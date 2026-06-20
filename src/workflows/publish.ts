import { getWritable } from "workflow";
import {
  buildInitialStatus,
  patchRunStatus,
  writeRunStatus,
} from "@/lib/workflow/status-store";
import { buildPublishedSite, type PublishInput } from "@/lib/sites/publish";
import { writePublishedSite } from "@/lib/sites/storage";
import { applyEnrichment, enrichWithAudit, generateStructuredMenu } from "@/lib/sites/ai-enrich";
import { translateSiteToEnglish } from "@/lib/sites/translator";
import type { PublishedSite, RestaurantData } from "@/lib/sites/types";
import type { AuditReport } from "@/lib/types";
import { upsertPlaceFromSite } from "@/lib/restaurants/queries";

export interface PublishWorkflowInput extends PublishInput {
  /** Full audit report. Drives the AI enrichment step. */
  audit?: AuditReport;
}

interface PublishEvent {
  state: "running" | "completed" | "failed";
  message: string;
  progress?: number;
  result?: PublishedSite;
  plannedUrl?: string;
  error?: string;
  meta?: Record<string, unknown>;
}

/**
 * Publish workflow: scrape → translate → enrich (Claude + web_search) →
 * structured menu (restaurant only) → persist to blob.
 *
 * Linear pipeline — no user-input suspension. The AI enrichment step fills
 * missing fields (phone, address, hours, cuisine, etc.) via web_search.
 */
export async function publishSiteWorkflow(
  runId: string,
  input: PublishWorkflowInput,
): Promise<PublishedSite> {
  "use workflow";

  await initPublishRun(runId, input);
  try {
    const scraped = await scrapeStep(runId, input);
    const translated = await translateStep(runId, scraped);
    const enriched = await enrichStep(runId, translated, input.audit);
    const menuFilled = await structuredMenuStep(runId, enriched);
    const result = await persistStep(runId, menuFilled);
    await upsertPlaceStep(runId, result);
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
  await emit({ state: "running", message: initial.message, progress: initial.progress, meta: initial.meta });
}

async function scrapeStep(
  runId: string,
  input: PublishWorkflowInput,
): Promise<PublishedSite> {
  "use step";
  await patchRunStatus<PublishedSite>("publish", runId, { state: "running", message: `Crawling ${input.sourceUrl}…`, progress: 20 });
  await emit({ state: "running", message: `Crawling ${input.sourceUrl}…`, progress: 20 });

  const site = await buildPublishedSite(input);

  const meta = {
    industry: site.industry,
    gallery: site.data.gallery.length,
    menuSections: site.data.industry === "restaurant" ? (site.data.menu?.sections.length ?? 0) : 0,
  };
  await patchRunStatus<PublishedSite>("publish", runId, {
    state: "running",
    message: `Extracted ${site.data.industry} data for ${site.data.name}.`,
    progress: 40,
    meta,
  });
  await emit({ state: "running", message: `Extracted ${site.data.industry} data for ${site.data.name}.`, progress: 40, meta });
  return site;
}

async function translateStep(runId: string, site: PublishedSite): Promise<PublishedSite> {
  "use step";
  if (site.source?.isEnglish) {
    const msg = "Source already in English — skipping translation.";
    await patchRunStatus<PublishedSite>("publish", runId, { state: "running", message: msg, progress: 50 });
    await emit({ state: "running", message: msg, progress: 50 });
    return { ...site, translated: true };
  }
  const startMsg = `Translating ${site.source?.language ?? "source"} → English…`;
  await patchRunStatus<PublishedSite>("publish", runId, { state: "running", message: startMsg, progress: 50 });
  await emit({ state: "running", message: startMsg, progress: 50 });

  const { site: out, notes } = await translateSiteToEnglish(site);
  const doneMsg = out.translated ? "Translated to English." : notes[0] ?? "Translation finished.";
  await patchRunStatus<PublishedSite>("publish", runId, { state: "running", message: doneMsg, progress: 60, meta: { translateNotes: notes } });
  await emit({ state: "running", message: doneMsg, progress: 60, meta: { translateNotes: notes } });
  return out;
}

async function enrichStep(runId: string, site: PublishedSite, audit?: AuditReport): Promise<PublishedSite> {
  "use step";
  const msg = audit ? "Enriching with audit findings (Claude)…" : "Generating GEO content (Claude)…";
  await patchRunStatus<PublishedSite>("publish", runId, { state: "running", message: msg, progress: 65 });
  await emit({ state: "running", message: msg, progress: 65 });

  const enrichment = await enrichWithAudit(site, audit);
  const merged = applyEnrichment(site, enrichment);

  const enrichMeta = {
    summaryChars: enrichment.summary?.length ?? 0,
    aboutChars: enrichment.about?.length ?? 0,
    faqCount: enrichment.faqs?.length ?? 0,
    notes: enrichment.notes,
  };
  const doneMsg = enrichment.faqs?.length ? `Generated ${enrichment.faqs.length} FAQs + GEO copy.` : "GEO enrichment finished.";
  await patchRunStatus<PublishedSite>("publish", runId, { state: "running", message: doneMsg, progress: 80, meta: enrichMeta });
  await emit({ state: "running", message: doneMsg, progress: 80, meta: enrichMeta });
  return merged;
}

async function structuredMenuStep(runId: string, site: PublishedSite): Promise<PublishedSite> {
  "use step";
  if (site.data.industry !== "restaurant") return site;
  const menuSections = (site.data as RestaurantData).menu?.sections ?? [];
  if (menuSections.length >= 3) return site;

  await patchRunStatus<PublishedSite>("publish", runId, { state: "running", message: "Building menu from the web…", progress: 88 });
  await emit({ state: "running", message: "Building menu from the web…", progress: 88 });

  const result = await generateStructuredMenu(site);
  if (!result) return site;
  return { ...site, data: { ...(site.data as RestaurantData), menu: result } };
}

async function persistStep(runId: string, site: PublishedSite): Promise<PublishedSite> {
  "use step";
  await patchRunStatus<PublishedSite>("publish", runId, { state: "running", message: "Publishing to subdomain…", progress: 92 });
  await emit({ state: "running", message: "Publishing to subdomain…", progress: 92 });

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
  await emit({ state: "completed", message: `Published at ${plannedUrl}`, progress: 100, result: site, plannedUrl });
  return site;
}

async function upsertPlaceStep(runId: string, site: PublishedSite): Promise<void> {
  "use step";
  try {
    await upsertPlaceFromSite(site);
    await emit({ state: "running", message: "Added to explore map.", progress: 97 });
  } catch (err) {
    // Best-effort — don't fail the publish if the upsert fails.
    console.warn("[publish] upsertPlaceFromSite failed:", err);
  }
}

async function markPublishFailed(runId: string, message: string): Promise<void> {
  "use step";
  await patchRunStatus<PublishedSite>("publish", runId, { state: "failed", error: message, message: `Publish failed: ${message}` });
  await emit({ state: "failed", message: `Publish failed: ${message}`, error: message });
}

async function emit(payload: PublishEvent): Promise<void> {
  const writable = getWritable<string>();
  const writer = writable.getWriter();
  try {
    await writer.write(`data: ${JSON.stringify(payload)}\n\n`);
  } finally {
    try { writer.releaseLock(); } catch { /* already released */ }
  }
}

async function closeStreamStep(): Promise<void> {
  "use step";
  try {
    await getWritable<string>().close();
  } catch {
    // Stream may already be closed by the workflow runtime — safe to ignore.
  }
}
