import Anthropic from "@anthropic-ai/sdk";
import { getRestaurantsForMap } from "@/lib/restaurants/queries";
import { parseJsonLenient } from "@/lib/sites/json-extract";
import type { Restaurant } from "@/lib/db/schema/restaurant";
import type { Itinerary, ItineraryDay, ItineraryStop, PlanItineraryInput } from "./types";

const MODEL = "claude-sonnet-4-6";

function getClient(): Anthropic | null {
  const apiKey = process.env.ANTHROPIC_API_KEY ?? "";
  if (!apiKey) return null;
  try {
    return new Anthropic({ apiKey });
  } catch {
    return null;
  }
}

function daysBetween(start?: string, end?: string): number {
  if (!start || !end) return 3;
  const a = new Date(start).getTime();
  const b = new Date(end).getTime();
  if (Number.isNaN(a) || Number.isNaN(b) || b < a) return 3;
  const days = Math.round((b - a) / 86_400_000) + 1;
  return Math.min(10, Math.max(1, days));
}

function matchesDestination(r: Restaurant, dest: string): boolean {
  const hay = [r.area, r.prefecture, r.region, r.nameEn]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  return dest
    .toLowerCase()
    .split(/[\s,]+/)
    .filter((w) => w.length > 2)
    .some((w) => hay.includes(w));
}

function toStop(r: Restaurant): ItineraryStop {
  return {
    id: r.id,
    slug: r.slug,
    name: r.nameEn,
    nameJp: r.nameJp,
    category: r.category,
    area: r.area,
    lat: r.lat as number,
    lng: r.lng as number,
    blurb: r.shortEn ?? r.aiOverview ?? "",
    imageUrl: r.imageUrl,
    hiddenGem: !!r.hiddenGem,
    price: r.price,
  };
}

/** Pick candidate restaurants near the destination (with coordinates). */
export async function getCandidates(destination: string): Promise<Restaurant[]> {
  const all = (await getRestaurantsForMap()).filter((r) => r.lat != null && r.lng != null);
  const matched = all.filter((r) => matchesDestination(r, destination));
  const pool = matched.length >= 3 ? matched : all;
  return pool.slice(0, 40);
}

function roundRobin(candidates: Restaurant[], totalDays: number, destination: string): ItineraryDay[] {
  const days: ItineraryDay[] = Array.from({ length: totalDays }, (_, i) => ({
    dayNumber: i + 1,
    title: `Day ${i + 1} — ${destination}`,
    area: null,
    stops: [],
  }));
  candidates.forEach((r, i) => days[i % totalDays].stops.push(toStop(r)));
  return days.filter((d) => d.stops.length > 0);
}

interface ClaudePlan {
  days?: { title?: string; area?: string; stopSlugs?: string[] }[];
}

async function claudePlan(
  client: Anthropic,
  input: PlanItineraryInput,
  totalDays: number,
  candidates: Restaurant[],
): Promise<ItineraryDay[] | null> {
  const compact = candidates.map((r) => ({
    slug: r.slug,
    name: r.nameEn,
    category: r.category,
    area: r.area ?? r.prefecture,
    lat: r.lat,
    lng: r.lng,
    hiddenGem: !!r.hiddenGem,
    note: (r.shortEn ?? r.aiOverview ?? "").slice(0, 160),
  }));

  const prompt = `Plan a ${totalDays}-day trip to "${input.destination}".${
    input.style ? ` Traveler style: ${input.style}.` : ""
  }
Choose and ORDER places from the candidate list below into ${totalDays} days. Group by geography so each day is walkable/drivable; put 2–4 stops per day; prefer hidden gems when relevant to the style. Only use slugs from the list.

Candidates (JSON):
${JSON.stringify(compact)}

Return ONLY JSON of this exact shape, no prose:
{"days":[{"title":"Day 1 — <area>","area":"<area>","stopSlugs":["slug-a","slug-b"]}]}`;

  try {
    const res = await client.messages.create({
      model: MODEL,
      max_tokens: 2000,
      system: "You are an expert Japan travel planner. Output ONLY valid JSON.",
      messages: [{ role: "user", content: prompt }],
    });
    const txt = res.content
      .map((c) => ("text" in c && typeof c.text === "string" ? c.text : ""))
      .join("\n")
      .trim();
    const parsed = parseJsonLenient(txt) as ClaudePlan;
    if (!parsed?.days?.length) return null;

    const bySlug = new Map(candidates.map((r) => [r.slug, r]));
    const days: ItineraryDay[] = [];
    parsed.days.slice(0, totalDays).forEach((d, i) => {
      const stops = (d.stopSlugs ?? [])
        .map((s) => bySlug.get(s))
        .filter((r): r is Restaurant => !!r)
        .map(toStop);
      if (stops.length) {
        days.push({
          dayNumber: i + 1,
          title: d.title ?? `Day ${i + 1} — ${input.destination}`,
          area: d.area ?? null,
          stops,
        });
      }
    });
    return days.length ? days : null;
  } catch {
    return null;
  }
}

