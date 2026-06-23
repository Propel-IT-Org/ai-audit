"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { MapPin, Sparkles, Send, Star, LocateFixed, Navigation } from "lucide-react";
import { toast } from "sonner";
import {
  MapProvider,
  GoogleMap,
  GemPin,
  CategoryPin,
  AdvancedMarker,
  InfoWindow,
  useMap,
} from "@/components/map/GoogleMap";
import { CategoryIcon } from "@/components/icons";
import { CATEGORY_META, normalizeCategory } from "@/lib/places/categories";
import { haversineKm, formatDistance } from "@/lib/places/distance";
import { discoverChatAction } from "@/lib/discover/actions";
import type { DiscoverCandidate } from "@/lib/discover/chat";
import type { Restaurant } from "@/lib/db/schema/restaurant";

const TOKYO = { lat: 35.6762, lng: 139.6503 };
const QUICK_PROMPTS = ["Cheap eats nearby", "Hidden gems", "Onsen", "Family-friendly"];

interface Ranked {
  r: Restaurant;
  dist: number | null;
}
interface ChatTurn {
  role: "user" | "assistant";
  content: string;
  pending?: boolean;
}

/** Recenters the map when the resolved center (e.g. the user's location) changes. */
function Recenter({ center, zoom }: { center: { lat: number; lng: number }; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    if (!map) return;
    map.panTo(center);
    map.setZoom(zoom);
  }, [map, center, zoom]);
  return null;
}

function PlaceCard({ ranked, suggested }: { ranked: Ranked; suggested?: boolean }) {
  const { r, dist } = ranked;
  const cat = normalizeCategory(r.category);
  return (
    <div className="relative flex gap-3 rounded-lg border border-border bg-white p-3 transition-shadow hover:shadow-md">
      <Link href={`/restaurants/${r.slug}`} aria-label={r.nameEn} className="absolute inset-0 z-0 rounded-lg" />
      {r.imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={r.imageUrl} alt={r.nameEn} className="h-16 w-16 flex-none rounded-md object-cover" />
      ) : (
        <span className="flex h-16 w-16 flex-none items-center justify-center rounded-md bg-[hsl(43,56%,91%)] text-[#223A70]">
          <CategoryIcon category={r.category} size={28} />
        </span>
      )}
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <h3 className="truncate font-semibold text-foreground">{r.nameEn}</h3>
          {r.hiddenGem && <Star className="h-4 w-4 flex-none text-[#C8A859]" />}
        </div>
        <p className="text-xs text-muted-foreground">
          {[CATEGORY_META[cat].label, r.area || r.prefecture].filter(Boolean).join(" · ")}
        </p>
        {r.aiOverview && <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{r.aiOverview}</p>}
        <div className="mt-1.5 flex items-center gap-2">
          {dist != null && (
            <span className="inline-flex items-center gap-1 text-xs text-[#223A70]">
              <Navigation className="h-3 w-3" /> {formatDistance(dist)}
            </span>
          )}
          {suggested && (
            <span className="rounded-full bg-[#EAF0F7] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[#2B4C7E]">
              Shirube pick
            </span>
          )}
          <Link
            href={`/restaurants/${r.slug}`}
            className="pointer-events-auto relative z-10 ml-auto text-xs font-medium text-[#223A70] hover:underline"
          >
            View {CATEGORY_META[cat].label.toLowerCase()} →
          </Link>
        </div>
      </div>
    </div>
  );
}

