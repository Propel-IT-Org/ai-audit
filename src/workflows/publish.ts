import { getWritable } from "workflow";
import {
  buildInitialStatus,
  patchRunStatus,
  writeRunStatus,
} from "@/lib/workflow/status-store";
import { buildPublishedSite, type PublishInput } from "@/lib/sites/publish";
import { writePublishedSite } from "@/lib/sites/storage";
import { applyEnrichment, enrichWithAudit } from "@/lib/sites/ai-enrich";
import { translateSiteToEnglish } from "@/lib/sites/translator";
import type { PublishedSite } from "@/lib/sites/types";
import type { AuditReport } from "@/lib/types";

export interface PublishWorkflowInput extends PublishInput {
  /** Full audit report. Drives the AI enrichment step. */
  audit?: AuditReport;
}

interface PublishEvent {
  state: "running" | "waiting_for_input" | "completed" | "failed";
  message: string;
  progress?: number;
  result?: PublishedSite;
  plannedUrl?: string;
  error?: string;
  meta?: Record<string, unknown>;
}

/**
 * Publish workflow: crawl source → scrape into typed site → AI-enrich from
 * audit report → persist to blob. Streams progress as SSE chunks via
 * `workflow.getWritable()`. After completion, `<subdomain>.<apex>` serves the
 * templated site plus /llms.txt, /llms-full.txt, /robots.txt, /sitemap.xml.
 */
export async function publishSiteWorkflow(
  runId: string,
  input: PublishWorkflowInput,
): Promise<PublishedSite> {
  "use workflow";

  await initPublishRun(runId, input);
  try {
    const scraped = await scrapeStep(runId, input);

    // NOTE: the interactive "customization questions" suspend was removed — the
    // current generate UI streams straight through and cannot answer a hook, so
    // suspending here left the run waiting forever and the storefront was never
    // persisted (404 on the published page). Run end-to-end instead.
    const translated = await translateStep(runId, scraped);
    const enriched = await enrichStep(runId, translated, input.audit);
    const result = await persistStep(runId, enriched);
    await closeStreamStep();
    return result;
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    await markPublishFailed(runId, message);
    await closeStreamStep();
    throw err;
  }
}

async function initPublishRun(
  runId: string,
  input: PublishWorkflowInput,
): Promise<void> {
  "use step";
  const initial = buildInitialStatus<PublishedSite>(runId, "publish", {
    sourceUrl: input.sourceUrl,
    subdomain: input.subdomain,
    industry: input.industry,
    hasAudit: !!input.audit,
  });
  initial.state = "running";
  initial.message = `Scraping ${input.sourceUrl}…`;
  initial.progress = 5;
  await writeRunStatus(initial);

  await emit({
    state: "running",
    message: initial.message,
    progress: initial.progress,
    meta: initial.meta,
  });
}

async function scrapeStep(
  runId: string,
  input: PublishWorkflowInput,
): Promise<PublishedSite> {
  "use step";
  await patchRunStatus<PublishedSite>("publish", runId, {
    state: "running",
    message: `Crawling ${input.sourceUrl}…`,
    progress: 25,
  });
  await emit({
    state: "running",
    message: `Crawling ${input.sourceUrl}…`,
    progress: 25,
  });

  const site = await buildPublishedSite(input);

  const meta = {
    industry: site.industry,
    gallery: site.data.gallery.length,
    menuSections:
      site.data.industry === "restaurant"
        ? (site.data.menu?.sections.length ?? 0)
        : 0,
  };
  await patchRunStatus<PublishedSite>("publish", runId, {
    state: "running",
    message: `Extracted ${site.data.industry} data for ${site.data.name}.`,
    progress: 55,
    meta,
  });
  await emit({
    state: "running",
    message: `Extracted ${site.data.industry} data for ${site.data.name}.`,
    progress: 55,
    meta,
  });
  return site;
}

