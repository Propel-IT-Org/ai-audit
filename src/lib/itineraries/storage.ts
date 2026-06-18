import { cache } from "react";
import {
  assertBlobConfigured,
  blob,
  blobToken,
  isBlobConfigured,
} from "../storage/blob";
import type { Itinerary } from "./types";

function itineraryKey(slug: string): string {
  return `itineraries/${slug}.json`;
}

function randomSuffix(len = 5): string {
  const alphabet = "abcdefghjkmnpqrstuvwxyz23456789";
  let out = "";
  for (let i = 0; i < len; i++) out += alphabet[Math.floor(Math.random() * alphabet.length)];
  return out;
}

export function newItinerarySlug(destination: string): string {
  const base =
    destination
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 40) || "trip";
  return `${base}-${randomSuffix()}`;
}

export async function writeItinerary(it: Itinerary): Promise<string> {
  assertBlobConfigured();
  const r = await blob.put(itineraryKey(it.slug), JSON.stringify(it), {
    access: "public",
    contentType: "application/json",
    addRandomSuffix: false,
    allowOverwrite: true,
    cacheControlMaxAge: 30,
    token: blobToken(),
  });
  return r.url;
}

const discoverUrl = cache(async (slug: string) => {
  if (!isBlobConfigured()) return null;
  const pathname = itineraryKey(slug);
  try {
    const meta = await blob.head(pathname, { token: blobToken() });
    return meta.url;
  } catch {
    /* not found via head — try list */
  }
  try {
    const r = await blob.list({ prefix: pathname, limit: 1, token: blobToken() });
    return r.blobs.find((b) => b.pathname === pathname)?.url ?? r.blobs[0]?.url ?? null;
  } catch {
    return null;
  }
});

export const readItinerary = cache(async (slug: string): Promise<Itinerary | null> => {
  const url = await discoverUrl(slug);
  if (!url) return null;
  try {
    const r = await fetch(url, { cache: "no-store" });
    if (!r.ok) return null;
    return (await r.json()) as Itinerary;
  } catch {
    return null;
  }
});
