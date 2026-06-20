"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import {
  Info,
  UtensilsCrossed,
  Image as ImageIcon,
  MapPin,
  Store,
  Armchair,
  Soup,
  Coffee,
  Users,
  Copy,
  Check,
  ArrowLeft,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CATEGORY_META, normalizeCategory } from "@/lib/places/categories";

const RestaurantMiniMap = dynamic(() => import("./RestaurantMiniMap"), { ssr: false });

export interface MenuItem {
  en: string;
  ja?: string;
  desc?: string;
  price?: string;
  badge?: string;
}

export interface PlaceFrontmatter {
  name?: string;
  nameJa?: string;
  reading?: string;
  area?: string;
  category?: string;
  rating?: number;
  reviewCount?: number;
  cuisineTags?: string[];
  flags?: string[];
  lat?: number;
  lng?: number;
  phone?: string;
  website?: string;
  addressEn?: string;
  addressJa?: string;
  /** Generic key→value overview rows. Keys used as display labels (camelCase converted). */
  overview?: Record<string, string>;
  goodToKnow?: string[];
  picks?: { lead?: string; note?: string; items?: string[] };
  /** Content sections (Menu / Highlights / Rooms / Baths / …). */
  menu?: { category: string; items: MenuItem[] }[];
  menuNote?: string;
  priceRecorded?: string;
  gallery?: { label: string; icon?: string }[];
}

/** @deprecated Use PlaceFrontmatter */
export type RestaurantFrontmatter = PlaceFrontmatter;

export interface DetailFallback {
  name: string;
  nameJp?: string | null;
  lat?: number | null;
  lng?: number | null;
  address?: string | null;
  website?: string | null;
}

const GALLERY_ICONS: Record<string, typeof Store> = {
  store: Store,
  chair: Armchair,
  bowl: Soup,
  tea: Coffee,
  users: Users,
};

function camelToLabel(key: string): string {
  return key.replace(/([A-Z])/g, " $1").replace(/^./, (s) => s.toUpperCase()).trim();
}

/** Bold the lead sentence (up to the first ". ") of a string. */
function leadBold(text: string): ReactNode {
  const i = text.indexOf(". ");
  if (i === -1) return text;
  return (
    <>
      <strong className="font-semibold text-[#1A2230]">{text.slice(0, i + 1)}</strong>
      {text.slice(i + 1)}
    </>
  );
}

type TabKey = "overview" | "menu" | "gallery";

