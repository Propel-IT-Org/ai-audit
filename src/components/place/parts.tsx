"use client";

// Shared, Tailwind-styled building blocks for the per-category place detail
// pages. Each <Category>Page renderer composes these — the layout owns the
// hero, click-tabs (Overview · <middle> · Gallery), the overview panel (map +
// rows + good-to-know) and the gallery; renderers supply the ordered overview
// rows and the middle-tab content (SectionList / PicksBox / lists).

import { useState, type ReactNode } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import {
  Info,
  Image as ImageIcon,
  MapPin,
  Store,
  Armchair,
  Soup,
  Coffee,
  Users,
  Mountain,
  Droplets,
  Copy,
  Check,
  ArrowLeft,
  type LucideIcon,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import type {
  BasePlace,
  DetailFallback,
  GalleryItem,
  LinkRef,
  Picks,
  Section,
} from "@/lib/places/place-types";

const PlaceMiniMap = dynamic(() => import("./PlaceMiniMap"), { ssr: false });

const GALLERY_ICONS: Record<string, LucideIcon> = {
  store: Store,
  chair: Armchair,
  bowl: Soup,
  tea: Coffee,
  users: Users,
  mountain: Mountain,
  water: Droplets,
};

export function camelToLabel(key: string): string {
  return key
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (s) => s.toUpperCase())
    .trim();
}

/** Bold the lead sentence (up to the first ". ") of a string. */
export function leadBold(text: string): ReactNode {
  const i = text.indexOf(". ");
  if (i === -1) return text;
  return (
    <>
      <strong className="font-semibold text-[#1A2230]">{text.slice(0, i + 1)}</strong>
      {text.slice(i + 1)}
    </>
  );
}

export type Row = { k: string; v: ReactNode };

/** Build ordered rows from an overview object, skipping empty values. */
export function rowsFromOverview(overview: Record<string, unknown> | undefined): Row[] {
  if (!overview) return [];
  return Object.entries(overview)
    .filter(([, v]) => v != null && v !== "")
    .map(([k, v]) => ({ k: camelToLabel(k), v: String(v) }));
}

/* --------------------------------- pieces --------------------------------- */

/** The "AI pick / Don't miss" box used in the middle tab. */
export function PicksBox({ picks, label }: { picks?: Picks; label: string }) {
  if (!picks?.items?.length && !picks?.lead) return null;
  return (
    <div className="mb-6 rounded-[14px] border border-[#D4E0EE] bg-[#EAF0F7] px-5 py-4">
      <span className="mb-2.5 inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.03em] text-[#2B4C7E]">
        <span className="h-1.5 w-1.5 rounded-full bg-[#2B4C7E]" /> {label}
      </span>
      {picks.lead && <p className="mb-2.5 text-[15px]">{picks.lead}</p>}
      {picks.items?.length ? (
        <ul className="list-disc space-y-1.5 pl-[18px] text-sm leading-[1.55]">
          {picks.items.map((p, i) => (
            <li key={i}>{leadBold(p)}</li>
          ))}
        </ul>
      ) : null}
      {picks.note && <span className="mt-2.5 block text-xs text-[#8A93A0]">{picks.note}</span>}
    </div>
  );
}

/** A list of titled sections (menu/highlights/rooms/features/options/sells). */
export function SectionList({ sections }: { sections?: Section[] }) {
  if (!sections?.length) return null;
  return (
    <>
      {sections.map((cat, ci) => (
        <div key={ci} className="mb-7">
          <h3 className="mb-1.5 border-b border-[#E5E7E3] pb-2 text-[13px] font-semibold uppercase tracking-[0.05em] text-[#2B4C7E]">
            {cat.category}
          </h3>
          {cat.items?.map((m, mi) => (
            <div
              key={mi}
              className="flex justify-between gap-4 border-b border-[#E5E7E3] py-3 last:border-b-0"
            >
              <div>
                <span className="font-semibold">{m.en}</span>
                {m.ja && <span className="ml-1.5 text-[13px] text-[#5B6675]">{m.ja}</span>}
                {m.badge && (
                  <Badge className="ml-2 rounded-full border-0 bg-[#F6EBE5] px-2 py-0 align-middle text-[11px] font-semibold text-[#B0512F]">
                    {m.badge}
                  </Badge>
                )}
                {m.desc && <div className="mt-0.5 text-sm text-[#5B6675]">{m.desc}</div>}
              </div>
              {m.price && <span className="whitespace-nowrap tabular-nums">{m.price}</span>}
            </div>
          ))}
        </div>
      ))}
    </>
  );
}

