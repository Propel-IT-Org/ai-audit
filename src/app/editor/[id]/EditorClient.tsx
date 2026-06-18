"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Sparkles, Send, ArrowLeft, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { editStorefrontAction } from "@/lib/sites/edit-actions";
import type { EditTurn } from "@/lib/sites/edit";

interface Turn extends EditTurn {
  pending?: boolean;
}

const SUGGESTIONS = [
  "Rewrite the tagline to be punchier",
  "Make the about section warmer",
  "Add a highlight about English-speaking staff",
  "Shorten the description",
];

export function EditorClient({ subdomain, name }: { subdomain: string; name: string }) {
  const [turns, setTurns] = useState<Turn[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [previewKey, setPreviewKey] = useState(0);
  const chatEnd = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEnd.current?.scrollIntoView({ behavior: "smooth" });
  }, [turns]);

  const send = async (text: string) => {
    const msg = text.trim();
    if (!msg || busy) return;
    setInput("");
    setBusy(true);

    const history: EditTurn[] = turns
      .filter((t) => !t.pending)
      .map((t) => ({ role: t.role, content: t.content }));

    setTurns((t) => [...t, { role: "user", content: msg }, { role: "assistant", content: "", pending: true }]);

    const res = await editStorefrontAction(subdomain, msg, history);
    setBusy(false);
    setTurns((t) => {
      const next = [...t];
      const idx = next.findIndex((x) => x.pending);
      if (idx !== -1) next[idx] = { role: "assistant", content: res.reply };
      return next;
    });
    if (res.ok) setPreviewKey((k) => k + 1);
  };

  return (
    <div className="flex h-screen flex-col bg-background">
      <header className="flex items-center justify-between border-b border-border px-4 py-3">
        <div className="min-w-0">
          <h1 className="truncate text-lg font-bold text-foreground">Editing: {name}</h1>
          <p className="text-xs text-muted-foreground">{subdomain}</p>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <Link href={`/storefront/${subdomain}`} className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground">
            <ExternalLink className="h-4 w-4" /> View live
          </Link>
          <Link href="/storefronts" className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" /> All
          </Link>
        </div>
      </header>

      <div className="grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-[380px_1fr]">
        {/* chat */}
        <div className="flex min-h-0 flex-col border-r border-border">
          <div className="flex items-center gap-2 border-b border-border px-4 py-2 text-sm font-semibold text-foreground">
            <Sparkles className="h-4 w-4 text-gold" /> Customize with AI
          </div>
          <div className="flex-1 space-y-3 overflow-y-auto px-4 py-3">
            {turns.length === 0 && (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">Tell the AI what to change. For example:</p>
                <div className="flex flex-col gap-2">
                  {SUGGESTIONS.map((s) => (
                    <button
                      key={s}
                      type="button"
                      disabled={busy}
                      onClick={() => send(s)}
                      className="rounded-lg border border-border px-3 py-2 text-left text-sm text-foreground transition-colors hover:border-kon2 hover:text-kon2 disabled:opacity-50"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {turns.map((t, i) =>
              t.role === "user" ? (
                <div key={i} className="flex justify-end">
                  <div className="max-w-[85%] rounded-2xl bg-kon2 px-3.5 py-2 text-sm text-white">{t.content}</div>
                </div>
              ) : (
                <div key={i} className="flex items-start gap-2">
                  <span className="flex h-7 w-7 flex-none items-center justify-center rounded-full bg-gold/20 text-gold">
                    <Sparkles className="h-3.5 w-3.5" />
                  </span>
                  <div className="max-w-[85%] rounded-2xl border border-border bg-secondary/40 px-3.5 py-2 text-sm text-foreground">
                    {t.pending ? "…" : t.content}
                  </div>
                </div>
              ),
            )}
            <div ref={chatEnd} />
          </div>
          <form
            onSubmit={(e) => { e.preventDefault(); send(input); }}
            className="flex items-center gap-2 border-t border-border px-3 py-2"
          >
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="e.g. change the tagline to…"
              disabled={busy}
              className="h-10"
            />
            <Button type="submit" disabled={busy || !input.trim()} size="icon" className="h-10 w-10 bg-kon2 text-white hover:bg-kon">
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>

        {/* live preview */}
        <div className="min-h-0 bg-muted/30">
          <iframe
            key={previewKey}
            src={`/storefront/${subdomain}`}
            title="Storefront preview"
            className="h-full w-full border-0"
          />
        </div>
      </div>
    </div>
  );
}
