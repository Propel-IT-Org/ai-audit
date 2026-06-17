import {
  assertBlobConfigured,
  blob,
  blobToken,
  isBlobConfigured,
} from "@/lib/storage/blob";

function mdxKey(slug: string): string {
  return `restaurants/${slug}.mdx`;
}

/** Upload restaurant MDX body to Vercel Blob. Returns the public blob URL. */
export async function writeRestaurantMdx(slug: string, body: string): Promise<string> {
  assertBlobConfigured();
  const r = await blob.put(mdxKey(slug), body, {
    access: "public",
    contentType: "text/markdown; charset=utf-8",
    addRandomSuffix: false,
    allowOverwrite: true,
    cacheControlMaxAge: 60,
    token: blobToken(),
  });
  return r.url;
}

/** Fetch MDX text from a stored blob URL. Returns null on any failure. */
export async function readRestaurantMdx(url: string): Promise<string | null> {
  try {
    const r = await fetch(url, { cache: "no-store" });
    if (!r.ok) return null;
    return await r.text();
  } catch {
    return null;
  }
}

export async function deleteRestaurantMdx(slug: string): Promise<void> {
  if (!isBlobConfigured()) return;
  try {
    await blob.del(mdxKey(slug), { token: blobToken() });
  } catch {
    // ignore — best effort
  }
}
