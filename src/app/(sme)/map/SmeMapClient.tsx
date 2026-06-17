"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { MapPin } from "lucide-react";
import type { Restaurant } from "@/lib/db/schema/restaurant";

const MapView = dynamic(() => import("./SmeMapView"), { ssr: false });

export function SmeMapClient({ restaurants }: { restaurants: Restaurant[] }) {
  const [selectedPrefecture, setSelectedPrefecture] = useState("");

  const prefectures = useMemo(() => {
    const set = new Set<string>();
    restaurants.forEach((r) => { if (r.prefecture) set.add(r.prefecture); });
    return Array.from(set).sort();
  }, [restaurants]);

  const filtered = useMemo(() => {
    if (!selectedPrefecture) return restaurants;
    return restaurants.filter((r) => r.prefecture === selectedPrefecture);
  }, [restaurants, selectedPrefecture]);

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8">
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-bold text-foreground">Business Map</h1>
          <p className="mt-2 text-muted-foreground">Explore AI-visible restaurants and businesses across Japan</p>
        </div>

        {restaurants.length === 0 ? (
          <div className="py-16 text-center">
            <MapPin className="mx-auto h-12 w-12 text-muted-foreground/50" />
            <p className="mt-4 text-muted-foreground">No businesses on the map yet.</p>
            <Link
              href="/generate"
              className="mt-4 inline-block rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground hover:bg-primary/90"
            >
              List Your Business
            </Link>
          </div>
        ) : (
          <>
            <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <select
                  value={selectedPrefecture}
                  onChange={(e) => setSelectedPrefecture(e.target.value)}
                  className="rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"
                >
                  <option value="">All prefectures</option>
                  {prefectures.map((p) => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <p className="text-sm text-muted-foreground">
                <span className="font-semibold text-foreground">{filtered.length}</span> businesses shown
              </p>
            </div>

            <div className="overflow-hidden rounded-lg border border-border" style={{ height: "60vh" }}>
              <MapView restaurants={filtered} />
            </div>
          </>
        )}
      </main>

      <footer className="border-t border-border py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>© 2026 AIVIBLE. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
