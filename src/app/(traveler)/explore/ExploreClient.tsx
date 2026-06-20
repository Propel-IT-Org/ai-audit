"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { MapPin, List as ListIcon, Map as MapIcon } from "lucide-react";
import { CategoryIcon } from "@/components/icons";
import type { Restaurant } from "@/lib/db/schema/restaurant";
import { CATEGORIES, CATEGORY_META, normalizeCategory } from "@/lib/places/categories";

const MapView = dynamic(() => import("./MapView"), { ssr: false });

function GemBadge() {
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold"
      style={{ backgroundColor: "#F6EFDC", color: "#8A6D2D" }}
    >
      <span style={{ color: "#C8A859" }}>★</span>
      Verified gem
    </span>
  );
}

function RestaurantCard({ r }: { r: Restaurant }) {
  return (
    <div className="relative flex h-full flex-col rounded-lg border border-border bg-white p-4 transition-shadow hover:shadow-md">
      <Link
        href={`/stop/${r.slug}`}
        aria-label={r.nameEn}
        className="absolute inset-0 z-0 rounded-lg"
      />
      <div className="pointer-events-none relative z-10 flex h-full flex-col">
        <div className="mb-2 flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            {r.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={r.imageUrl} alt={r.nameEn} className="h-10 w-10 rounded object-cover" />
            ) : (
              <span className="flex h-10 w-10 items-center justify-center rounded bg-[hsl(43,56%,91%)] text-[#223A70]" aria-hidden="true">
                <CategoryIcon category={r.category} size={22} />
              </span>
            )}
          </div>
          {r.auditGrade && (
            <span className="rounded bg-muted px-2 py-0.5 text-xs font-medium text-foreground">
              {r.auditGrade}
            </span>
          )}
        </div>

        <h3 className="font-semibold text-foreground">{r.nameEn}</h3>
        {r.nameJp && <p className="text-xs text-muted-foreground">{r.nameJp}</p>}

        {(r.category || r.subcategory) && (
          <p className="text-xs text-muted-foreground">
            {[CATEGORY_META[normalizeCategory(r.category)].label, r.subcategory].filter(Boolean).join(" · ")}
          </p>
        )}

        {(r.area || r.prefecture) && (
          <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin className="h-3 w-3" />
            {[r.area, r.prefecture].filter(Boolean).join(", ")}
          </p>
        )}

        {r.aiOverview && (
          <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{r.aiOverview}</p>
        )}

        <div className="mt-2 flex items-center justify-between gap-2">
          {r.price && <span className="text-xs text-foreground">{r.price}</span>}
          {r.hiddenGem && <GemBadge />}
        </div>

        {(r.mdxUrl || r.mdxBody) && (
          <Link
            href={`/restaurants/${r.slug}`}
            className="pointer-events-auto relative z-20 mt-3 inline-block self-start text-xs font-medium text-[#223A70] hover:underline"
          >
            View restaurant page →
          </Link>
        )}
      </div>
    </div>
  );
}

function ChipButton({
  active,
  onClick,
  gold,
  children,
}: {
  active: boolean;
  onClick: () => void;
  gold?: boolean;
  children: React.ReactNode;
}) {
  const base = "rounded-full border px-3 py-1 text-sm transition-colors whitespace-nowrap";
  if (gold) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={base}
        style={
          active
            ? { backgroundColor: "#C8A859", borderColor: "#C8A859", color: "#fff" }
            : { borderColor: "#C8A859", color: "#8A6D2D" }
        }
      >
        {children}
      </button>
    );
  }
  return (
    <button
      type="button"
      onClick={onClick}
      className={`${base} ${
        active
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-background text-foreground hover:bg-muted"
      }`}
    >
      {children}
    </button>
  );
}

function uniqueVals(items: Restaurant[], pick: (r: Restaurant) => string | null | undefined): string[] {
  const set = new Set<string>();
  for (const r of items) {
    const v = pick(r);
    if (v) set.add(v);
  }
  return Array.from(set).sort();
}