/** A simple titled bullet list (tips / notes / amenities / specialties). */
export function BulletList({ title, items }: { title: string; items?: string[] }) {
  if (!items?.length) return null;
  return (
    <div className="mb-6">
      <h3 className="mb-2 text-[13px] font-semibold uppercase tracking-[0.05em] text-[#2B4C7E]">
        {title}
      </h3>
      <ul className="list-disc space-y-1.5 pl-[18px] text-sm">
        {items.map((t, i) => (
          <li key={i}>{leadBold(t)}</li>
        ))}
      </ul>
    </div>
  );
}

/** Booking / official links. */
export function BookingLinks({ links }: { links?: LinkRef[] }) {
  if (!links?.length) return null;
  return (
    <div className="mb-6 flex flex-wrap gap-2">
      {links.map((l, i) => (
        <a
          key={i}
          href={l.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 rounded-lg border border-[#2B4C7E] bg-[#EAF0F7] px-3 py-1.5 text-[13px] font-medium text-[#2B4C7E] hover:bg-[#dce7f4]"
        >
          {l.label} ↗
        </a>
      ))}
    </div>
  );
}

/** Optional note shown under a section (e.g. price source / recorded date). */
export function SectionNote({ note, recorded }: { note?: string; recorded?: string }) {
  if (!note && !recorded) return null;
  return (
    <p className="rounded-[10px] border border-[#E5E7E3] bg-white px-3.5 py-3 text-[13px] text-[#5B6675]">
      {note}
      {recorded && (
        <>
          {note ? <br /> : null}
          <strong className="text-[#1A2230]">Recorded: {recorded}.</strong>
        </>
      )}
    </p>
  );
}

/* --------------------------------- layout --------------------------------- */

export interface MiddleTab {
  label: string;
  icon: LucideIcon;
  content: ReactNode;
}

type TabKey = "overview" | "middle" | "gallery";

export function PlaceDetailLayout({
  data,
  fallback,
  aiOverview,
  overviewRows,
  middle,
  middleIcon,
  galleryImages = [],
}: {
  data: BasePlace;
  fallback: DetailFallback;
  aiOverview: ReactNode;
  overviewRows: Row[];
  /** Middle-tab content; the tab is hidden when null. */
  middle?: { label: string; content: ReactNode } | null;
  middleIcon: LucideIcon;
  galleryImages?: string[];
}) {
  const [tab, setTab] = useState<TabKey>("overview");
  const [copied, setCopied] = useState(false);

  const name = data.name ?? fallback.name;
  const nameJa = data.nameJa ?? fallback.nameJp ?? undefined;
  const lat = data.lat ?? fallback.lat ?? undefined;
  const lng = data.lng ?? fallback.lng ?? undefined;
  const addressEn = data.addressEn ?? fallback.address ?? undefined;
  const website = data.website ?? fallback.website ?? undefined;
  const tags = data.tags ?? data.cuisineTags;

  const gmaps =
    lat != null && lng != null
      ? `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`
      : undefined;
  const osm =
    lat != null && lng != null
      ? `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=18/${lat}/${lng}`
      : undefined;

  const copyJa = async () => {
    if (!data.addressJa) return;
    try {
      await navigator.clipboard.writeText(data.addressJa);
      setCopied(true);
      setTimeout(() => setCopied(false), 1400);
    } catch {
      /* clipboard unavailable */
    }
  };

  // Real gallery photos: admin-supplied URLs + any `src` in frontmatter gallery.
  const galleryPhotos = Array.from(
    new Set([
      ...galleryImages,
      ...((data.gallery ?? []).map((g) => g.src).filter(Boolean) as string[]),
    ]),
  );
  const galleryTiles: GalleryItem[] = data.gallery ?? [];
  const hasMiddle = !!middle;
  const hasGallery = galleryPhotos.length > 0 || galleryTiles.length > 0;

  const tabs: { key: TabKey; label: string; icon: LucideIcon; show: boolean }[] = [
    { key: "overview", label: "Overview", icon: Info, show: true },
    { key: "middle", label: middle?.label ?? "", icon: middleIcon, show: hasMiddle },
    { key: "gallery", label: "Gallery", icon: ImageIcon, show: hasGallery },
  ];

  const activeTab = tabs.find((t) => t.key === tab && t.show) ? tab : "overview";

  return (
    <div className="min-h-screen bg-[#F5F6F4] text-[#1A2230]">
      <div className="mx-auto max-w-[760px] px-5">
        <Link
          href="/explore"
          className="inline-flex items-center gap-1 pt-6 text-sm text-[#5B6675] hover:text-[#1A2230]"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to explore
        </Link>

        {/* Hero */}
        <header className="pt-6 pb-6">
          {data.area && (
            <span className="text-[13px] font-semibold uppercase tracking-[0.04em] text-[#2B4C7E]">
              {data.area}
            </span>
          )}
          <h1 className="my-1 font-serif text-[clamp(34px,7vw,52px)] font-medium leading-[1.05]">
            {name}
          </h1>
          {nameJa && (
            <div className="text-[clamp(18px,4vw,22px)] font-medium text-[#5B6675]">{nameJa}</div>
          )}
          {data.reading && <div className="mt-1 text-sm italic text-[#8A93A0]">{data.reading}</div>}

          <div className="mt-4 flex flex-wrap items-center gap-x-3.5 gap-y-2 text-sm text-[#5B6675]">
            {data.rating != null && (
              <span className="font-semibold text-[#1A2230]">★ {data.rating}</span>
            )}
            {data.reviewCount != null && <span>{data.reviewCount} Google reviews</span>}
            {(tags?.length || data.flags?.length) && <span>·</span>}
            {tags?.map((t) => (
              <Badge
                key={t}
                className="rounded-full border-0 bg-[#EAF0F7] px-2.5 py-0.5 text-[13px] font-semibold text-[#2B4C7E]"
              >
                {t}
              </Badge>
            ))}
            {data.flags?.map((t) => (
              <Badge
                key={t}
                className="rounded-full border-0 bg-[#F6EBE5] px-2.5 py-0.5 text-[13px] font-semibold text-[#B0512F]"
              >
                {t}
              </Badge>
            ))}
          </div>

          {/* AI overview */}
          <Card className="mt-5 gap-0 rounded-[14px] border-[#E5E7E3] bg-white px-5 py-5 shadow-none">
            <span className="mb-2.5 inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.03em] text-[#2B4C7E]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#2B4C7E]" /> AI overview
            </span>
            <div className="font-serif text-[19px] leading-[1.55] [&_p]:m-0">{aiOverview}</div>
            <span className="mt-2.5 block text-xs text-[#8A93A0]">
              Generated summary · confirm hours and prices before visiting
            </span>
          </Card>
        </header>

        {/* Tabs */}
        <nav className="sticky top-0 z-10 flex gap-1.5 border-b border-[#E5E7E3] bg-[#F5F6F4]">
          {tabs
            .filter((t) => t.show)
            .map((t) => {
              const active = activeTab === t.key;
              const Icon = t.icon;
              return (
                <button
                  key={t.key}
                  type="button"
                  onClick={() => setTab(t.key)}
                  className={`-mb-px flex items-center gap-1.5 rounded-t-lg border border-b-0 px-4 py-2.5 text-sm font-semibold transition-colors ${
                    active
                      ? "border-[#E5E7E3] border-t-[3px] border-t-[#2B4C7E] bg-white text-[#2B4C7E]"
                      : "border-transparent text-[#5B6675] hover:text-[#1A2230]"
                  }`}
                >
                  <Icon className="h-[18px] w-[18px]" />
                  {t.label}
                </button>
              );
            })}
        </nav>

        <main className="pb-16">
          {/* Overview panel */}
          {activeTab === "overview" && (
            <section className="py-7">
              {lat != null && lng != null && (
                <div className="mb-5 overflow-hidden rounded-[14px] border border-[#E5E7E3]">
                  <PlaceMiniMap lat={lat} lng={lng} label={nameJa ?? name} />
                  <div className="flex items-center justify-between gap-2.5 border-t border-[#E5E7E3] bg-white px-3.5 py-2.5 text-[13px] text-[#5B6675]">
                    <span>{nameJa ?? name}</span>
                    <span className="flex gap-2 whitespace-nowrap">
                      {osm && (
                        <a
                          href={osm}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-medium text-[#2B4C7E] hover:underline"
                        >
                          Open larger map
                        </a>
                      )}
                      {gmaps && (
                        <>
                          ·
                          <a
                            href={gmaps}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-medium text-[#2B4C7E] hover:underline"
                          >
                            Google Maps
                          </a>
                        </>
                      )}
                    </span>
                  </div>
                </div>
              )}

              {(overviewRows.length > 0 || addressEn || data.phone) && (
                <Card className="gap-0 overflow-hidden rounded-[14px] border-[#E5E7E3] bg-white p-0 shadow-none">
                  {overviewRows.map((row, i) => (
                    <div
                      key={`${row.k}-${i}`}
                      className={`grid grid-cols-1 gap-1 px-5 py-4 sm:grid-cols-[150px_1fr] sm:gap-4 ${
                        i > 0 ? "border-t border-[#E5E7E3]" : ""
                      }`}
                    >
                      <span className="text-sm text-[#5B6675]">{row.k}</span>
                      <span className="whitespace-pre-line text-[15px]">{row.v}</span>
                    </div>
                  ))}

                  {addressEn && (
                    <div className="grid grid-cols-1 gap-1 border-t border-[#E5E7E3] px-5 py-4 sm:grid-cols-[150px_1fr] sm:gap-4">
                      <span className="text-sm text-[#5B6675]">Address</span>
                      <span className="text-[15px]">
                        {addressEn}
                        <div className="mt-2.5 flex flex-wrap gap-2">
                          {gmaps && (
                            <a
                              href={gmaps}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 rounded-lg border border-[#E5E7E3] bg-[#F5F6F4] px-2.5 py-1 text-[13px] hover:border-[#2B4C7E] hover:text-[#2B4C7E]"
                            >
                              <MapPin className="h-[15px] w-[15px]" /> Google Maps
                            </a>
                          )}
                          {osm && (
                            <a
                              href={osm}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 rounded-lg border border-[#E5E7E3] bg-[#F5F6F4] px-2.5 py-1 text-[13px] hover:border-[#2B4C7E] hover:text-[#2B4C7E]"
                            >
                              <MapPin className="h-[15px] w-[15px]" /> OpenStreetMap
                            </a>
                          )}
                          {data.addressJa && (
                            <button
                              type="button"
                              onClick={copyJa}
                              className="inline-flex items-center gap-1.5 rounded-lg border border-[#E5E7E3] bg-[#F5F6F4] px-2.5 py-1 text-[13px] hover:border-[#2B4C7E] hover:text-[#2B4C7E]"
                            >
                              {copied ? (
                                <Check className="h-[15px] w-[15px]" />
                              ) : (
                                <Copy className="h-[15px] w-[15px]" />
                              )}
                              {copied ? "Copied" : "Copy 日本語 for taxi"}
                            </button>
                          )}
                        </div>
                      </span>
                    </div>
                  )}

                  {data.phone && (
                    <div className="grid grid-cols-1 gap-1 border-t border-[#E5E7E3] px-5 py-4 sm:grid-cols-[150px_1fr] sm:gap-4">
                      <span className="text-sm text-[#5B6675]">Phone</span>
                      <a href={`tel:${data.phone}`} className="text-[15px] hover:text-[#2B4C7E]">
                        {data.phone}
                      </a>
                    </div>
                  )}
                </Card>
              )}

              {data.goodToKnow?.length ? (
                <div className="mt-5 rounded-[14px] border border-[#ECD8CD] bg-[#F6EBE5] px-5 py-4">
                  <h3 className="mb-2 text-[15px] font-semibold text-[#B0512F]">Good to know</h3>
                  <ul className="list-disc space-y-1.5 pl-[18px] text-sm">
                    {data.goodToKnow.map((g, i) => (
                      <li key={i}>{leadBold(g)}</li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </section>
          )}

          {/* Middle panel */}
          {activeTab === "middle" && middle && <section className="py-7">{middle.content}</section>}

          {/* Gallery panel */}
          {activeTab === "gallery" && hasGallery && (
            <section className="py-7">
              {galleryPhotos.length > 0 ? (
                <div className="grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-2.5">
                  {galleryPhotos.map((src, i) => (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      key={i}
                      src={src}
                      alt={galleryTiles[i]?.alt ?? galleryTiles[i]?.label ?? `${name} photo ${i + 1}`}
                      loading="lazy"
                      className="aspect-[4/3] w-full rounded-[10px] border border-[#E5E7E3] object-cover"
                    />
                  ))}
                </div>
              ) : (
                <>
                  <p className="mb-3.5 text-[13px] text-[#5B6675]">
                    Placeholders mirror the photo categories for this place.
                  </p>
                  <div className="grid grid-cols-[repeat(auto-fill,minmax(160px,1fr))] gap-2.5">
                    {galleryTiles.map((g, i) => {
                      const Icon = GALLERY_ICONS[g.icon ?? ""] ?? ImageIcon;
                      return (
                        <div
                          key={i}
                          className="flex aspect-[4/3] flex-col items-center justify-center gap-1.5 rounded-[10px] bg-[#EAF0F7] p-2 text-center text-[#2B4C7E]"
                        >
                          <Icon className="h-[26px] w-[26px]" strokeWidth={2} />
                          <span className="text-[13px] font-medium">{g.label}</span>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </section>
          )}

          {website && (
            <>
              <Separator className="bg-[#E5E7E3]" />
              <div className="py-6 text-center">
                <a
                  href={website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-medium text-[#2B4C7E] hover:underline"
                >
                  Official website ↗
                </a>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
