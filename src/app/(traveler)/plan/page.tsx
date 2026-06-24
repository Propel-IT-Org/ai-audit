"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Sparkles, Loader2, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { planItineraryAction } from "@/lib/itineraries/actions";

const PRESETS = ["Kyoto", "Hakone", "Kanazawa", "Takayama", "Yamanashi"];

export default function PlanPage() {
  const router = useRouter();
  const [destination, setDestination] = useState("");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [style, setStyle] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const today = new Date().toISOString().split("T")[0];

  const submit = async () => {
    if (!destination.trim()) {
      setError("Please enter a destination.");
      return;
    }
    setError(null);
    setLoading(true);
    const res = await planItineraryAction({
      destination: destination.trim(),
      start: start || undefined,
      end: end || undefined,
      style: style.trim() || undefined,
    });
    if (res.ok) {
      router.push(`/itinerary/${res.slug}`);
    } else {
      setError(res.error);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <section className="hero-map px-4 py-14 text-center md:py-20">
        <p className="av-eyebrow mb-3">Plan a trip</p>
        <h1 className="mx-auto max-w-2xl text-4xl font-extrabold leading-tight tracking-tight text-white md:text-5xl">
          Where in Japan are you <span className="text-gold">headed?</span>
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-base text-indigo-100/80">
          Pick a destination and dates — our AI builds a day-by-day itinerary from verified local gems.
        </p>
        <Image
          src="/mockups/traveler-journey/illustrations/onboarding-plan.webp"
          alt="Shirube presenting an itinerary"
          width={320}
          height={200}
          className="mx-auto mt-6 h-36 w-auto md:h-44"
          priority
        />
      </section>

      <div className="mx-auto -mt-10 max-w-xl px-4 pb-20">
        <div className="rounded-2xl border border-border bg-card p-6 shadow-lg md:p-8">
          {/* Destination */}
          <label className="av-eyebrow mb-1 block text-kon2">Destination</label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={destination}
              onChange={(e) => { setDestination(e.target.value); if (error) setError(null); }}
              placeholder="e.g. Kyoto"
              className="h-12 pl-10 text-base"
            />
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            {PRESETS.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setDestination(p)}
                className="rounded-full border border-border px-3 py-1 text-sm text-foreground transition-colors hover:border-kon2 hover:text-kon2"
              >
                {p}
              </button>
            ))}
          </div>

          {/* Dates */}
          <label className="av-eyebrow mb-1 mt-6 block text-kon2">When</label>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Input type="date" min={today} value={start} onChange={(e) => setStart(e.target.value)} className="h-12" />
            <Input type="date" min={start || today} value={end} onChange={(e) => setEnd(e.target.value)} className="h-12" />
          </div>
          <p className="mt-1 text-xs text-muted-foreground">Leave blank for a default 3-day plan.</p>

          {/* Style */}
          <label className="av-eyebrow mb-1 mt-6 block text-kon2">Travel style (optional)</label>
          <Textarea
            value={style}
            onChange={(e) => setStyle(e.target.value)}
            rows={2}
            placeholder="Budget · foodie · culture · family-friendly · nature…"
          />

          {error && <p className="mt-4 text-sm text-destructive">{error}</p>}

          <Button onClick={submit} disabled={loading} size="lg" className="mt-6 h-12 w-full bg-kon2 text-base font-bold text-white hover:bg-kon">
            {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Sparkles className="mr-2 h-5 w-5" />}
            {loading ? "Building your itinerary…" : "Generate itinerary"}
          </Button>
        </div>
      </div>
    </div>
  );
}
