import { notFound } from "next/navigation";
import Link from "next/link";
import { MapPin, Globe, ArrowLeft } from "lucide-react";
import { compileMDX } from "next-mdx-remote/rsc";
import { getRestaurant } from "@/lib/restaurants/queries";
import { readRestaurantMdx } from "@/lib/restaurants/mdx-storage";
import { mdxComponents } from "@/components/mdx-components";
import { SafeMdx } from "@/components/SafeMdx";
import { PlaceDetail } from "@/components/place/PlaceDetail";
import type { Place } from "@/lib/places/place-types";

const compileOptions = { parseFrontmatter: true } as const;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const r = await getRestaurant(slug);
  if (!r) return { title: "Not Found" };
  return {
    title: `${r.nameEn} — AIVIBLE`,
    description: r.aiOverview ?? r.shortEn ?? undefined,
  };
}

export default async function RestaurantPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const r = await getRestaurant(slug);
  if (!r) notFound();

  const mdxSource = r.mdxUrl ? await readRestaurantMdx(r.mdxUrl) : r.mdxBody;

  // Parse frontmatter — the rich restaurant data lives there; the body is the
  // AI-overview prose. Falls back to a simple layout on plain MDX / parse error.
  let frontmatter: Record<string, unknown> = {};
  let body: React.ReactNode = null;
  if (mdxSource) {
    try {
      const compiled = await compileMDX<Record<string, unknown>>({
        source: mdxSource,
        options: compileOptions,
        components: mdxComponents,
      });
      frontmatter = compiled.frontmatter;
      body = compiled.content;
    } catch {
      frontmatter = {};
      body = null;
    }
  }

  const isRich = !!(frontmatter.name || frontmatter.category || frontmatter.overview);

  if (isRich) {
    return (
      <PlaceDetail
        data={frontmatter as unknown as Place}
        body={body}
        galleryImages={r.galleryUrls ?? []}
        fallback={{
          name: r.nameEn,
          nameJp: r.nameJp,
          lat: r.lat,
          lng: r.lng,
          address: r.address,
          website: r.websiteUrl,
        }}
      />
    );
  }

  // ---- Plain-MDX fallback (no structured frontmatter) ----
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto max-w-3xl px-4 py-8">
        <Link
          href="/explore"
          className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to explore
        </Link>

        <div className="mb-8">
          {r.imageUrl && (
            <div className="mb-6 overflow-hidden rounded-xl">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={r.imageUrl} alt={r.nameEn} className="h-64 w-full object-cover" />
            </div>
          )}

          <div className="flex flex-wrap items-start gap-3">
            {r.imageEmoji && (
              <span className="text-4xl" role="img" aria-hidden="true">{r.imageEmoji}</span>
            )}
            <div className="min-w-0 flex-1">
              <h1 className="text-3xl font-bold text-foreground">{r.nameEn}</h1>
              {r.nameJp && <p className="text-lg text-muted-foreground">{r.nameJp}</p>}
            </div>
            {r.hiddenGem && (
              <span
                className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-sm font-semibold"
                style={{ backgroundColor: "#F6EFDC", color: "#8A6D2D" }}
              >
                <span style={{ color: "#C8A859" }}>★</span>
                Verified gem
              </span>
            )}
          </div>

          <div className="mt-4 flex flex-wrap gap-4 text-sm text-muted-foreground">
            {r.address && (
              <span className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                {r.address}
              </span>
            )}
            {r.category && (
              <span className="rounded-full border border-border px-2 py-0.5 capitalize">
                {r.category}
              </span>
            )}
            {r.price && <span>{r.price}</span>}
          </div>

          {r.aiOverview && (
            <div className="mt-4 rounded-lg border border-[#C8A859]/30 bg-[#F6EFDC]/50 p-4">
              <p className="av-eyebrow mb-1">AI Overview</p>
              <p className="text-sm text-foreground/90">{r.aiOverview}</p>
            </div>
          )}

          {r.websiteUrl && (
            <a
              href={r.websiteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-1 rounded-lg bg-[#223A70] px-4 py-2 text-sm font-semibold text-white hover:bg-[#1a2d58]"
            >
              <Globe className="h-4 w-4" />
              Visit website
            </a>
          )}
        </div>

        {mdxSource ? (
          <article className="prose-custom">
            <SafeMdx source={mdxSource} />
          </article>
        ) : (
          <div className="rounded-lg border border-border bg-muted/30 p-8 text-center text-muted-foreground">
            No detailed content yet for this restaurant.
          </div>
        )}
      </div>

      <footer className="mt-12 border-t border-border py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>© 2026 AIVIBLE. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