export function DiscoverClient({ places }: { places: Restaurant[] }) {
  const [geo, setGeo] = useState<{ lat: number; lng: number } | null>(null);
  const [geoStatus, setGeoStatus] = useState<"loading" | "ready" | "denied" | "unsupported">(
    "loading",
  );
  const [activeId, setActiveId] = useState<string | null>(null);
  const [turns, setTurns] = useState<ChatTurn[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [highlight, setHighlight] = useState<string[]>([]);
  const chatEnd = useRef<HTMLDivElement>(null);

  // Kicks off a geolocation request; state is only updated from the async
  // callbacks (never synchronously inside an effect).
  const runGeo = () => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGeo({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setGeoStatus("ready");
      },
      () => setGeoStatus("denied"),
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 300000 },
    );
  };

  const requestLocation = () => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setGeoStatus("unsupported");
      return;
    }
    setGeoStatus("loading");
    runGeo();
  };

  useEffect(() => {
    if (typeof navigator !== "undefined" && navigator.geolocation) {
      runGeo();
    } else {
      queueMicrotask(() => setGeoStatus("unsupported"));
    }
  }, []);

  useEffect(() => {
    chatEnd.current?.scrollIntoView({ behavior: "smooth" });
  }, [turns]);

  const ranked = useMemo<Ranked[]>(() => {
    const withDist = places.map((r) => ({
      r,
      dist: geo && r.lat != null && r.lng != null ? haversineKm(geo, { lat: r.lat, lng: r.lng }) : null,
    }));
    if (geo) withDist.sort((a, b) => (a.dist ?? Infinity) - (b.dist ?? Infinity));
    return withDist;
  }, [places, geo]);

  const gems = useMemo(() => ranked.filter((x) => x.r.hiddenGem), [ranked]);
  // Highlight verified gems; fall back to the top-ranked places when none exist.
  const featured = (gems.length ? gems : ranked).slice(0, 6);
  const featuredIds = new Set(featured.map((x) => x.r.id));
  const rest = ranked.filter((x) => !featuredIds.has(x.r.id));

  const bySlug = useMemo(() => new Map(ranked.map((x) => [x.r.slug, x])), [ranked]);
  const suggested = highlight.map((s) => bySlug.get(s)).filter((x): x is Ranked => !!x);

  const mapList = ranked.slice(0, 40);
  const center = geo ?? TOKYO;
  const active = ranked.find((x) => x.r.id === activeId)?.r ?? null;

  const send = async (text: string) => {
    const msg = text.trim();
    if (!msg || busy) return;
    setInput("");
    setBusy(true);
    setTurns((t) => [...t, { role: "user", content: msg }, { role: "assistant", content: "", pending: true }]);
    const candidates: DiscoverCandidate[] = ranked.slice(0, 40).map((x) => ({
      slug: x.r.slug,
      name: x.r.nameEn,
      category: x.r.category,
      area: x.r.area ?? x.r.prefecture,
      hiddenGem: !!x.r.hiddenGem,
      note: x.r.aiOverview ?? x.r.shortEn ?? "",
    }));
    const res = await discoverChatAction(msg, candidates);
    setBusy(false);
    if (res.ok) {
      setTurns((t) => {
        const next = [...t];
        const idx = next.findIndex((x) => x.pending);
        if (idx !== -1) next[idx] = { role: "assistant", content: res.result.reply };
        return next;
      });
      setHighlight(res.result.slugs);
    } else {
      setTurns((t) => t.filter((x) => !x.pending));
      toast.error(res.error);
    }
  };

  const statusLine =
    geoStatus === "ready"
      ? "Sorted by distance from you"
      : geoStatus === "loading"
        ? "Finding your location…"
        : geoStatus === "denied"
          ? "Location off — showing verified gems"
          : "Location unavailable — showing verified gems";

  return (
    <div className="min-h-screen bg-[#F5F6F4] pb-44">
      <div className="mx-auto w-full max-w-6xl px-4 py-6">
        {/* header */}
        <header className="mb-5">
          <h1 className="text-3xl font-bold text-foreground">Discover near you</h1>
          <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <MapPin className="h-4 w-4" /> {statusLine}
            </span>
            {geoStatus !== "ready" && (
              <button
                type="button"
                onClick={requestLocation}
                className="inline-flex items-center gap-1 rounded-full border border-[#223A70] px-3 py-1 text-xs font-medium text-[#223A70] hover:bg-[#EAF0F7]"
              >
                <LocateFixed className="h-3.5 w-3.5" /> Use my location
              </button>
            )}
          </div>
        </header>

        {/* Shirube suggestions */}
        {suggested.length > 0 && (
          <section className="mb-6 rounded-xl border border-[#D4E0EE] bg-[#EAF0F7] p-4">
            <h2 className="mb-3 inline-flex items-center gap-1.5 text-sm font-semibold text-[#2B4C7E]">
              <Sparkles className="h-4 w-4" /> Shirube suggests
            </h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {suggested.map((x) => (
                <PlaceCard key={x.r.id} ranked={x} suggested />
              ))}
            </div>
          </section>
        )}

        {/* Featured (gems or top picks) */}
        <section className="mb-6">
          <h2 className="mb-3 inline-flex items-center gap-1.5 text-lg font-semibold text-foreground">
            <Star className="h-5 w-5 text-[#C8A859]" />
            {gems.length ? "Verified gems near you" : "Popular near you"}
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {featured.map((x) => (
              <PlaceCard key={x.r.id} ranked={x} />
            ))}
          </div>
        </section>

        {/* map + rest of list */}
        <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
          <section className="order-2 lg:order-1">
            <h2 className="mb-3 text-lg font-semibold text-foreground">More nearby</h2>
            <div className="flex flex-col gap-3">
              {rest.slice(0, 40).map((x) => (
                <PlaceCard key={x.r.id} ranked={x} />
              ))}
              {rest.length === 0 && (
                <p className="text-sm text-muted-foreground">No other places to show.</p>
              )}
            </div>
          </section>

          <section className="order-1 lg:order-2">
            <div className="sticky top-4 h-[60vh] overflow-hidden rounded-xl border border-border">
              <MapProvider>
                <GoogleMap
                  defaultCenter={center}
                  defaultZoom={geo ? 12 : 10}
                  style={{ width: "100%", height: "100%" }}
                >
                  <Recenter center={center} zoom={geo ? 12 : 10} />
                  {geo && (
                    <AdvancedMarker position={geo}>
                      <span className="block h-4 w-4 rounded-full border-2 border-white bg-[#1A73E8] shadow-[0_0_0_4px_rgba(26,115,232,0.3)]" />
                    </AdvancedMarker>
                  )}
                  {mapList.map((x) => (
                    <AdvancedMarker
                      key={x.r.id}
                      position={{ lat: x.r.lat as number, lng: x.r.lng as number }}
                      onClick={() => setActiveId(x.r.id)}
                    >
                      {x.r.hiddenGem ? <GemPin /> : <CategoryPin category={x.r.category} />}
                    </AdvancedMarker>
                  ))}
                  {active && (
                    <InfoWindow
                      position={{ lat: active.lat as number, lng: active.lng as number }}
                      onCloseClick={() => setActiveId(null)}
                    >
                      <div className="min-w-45">
                        <p className="font-semibold">{active.nameEn}</p>
                        {active.area && <p className="text-xs text-gray-500">{active.area}</p>}
                        <Link
                          href={`/restaurants/${active.slug}`}
                          className="mt-1 inline-block text-sm font-medium text-[#223A70] hover:underline"
                        >
                          View {CATEGORY_META[normalizeCategory(active.category)].label.toLowerCase()} →
                        </Link>
                      </div>
                    </InfoWindow>
                  )}
                </GoogleMap>
              </MapProvider>
            </div>
          </section>
        </div>
      </div>

      {/* docked Shirube chat */}
      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-border bg-white/95 backdrop-blur">
        <div className="mx-auto w-full max-w-6xl px-4 py-3">
          <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-foreground">
            <Sparkles className="h-4 w-4 text-[#C8A859]" /> Ask Shirube
          </div>
          {turns.length > 0 && (
            <div className="mb-2 max-h-32 space-y-2 overflow-y-auto">
              {turns.map((t, i) =>
                t.role === "user" ? (
                  <div key={i} className="flex justify-end">
                    <div className="max-w-[85%] rounded-2xl bg-[#223A70] px-3.5 py-2 text-sm text-white">
                      {t.content}
                    </div>
                  </div>
                ) : (
                  <div key={i} className="flex items-start gap-2">
                    <span className="flex h-7 w-7 flex-none items-center justify-center rounded-full bg-[#C8A859]/20 text-[#8A6D2D]">
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
          )}
          {turns.length === 0 && (
            <div className="mb-2 flex flex-wrap gap-2">
              {QUICK_PROMPTS.map((q) => (
                <button
                  key={q}
                  type="button"
                  disabled={busy}
                  onClick={() => send(q)}
                  className="rounded-full border border-border px-3 py-1 text-sm text-foreground transition-colors hover:border-[#223A70] hover:text-[#223A70] disabled:opacity-50"
                >
                  {q}
                </button>
              ))}
            </div>
          )}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
            className="flex items-center gap-2"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="What are you after? e.g. cheap yakitori near me"
              disabled={busy}
              className="h-10 flex-1 rounded-md border border-border bg-background px-3 text-sm text-foreground outline-none focus:border-[#223A70]"
            />
            <button
              type="submit"
              disabled={busy || !input.trim()}
              className="inline-flex h-10 w-10 items-center justify-center rounded-md bg-[#223A70] text-white hover:bg-[#1a2d58] disabled:opacity-50"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
