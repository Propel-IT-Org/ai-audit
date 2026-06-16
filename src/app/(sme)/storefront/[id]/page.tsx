import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ExternalLink, MapPin, Phone, Globe, Star } from "lucide-react";
import { readPublishedSite } from "@/lib/sites/storage";

export default async function StorefrontPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: subdomain } = await params;
  const site = await readPublishedSite(subdomain);
  if (!site) notFound();

  const d = site.data as {
    name: string;
    tagline?: string;
    description?: string;
    about?: string;
    highlights?: string[];
    hero?: { heading?: string; sub?: string; image?: { url: string; alt?: string } };
    gallery?: { url: string; alt?: string }[];
    contact?: { phone?: string; street?: string; city?: string; region?: string; country?: string };
    social?: { instagram?: string; facebook?: string };
    websiteUrl?: string;
  };

  const heroImage = d.hero?.image?.url ?? d.gallery?.[0]?.url;
  const geo = site.geo;

  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-20 border-b border-border bg-background/95 backdrop-blur">
        <div className="container mx-auto flex items-center justify-between px-4 py-3">
          <Link
            href="/storefronts"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            All storefronts
          </Link>
          {site.sourceUrl && (
            <a
              href={site.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
            >
              <ExternalLink className="h-4 w-4" />
              Original site
            </a>
          )}
        </div>
      </div>

      {heroImage && (
        <div className="h-64 w-full overflow-hidden bg-muted md:h-96">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={heroImage} alt={d.hero?.image?.alt ?? d.name} className="h-full w-full object-cover" />
        </div>
      )}

      <div className="container mx-auto max-w-3xl px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-foreground md:text-4xl">{d.name}</h1>
          {(d.tagline || site.geo?.hero?.sub) && (
            <p className="mt-2 text-lg text-muted-foreground">{site.geo?.hero?.sub ?? d.tagline}</p>
          )}
          <div className="mt-4 flex flex-wrap gap-4 text-sm text-muted-foreground">
            {d.contact?.phone && (
              <a href={`tel:${d.contact.phone}`} className="flex items-center gap-1 hover:text-foreground">
                <Phone className="h-4 w-4" />
                {d.contact.phone}
              </a>
            )}
            {(d.contact?.street || d.contact?.city) && (
              <span className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                {[d.contact.street, d.contact.city, d.contact.region].filter(Boolean).join(", ")}
              </span>
            )}
            {site.sourceUrl && (
              <a href={site.sourceUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-foreground">
                <Globe className="h-4 w-4" />
                Website
              </a>
            )}
          </div>
        </div>

        {geo?.summary && (
          <div className="mb-8 rounded-lg border border-[#C8A859]/30 bg-[#F6EFDC]/50 p-5">
            <p className="av-eyebrow mb-2">AI Overview</p>
            <p className="text-foreground/90">{geo.summary}</p>
          </div>
        )}

        {(geo?.about ?? d.about) && (
          <section className="mb-8">
            <h2 className="mb-3 text-xl font-bold text-foreground">About</h2>
            <p className="leading-relaxed text-foreground/80">{geo?.about ?? d.about}</p>
          </section>
        )}

        {d.highlights && d.highlights.length > 0 && (
          <section className="mb-8">
            <h2 className="mb-3 text-xl font-bold text-foreground">Highlights</h2>
            <ul className="space-y-2">
              {d.highlights.map((h, i) => (
                <li key={i} className="flex items-start gap-2 text-foreground/80">
                  <Star className="mt-0.5 h-4 w-4 shrink-0 text-[#C8A859]" />
                  {h}
                </li>
              ))}
            </ul>
          </section>
        )}

        {geo?.faqs && geo.faqs.length > 0 && (
          <section className="mb-8">
            <h2 className="mb-4 text-xl font-bold text-foreground">FAQ</h2>
            <div className="space-y-4">
              {geo.faqs.map((faq, i) => (
                <div key={i} className="rounded-lg border border-border p-4">
                  <p className="font-semibold text-foreground">{faq.q}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{faq.a}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {d.gallery && d.gallery.length > 1 && (
          <section className="mb-8">
            <h2 className="mb-3 text-xl font-bold text-foreground">Gallery</h2>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
              {d.gallery.slice(1).map((img, i) => (
                <div key={i} className="aspect-square overflow-hidden rounded-lg bg-muted">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img.url} alt={img.alt ?? ""} className="h-full w-full object-cover" loading="lazy" />
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

      <footer className="border-t border-border py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>© 2026 AIVIBLE. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
