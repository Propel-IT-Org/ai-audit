"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Sparkles, Send, MapPin, Star, ArrowLeft, X } from "lucide-react";
import { toast } from "sonner";
import {
  MapProvider,
  GoogleMap,
  GemPin,
  NumberedPin,
  AdvancedMarker,
  InfoWindow,
  useMap,
  useMapsLibrary,
} from "@/components/map/GoogleMap";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { customizeItineraryAction } from "@/lib/itineraries/actions";
import type { Itinerary, ItineraryStop } from "@/lib/itineraries/types";

const DAY_COLORS = [
  "#223A70", "#B0512F", "#2E7D32", "#7C3AED",
  "#0E7490", "#C2410C", "#9D174D", "#1D4ED8",
];

const QUICK_TWEAKS = ["Family-friendly", "Budget trip", "Foodie focus", "Nature lover", "Culture & history"];

interface ChatTurn {
  role: "user" | "assistant";
  content: string;
  pending?: boolean;
}

/* ---- map helpers ---- */

function FitBounds({ stops }: { stops: ItineraryStop[] }) {
  const map = useMap();
  useEffect(() => {
    if (!map || stops.length === 0) return;
    const bounds = new google.maps.LatLngBounds();
    stops.forEach((s) => bounds.extend({ lat: s.lat, lng: s.lng }));
    map.fitBounds(bounds, 64);
  }, [map, stops]);
  return null;
}

function DayRoute({ stops, color }: { stops: ItineraryStop[]; color: string }) {
  const map = useMap();
  const routes = useMapsLibrary("routes");
  useEffect(() => {
    if (!map || !routes || stops.length < 2) return;
    let renderer: google.maps.DirectionsRenderer | null = null;
    let fallback: google.maps.Polyline | null = null;

    renderer = new routes.DirectionsRenderer({
      map,
      suppressMarkers: true,
      preserveViewport: true,
      polylineOptions: { strokeColor: color, strokeWeight: 4, strokeOpacity: 0.85 },
    });

    new routes.DirectionsService()
      .route({
        origin: { lat: stops[0].lat, lng: stops[0].lng },
        destination: { lat: stops[stops.length - 1].lat, lng: stops[stops.length - 1].lng },
        waypoints: stops.slice(1, -1).map((s) => ({ location: { lat: s.lat, lng: s.lng }, stopover: true })),
        travelMode: google.maps.TravelMode.DRIVING,
        optimizeWaypoints: false,
      })
      .then((res) => renderer?.setDirections(res))
      .catch(() => {
        renderer?.setMap(null);
        renderer = null;
        fallback = new google.maps.Polyline({
          path: stops.map((s) => ({ lat: s.lat, lng: s.lng })),
          geodesic: true,
          strokeColor: color,
          strokeWeight: 4,
          strokeOpacity: 0.85,
          map,
        });
      });

    return () => {
      renderer?.setMap(null);
      fallback?.setMap(null);
    };
  }, [map, routes, stops, color]);
  return null;
}

function ItineraryMap({
  itinerary,
  numberOf,
  selected,
  onSelect,
}: {
  itinerary: Itinerary;
  numberOf: Map<string, number>;
  selected: ItineraryStop | null;
  onSelect: (s: ItineraryStop | null) => void;
}) {
  const allStops = useMemo(() => itinerary.days.flatMap((d) => d.stops), [itinerary]);

  return (
    <GoogleMap defaultCenter={{ lat: 36.2, lng: 138.2 }} defaultZoom={6} style={{ width: "100%", height: "100%" }}>
      <FitBounds stops={allStops} />
      {itinerary.days.map((d, i) => {
        const sig = d.stops.map((s) => `${s.lat},${s.lng}`).join("|");
        return <DayRoute key={`day-${d.dayNumber}-${sig}`} stops={d.stops} color={DAY_COLORS[i % DAY_COLORS.length]} />;
      })}
      {allStops.map((s) => (
        <AdvancedMarker key={s.id} position={{ lat: s.lat, lng: s.lng }} onClick={() => onSelect(s)}>
          {s.hiddenGem ? <GemPin /> : <NumberedPin n={numberOf.get(s.id) ?? 1} />}
        </AdvancedMarker>
      ))}
      {selected && (
        <InfoWindow position={{ lat: selected.lat, lng: selected.lng }} onCloseClick={() => onSelect(null)}>
          <div className="min-w-45">
            <p className="font-semibold">{selected.name}</p>
            {selected.category && <p className="text-xs text-gray-500">{selected.category}</p>}
            {selected.blurb && <p className="mt-1 line-clamp-3 text-xs text-gray-600">{selected.blurb}</p>}
            <Link href={`/restaurants/${selected.slug}`} className="mt-2 inline-block text-sm font-medium text-[#223A70] hover:underline">
              View full page →
            </Link>
          </div>
        </InfoWindow>
      )}
    </GoogleMap>
  );
}

/* ---- main view ---- */

