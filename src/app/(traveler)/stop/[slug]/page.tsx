import Link from "next/link";
import { notFound } from "next/navigation";
import { MapPin, ExternalLink, Globe } from "lucide-react";
import { CategoryIcon } from "@/components/icons";
import { getRestaurant } from "@/lib/restaurants/queries";
import { BackButton } from "./BackButton";

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

export default async function StopPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const r = await getRestaurant(slug);
  if (!r) notFound();

  return (
    <section className="container mx-auto max-w-3xl px-4 py-6">
      <BackButton />

      <div className="rounded-xl border border-border bg-white p-6 shadow-sm">
        <div className="flex items-start gap-4">
          {r.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={r.imageUrl} alt={r.nameEn} className="h-16 w-16 rounded-lg object-cover" />
          ) : (
            <span className="flex h-16 w-16 flex-none items-center justify-center rounded-lg bg-paper text-kon2" aria-hidden="true">
              {r.imageEmoji ? (
                <span className="text-3xl">{r.imageEmoji}</span>
              ) : (
                <CategoryIcon category={r.category ?? ""} size={34} />
              )}
            </span>
          )}
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-bold text-foreground">{r.nameEn}</h1>
              {r.hiddenGem && <GemBadge />}
              {r.auditGrade && (
                <span className="rounded bg-muted px-2 py-0.5 text-xs font-medium text-foreground">
                  {r.auditGrade}
                </span>
              )}
            </div>
            {r.nameJp && <p className="text-sm text-muted-foreground">{r.nameJp}</p>}
            {(r.category || r.subcategory) && (
              <p className="text-sm text-muted-foreground">
                {[r.category, r.subcategory].filter(Boolean).join(" · ")}
              </p>
            )}
            {(r.area || r.prefecture) && (
              <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                {[r.area, r.prefecture].filter(Boolean).join(", ")}
              </p>
            )}
            {r.price && <p className="mt-1 text-sm text-foreground">{r.price}</p>}
          </div>
        </div>

        {(r.shortEn || r.aiOverview) && (
          <p className="mt-4 text-foreground/90">{r.shortEn || r.aiOverview}</p>
        )}

        <div className="mt-4 flex flex-wrap gap-3">
          {(r.mdxUrl || r.mdxBody) && (
            <Link
              href={`/restaurants/${r.slug}`}
              className="inline-flex items-center gap-1 rounded-lg bg-kon2 px-4 py-2 text-sm font-semibold text-white hover:bg-kon"
            >
              <Globe className="h-4 w-4" />
              View restaurant page
            </Link>
          )}
          {r.publishedSubdomain && (
            <Link
              href={`/storefront/${r.publishedSubdomain}`}
              className="inline-flex items-center gap-1 rounded-lg border border-border px-4 py-2 text-sm font-semibold text-foreground hover:bg-muted"
            >
              View storefront
            </Link>
          )}
          {r.websiteUrl && (
            <a
              href={r.websiteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 rounded-lg border border-border px-4 py-2 text-sm font-semibold text-foreground hover:bg-muted"
            >
              Visit website
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          )}
        </div>
      </div>

      {r.aiOverview && (
        <div className="mt-4 rounded-lg border border-[#C8A859]/30 bg-[#F6EFDC]/50 p-4">
          <p className="av-eyebrow mb-1">AI Overview</p>
          <p className="text-sm text-foreground/90">{r.aiOverview}</p>
        </div>
      )}
    </section>
  );
}
