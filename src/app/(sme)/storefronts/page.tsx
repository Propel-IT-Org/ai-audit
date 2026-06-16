import Link from "next/link";
import { listPublishedSites, readPublishedSite } from "@/lib/sites/storage";

function getDomain(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

async function getStorefronts() {
  const list = await listPublishedSites();
  const items = await Promise.all(
    list.slice(0, 50).map(async ({ subdomain, uploadedAt }) => {
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
        uploadedAt,
      };
    }),
  );
  return items
    .filter(Boolean)
    .sort((a, b) => new Date(b!.uploadedAt).getTime() - new Date(a!.uploadedAt).getTime()) as NonNullable<(typeof items)[0]>[];
}

export const metadata = { title: "AI Storefronts — AIVIBLE" };

export default async function StorefrontsPage() {
  const storefronts = await getStorefronts();

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-12">
        <div className="mb-8 text-center">
          <p className="av-eyebrow mb-2">Discover</p>
          <h1 className="text-3xl font-bold text-foreground">AI-Powered Storefronts</h1>
          <p className="mt-2 text-muted-foreground">
            Explore Japan&apos;s hidden gems — discovered and published by AI.
          </p>
        </div>

        {storefronts.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-muted-foreground">No storefronts published yet.</p>
            <Link
              href="/generate"
              className="mt-4 inline-block rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground hover:bg-primary/90"
            >
              Build your storefront
            </Link>
          </div>
        ) : (
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
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-primary/5">
                      <span className="text-3xl font-bold text-primary/30">{sf.name.charAt(0)}</span>
                    </div>
                  )}
                </div>
                <div className="p-4">
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
        )}
      </main>

      <footer className="border-t border-border py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>© 2026 AIVIBLE. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
