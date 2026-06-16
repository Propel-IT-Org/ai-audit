"use client";

import { useEffect, useState } from "react";

const QUESTION = "I'm visiting Kyoto next month — can you recommend a great kaiseki restaurant with good English menus?";
const REPLY = "I don't have reliable information about which Kyoto kaiseki restaurants currently offer English menus. Restaurant details, seasonal menus, and booking policies change frequently. I'd suggest checking Google Maps, TripAdvisor, or contacting restaurants directly for the most up-to-date information.";

type Phase = "typing" | "thinking" | "reply";

function TypingDots() {
  return (
    <span className="flex items-center gap-1 py-1" aria-label="ChatGPT is typing">
      {[0, 150, 300].map((d) => (
        <span
          key={d}
          className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-400"
          style={{ animationDelay: `${d}ms` }}
        />
      ))}
    </span>
  );
}

export function ChatGptDemo() {
  const [typed, setTyped] = useState("");
  const [phase, setPhase] = useState<Phase>("typing");

  useEffect(() => {
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      setTyped(QUESTION);
      setPhase("reply");
      return;
    }
    setTyped("");
    setPhase("typing");
    let i = 0;
    let think: ReturnType<typeof setTimeout>;
    const typer = setInterval(() => {
      i += 1;
      setTyped(QUESTION.slice(0, i));
      if (i >= QUESTION.length) {
        clearInterval(typer);
        setPhase("thinking");
        think = setTimeout(() => setPhase("reply"), 1000);
      }
    }, 28);
    return () => {
      clearInterval(typer);
      clearTimeout(think);
    };
  }, []);

  return (
    <div className="text-left">
      <p className="av-eyebrow mb-3 text-indigo-100/80">What travelers ask AI today</p>

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl">
        <div className="flex items-center gap-2 border-b border-gray-100 px-4 py-2.5">
          <span
            className="flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-bold text-white"
            style={{ background: "#10A37F" }}
            aria-hidden="true"
          >
            ✺
          </span>
          <span className="text-sm font-semibold text-gray-700">ChatGPT</span>
        </div>
        <div className="min-h-[150px] space-y-4 px-4 py-5">
          <div className="flex justify-end">
            <div className="max-w-[82%] rounded-2xl rounded-tr-sm bg-gray-100 px-4 py-2.5 text-sm text-gray-800">
              {typed}
              {phase === "typing" && (
                <span className="ml-0.5 inline-block w-1.5 animate-pulse text-gray-400">▍</span>
              )}
            </div>
          </div>

          {phase !== "typing" && (
            <div className="flex items-start gap-2.5">
              <span
                className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs text-white"
                style={{ background: "#10A37F" }}
                aria-hidden="true"
              >
                ✺
              </span>
              <div className="max-w-[88%] rounded-2xl rounded-tl-sm border border-gray-100 bg-gray-50 px-4 py-3 text-sm leading-relaxed text-gray-700">
                {phase === "thinking" ? <TypingDots /> : REPLY}
              </div>
            </div>
          )}
        </div>
      </div>

      <p className="mt-4 text-sm font-semibold text-white">
        Your customers can&apos;t find you. Let&apos;s fix that.
      </p>
    </div>
  );
}