async function translateStep(
  runId: string,
  site: PublishedSite,
): Promise<PublishedSite> {
  "use step";
  if (site.source?.isEnglish) {
    const skipMsg = "Source already in English — skipping translation.";
    await patchRunStatus<PublishedSite>("publish", runId, {
      state: "running",
      message: skipMsg,
      progress: 62,
    });
    await emit({ state: "running", message: skipMsg, progress: 62 });
    return { ...site, translated: true };
  }
  const startMsg = `Translating ${site.source?.language ?? "source"} → English…`;
  await patchRunStatus<PublishedSite>("publish", runId, {
    state: "running",
    message: startMsg,
    progress: 62,
  });
  await emit({ state: "running", message: startMsg, progress: 62 });

  const { site: out, notes } = await translateSiteToEnglish(site);
  const doneMsg = out.translated
    ? "Translated to English."
    : notes[0] ?? "Translation step finished.";
  await patchRunStatus<PublishedSite>("publish", runId, {
    state: "running",
    message: doneMsg,
    progress: 70,
    meta: { translateNotes: notes },
  });
  await emit({
    state: "running",
    message: doneMsg,
    progress: 70,
    meta: { translateNotes: notes },
  });
  return out;
}

async function enrichStep(
  runId: string,
  site: PublishedSite,
  audit?: AuditReport,
): Promise<PublishedSite> {
  "use step";
  const msg = audit
    ? "Enriching with audit findings (Claude)…"
    : "Generating GEO content (Claude)…";
  await patchRunStatus<PublishedSite>("publish", runId, {
    state: "running",
    message: msg,
    progress: 75,
  });
  await emit({ state: "running", message: msg, progress: 75 });

  const enrichment = await enrichWithAudit(site, audit);
  const merged = applyEnrichment(site, enrichment);

  const enrichMeta = {
    summaryChars: enrichment.summary?.length ?? 0,
    aboutChars: enrichment.about?.length ?? 0,
    faqCount: enrichment.faqs?.length ?? 0,
    notes: enrichment.notes,
  };
  const doneMsg = enrichment.faqs?.length
    ? `Generated ${enrichment.faqs.length} FAQs + GEO copy.`
    : "GEO enrichment finished.";
  await patchRunStatus<PublishedSite>("publish", runId, {
    state: "running",
    message: doneMsg,
    progress: 85,
    meta: enrichMeta,
  });
  await emit({
    state: "running",
    message: doneMsg,
    progress: 85,
    meta: enrichMeta,
  });
  return merged;
}

async function persistStep(
  runId: string,
  site: PublishedSite,
): Promise<PublishedSite> {
  "use step";
  await patchRunStatus<PublishedSite>("publish", runId, {
    state: "running",
    message: "Publishing to subdomain…",
    progress: 92,
  });
  await emit({
    state: "running",
    message: "Publishing to subdomain…",
    progress: 92,
  });

  const url = await writePublishedSite(site);
  const apex = process.env.SITE_PUBLIC_APEX ?? "shorobik.com";
  const plannedUrl = `https://${site.subdomain}.${apex}`;

  await patchRunStatus<PublishedSite>("publish", runId, {
    state: "completed",
    progress: 100,
    message: `Published at ${plannedUrl}`,
    result: site,
    meta: { blobUrl: url ?? "" },
  });

  await emit({
    state: "completed",
    message: `Published at ${plannedUrl}`,
    progress: 100,
    result: site,
    plannedUrl,
  });

  return site;
}

async function markPublishFailed(runId: string, message: string): Promise<void> {
  "use step";
  await patchRunStatus<PublishedSite>("publish", runId, {
    state: "failed",
    error: message,
    message: `Publish failed: ${message}`,
  });
  await emit({
    state: "failed",
    message: `Publish failed: ${message}`,
    error: message,
  });
}

async function emit(payload: PublishEvent): Promise<void> {
  const writable = getWritable<string>();
  const writer = writable.getWriter();
  try {
    await writer.write(`data: ${JSON.stringify(payload)}\n\n`);
  } finally {
    try {
      writer.releaseLock();
    } catch {
      /* already released */
    }
  }
}

/**
 * Closes the default writable in its own step, run after the final `emit`.
 * Buffered chunk writes flush at the step boundary, so the stream's
 * `X-Stream-Done` is only sent once the last chunk has landed — avoids the
 * HTTP 409 "stream is completing, cannot write new chunks" race that crashes
 * the run when write + close share a step.
 */
async function closeStreamStep(): Promise<void> {
  "use step";
  try {
    await getWritable<string>().close();
  } catch {
    // Stream may already be closed by the workflow runtime — safe to ignore.
  }
}
