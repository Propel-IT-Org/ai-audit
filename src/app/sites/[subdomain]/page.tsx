import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { readPublishedSite, isValidSubdomain } from "@/lib/sites/storage";
import { RestaurantHome } from "@/templates/restaurant/RestaurantHome";

// ISR: published sites are immutable between publishes. Time-based fallback +
// on-demand purge via revalidateSite() on publish/edit/delete.
export const revalidate = 3600;

interface Params {
  params: Promise<{ subdomain: string }>;
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { subdomain } = await params;
  if (!isValidSubdomain(subdomain)) return {};
  const site = await readPublishedSite(subdomain);
  if (!site) return {};
  return {
    metadataBase: new URL(site.meta.canonical),
    title: site.meta.title,
    description: site.meta.description,
    alternates: { canonical: site.meta.canonical },
    openGraph: {
      title: site.meta.title,
      description: site.meta.description,
      url: site.meta.canonical,
      siteName: site.data.name,
      type: "website",
      images: site.meta.ogImage ? [{ url: site.meta.ogImage }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: site.meta.title,
      description: site.meta.description,
      images: site.meta.ogImage ? [site.meta.ogImage] : undefined,
    },
  };
}

export default async function SubdomainHomePage({ params }: Params) {
  const { subdomain } = await params;
  if (!isValidSubdomain(subdomain)) notFound();
  const site = await readPublishedSite(subdomain);
  if (!site) notFound();
  return <RestaurantHome site={site} />;
}
