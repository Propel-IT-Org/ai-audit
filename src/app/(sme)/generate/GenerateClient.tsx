"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Globe,
  MessageSquare,
  ArrowRight,
  Loader2,
  Sparkles,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { AuditReport } from "@/lib/types";

type ViewState = "landing" | "publishing" | "done" | "error";

interface SubdomainCheck {
  ok: boolean;
  reason?: string;
  sameSource?: boolean;
  suggestion?: string | null;
}

const APEX = process.env.NEXT_PUBLIC_SITE_APEX ?? "shorobik.com";

const INDUSTRY_OPTIONS = [
  { value: "restaurant", label: "Restaurant / Cafe" },
  { value: "travel", label: "Travel / Tourism" },
  { value: "service", label: "Service Business" },
  { value: "general", label: "Other" },
] as const;

type Industry = (typeof INDUSTRY_OPTIONS)[number]["value"];

function normalizeUrl(url: string): string {
  let u = url.trim();
  if (!/^https?:\/\//i.test(u)) u = `https://${u}`;
  return u;
}

function slugFromUrl(url: string): string {
  try {
    return new URL(normalizeUrl(url)).hostname
      .replace(/^www\./, "")
      .replace(/\./g, "-")
      .replace(/[^a-z0-9-]/gi, "")
      .toLowerCase()
      .slice(0, 50);
  } catch {
    return "my-site";
  }
}

/** Read a forwarded audit report stashed by the audit page for this URL. */
function readForwardedAudit(rawUrl: string): AuditReport | undefined {
  if (typeof window === "undefined") return undefined;
  try {
    const key = `aivible:audit:${normalizeUrl(rawUrl).replace(/\/$/, "")}`;
    const raw = window.sessionStorage.getItem(key);
    return raw ? (JSON.parse(raw) as AuditReport) : undefined;
  } catch {
    return undefined;
  }
}

export function GenerateClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialUrl = searchParams?.get("url") ?? "";

  const [url, setUrl] = useState(initialUrl);
  const [snsUrl, setSnsUrl] = useState("");
  const [industry, setIndustry] = useState<Industry>("restaurant");
  const [subdomain, setSubdomain] = useState(
    initialUrl ? slugFromUrl(initialUrl) : "",
  );
  const [touchedSub, setTouchedSub] = useState(false);

  const [check, setCheck] = useState<SubdomainCheck | null>(null);
  const [checking, setChecking] = useState(false);

  const [urlError, setUrlError] = useState<string | null>(null);
  const [viewState, setViewState] = useState<ViewState>("landing");
  const [progress, setProgress] = useState<{
    message: string;
    pct?: number;
  } | null>(null);
  const [publishedSubdomain, setPublishedSubdomain] = useState<string | null>(
    null,
  );
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const abortRef = useRef<AbortController | null>(null);

  const onUrlChange = (v: string) => {
    setUrl(v);
    if (urlError) setUrlError(null);
    if (!touchedSub) setSubdomain(v ? slugFromUrl(v) : "");
  };

  // Debounced subdomain availability check.
  useEffect(() => {
    const handle = setTimeout(async () => {
      if (!subdomain) {
        setCheck(null);
        return;
      }
      setChecking(true);
      try {
        const r = await fetch("/api/publish/check", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            subdomain,
            sourceUrl: url ? normalizeUrl(url) : undefined,
          }),
        });
        const j = await r.json();
        setCheck({
          ok: !!j.ok,
          reason: j.reason,
          sameSource: !!j.sameSource,
          suggestion: j.suggestion ?? null,
        });
      } catch {
        setCheck(null);
      } finally {
        setChecking(false);
      }
    }, 400);
    return () => clearTimeout(handle);
  }, [subdomain, url]);

  const canStart =
    !!url.trim() &&
    !!subdomain &&
    (check?.ok === true || check?.sameSource === true);

  const consumeStream = useCallback(
    async (
      body: ReadableStream<Uint8Array>,
      signal: AbortSignal,
    ): Promise<"completed" | "ended"> => {
      const reader = body.getReader();
      const decoder = new TextDecoder();
      let buf = "";
      try {
        while (true) {
          if (signal.aborted) return "ended";
          const { value, done } = await reader.read();
          if (done) break;
          buf += decoder.decode(value, { stream: true });
          const parts = buf.split("\n\n");
          buf = parts.pop() ?? "";
          for (const part of parts) {
            const line = part.split("\n").find((l) => l.startsWith("data:"));
            if (!line) continue;
            const payload = line.slice(5).trim();
            if (!payload || payload === "[DONE]") continue;
            let ev: {
              state?: string;
              message?: string;
              progress?: number;
              error?: string;
            };
            try {
              ev = JSON.parse(payload);
            } catch {
              continue;
            }
            if (
              typeof ev.message === "string" ||
              typeof ev.progress === "number"
            ) {
              setProgress({
                message: ev.message ?? ev.state ?? "Working…",
                pct: ev.progress,
              });
            }
            if (ev.state === "completed") {
              await reader.cancel().catch(() => {});
              return "completed";
            }
            if (ev.state === "failed") {
              throw new Error(ev.error ?? ev.message ?? "Publish failed.");
            }
          }
        }
      } finally {
        await reader.cancel().catch(() => {});
      }
      return "ended";
    },
    [],
  );

  /** Poll durable status until terminal. Used when SSE stream ends without a terminal event. */
  const pollStatus = useCallback(async (id: string, signal: AbortSignal) => {
    while (!signal.aborted) {
      await new Promise((res) => setTimeout(res, 1500));
      if (signal.aborted) return;
      const r = await fetch(
        `/api/publish/status?runId=${encodeURIComponent(id)}`,
        {
          cache: "no-store",
          signal,
        },
      );
      if (!r.ok) continue;
      const s = (await r.json()) as {
        state?: string;
        message?: string;
        progress?: number;
        error?: string;
      };
      if (typeof s.message === "string" || typeof s.progress === "number") {
        setProgress({ message: s.message ?? "Working…", pct: s.progress });
      }
      if (s.state === "completed") {
        setViewState("done");
        return;
      }
      if (s.state === "failed") {
        setErrorMsg(s.error ?? "Publish failed.");
        setViewState("error");
        return;
      }
    }
  }, []);

  const handleGenerate = useCallback(async () => {
    const trimmed = url.trim();
    if (!trimmed) {
      setUrlError("Please enter a URL");
      return;
    }
    setUrlError(null);
    setErrorMsg(null);
    setProgress({ message: "Starting publish…" });
    setViewState("publishing");

    const sourceUrl = normalizeUrl(trimmed);
    const audit = readForwardedAudit(trimmed);
    const ctrl = new AbortController();
    abortRef.current = ctrl;

    const startBody = {
      sourceUrl,
      subdomain,
      industry,
      overwrite: check?.sameSource ? true : undefined,
      audit,
    };

    try {
      const r = await fetch("/api/publish/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(startBody),
        signal: ctrl.signal,
      });

      if (!r.ok) {
        const j = (await r.json().catch(() => ({}))) as {
          code?: string;
          error?: string;
        };
        // Session expired between page load and publish — bounce to sign-in,
        // returning here (with the URL) so the customization is preserved.
        if (r.status === 401) {
          const next = `/generate?url=${encodeURIComponent(trimmed)}`;
          router.push(`/signin?next=${encodeURIComponent(next)}`);
          return;
        }
        throw new Error(j.error ?? `Failed: ${r.status}`);
      }

      const id = r.headers.get("x-run-id");
      const sub = r.headers.get("x-subdomain") ?? subdomain;
      setPublishedSubdomain(sub);

      if (!r.body) throw new Error("Server returned no stream.");
      const outcome = await consumeStream(r.body, ctrl.signal);

      if (outcome === "completed") {
        setViewState("done");
      } else if (id) {
        // Stream ended without a terminal event — fall back to polling.
        await pollStatus(id, ctrl.signal);
      }
    } catch (e) {
      if (e instanceof Error && e.name === "AbortError") return;
      setErrorMsg(e instanceof Error ? e.message : "Something went wrong.");
      setViewState("error");
    }
  }, [url, subdomain, industry, check, consumeStream, pollStatus]);

  const restart = () => {
    abortRef.current?.abort();
    setViewState("landing");
    setProgress(null);
    setPublishedSubdomain(null);
    setErrorMsg(null);
  };

  /* ---------------------------------------------------------------- */

  if (viewState === "publishing") {
    return <PublishingView progress={progress} onCancel={restart} />;
  }

  if (viewState === "done" && publishedSubdomain) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 py-16 text-center">
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/10">
          <Sparkles className="h-10 w-10 text-emerald-500" />
        </div>
        <h1 className="text-3xl font-extrabold text-foreground">
          Your storefront is live!
        </h1>
        <p className="mt-3 max-w-sm text-muted-foreground">
          Published at{" "}
          <span className="font-mono">
            {publishedSubdomain}.{APEX}
          </span>
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <a
            href={`https://${publishedSubdomain}.${APEX}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-xl bg-gold px-6 py-3 font-bold text-kon transition-colors hover:bg-gold/90"
          >
            Visit website
            <ArrowRight className="h-4 w-4" />
          </a>
          <Link
            href={`/storefront/${publishedSubdomain}`}
            className="inline-flex items-center gap-2 rounded-xl bg-kon2 px-6 py-3 font-bold text-white transition-colors hover:bg-kon"
          >
            View storefront
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Button variant="outline" onClick={restart}>
            Generate another
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <section className="hero-map relative overflow-hidden px-4 py-16 md:py-24">
        <div className="relative mx-auto max-w-3xl text-center">
          <p className="av-eyebrow mb-3">For businesses</p>
          <h1 className="mb-4 text-4xl font-extrabold leading-tight tracking-tight text-white md:text-5xl">
            Build your <span className="text-gold">AI storefront</span> in 60
            seconds
          </h1>
          <p className="mx-auto mb-8 max-w-xl text-base text-indigo-100/80 md:text-lg">
            Paste your website URL — we&apos;ll translate, enrich, and publish
            an English storefront that AI travel tools can find and recommend.
          </p>

          {viewState === "error" && errorMsg && (
            <div className="mb-6 rounded-lg border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
              {errorMsg}
            </div>
          )}

          <div className="mx-auto max-w-xl space-y-3 text-left">
            <div className="relative">
              <Globe className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="url"
                placeholder="https://your-restaurant.jp"
                value={url}
                onChange={(e) => onUrlChange(e.target.value)}
                className={`h-14 bg-white pl-10 text-base shadow-sm ${urlError ? "border-red-500" : ""}`}
              />
            </div>
            {urlError && <p className="text-sm text-red-200">{urlError}</p>}

            <div className="relative">
              <MessageSquare className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="url"
                placeholder="Instagram / social URL (optional)"
                value={snsUrl}
                onChange={(e) => setSnsUrl(e.target.value)}
                className="h-12 bg-white pl-10 text-base shadow-sm"
              />
            </div>

            <select
              value={industry}
              onChange={(e) => setIndustry(e.target.value as Industry)}
              className="h-12 w-full rounded-md border border-border bg-white px-3 text-base text-foreground shadow-sm"
            >
              {INDUSTRY_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>

            {/* Custom subdomain + availability */}
            <div className="rounded-md bg-white/95 p-3 shadow-sm">
              <label className="av-eyebrow mb-1 block text-kon2">
                Choose your subdomain
              </label>
              <div className="flex items-center gap-2">
                <Input
                  value={subdomain}
                  onChange={(e) => {
                    setTouchedSub(true);
                    setSubdomain(
                      e.target.value.toLowerCase().replace(/[^a-z0-9-]+/g, "-"),
                    );
                  }}
                  placeholder="your-business"
                  className="h-11 font-mono"
                />
                <span className="whitespace-nowrap font-mono text-sm text-muted-foreground">
                  .{APEX}
                </span>
              </div>
              <div className="mt-1 flex min-h-5 flex-wrap items-center gap-x-2 text-xs">
                {checking && (
                  <span className="text-muted-foreground">
                    Checking availability…
                  </span>
                )}
                {!checking && check?.ok && (
                  <span className="inline-flex items-center gap-1 text-emerald-600">
                    <CheckCircle className="h-3 w-3" /> Available
                  </span>
                )}
                {!checking && check?.sameSource && (
                  <span className="inline-flex items-center gap-1 text-amber-600">
                    <CheckCircle className="h-3 w-3" /> Owned by this site —
                    re-publishing overwrites it.
                  </span>
                )}
                {!checking && check && !check.ok && !check.sameSource && (
                  <>
                    <span className="inline-flex items-center gap-1 text-red-600">
                      <XCircle className="h-3 w-3" /> {check.reason}
                    </span>
                    {check.suggestion && (
                      <button
                        type="button"
                        onClick={() => {
                          setTouchedSub(true);
                          setSubdomain(check.suggestion ?? subdomain);
                        }}
                        className="font-mono underline underline-offset-2 hover:no-underline"
                      >
                        Try {check.suggestion}
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>

            <Button
              onClick={handleGenerate}
              size="lg"
              disabled={!canStart}
              className="h-14 w-full bg-gold px-8 text-lg font-bold text-kon shadow-lg transition-all hover:scale-[1.02] hover:bg-gold/90 hover:shadow-xl disabled:opacity-60 disabled:hover:scale-100"
            >
              {check?.sameSource
                ? "Re-publish my storefront"
                : "Build my storefront"}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>

      <footer className="border-t border-border py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>© 2026 AIVIBLE. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

/* ------------------------------------------------------------------ */

function PublishingView({
  progress,
  onCancel,
}: {
  progress: { message: string; pct?: number } | null;
  onCancel: () => void;
}) {
  const pct = progress?.pct;
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="container mx-auto max-w-md px-4 text-center">
        <Loader2 className="mx-auto mb-6 h-12 w-12 animate-spin text-primary" />
        <h2 className="mb-2 text-2xl font-bold text-foreground">
          Building your AI storefront…
        </h2>
        <p className="mb-6 text-muted-foreground">
          This takes about 30–60 seconds.
        </p>

        <p className="mb-2 text-sm text-foreground">
          {progress?.message ?? "Working…"}
        </p>
        {typeof pct === "number" && (
          <div className="mx-auto h-1.5 w-full max-w-sm overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-kon2 transition-[width] duration-500"
              style={{ width: `${Math.max(2, pct)}%` }}
            />
          </div>
        )}

        <Button
          variant="ghost"
          onClick={onCancel}
          className="mt-8 text-muted-foreground hover:text-foreground"
        >
          Cancel
        </Button>
      </div>
    </div>
  );
}
