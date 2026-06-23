import Anthropic from "@anthropic-ai/sdk";
import { parseJsonLenient } from "@/lib/sites/json-extract";

const MODEL = "claude-sonnet-4-6";

export interface DiscoverCandidate {
  slug: string;
  name: string;
  category?: string | null;
  area?: string | null;
  hiddenGem?: boolean;
  note?: string;
}

export interface DiscoverReply {
  reply: string;
  slugs: string[];
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

/**
 * "Shirube" local-guide reply: given the traveler's message and the nearby
 * candidate places, recommend a handful by slug and return a short friendly note.
 */
export async function discoverReply(
  message: string,
  candidates: DiscoverCandidate[],
): Promise<DiscoverReply> {
  const client = getClient();
  if (!client || candidates.length === 0) {
    return {
      reply:
        "I can't reach the guide right now — but the verified gems above are a great place to start.",
      slugs: [],
    };
  }

  const compact = candidates.slice(0, 40).map((c) => ({
    slug: c.slug,
    name: c.name,
    category: c.category ?? undefined,
    area: c.area ?? undefined,
    gem: !!c.hiddenGem,
    note: (c.note ?? "").slice(0, 140),
  }));

  const prompt = `A traveler near these places asked: "${message}"

Nearby places (JSON):
${JSON.stringify(compact)}

Pick the best 2-5 matches from the list. Prefer verified gems ("gem": true) when they fit.
Only use slugs from the list.

Return ONLY JSON (no prose, no markdown):
{"reply":"<one or two warm sentences as a local guide>","slugs":["slug-a","slug-b"]}`;

  try {
    const res = await client.messages.create({
      model: MODEL,
      max_tokens: 600,
      system:
        "You are Shirube, a warm, concise local guide for Japan. Output ONLY valid JSON.",
      messages: [{ role: "user", content: prompt }],
    });
    const txt = res.content
      .map((c) => ("text" in c && typeof c.text === "string" ? c.text : ""))
      .join("\n")
      .trim();
    const parsed = parseJsonLenient(txt) as Partial<DiscoverReply>;
    const valid = new Set(candidates.map((c) => c.slug));
    const slugs = (parsed?.slugs ?? []).filter((s) => valid.has(s)).slice(0, 5);
    return {
      reply: parsed?.reply?.trim() || "Here are a few spots near you worth a look.",
      slugs,
    };
  } catch {
    return {
      reply: "Couldn't pull that together just now — try rephrasing, or browse the list above.",
      slugs: [],
    };
  }
}