export function ItineraryView({ initial }: { initial: Itinerary }) {
  const [itinerary, setItinerary] = useState<Itinerary>(initial);
  const [selected, setSelected] = useState<ItineraryStop | null>(null);
  const [turns, setTurns] = useState<ChatTurn[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const chatEnd = useRef<HTMLDivElement>(null);

  // Sequential numbering across all days.
  const numberOf = useMemo(() => {
    const m = new Map<string, number>();
    let n = 0;
    itinerary.days.forEach((d) => d.stops.forEach((s) => m.set(s.id, ++n)));
    return m;
  }, [itinerary]);

  useEffect(() => {
    chatEnd.current?.scrollIntoView({ behavior: "smooth" });
  }, [turns]);

  const send = async (text: string) => {
    const msg = text.trim();
    if (!msg || busy) return;
    setInput("");
    setBusy(true);
    const snapshot = itinerary;
    setTurns((t) => [...t, { role: "user", content: msg }, { role: "assistant", content: "", pending: true }]);
    const res = await customizeItineraryAction(snapshot.slug, msg, snapshot);
    setBusy(false);
    if (res.ok) {
      setTurns((t) => {
        const next = [...t];
        const idx = next.findIndex((x) => x.pending);
        if (idx !== -1) next[idx] = { role: "assistant", content: res.reply };
        return next;
      });
      setItinerary(res.itinerary);
      setSelected(null);
    } else {
      // Drop pending bubble, show toast
      setTurns((t) => t.filter((x) => !x.pending));
      toast.error(res.error);
    }
  };

  return (
    <div className="flex h-[calc(100vh-0px)] flex-col bg-background">
      {/* header */}
      <header className="flex items-center justify-between border-b border-border px-4 py-3">
        <div className="min-w-0">
          <h1 className="truncate text-lg font-bold text-foreground">{itinerary.destination}</h1>
          <p className="text-xs text-muted-foreground">
            {itinerary.totalDays} days · {itinerary.days.reduce((n, d) => n + d.stops.length, 0)} stops
          </p>
        </div>
        <Link href="/plan" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> New plan
        </Link>
      </header>

      <div className="grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-[340px_1fr]">
        {/* sidebar */}
        <aside className="min-h-0 overflow-y-auto border-r border-border">
          {itinerary.days.map((d, i) => (
            <div key={d.dayNumber}>
              <div className="sticky top-0 flex items-center gap-2 bg-muted/60 px-4 py-2 backdrop-blur">
                <span
                  className="flex h-5 w-5 items-center justify-center rounded-full text-[11px] font-bold text-white"
                  style={{ background: DAY_COLORS[i % DAY_COLORS.length] }}
                >
                  {d.dayNumber}
                </span>
                <span className="text-sm font-semibold text-foreground">{d.title}</span>
              </div>
              {d.stops.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setSelected(s)}
                  className={`flex w-full items-start gap-3 border-b border-border px-4 py-3 text-left transition-colors hover:bg-muted/40 ${
                    selected?.id === s.id ? "bg-primary/10" : ""
                  }`}
                >
                  <span className="mt-0.5 flex h-6 w-6 flex-none items-center justify-center rounded-full bg-secondary text-xs font-semibold text-foreground">
                    {numberOf.get(s.id)}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-1.5">
                      <span className="truncate font-medium text-foreground">{s.name}</span>
                      {s.hiddenGem && <Star className="h-3.5 w-3.5 flex-none text-[#C8A859]" />}
                    </span>
                    {s.blurb && <span className="mt-0.5 line-clamp-2 block text-xs text-muted-foreground">{s.blurb}</span>}
                  </span>
                </button>
              ))}
            </div>
          ))}
        </aside>

        {/* map + chat */}
        <div className="grid min-h-0 grid-rows-[1fr_auto]">
          <div className="relative min-h-0">
            <MapProvider>
              <ItineraryMap itinerary={itinerary} numberOf={numberOf} selected={selected} onSelect={setSelected} />
            </MapProvider>
          </div>

          {/* chat */}
          <div className="flex max-h-72 flex-col border-t border-border bg-card">
            <div className="flex items-center gap-2 border-b border-border px-4 py-2 text-sm font-semibold text-foreground">
              <Sparkles className="h-4 w-4 text-gold" /> Customize with AI
            </div>
            <div className="flex-1 space-y-3 overflow-y-auto px-4 py-3">
              {turns.length === 0 && (
                <div className="flex flex-wrap gap-2">
                  {QUICK_TWEAKS.map((q) => (
                    <button
                      key={q}
                      type="button"
                      disabled={busy}
                      onClick={() => send(q)}
                      className="rounded-full border border-border px-3 py-1 text-sm text-foreground transition-colors hover:border-kon2 hover:text-kon2 disabled:opacity-50"
                    >
                      {q}
                    </button>
                  ))}
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
                placeholder="Ask to tweak the plan…"
                disabled={busy}
                className="h-10"
              />
              <Button type="submit" disabled={busy || !input.trim()} size="icon" className="h-10 w-10 bg-kon2 text-white hover:bg-kon">
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </div>
      </div>

      {/* mobile detail sheet */}
      {selected && (
        <div className="fixed inset-x-0 bottom-0 z-20 border-t border-border bg-card p-4 shadow-lg lg:hidden">
          <div className="mb-1 flex items-start justify-between">
            <h3 className="font-bold text-foreground">{selected.name}</h3>
            <button type="button" onClick={() => setSelected(null)}><X className="h-4 w-4 text-muted-foreground" /></button>
          </div>
          {selected.category && <Badge className="mb-2 bg-[#EAF0F7] text-[#2B4C7E]">{selected.category}</Badge>}
          {selected.blurb && <p className="text-sm text-muted-foreground">{selected.blurb}</p>}
          <Link href={`/restaurants/${selected.slug}`} className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-kon2">
            <MapPin className="h-3.5 w-3.5" /> View full page
          </Link>
        </div>
      )}
    </div>
  );
}
