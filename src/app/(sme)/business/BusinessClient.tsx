"use client";

import { useState, useCallback, useRef } from "react";
import Link from "next/link";
import {
  Search,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  XCircle,
  AlertTriangle,
  Check,
  Loader2,
  X,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { AuditReport } from "@/lib/types";
import { ChatGptDemo } from "@/components/ChatGptDemo";
import { StatsSection } from "@/components/StatsSection";
import { HowItWorksSection } from "@/components/HowItWorksSection";
import { RecentShowcase } from "@/components/RecentShowcase";
import type { StorefrontSummaryItem } from "@/lib/sites/queries";

type ViewState = "landing" | "loading" | "results" | "error";

const STEPS = [
  "Resolving domain & robots.txt",
  "Fetching llms.txt",
  "Discovering URLs via sitemap",
  "Rendering pages with headless Chromium",
  "Comparing AI vs human HTML",
  "Scoring & assembling the report",
];

const TIMEOUT_MS = 120_000;

const gradeColors: Record<string, string> = {
  "A+": "bg-emerald-600",
  A: "bg-emerald-500",
  B: "bg-green-400",
  C: "bg-yellow-500",
  D: "bg-orange-500",
  F: "bg-red-500",
};
const gradeTextColors: Record<string, string> = {
  "A+": "text-emerald-600",
  A: "text-emerald-500",
  B: "text-green-400",
  C: "text-yellow-500",
  D: "text-orange-500",
  F: "text-red-500",
};
const priorityColors: Record<string, string> = {
  high: "bg-red-500 text-white",
  medium: "bg-yellow-500 text-white",
  low: "bg-green-500 text-white",
};

function normalizeUrl(url: string): string {
  let u = url.trim();
  if (!/^https?:\/\//i.test(u)) u = `https://${u}`;
  return u;
}

function getHostname(url: string): string {
  try {
    return new URL(url).hostname;
  } catch {
    return url.replace(/^https?:\/\//, "").split("/")[0];
  }
}

function gradeMessage(score: number): string {
  if (score >= 90) return "Excellent AI visibility. You're ahead of 95% of Japan's tourism businesses.";
  if (score >= 75) return "Good AI visibility with room to improve in a few areas.";
  if (score >= 60) return "Moderate AI visibility. ChatGPT and Gemini may not recommend you reliably.";
  if (score >= 40) return "Weak AI visibility. Significant improvements needed to appear in AI recommendations.";
  return "Critical AI visibility issues. AI tools cannot reliably find or describe your business.";
}

function isAuditReport(value: unknown): value is AuditReport {
  if (!value || typeof value !== "object") return false;
  const r = value as Record<string, unknown>;
  return (
    typeof r.overallScore === "number" &&
    typeof r.completedAt === "string" &&
    Array.isArray(r.pages)
  );
}

function parseStreamLine(line: string): unknown | null {
  if (!line || line.startsWith(":")) return null;
  const payload = line.startsWith("data:") ? line.slice(5).trim() : line;
  if (!payload || payload === "[DONE]") return null;
  try {
    return JSON.parse(payload);
  } catch {
    return null;
  }
}

function isCrawlEvent(v: unknown): v is { type: string } {
  if (!v || typeof v !== "object") return false;
  const r = v as Record<string, unknown>;
  return typeof r.type === "string" && (r.type as string).includes(":");
}

function stepFromEvent(e: { type: string }): number {
  const map: Record<string, number> = {
    "site:start": 0,
    "site:robots": 0,
    "site:llms": 1,
    "site:sitemap": 2,
    "page:start": 3,
    "page:done": 4,
    "page:error": 4,
    "site:analyzer:start": 5,
    "page:analyzer:start": 5,
    "site:done": 5,
  };
  return map[e.type] ?? -1;
}

/* ------------------------------------------------------------------ */

function AuditLoadingView({
  url,
  currentStep,
  onCancel,
}: {
  url: string;
  currentStep: number;
  onCancel: () => void;
}) {
  const progress = Math.min(((currentStep + 1) / STEPS.length) * 100, 100);
  const hostname = getHostname(url);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="container mx-auto max-w-md px-4 text-center">
        <div className="mb-6">
          <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
        </div>
        <h2 className="mb-2 text-2xl font-bold text-foreground">
          Analyzing {hostname}
        </h2>
        <p className="mb-8 text-muted-foreground">This takes about 30 seconds.</p>

        <div className="mb-8">
          <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
            <div
              className="h-full bg-primary transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="mt-2 text-sm text-muted-foreground">{Math.round(progress)}%</p>
        </div>

        <div className="space-y-3 text-left">
          {STEPS.map((step, i) => (
            <div
              key={i}
              className={`flex items-center gap-3 ${i <= currentStep ? "text-foreground" : "text-muted-foreground"}`}
            >
              {i < currentStep ? (
                <Check className="h-5 w-5 text-green-500" />
              ) : i === currentStep ? (
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
              ) : (
                <div className="h-5 w-5 rounded-full border-2 border-muted" />
              )}
              <span className="text-sm">{step}</span>
            </div>
          ))}
        </div>

        <div className="mt-8">
          <Button
            variant="ghost"
            onClick={onCancel}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="mr-2 h-4 w-4" />
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */

function AuditResultsView({
  report,
  onBack,
}: {
  report: AuditReport;
  onBack: () => void;
}) {
  const [openIssues, setOpenIssues] = useState<Record<number, boolean>>({});

  const grade = report.grade?.replace("+", "") ?? "F";
  const score = report.overallScore ?? 0;

  const issues = report.topRecommendations?.slice(0, 8).map((c) => ({
    title: c.name,
    priority: c.status === "fail" ? "high" : "medium",
    fix: c.fixSuggestion,
  })) ?? [];

  const toggleIssue = (i: number) =>
    setOpenIssues((prev) => ({ ...prev, [i]: !prev[i] }));

  return (
    <div className="min-h-screen bg-background py-8 md:py-12">
      <div className="container mx-auto max-w-3xl px-4">
        <Button
          variant="ghost"
          onClick={onBack}
          className="mb-6 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Scan another
        </Button>

        <p className="mb-6 truncate text-center text-sm text-muted-foreground">
          Results for <span className="font-medium">{report.rootUrl}</span>
        </p>

        {/* Score card */}
        <Card className="mb-8 overflow-hidden border-0 shadow-lg">
          <CardContent className="p-8 text-center">
            <div className="mb-6 flex items-center justify-center gap-6">
              <div
                className={`relative flex h-36 w-36 items-center justify-center rounded-full shadow-lg ${gradeColors[report.grade] ?? "bg-gray-400"}`}
              >
                <div className="text-white">
                  <p className="text-5xl font-bold">{score}</p>
                  <p className="text-sm opacity-80">/100</p>
                </div>
              </div>
              <div className="text-left">
                <p className={`text-6xl font-bold ${gradeTextColors[grade] ?? "text-gray-500"}`}>
                  {report.grade}
                </p>
                <p className="text-sm text-muted-foreground">Grade</p>
              </div>
            </div>
            <p className="text-lg text-foreground">{gradeMessage(score)}</p>
          </CardContent>
        </Card>

        {/* CTA — generate storefront */}
        <Card className="mb-8 overflow-hidden border-0 bg-linear-to-r from-primary/10 via-primary/5 to-background shadow-lg">
          <CardContent className="p-6 text-center md:p-8">
            <h2 className="mb-2 text-xl font-bold text-foreground">Build your AI storefront</h2>
            <p className="mb-6 text-muted-foreground">
              We&apos;ll create an English storefront Google, Gemini, and Perplexity can find.
            </p>
            <Link
              href={`/generate?url=${encodeURIComponent(report.rootUrl)}`}
              onClick={() => {
                // Forward the full audit report so publish enrichment can use it.
                try {
                  const u = /^https?:\/\//i.test(report.rootUrl) ? report.rootUrl : `https://${report.rootUrl}`;
                  sessionStorage.setItem(`aivible:audit:${u.replace(/\/$/, "")}`, JSON.stringify(report));
                } catch {
                  /* sessionStorage unavailable — enrichment falls back to no-audit */
                }
              }}
            >
              <Button size="lg" className="h-12 px-8 text-base font-bold shadow-lg transition-all hover:scale-[1.02]">
                Build storefront →
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Category scores */}
        {report.categoryScores && Object.keys(report.categoryScores).length > 0 && (
          <>
            <h2 className="mb-4 text-xl font-semibold text-foreground">Quick Results</h2>
            <Card className="mb-8 border-0 shadow-md">
              <CardContent className="divide-y divide-border p-0">
                {Object.entries(report.categoryScores).map(([cat, v]) => {
                  const pct = v.max > 0 ? Math.round((v.score / v.max) * 100) : 0;
                  const passed = pct >= 60;
                  return (
                    <div key={cat} className="flex items-center justify-between p-4 hover:bg-secondary/50">
                      <div className="flex items-center gap-3">
                        {passed ? (
                          <CheckCircle className="h-5 w-5 shrink-0 text-emerald-500" />
                        ) : pct >= 40 ? (
                          <AlertTriangle className="h-5 w-5 shrink-0 text-yellow-500" />
                        ) : (
                          <XCircle className="h-5 w-5 shrink-0 text-red-500" />
                        )}
                        <span className="font-medium capitalize text-foreground">{cat.replace(/_/g, " ")}</span>
                      </div>
                      <span className="whitespace-nowrap text-sm font-medium text-muted-foreground">
                        {v.score}/{v.max}
                      </span>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </>
        )}

        {/* Issues */}
        {issues.length > 0 && (
          <>
            <h2 className="mb-4 text-xl font-semibold text-foreground">
              {issues.length} issues found
            </h2>
            <div className="mb-8 space-y-3">
              {issues.map((issue, idx) => (
                <Card key={idx} className="overflow-hidden border-0 shadow-md">
                  <button
                    type="button"
                    className="w-full cursor-pointer"
                    onClick={() => toggleIssue(idx)}
                  >
                    <div className="flex items-center justify-between p-4 hover:bg-secondary/50">
                      <div className="flex items-center gap-3 text-left">
                        <Badge className={`${priorityColors[issue.priority]} capitalize text-xs`}>
                          {issue.priority}
                        </Badge>
                        <span className="font-medium text-foreground">{issue.title}</span>
                      </div>
                      {openIssues[idx] ? (
                        <ChevronUp className="h-5 w-5 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-muted-foreground" />
                      )}
                    </div>
                  </button>
                  {openIssues[idx] && (
                    <div className="border-t border-border bg-secondary/30 p-4">
                      <p className="text-sm text-muted-foreground">
                        <span className="font-medium text-foreground">How to fix: </span>
                        {issue.fix}
                      </p>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */

export function BusinessClient({ storefronts }: { storefronts: StorefrontSummaryItem[] }) {
  const [url, setUrl] = useState("");
  const [urlError, setUrlError] = useState<string | null>(null);
  const [viewState, setViewState] = useState<ViewState>("landing");
  const [currentStep, setCurrentStep] = useState(0);
  const [report, setReport] = useState<AuditReport | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const cancel = useCallback(() => {
    abortRef.current?.abort();
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setViewState("landing");
    setCurrentStep(0);
    setErrorMsg(null);
  }, []);

  const handleAudit = useCallback(async () => {
    const trimmed = url.trim();
    if (!trimmed) {
      setUrlError("Please enter a URL");
      return;
    }
    const normalizedUrl = normalizeUrl(trimmed);
    setUrlError(null);
    setViewState("loading");
    setCurrentStep(0);
    setReport(null);
    setErrorMsg(null);

    const ctrl = new AbortController();
    abortRef.current = ctrl;

    timeoutRef.current = setTimeout(() => {
      ctrl.abort();
      setErrorMsg("Audit timed out. Please try again.");
      setViewState("error");
    }, TIMEOUT_MS);

    try {
      const r = await fetch("/api/audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: normalizedUrl }),
        signal: ctrl.signal,
      });

      if (!r.ok) {
        const j = await r.json().catch(() => ({}));
        throw new Error((j as { error?: string }).error ?? `Audit failed: ${r.status}`);
      }
      if (!r.body) throw new Error("No response stream from audit.");

      const reader = r.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let found: AuditReport | null = null;
      let finished = false;

      while (!finished) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        let idx = buffer.indexOf("\n");
        while (idx >= 0) {
          const line = buffer.slice(0, idx).trim();
          buffer = buffer.slice(idx + 1);
          const payload = parseStreamLine(line);
          if (payload && isCrawlEvent(payload)) {
            const step = stepFromEvent(payload as { type: string });
            if (step >= 0) setCurrentStep((p) => Math.max(p, step));
          }
          if (payload && isAuditReport(payload)) {
            found = payload;
            finished = true;
            break;
          }
          idx = buffer.indexOf("\n");
        }
      }

      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      await reader.cancel().catch(() => {});

      if (!found && buffer.trim()) {
        const payload = parseStreamLine(buffer.trim());
        if (payload && isAuditReport(payload)) found = payload;
      }

      if (!found) throw new Error("Audit stream ended without a report.");

      setReport(found);
      setCurrentStep(STEPS.length - 1);
      setViewState("results");
    } catch (e) {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (e instanceof Error && e.name === "AbortError") return;
      setErrorMsg(e instanceof Error ? e.message : "Something went wrong.");
      setViewState("error");
    }
  }, [url]);

  if (viewState === "loading") {
    return (
      <AuditLoadingView
        url={normalizeUrl(url)}
        currentStep={currentStep}
        onCancel={cancel}
      />
    );
  }

  if (viewState === "results" && report) {
    return (
      <AuditResultsView
        report={report}
        onBack={() => {
          setViewState("landing");
          setReport(null);
          setUrl("");
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <section className="hero-map relative overflow-hidden px-4 py-16 md:py-24">
        <div className="relative mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-2">
          <div className="text-center lg:text-left">
            <p className="av-eyebrow mb-3">For businesses</p>
            <h1 className="mb-4 text-4xl font-extrabold leading-tight tracking-tight text-white md:text-5xl">
              Connecting Tourists to Local Businesses{" "}
              <span className="text-gold">Through AI</span>
            </h1>
            <p className="mx-auto mb-8 max-w-xl text-base text-indigo-100/80 md:text-lg lg:mx-0">
              Get a free AI audit of your website and see how ChatGPT, Gemini, and Perplexity view your business. Then{" "}
              <span className="font-semibold text-white">let AI build your new site.</span>
            </p>

            {viewState === "error" && errorMsg && (
              <div className="mb-6 rounded-lg border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                {errorMsg}
              </div>
            )}

            <div className="mx-auto mb-2 flex max-w-xl flex-col gap-3 sm:flex-row lg:mx-0">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="url"
                  placeholder="https://your-restaurant.com"
                  value={url}
                  onChange={(e) => { setUrl(e.target.value); if (urlError) setUrlError(null); }}
                  onKeyDown={(e) => e.key === "Enter" && handleAudit()}
                  className={`h-14 bg-white pl-10 text-base shadow-sm ${urlError ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                />
              </div>
              <Button
                onClick={handleAudit}
                size="lg"
                className="h-14 bg-gold px-8 text-lg font-bold text-kon shadow-lg transition-all hover:scale-[1.02] hover:bg-gold/90 hover:shadow-xl"
              >
                Audit My Site
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>

            {urlError && (
              <p className="mx-auto mb-4 max-w-xl text-left text-sm text-red-200 lg:mx-0">
                {urlError}
              </p>
            )}

            <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-sm text-indigo-100/80 md:gap-6 lg:justify-start">
              {["Free", "No signup", "Results in 30 seconds"].map((f) => (
                <div key={f} className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-gold" />
                  <span>{f}</span>
                </div>
              ))}
            </div>
          </div>

          <ChatGptDemo />
        </div>
      </section>

      <StatsSection />
      <HowItWorksSection />
      <RecentShowcase storefronts={storefronts} />

      <footer className="border-t border-border py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>© 2026 AIVIBLE. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
