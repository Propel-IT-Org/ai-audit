"use client";

import { useState, useCallback, useRef } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Globe, MessageSquare, ArrowRight, Loader2, X, Sparkles, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type ViewState = "landing" | "loading" | "done" | "error";

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

const INDUSTRY_OPTIONS = [
  { value: "restaurant", label: "Restaurant / Cafe" },
  { value: "travel", label: "Travel / Tourism" },
  { value: "service", label: "Service Business" },
  { value: "general", label: "Other" },
] as const;

type Industry = (typeof INDUSTRY_OPTIONS)[number]["value"];

const LOAD_STEPS = [
  "Fetching your website",
  "Extracting content",
  "Translating & enriching",
  "Building your storefront",
  "Publishing",
];

export function GenerateClient() {
  const searchParams = useSearchParams();
  const [url, setUrl] = useState(searchParams?.get("url") ?? "");
  const [snsUrl, setSnsUrl] = useState("");
  const [industry, setIndustry] = useState<Industry>("restaurant");
  const [urlError, setUrlError] = useState<string | null>(null);
  const [viewState, setViewState] = useState<ViewState>("landing");
  const [publishedSubdomain, setPublishedSubdomain] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loadingStep, setLoadingStep] = useState(0);
  const abortRef = useRef<AbortController | null>(null);

  const cancel = useCallback(() => {
    abortRef.current?.abort();
    setViewState("landing");
    setLoadingStep(0);
  }, []);

  const handleGenerate = useCallback(async () => {
    const trimmed = url.trim();
    if (!trimmed) {
      setUrlError("Please enter a URL");
      return;
    }
    setUrlError(null);
    setViewState("loading");
    setLoadingStep(0);
    setErrorMsg(null);

    const sourceUrl = normalizeUrl(trimmed);
    const subdomain = slugFromUrl(trimmed);
    const ctrl = new AbortController();
    abortRef.current = ctrl;

    try {
      const r = await fetch("/api/publish/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sourceUrl, subdomain, industry, autoUnique: true }),
        signal: ctrl.signal,
      });

      if (!r.ok) {
        const j = await r.json().catch(() => ({})) as { code?: string; error?: string };
        if (j.code === "TAKEN_BY_SELF") {
          const r2 = await fetch("/api/publish/start", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ sourceUrl, subdomain, industry, overwrite: true }),
            signal: ctrl.signal,
          });
          if (!r2.ok) throw new Error(`Re-publish failed: ${r2.status}`);
          await drainStream(r2, setLoadingStep, ctrl.signal);
          setPublishedSubdomain(r2.headers.get("x-subdomain") ?? subdomain);
          setViewState("done");
          return;
        }
        throw new Error(j.error ?? `Failed: ${r.status}`);
      }

      await drainStream(r, setLoadingStep, ctrl.signal);
      setPublishedSubdomain(r.headers.get("x-subdomain") ?? subdomain);
      setViewState("done");
    } catch (e) {
      if (e instanceof Error && e.name === "AbortError") return;
      setErrorMsg(e instanceof Error ? e.message : "Something went wrong.");
      setViewState("error");
    }
  }, [url, industry]);

  if (viewState === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="container mx-auto max-w-md px-4 text-center">
          <Loader2 className="mx-auto mb-6 h-12 w-12 animate-spin text-primary" />
          <h2 className="mb-2 text-2xl font-bold text-foreground">Building your AI storefront…</h2>
          <p className="mb-8 text-muted-foreground">This takes about 30–60 seconds.</p>
          <div className="space-y-3 text-left">
            {LOAD_STEPS.map((step, i) => (
              <div
                key={i}
                className={`flex items-center gap-3 ${i <= loadingStep ? "text-foreground" : "text-muted-foreground"}`}
              >
                {i < loadingStep ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : i === loadingStep ? (
                  <Loader2 className="h-5 w-5 animate-spin text-primary" />
                ) : (
                  <div className="h-5 w-5 rounded-full border-2 border-muted" />
                )}
                <span className="text-sm">{step}</span>
              </div>
            ))}
          </div>
          <Button variant="ghost" onClick={cancel} className="mt-8 text-muted-foreground hover:text-foreground">
            <X className="mr-2 h-4 w-4" />
            Cancel
          </Button>
        </div>
      </div>
    );
  }

  if (viewState === "done" && publishedSubdomain) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 py-16 text-center">
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/10">
          <Sparkles className="h-10 w-10 text-emerald-500" />
        </div>
        <h1 className="text-3xl font-extrabold text-foreground">Your storefront is live!</h1>
        <p className="mt-3 max-w-sm text-muted-foreground">
          Your AI-powered storefront has been published and is ready to be found.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link
            href={`/storefront/${publishedSubdomain}`}
            className="inline-flex items-center gap-2 rounded-xl bg-kon2 px-6 py-3 font-bold text-white transition-colors hover:bg-kon"
          >
            View Storefront
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Button
            variant="outline"
            onClick={() => { setViewState("landing"); setUrl(""); setSnsUrl(""); }}
          >
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
            Build your <span className="text-gold">AI storefront</span> in 60 seconds
          </h1>
          <p className="mx-auto mb-8 max-w-xl text-base text-indigo-100/80 md:text-lg">
            Paste your website URL — we&apos;ll translate, enrich, and publish an English storefront that AI travel tools can find and recommend.
          </p>

          {viewState === "error" && errorMsg && (
            <div className="mb-6 rounded-lg border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
              {errorMsg}
            </div>
          )}

          <div className="mx-auto max-w-xl space-y-3">
            <div className="relative">
              <Globe className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="url"
                placeholder="https://your-restaurant.jp"
                value={url}
                onChange={(e) => { setUrl(e.target.value); if (urlError) setUrlError(null); }}
                onKeyDown={(e) => e.key === "Enter" && handleGenerate()}
                className={`h-14 bg-white pl-10 text-base shadow-sm ${urlError ? "border-red-500" : ""}`}
              />
            </div>
            {urlError && <p className="text-left text-sm text-red-200">{urlError}</p>}

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
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>

            <Button
              onClick={handleGenerate}
              size="lg"
              className="h-14 w-full bg-gold px-8 text-lg font-bold text-kon shadow-lg transition-all hover:scale-[1.02] hover:bg-gold/90 hover:shadow-xl"
            >
              Build my storefront
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

async function drainStream(
  response: Response,
  onStep: (step: number) => void,
  signal: AbortSignal,
): Promise<void> {
  if (!response.body) return;
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let step = 0;

  while (true) {
    if (signal.aborted) { await reader.cancel(); return; }
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    let idx = buffer.indexOf("\n");
    while (idx >= 0) {
      const line = buffer.slice(0, idx).trim();
      buffer = buffer.slice(idx + 1);
      if (line.startsWith("event:") || line.startsWith("data:")) {
        step = Math.min(step + 1, LOAD_STEPS.length - 1);
        onStep(step);
      }
      idx = buffer.indexOf("\n");
    }
  }
  await reader.cancel().catch(() => {});
}