export function RestaurantDetail({
  data,
  overview,
  fallback,
}: {
  data: PlaceFrontmatter;
  overview: ReactNode;
  fallback: DetailFallback;
}) {
  const [tab, setTab] = useState<TabKey>("overview");
  const [copied, setCopied] = useState(false);

  const name = data.name ?? fallback.name;
  const nameJa = data.nameJa ?? fallback.nameJp ?? undefined;
  const lat = data.lat ?? fallback.lat ?? undefined;
  const lng = data.lng ?? fallback.lng ?? undefined;
  const addressEn = data.addressEn ?? fallback.address ?? undefined;
  const website = data.website ?? fallback.website ?? undefined;

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

  const overviewEntries = Object.entries(data.overview ?? {}).filter(([, v]) => v);
  const hasMenu = !!data.menu?.length;
  const hasGallery = !!data.gallery?.length;
  const sectionLabel = CATEGORY_META[normalizeCategory(data.category)].section;

  const tabs: { key: TabKey; label: string; icon: typeof Info; show: boolean }[] = [
    { key: "overview", label: "Overview", icon: Info, show: true },
    { key: "menu", label: sectionLabel, icon: UtensilsCrossed, show: hasMenu },
    { key: "gallery", label: "Gallery", icon: ImageIcon, show: hasGallery },
  ];

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
          {nameJa && <div className="text-[clamp(18px,4vw,22px)] font-medium text-[#5B6675]">{nameJa}</div>}
          {data.reading && <div className="mt-1 text-sm italic text-[#8A93A0]">{data.reading}</div>}

          <div className="mt-4 flex flex-wrap items-center gap-x-3.5 gap-y-2 text-sm text-[#5B6675]">
            {data.rating != null && (
              <span className="font-semibold text-[#1A2230]">★ {data.rating}</span>
            )}
            {data.reviewCount != null && <span>{data.reviewCount} Google reviews</span>}
            {(data.cuisineTags?.length || data.flags?.length) && <span>·</span>}
            {data.cuisineTags?.map((t) => (
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
            <div className="font-serif text-[19px] leading-[1.55] [&_p]:m-0">{overview}</div>
            <span className="mt-2.5 block text-xs text-[#8A93A0]">
              Generated summary · confirm hours and prices before visiting
            </span>
          </Card>
        </header>

        {/* Tabs */}
        <nav className="sticky top-0 z-10 flex gap-1.5 border-b border-[#E5E7E3] bg-[#F5F6F4]">
          {tabs.filter((t) => t.show).map((t) => {
            const active = tab === t.key;
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
          {tab === "overview" && (
            <section className="py-7">
              {lat != null && lng != null && (
                <div className="mb-5 overflow-hidden rounded-[14px] border border-[#E5E7E3]">
                  <RestaurantMiniMap lat={lat} lng={lng} label={nameJa ?? name} />
                  <div className="flex items-center justify-between gap-2.5 border-t border-[#E5E7E3] bg-white px-3.5 py-2.5 text-[13px] text-[#5B6675]">
                    <span>{nameJa ?? name}</span>
                    <span className="flex gap-2 whitespace-nowrap">
                      {osm && <a href={osm} target="_blank" rel="noopener noreferrer" className="font-medium text-[#2B4C7E] hover:underline">Open larger map</a>}
                      {gmaps && <>·<a href={gmaps} target="_blank" rel="noopener noreferrer" className="font-medium text-[#2B4C7E] hover:underline">Google Maps</a></>}
                    </span>
                  </div>
                </div>
              )}

              {(overviewEntries.length > 0 || addressEn || data.phone) && (
                <Card className="gap-0 overflow-hidden rounded-[14px] border-[#E5E7E3] bg-white p-0 shadow-none">
                  {overviewEntries.map(([key, val], i) => (
                    <div
                      key={key}
                      className={`grid grid-cols-1 gap-1 px-5 py-4 sm:grid-cols-[150px_1fr] sm:gap-4 ${i > 0 ? "border-t border-[#E5E7E3]" : ""}`}
                    >
                      <span className="text-sm text-[#5B6675]">{camelToLabel(key)}</span>
                      <span className="whitespace-pre-line text-[15px]">{val}</span>
                    </div>
                  ))}

                  {addressEn && (
                    <div className="grid grid-cols-1 gap-1 border-t border-[#E5E7E3] px-5 py-4 sm:grid-cols-[150px_1fr] sm:gap-4">
                      <span className="text-sm text-[#5B6675]">Address</span>
                      <span className="text-[15px]">
                        {addressEn}
                        <div className="mt-2.5 flex flex-wrap gap-2">
                          {gmaps && (
                            <a href={gmaps} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 rounded-lg border border-[#E5E7E3] bg-[#F5F6F4] px-2.5 py-1 text-[13px] hover:border-[#2B4C7E] hover:text-[#2B4C7E]">
                              <MapPin className="h-[15px] w-[15px]" /> Google Maps
                            </a>
                          )}
                          {osm && (
                            <a href={osm} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 rounded-lg border border-[#E5E7E3] bg-[#F5F6F4] px-2.5 py-1 text-[13px] hover:border-[#2B4C7E] hover:text-[#2B4C7E]">
                              <MapPin className="h-[15px] w-[15px]" /> OpenStreetMap
                            </a>
                          )}
                          {data.addressJa && (
                            <button
                              type="button"
                              onClick={copyJa}
                              className="inline-flex items-center gap-1.5 rounded-lg border border-[#E5E7E3] bg-[#F5F6F4] px-2.5 py-1 text-[13px] hover:border-[#2B4C7E] hover:text-[#2B4C7E]"
                            >
                              {copied ? <Check className="h-[15px] w-[15px]" /> : <Copy className="h-[15px] w-[15px]" />}
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
                      <a href={`tel:${data.phone}`} className="text-[15px] hover:text-[#2B4C7E]">{data.phone}</a>
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

          {/* Menu panel */}
          {tab === "menu" && hasMenu && (
            <section className="py-7">
              {data.picks?.items?.length ? (
                <div className="mb-6 rounded-[14px] border border-[#D4E0EE] bg-[#EAF0F7] px-5 py-4">
                  <span className="mb-2.5 inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.03em] text-[#2B4C7E]">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#2B4C7E]" /> AI pick · what to try
                  </span>
                  {data.picks.lead && <p className="mb-2.5 text-[15px]">{data.picks.lead}</p>}
                  <ul className="list-disc space-y-1.5 pl-[18px] text-sm leading-[1.55]">
                    {data.picks.items.map((p, i) => (
                      <li key={i}>{leadBold(p)}</li>
                    ))}
                  </ul>
                  {data.picks.note && <span className="mt-2.5 block text-xs text-[#8A93A0]">{data.picks.note}</span>}
                </div>
              ) : null}

              {data.menu!.map((cat, ci) => (
                <div key={ci} className="mb-7">
                  <h3 className="mb-1.5 border-b border-[#E5E7E3] pb-2 text-[13px] font-semibold uppercase tracking-[0.05em] text-[#2B4C7E]">
                    {cat.category}
                  </h3>
                  {cat.items.map((m, mi) => (
                    <div key={mi} className="flex justify-between gap-4 border-b border-[#E5E7E3] py-3 last:border-b-0">
                      <div>
                        <span className="font-semibold">{m.en}</span>
                        {m.ja && <span className="ml-1.5 text-[13px] text-[#5B6675]">{m.ja}</span>}
                        {m.badge && (
                          <Badge className="ml-2 rounded-full border-0 bg-[#F6EBE5] px-2 py-0 text-[11px] font-semibold text-[#B0512F] align-middle">
                            {m.badge}
                          </Badge>
                        )}
                        {m.desc && <div className="mt-0.5 text-sm text-[#5B6675]">{m.desc}</div>}
                      </div>
                      {m.price && (
                        <span className="whitespace-nowrap tabular-nums">{m.price}</span>
                      )}
                    </div>
                  ))}
                </div>
              ))}

              {(data.menuNote || data.priceRecorded) && (
                <p className="rounded-[10px] border border-[#E5E7E3] bg-white px-3.5 py-3 text-[13px] text-[#5B6675]">
                  {data.menuNote}
                  {data.priceRecorded && (
                    <>
                      <br />
                      <strong className="text-[#1A2230]">Prices recorded: {data.priceRecorded}.</strong>
                    </>
                  )}
                </p>
              )}
            </section>
          )}

          {/* Gallery panel */}
          {tab === "gallery" && hasGallery && (
            <section className="py-7">
              <p className="mb-3.5 text-[13px] text-[#5B6675]">
                Placeholders mirror the photo categories on the restaurant&apos;s site.
              </p>
              <div className="grid grid-cols-[repeat(auto-fill,minmax(160px,1fr))] gap-2.5">
                {data.gallery!.map((g, i) => {
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
