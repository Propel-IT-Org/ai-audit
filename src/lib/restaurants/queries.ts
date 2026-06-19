import { eq, isNotNull, and, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { restaurant, type Restaurant } from "@/lib/db/schema/restaurant";

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
