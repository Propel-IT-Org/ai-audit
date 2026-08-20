"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Audit } from "@/lib/db/schema/audit";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  AlertTriangle,
  CheckCircle2,
  Lock,
  Download,
  ArrowRight,
  Sparkles,
  Search,
  MapPin,
  RefreshCw,
  Globe2,
  ShieldCheck,
  Zap,
} from "lucide-react";

interface SmeScoreAuditorProps {
  initialAudit?: Audit | null;
  initialLang?: "ja" | "en";
}

export function SmeScoreAuditor({ initialAudit, initialLang = "en" }: SmeScoreAuditorProps) {
  const [lang, setLang] = useState<"ja" | "en">(() => {
    if (initialLang) return initialLang;
    if (typeof window !== "undefined" && navigator.language.toLowerCase().startsWith("ja")) {
      return "ja";
    }
    return "en";
  });

  const [businessOrUrl, setBusinessOrUrl] = useState("");
  const [location, setLocation] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [audit, setAudit] = useState<Audit | null>(initialAudit || null);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [email, setEmail] = useState("");
  const [isUnlocking, setIsUnlocking] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const loadingSteps = lang === "ja"
    ? [
        "ChatGPT & Gemini の回答をスキャン中...",
        "Perplexity & Claude でのハルシネーションを調査中...",
        "インバウンド旅行者向けの英語誘導力を評価中...",
        "AI可視性スコアカードを生成中...",
      ]
    : [
        "Scanning ChatGPT & Gemini knowledge graph...",
        "Checking Perplexity & Claude for hallucinations...",
        "Evaluating English inbound booking readiness...",
        "Generating AI Visibility Scorecard...",
      ];

  const handleRunAudit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanBusiness = businessOrUrl.trim();
    const cleanLoc = location.trim();

    if (!cleanBusiness) {
      setErrorMsg(lang === "ja" ? "ウェブサイトURLまたは店名を入力してください" : "Please enter your website URL or business name.");
      return;
    }

    setIsLoading(true);
    setErrorMsg("");
    setAudit(null);
    setIsUnlocked(false);

    let step = 0;
    const interval = setInterval(() => {
      step = (step + 1) % loadingSteps.length;
      setLoadingStep(step);
    }, 1200);

    try {
      const res = await fetch("/api/probe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessName: cleanBusiness,
          location: cleanLoc || "Japan",
          language: lang,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Probe failed");
      }

      setAudit(data.audit);
    } catch (err: unknown) {
      console.error("Audit error:", err);
      const message = err instanceof Error ? err.message : "";
      setErrorMsg(message || (lang === "ja" ? "診断中にエラーが発生しました。" : "Failed to run audit. Please try again."));
    } finally {
      clearInterval(interval);
      setIsLoading(false);
    }
  };

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes("@")) {
      setErrorMsg(lang === "ja" ? "有効なメールアドレスを入力してください" : "Please enter a valid email address.");
      return;
    }

    setIsUnlocking(true);
    setErrorMsg("");

    try {
      const res = await fetch("/api/leads/unlock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ auditId: audit?.id, email }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to unlock");
      }

      setIsUnlocked(true);
    } catch (err: unknown) {
      console.error("Unlock error:", err);
      const message = err instanceof Error ? err.message : "Unlock failed";
      setErrorMsg(message);
    } finally {
      setIsUnlocking(false);
    }
  };

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-emerald-600 border-emerald-500 bg-emerald-50";
    if (score >= 60) return "text-amber-600 border-amber-500 bg-amber-50";
    return "text-rose-600 border-rose-500 bg-rose-50";
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4">
      {/* Top Locale Switcher */}
      <div className="flex justify-end mb-4">
        <button
          type="button"
          onClick={() => setLang(lang === "ja" ? "en" : "ja")}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-full border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 transition-colors shadow-sm"
        >
          <Globe2 className="w-3.5 h-3.5" />
          <span>{lang === "ja" ? "English に切替" : "日本語に切替"}</span>
        </button>
      </div>

      {/* Main Commanding Hero + Prominent Form */}
      {!audit && (
        <div className="text-center max-w-3xl mx-auto mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent-brand/10 text-accent-brand font-semibold text-xs mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>
              {lang === "ja"
                ? "AI検索（ChatGPT・Gemini・Perplexity）無料診断"
                : "Free AI Visibility Audit for Japan"}
            </span>
          </div>

          <h1 className="text-3xl md:text-5xl font-black tracking-tight text-gray-900 leading-tight">
            {lang === "ja" ? (
              <>
                あなたの店・ウェブサイトは、
                <br />
                <span className="text-accent-brand">AI検索でどう推薦されていますか？</span>
              </>
            ) : (
              <>
                Audit Your Business
                <br />
                <span className="text-accent-brand">In AI Search in 10 Seconds</span>
              </>
            )}
          </h1>

          <p className="mt-3 text-sm md:text-base text-gray-600 max-w-xl mx-auto">
            {lang === "ja"
              ? "URLまたは店名を入力。AIが海外旅行者に回答している営業時間・料金・誤情報を即座に無料スキャンします。"
              : "Enter your website URL or business name to see what AI answer engines tell foreign travelers right now."}
          </p>
        </div>
      )}

      {/* Commanding, Extra-Large Form Box */}
      <div className="bg-white rounded-3xl shadow-2xl border-2 border-gray-100 p-6 md:p-10 max-w-3xl mx-auto">
        <form onSubmit={handleRunAudit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-800 mb-2 flex items-center gap-2">
              <Globe2 className="w-4 h-4 text-accent-brand" />
              {lang === "ja" ? "ウェブサイトURL または 店名・会社名" : "Website URL or Business / Entity Name"}
            </label>
            <div className="relative">
              <Input
                type="text"
                placeholder={
                  lang === "ja"
                    ? "例: tanaka-ryokan.com または 田中旅館"
                    : "e.g. https://tanaka-ryokan.com or Tanaka Ryokan"
                }
                value={businessOrUrl}
                onChange={(e) => setBusinessOrUrl(e.target.value)}
                disabled={isLoading}
                className="h-16 text-lg md:text-xl font-medium px-5 rounded-2xl border-2 border-gray-200 focus:border-accent-brand focus:ring-accent-brand transition-all shadow-inner"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-800 mb-2 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-accent-brand" />
              {lang === "ja" ? "所在地 / 市区町村 (URL入力時は省略可)" : "Location / City (Optional if entering full URL)"}
            </label>
            <div className="relative">
              <Input
                type="text"
                placeholder={lang === "ja" ? "例: 金沢市 / 京都市 / 東京都渋谷区" : "e.g. Kanazawa, Ishikawa / Kyoto / Tokyo"}
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                disabled={isLoading}
                className="h-14 text-base md:text-lg font-medium px-5 rounded-2xl border-2 border-gray-200 focus:border-accent-brand focus:ring-accent-brand transition-all shadow-inner"
              />
            </div>
          </div>

          {errorMsg && (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm font-medium flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full h-16 text-lg md:text-xl font-black rounded-2xl bg-accent-brand hover:bg-accent-brand/90 text-white shadow-xl shadow-accent-brand/25 transition-all flex items-center justify-center gap-3 active:scale-[0.99]"
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-6 h-6 animate-spin" />
                <span className="text-base md:text-lg">{loadingSteps[loadingStep]}</span>
              </>
            ) : (
              <>
                <Search className="w-6 h-6" />
                <span>{lang === "ja" ? "無料でAI可視性を診断する (10秒)" : "Audit My Business Now (Free · 10s)"}</span>
              </>
            )}
          </Button>

          {/* Quick Trust Badges Strip */}
          <div className="pt-3 flex flex-wrap items-center justify-center gap-4 text-xs font-semibold text-gray-500">
            <span className="flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 text-amber-500" />
              {lang === "ja" ? "10秒で即時スキャン" : "10-Second Instant Scan"}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-accent-brand" />
              {lang === "ja" ? "ChatGPT & Gemini 対応" : "ChatGPT, Gemini & Perplexity"}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              {lang === "ja" ? "登録不要・完全無料" : "No Sign Up Required"}
            </span>
          </div>
        </form>
      </div>

      {/* Audit Report View */}
      {audit && (
        <div className="mt-12 space-y-8 animate-in fade-in-50 duration-500">
          {/* Top Score Banner */}
          <div className="bg-white rounded-3xl border-2 border-gray-100 shadow-xl p-6 md:p-10">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 border-b border-gray-100 pb-8">
              <div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs uppercase tracking-wider font-bold">
                    {audit.entityType}
                  </Badge>
                  <span className="text-xs text-gray-400">
                    ID: {audit.id} · {new Date(audit.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <h2 className="text-2xl md:text-4xl font-extrabold text-gray-900 mt-2">
                  {audit.businessName}
                </h2>
                <p className="text-gray-500 text-sm flex items-center gap-1 mt-1 font-medium">
                  <MapPin className="w-4 h-4 text-gray-400" /> {audit.location}
                </p>
              </div>

              <div className="flex items-center gap-6">
                <div className="text-center">
                  <div
                    className={`w-28 h-28 rounded-full border-4 flex flex-col items-center justify-center shadow-inner ${getScoreColor(
                      audit.overallScore
                    )}`}
                  >
                    <span className="text-3xl font-black">{audit.overallScore}</span>
                    <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
                      Grade: {audit.grade}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Teaser Alarm Alert */}
            <div className="mt-6 p-5 rounded-2xl bg-amber-50/90 border border-amber-200/80">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-base font-bold text-amber-900">
                    {lang === "ja" ? "AI検索における検出アラート" : "Critical AI Engine Findings"}
                  </h3>
                  <p className="mt-1 text-sm text-amber-800 leading-relaxed font-medium">
                    {audit.teaserSummary}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Gated Content / Unlocked Content */}
          {!isUnlocked ? (
            <div className="relative rounded-3xl overflow-hidden border-2 border-gray-200 shadow-2xl bg-white">
              {/* Blurred Teaser Preview */}
              <div className="p-8 filter blur-sm select-none pointer-events-none opacity-40 space-y-6">
                <div className="h-28 bg-gray-100 rounded-2xl"></div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="h-36 bg-gray-100 rounded-2xl"></div>
                  <div className="h-36 bg-gray-100 rounded-2xl"></div>
                </div>
                <div className="h-40 bg-gray-100 rounded-2xl"></div>
              </div>

              {/* Lead Capture Gate Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-white via-white/95 to-white/80 flex flex-col items-center justify-center p-6 text-center">
                <div className="w-14 h-14 rounded-2xl bg-accent-brand/10 text-accent-brand flex items-center justify-center mb-4">
                  <Lock className="w-7 h-7" />
                </div>
                <h3 className="text-2xl md:text-3xl font-extrabold text-gray-900 max-w-lg">
                  {lang === "ja" ? "完全な4軸詳細レポートと改善策を解放" : "Unlock Full 4-Dimension Report & Action Plan"}
                </h3>
                <p className="mt-2 text-sm text-gray-600 max-w-md">
                  {lang === "ja"
                    ? "メールアドレスを入力すると、AIが誤認している具体的な内容、4つの評価軸、改善ステップを即座に表示します。"
                    : "Enter your email to reveal exact AI hallucinations, 4-dimension breakdowns, and printable PDF report."}
                </p>

                <form onSubmit={handleUnlock} className="mt-6 w-full max-w-md space-y-3">
                  <Input
                    type="email"
                    placeholder={lang === "ja" ? "owner@your-business.jp" : "owner@business.com"}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={isUnlocking}
                    className="h-14 rounded-2xl text-center text-base md:text-lg font-medium border-2"
                  />
                  <Button
                    type="submit"
                    disabled={isUnlocking}
                    className="w-full h-14 rounded-2xl bg-kon2 hover:bg-kon text-white font-bold text-base shadow-lg"
                  >
                    {isUnlocking ? (
                      <RefreshCw className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        <span>{lang === "ja" ? "無料で即時アンロック" : "Unlock Full Report (Instant)"}</span>
                        <ArrowRight className="w-4 h-4 ml-1.5" />
                      </>
                    )}
                  </Button>
                </form>
              </div>
            </div>
          ) : (
            /* Unlocked Full Scorecard */
            <div className="space-y-8 animate-in fade-in duration-500">
              {/* Actions Header Bar */}
              <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                <span className="text-sm font-bold text-emerald-700 flex items-center gap-1.5">
                  <CheckCircle2 className="w-5 h-5" />
                  {lang === "ja" ? "レポート完全版が解放されました" : "Full Report Unlocked"}
                </span>
                <div className="flex items-center gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handlePrint}
                    className="gap-2 rounded-xl text-xs font-bold h-10"
                  >
                    <Download className="w-4 h-4" />
                    {lang === "ja" ? "1枚のPDFで保存 / 印刷" : "Download 1-Page PDF"}
                  </Button>
                  <Link
                    href={`/generate?name=${encodeURIComponent(audit.businessName)}&location=${encodeURIComponent(
                      audit.location
                    )}`}
                  >
                    <Button className="gap-2 rounded-xl bg-accent-brand hover:bg-accent-brand/90 text-white text-xs font-bold shadow-md h-10">
                      <Sparkles className="w-4 h-4" />
                      {lang === "ja" ? "AI対応サイトを生成する" : "Generate AI Storefront"}
                    </Button>
                  </Link>
                </div>
              </div>

              {/* 4 Dimensions Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {Object.entries(audit.dimensions).map(([key, dim]) => (
                  <div key={key} className="bg-white rounded-2xl border border-gray-100 shadow-md p-6">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-bold text-gray-900 text-base">{dim.name}</h4>
                      <Badge
                        variant={dim.status === "critical" ? "destructive" : "secondary"}
                        className="font-bold text-xs"
                      >
                        {dim.score}/100 ({dim.grade})
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-3 leading-relaxed">{dim.summary}</p>
                    <ul className="space-y-1.5 text-xs text-gray-500 font-medium">
                      {dim.details?.map((d, i) => (
                        <li key={i} className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-accent-brand"></span>
                          {d}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>

              {/* Hallucinations & Misconceptions */}
              {audit.hallucinations && audit.hallucinations.length > 0 && (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-md p-6 md:p-8">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-rose-500" />
                    {lang === "ja" ? "AIが回答している誤情報・ハルシネーション" : "Detected AI Hallucinations & Errors"}
                  </h3>
                  <div className="space-y-4">
                    {audit.hallucinations.map((h, i) => (
                      <div key={i} className="p-4 rounded-xl bg-rose-50/70 border border-rose-200/70">
                        <div className="flex items-center justify-between text-xs font-bold text-rose-800 uppercase tracking-wider mb-1">
                          <span>{lang === "ja" ? "AIの不正確な回答" : "AI Claim"}</span>
                          <span className="text-rose-600">Severity: {h.severity}</span>
                        </div>
                        <p className="text-sm font-bold text-rose-950">&quot;{h.claim}&quot;</p>
                        {h.reality && (
                          <div className="mt-2 text-xs text-rose-800 pt-2 border-t border-rose-200/50 font-medium">
                            <strong>{lang === "ja" ? "正しい対策:" : "Resolution:"}</strong> {h.reality}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Prioritized Action Items */}
              {audit.actionItems && audit.actionItems.length > 0 && (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-md p-6 md:p-8">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    {lang === "ja" ? "スコアを改善するための3ステップ" : "Recommended Action Plan"}
                  </h3>
                  <div className="space-y-3">
                    {audit.actionItems.map((action, i) => (
                      <div key={i} className="flex items-start gap-4 p-4 rounded-xl bg-gray-50 border border-gray-100">
                        <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 font-bold text-sm flex items-center justify-center flex-shrink-0">
                          {action.priority || i + 1}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h5 className="text-sm font-bold text-gray-900">{action.title}</h5>
                            <span className="text-xs font-bold text-emerald-600">{action.estimatedImpact}</span>
                          </div>
                          <p className="text-xs text-gray-600 mt-1">{action.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Bottom Upsell Card */}
              <div className="p-8 rounded-3xl bg-gradient-to-r from-kon2 to-kon text-white text-center shadow-2xl">
                <h3 className="text-2xl md:text-3xl font-extrabold">
                  {lang === "ja" ? "AI検索で推薦される公式ウェブサイトを今すぐ作成" : "Make Your Business Recommended by AI"}
                </h3>
                <p className="mt-2 text-white/80 text-sm max-w-xl mx-auto">
                  {lang === "ja"
                    ? "Aivibleの自動ストアフロント生成ツールで、JSON-LDスキーマとバイリンガル情報を備えたAI最適化サイトを即座に作成できます。"
                    : "Generate an AI-structured, bilingual storefront with verified JSON-LD schema to lock in your official facts."}
                </p>
                <div className="mt-6 flex flex-wrap items-center justify-center gap-4">
                  <Link
                    href={`/generate?name=${encodeURIComponent(audit.businessName)}&location=${encodeURIComponent(
                      audit.location
                    )}`}
                  >
                    <Button className="h-12 px-8 rounded-xl bg-white text-kon font-bold hover:bg-gray-100 shadow-xl">
                      <Sparkles className="w-4 h-4 mr-2 text-accent-brand" />
                      {lang === "ja" ? "AI対応サイトを無料でプレビュー" : "Preview AI Storefront ($0)"}
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