interface Props {
  restaurants: Restaurant[];
  mapRestaurants: Restaurant[];
}

export function ExploreClient({ restaurants, mapRestaurants }: Props) {
  const [category, setCategory] = useState<string | null>(null);
  const [prefecture, setPrefecture] = useState("");
  const [region, setRegion] = useState("");
  const [hiddenOnly, setHiddenOnly] = useState(false);
  const [view, setView] = useState<"list" | "map">("list");

  const presentCategories = useMemo(() => {
    const set = new Set(restaurants.map((r) => normalizeCategory(r.category)));
    return CATEGORIES.filter((c) => set.has(c));
  }, [restaurants]);
  const prefectures = useMemo(() => uniqueVals(restaurants, (r) => r.prefecture), [restaurants]);
  const regions = useMemo(() => uniqueVals(restaurants, (r) => r.region), [restaurants]);

  const filtered = useMemo(() => {
    return restaurants.filter((r) => {
      if (hiddenOnly && !r.hiddenGem) return false;
      if (category && normalizeCategory(r.category) !== category) return false;
      if (prefecture && r.prefecture !== prefecture) return false;
      if (region && r.region !== region) return false;
      return true;
    });
  }, [restaurants, category, prefecture, region, hiddenOnly]);

  return (
    <section className="container mx-auto px-4 py-8">
      <header className="mb-6 text-center">
        <h1 className="text-3xl font-bold text-foreground">Explore Japan</h1>
        <p className="mt-2 text-muted-foreground">Discover restaurants, cafes, stays and experiences</p>
      </header>

      <div className="mb-3 flex flex-wrap gap-2">
        <ChipButton active={!!hiddenOnly} onClick={() => setHiddenOnly((v) => !v)} gold>
          ★ Hidden Gems
        </ChipButton>
        {presentCategories.map((c) => (
          <ChipButton
            key={`cat-${c}`}
            active={category === c}
            onClick={() => setCategory((cur) => (cur === c ? null : c))}
          >
            <CategoryIcon category={c} size={14} className="mr-1 inline-block" />
            {CATEGORY_META[c].label}
          </ChipButton>
        ))}
      </div>

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <select
            aria-label="Region"
            value={region}
            onChange={(e) => setRegion(e.target.value)}
            className="rounded-md border border-border bg-background px-2 py-1.5 text-sm text-foreground"
          >
            <option value="">Region</option>
            {regions.map((r) => <option key={r} value={r}>{r}</option>)}
          </select>
          <select
            aria-label="Prefecture"
            value={prefecture}
            onChange={(e) => setPrefecture(e.target.value)}
            className="rounded-md border border-border bg-background px-2 py-1.5 text-sm text-foreground"
          >
            <option value="">Prefecture</option>
            {prefectures.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
          <p className="text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">{filtered.length}</span> places
          </p>
        </div>
        <div className="inline-flex overflow-hidden rounded-md border border-border">
          <button
            type="button"
            onClick={() => setView("list")}
            className={`inline-flex items-center gap-1 px-3 py-1.5 text-sm ${
              view === "list" ? "bg-primary text-primary-foreground" : "bg-background text-muted-foreground"
            }`}
          >
            <ListIcon className="h-4 w-4" />
            List
          </button>
          <button
            type="button"
            onClick={() => setView("map")}
            className={`inline-flex items-center gap-1 px-3 py-1.5 text-sm ${
              view === "map" ? "bg-primary text-primary-foreground" : "bg-background text-muted-foreground"
            }`}
          >
            <MapIcon className="h-4 w-4" />
            Map
          </button>
        </div>
      </div>

      {view === "map" ? (
        <div className="overflow-hidden rounded-lg border border-border" style={{ height: "60vh" }}>
          <MapView restaurants={mapRestaurants} language="en" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-16 text-center">
          <MapPin className="mx-auto h-12 w-12 text-muted-foreground/50" />
          <p className="mt-4 text-muted-foreground">No places match your filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((r) => <RestaurantCard key={r.id} r={r} />)}
        </div>
      )}
    </section>
  );
}
