"use client";

import { SmeScoreAuditor } from "@/components/probe/SmeScoreAuditor";
import { CheckCircle2, Bot, Globe2, Sparkles, ShieldCheck, Zap } from "lucide-react";

export default function FrontDoorPage() {
  return (
    <div className="bg-gradient-to-b from-gray-50/70 via-white to-gray-50/50">
      {/* Primary Hero & Interactive Tool */}
      <section className="pt-6 pb-12">
        <SmeScoreAuditor />
      </section>

      {/* Why GEO Matters Section */}
      <section className="py-16 border-t border-gray-100 bg-white">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-accent-brand">
              The 2026 Search Shift
            </span>
            <h2 className="text-2xl md:text-4xl font-extrabold text-gray-900 mt-2">
              Foreign Travelers No Longer Google. They Ask AI.
            </h2>
            <p className="mt-3 text-sm md:text-base text-gray-600">
              When tourists ask ChatGPT or Perplexity for authentic ryokans or dining in Japan, AI answers with direct recommendations. If your data is unreadable, you are invisible.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 rounded-2xl bg-gray-50 border border-gray-100 shadow-sm">
              <div className="w-12 h-12 rounded-xl bg-indigo-50 text-kon2 flex items-center justify-center mb-4">
                <Bot className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Hallucinations & Stale Data</h3>
              <p className="mt-2 text-sm text-gray-600 leading-relaxed">
                Without authoritative structured markup, AI hallucinates your operating hours, confuses your pricing, and claims you don&apos;t accept international travelers.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-gray-50 border border-gray-100 shadow-sm">
              <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-4">
                <Globe2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">English Language Friction</h3>
              <p className="mt-2 text-sm text-gray-600 leading-relaxed">
                Foreign travelers search in English. Aivible bridges the translation gap, making Japanese-only menus and policies instantly readable to global AI answer engines.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-gray-50 border border-gray-100 shadow-sm">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Zero Commission Bypass</h3>
              <p className="mt-2 text-sm text-gray-600 leading-relaxed">
                Direct booking and official contact instructions allow AI to route travelers straight to your reservation channels rather than high-commission third-party OTAs.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How Aivible Works */}
      <section id="how-it-works" className="py-16 bg-gray-50/60 border-t border-gray-100">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-kon2">
              Simple 3-Step Process
            </span>
            <h2 className="text-2xl md:text-4xl font-extrabold text-gray-900 mt-2">
              From Invisible to AI-Recommended
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-md">
              <div className="w-8 h-8 rounded-full bg-kon2 text-white font-bold flex items-center justify-center mb-4 text-sm">
                1
              </div>
              <h4 className="font-bold text-gray-900 text-base">Run Free AI Audit</h4>
              <p className="mt-2 text-xs text-gray-600 leading-relaxed">
                Scan your entity name across LLMs to reveal current hallucinations and English readiness gaps in 10 seconds.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-md">
              <div className="w-8 h-8 rounded-full bg-accent-brand text-white font-bold flex items-center justify-center mb-4 text-sm">
                2
              </div>
              <h4 className="font-bold text-gray-900 text-base">Generate AI Storefront</h4>
              <p className="mt-2 text-xs text-gray-600 leading-relaxed">
                Deploy an AI-optimized, bilingual storefront with verified JSON-LD schema to lock in authoritative business facts.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-md">
              <div className="w-8 h-8 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center mb-4 text-sm">
                3
              </div>
              <h4 className="font-bold text-gray-900 text-base">Get Recommended</h4>
              <p className="mt-2 text-xs text-gray-600 leading-relaxed">
                Watch your AI visibility score rise as ChatGPT, Gemini, and Perplexity start citing your official answers.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
