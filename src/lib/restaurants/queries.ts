import { eq, isNotNull, and, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { restaurant, type Restaurant } from "@/lib/db/schema/restaurant";
import type { PublishedSite } from "@/lib/sites/types";
import { normalizeCategory } from "@/lib/places/categories";
import type { Category } from "@/lib/places/categories";

export interface ListRestaurantsOptions {
  prefecture?: string;
  region?: string;
  category?: string;
  hiddenGem?: boolean;
  limit?: number;
}

export async function listRestaurants(opts: ListRestaurantsOptions = {}): Promise<Restaurant[]> {
  const conditions = [];
  if (opts.prefecture) conditions.push(eq(restaurant.prefecture, opts.prefecture));
  if (opts.region) conditions.push(eq(restaurant.region, opts.region));
  if (opts.category) conditions.push(eq(restaurant.category, opts.category));
  if (opts.hiddenGem != null) conditions.push(eq(restaurant.hiddenGem, opts.hiddenGem));

  const rows = await db
    .select()
    .from(restaurant)
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(sql`${restaurant.nameEn} ASC`)
    .limit(opts.limit ?? 100);

  return rows;
}

export async function getRestaurant(slug: string): Promise<Restaurant | null> {
  const rows = await db
    .select()
    .from(restaurant)
    .where(eq(restaurant.slug, slug))
    .limit(1);
  return rows[0] ?? null;
}

export async function getRestaurantById(id: string): Promise<Restaurant | null> {
  const rows = await db
    .select()
    .from(restaurant)
    .where(eq(restaurant.id, id))
    .limit(1);
  return rows[0] ?? null;
}

export async function getRestaurantsForMap(): Promise<Restaurant[]> {
  return db
    .select()
    .from(restaurant)
    .where(and(isNotNull(restaurant.lat), isNotNull(restaurant.lng)));
}

export async function deleteRestaurant(id: string): Promise<void> {
  await db.delete(restaurant).where(eq(restaurant.id, id));
}

export async function createRestaurant(data: typeof restaurant.$inferInsert): Promise<Restaurant> {
  const rows = await db.insert(restaurant).values(data).returning();
  return rows[0];
}

export async function updateRestaurant(
  id: string,
  data: Partial<typeof restaurant.$inferInsert>,
): Promise<Restaurant | null> {
  const rows = await db
    .update(restaurant)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(restaurant.id, id))
    .returning();
  return rows[0] ?? null;
}

const INDUSTRY_TO_CATEGORY: Record<string, Category> = {
  restaurant: "restaurant",
  travel:     "attraction",
  service:    "service",
  general:    "service",
};

export async function upsertPlaceFromSite(site: PublishedSite): Promise<void> {
  const d = site.data;
  const contact = d.contact;
  const geo = site.geo;

  const rawCategory = INDUSTRY_TO_CATEGORY[site.industry] ?? "service";
  const category = normalizeCategory(rawCategory);

  const addressParts = [contact?.street, contact?.city, contact?.region, contact?.country]
    .filter(Boolean);
  const address = addressParts.length > 0 ? addressParts.join(", ") : undefined;

  const imageUrl = d.hero?.image?.url ?? d.gallery?.[0]?.url ?? undefined;
  const aiOverview = geo?.summary ?? d.description ?? undefined;

  const values: Omit<typeof restaurant.$inferInsert, "id"> = {
    slug: site.subdomain,
    nameEn: d.name,
    category,
    address,
    lat: contact?.lat ?? undefined,
    lng: contact?.lng ?? undefined,
    aiOverview,
    websiteUrl: site.sourceUrl,
    imageUrl,
    publishedSubdomain: site.subdomain,
    hiddenGem: false,
  };

  const existing = await getRestaurant(site.subdomain);
  if (existing) {
    await updateRestaurant(existing.id, values);
  } else {
    const id = `r_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    await createRestaurant({ id, ...values });
  }
}
