import { listPublishedSites, readPublishedSite } from "./storage";

export interface StorefrontSummaryItem {
  subdomain: string;
  name: string;
  sourceUrl: string;
  imageUrl: string | null;
  industry: string;
  uploadedAt: string;
}

export async function listStorefrontSummaries(limit = 50): Promise<StorefrontSummaryItem[]> {
  const list = await listPublishedSites();
  const items = await Promise.all(
    list.slice(0, limit).map(async ({ subdomain, uploadedAt }) => {
      const site = await readPublishedSite(subdomain);
      if (!site) return null;
      const gallery = (site.data as { gallery?: { url: string }[] }).gallery ?? [];
      const imageUrl =
        (site.data as { hero?: { image?: { url: string } } }).hero?.image?.url ??
        gallery[0]?.url ??
        null;
      return {
        subdomain,
        name: site.data.name,
        sourceUrl: site.sourceUrl,
        imageUrl,
        industry: site.industry,
        uploadedAt,
      } satisfies StorefrontSummaryItem;
    }),
  );
  return (items.filter(Boolean) as StorefrontSummaryItem[]).sort(
    (a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime(),
  );
}
