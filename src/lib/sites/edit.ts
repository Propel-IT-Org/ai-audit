import Anthropic from "@anthropic-ai/sdk";
import { readPublishedSite, writePublishedSite } from "./storage";
import { parseJsonLenient } from "./json-extract";
import type { AnySiteData } from "./types";

const MODEL = "claude-sonnet-4-6";

export interface EditTurn {
  role: "user" | "assistant";
  content: string;
}

export interface EditResult {
  ok: boolean;
  reply: string;
  data?: AnySiteData;
  error?: string;
}

function getClient(): Anthropic | null {
  const apiKey = process.env.ANTHROPIC_API_KEY ?? "";
  if (!apiKey) return null;
  try {
    return new Anthropic({ apiKey });
  } catch {
    return null;
  }
}

/** Minimal structural guard so a bad model reply can't corrupt the stored site. */
function isValidData(orig: AnySiteData, next: unknown): next is AnySiteData {
  if (!next || typeof next !== "object") return false;
  const d = next as Record<string, unknown>;
  if (d.industry !== orig.industry) return false;
  if (typeof d.name !== "string" || !d.name.trim()) return false;
  if (!Array.isArray(d.gallery)) return false;
  if (typeof d.hero !== "object" || d.hero === null) return false;
  if (typeof d.contact !== "object" || d.contact === null) return false;
  return true;
}

export async function editStorefront(
  subdomain: string,
  message: string,
  history: EditTurn[],
): Promise<EditResult> {
  const site = await readPublishedSite(subdomain);
  if (!site) return { ok: false, reply: "Storefront not found.", error: "NOT_FOUND" };

  const client = getClient();
  if (!client) {
    return { ok: false, reply: "AI editing is unavailable (no API key configured).", error: "NO_AI" };
  }

  const convo = history
    .slice(-6)
    .map((t) => `${t.role.toUpperCase()}: ${t.content}`)
    .join("\n");

  const prompt = `You are editing a published business website's structured content (JSON).
Apply the user's requested change. Keep the same "industry" and overall structure — only modify what the user asks. Preserve existing image URLs unless told otherwise. Do not invent menus/sections that didn't exist.

Conversation so far:
${convo || "(none)"}

User request: "${message}"

Current data (JSON):
${JSON.stringify(site.data)}

Return ONLY JSON of this exact shape (no prose, no markdown fences):
{"reply":"<one short sentence describing what you changed>","data":<the FULL updated data object>}`;

  try {
    const res = await client.messages.create({
      model: MODEL,
      max_tokens: 4000,
      system: "You are a precise website content editor. Output ONLY a single valid JSON object.",
      messages: [{ role: "user", content: prompt }],
    });
    const txt = res.content
      .map((c) => ("text" in c && typeof c.text === "string" ? c.text : ""))
      .join("\n")
      .trim();
    const parsed = parseJsonLenient(txt) as { reply?: string; data?: unknown };

    if (!parsed?.data || !isValidData(site.data, parsed.data)) {
      return { ok: false, reply: "I couldn't apply that safely — try rephrasing.", error: "INVALID" };
    }

    const updated = { ...site, data: parsed.data, updatedAt: new Date().toISOString() };
    await writePublishedSite(updated);
    return { ok: true, reply: parsed.reply ?? "Done.", data: parsed.data };
  } catch (e) {
    return { ok: false, reply: "Something went wrong applying the edit.", error: e instanceof Error ? e.message : "ERROR" };
  }
}
