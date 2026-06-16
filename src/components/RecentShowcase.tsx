"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { listStorefrontsAction, type StorefrontSummaryItem } from "@/lib/sites/actions";

function getDomain(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export function RecentShowcase() {
  const [storefronts, setStorefronts] = useState<StorefrontSummaryItem[]>([]);

  useEffect(() => {
    listStorefrontsAction(3).then(setStorefronts).catch(() => {});
  }, []);

  if (storefronts.length === 0) return null;

  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-foreground">Recently published storefronts</h2>
          <Link
            href="/storefronts"
            className="flex items-center gap-1 text-sm text-primary hover:underline"
          >
            View all
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {storefronts.map((sf) => (
            <Link
              key={sf.subdomain}
              href={`/storefront/${sf.subdomain}`}
              className="group block overflow-hidden rounded-lg border border-border bg-card transition-shadow hover:shadow-md"
            >
              <div className="aspect-16/10 w-full overflow-hidden bg-muted">
                {sf.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={sf.imageUrl}
                    alt={sf.name}
                    className="h-full w-full object-cover transition-transform group-hover:scale-105"
                    loading="lazy"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-primary/5">
                    <span className="text-3xl font-bold text-primary/30">{sf.name.charAt(0)}</span>
                  </div>
                )}
              </div>
              <div className="p-3">
                <h3 className="truncate font-semibold text-foreground transition-colors group-hover:text-primary">
                  {sf.name}
                </h3>
                <div className="mt-1 flex items-center justify-between text-xs text-muted-foreground">
                  <span className="truncate">{getDomain(sf.sourceUrl)}</span>
                  <span className="ml-2 shrink-0">{formatDate(sf.uploadedAt)}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