export async function generateItinerary(
  input: PlanItineraryInput,
  slug: string,
): Promise<Itinerary> {
  const totalDays = daysBetween(input.start, input.end);
  const candidates = await getCandidates(input.destination);
  const client = getClient();

  let days: ItineraryDay[] | null = null;
  let source: "claude" | "fallback" = "fallback";
  if (client && candidates.length) {
    days = await claudePlan(client, input, totalDays, candidates);
    if (days) source = "claude";
  }
  if (!days) days = roundRobin(candidates, totalDays, input.destination);

  return {
    slug,
    destination: input.destination,
    style: input.style ?? null,
    startDate: input.start ?? null,
    endDate: input.end ?? null,
    totalDays: days.length || totalDays,
    days,
    createdAt: new Date().toISOString(),
    meta: { source },
  };
}

interface CustomizePlan {
  reply?: string;
  days?: { dayNumber?: number; title?: string; area?: string; stopSlugs?: string[] }[];
}

/** Apply a free-text change to an existing itinerary without re-planning from scratch. */
export async function customizeItinerary(
  current: Itinerary,
  message: string,
): Promise<{ itinerary: Itinerary; reply: string }> {
  const client = getClient();
  if (!client) {
    return { itinerary: current, reply: "AI planning is unavailable right now." };
  }

  const candidates = await getCandidates(current.destination);

  // Merged resolution map: current stops by slug (full ItineraryStop) + fresh candidates
  const currentStopsBySlug = new Map<string, ItineraryStop>();
  current.days.forEach((d) => d.stops.forEach((s) => currentStopsBySlug.set(s.slug, s)));
  const candidatesBySlug = new Map(candidates.map((r) => [r.slug, r]));

  const currentDays = current.days.map((d) => ({
    dayNumber: d.dayNumber,
    title: d.title,
    area: d.area,
    stops: d.stops.map((s) => ({ slug: s.slug, name: s.name })),
  }));

  const pool = candidates.map((r) => ({
    slug: r.slug,
    name: r.nameEn,
    category: r.category,
    area: r.area ?? r.prefecture,
    hiddenGem: !!r.hiddenGem,
  }));

  const prompt = `Current itinerary for "${current.destination}":
${JSON.stringify(currentDays)}

Additional places available to add:
${JSON.stringify(pool)}

User request: "${message}"

Apply the user's request. You may remove, add, reorder, or replace stops. Keep everything not mentioned unchanged. Only use slugs from the current itinerary or the additional list.

Return ONLY JSON (no prose, no markdown):
{"reply":"<one sentence describing what you changed>","days":[{"dayNumber":1,"title":"Day 1 — area","area":"area","stopSlugs":["slug-a","slug-b"]}]}`;

  try {
    const res = await client.messages.create({
      model: MODEL,
      max_tokens: 2000,
      system: "You are an expert Japan travel planner. Output ONLY valid JSON.",
      messages: [{ role: "user", content: prompt }],
    });

    const txt = res.content
      .map((c) => ("text" in c && typeof c.text === "string" ? c.text : ""))
      .join("\n")
      .trim();

    const parsed = parseJsonLenient(txt) as CustomizePlan;
    if (!parsed?.days?.length) {
      return { itinerary: current, reply: "Couldn't apply that change — try rephrasing." };
    }

    const days: ItineraryDay[] = [];
    parsed.days.forEach((d, i) => {
      const stops = (d.stopSlugs ?? [])
        .map((slug) => {
          const existing = currentStopsBySlug.get(slug);
          if (existing) return existing;
          const r = candidatesBySlug.get(slug);
          return r ? toStop(r) : null;
        })
        .filter((s): s is ItineraryStop => !!s);

      if (stops.length) {
        days.push({
          dayNumber: d.dayNumber ?? i + 1,
          title: d.title ?? `Day ${i + 1} — ${current.destination}`,
          area: d.area ?? null,
          stops,
        });
      }
    });

    // Renumber sequentially to close gaps from removed stops/days
    days.forEach((d, i) => { d.dayNumber = i + 1; });

    const itinerary: Itinerary = {
      ...current,
      days: days.length ? days : current.days,
      totalDays: days.length || current.totalDays,
      meta: { source: "claude" },
    };

    return {
      itinerary,
      reply: parsed.reply ?? `Updated your ${current.destination} itinerary.`,
    };
  } catch {
    return { itinerary: current, reply: "Couldn't apply that change — try rephrasing." };
  }
}
