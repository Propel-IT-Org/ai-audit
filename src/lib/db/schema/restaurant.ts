import { pgTable, text, doublePrecision, boolean, integer, timestamp, index } from "drizzle-orm/pg-core";

export const restaurant = pgTable(
  "restaurant",
  {
    id: text("id").primaryKey(),
    slug: text("slug").notNull().unique(),
    nameEn: text("name_en").notNull(),
    nameJp: text("name_jp"),
    address: text("address"),
    aiOverview: text("ai_overview"),
    shortEn: text("short_en"),
    shortJp: text("short_jp"),
    category: text("category"),
    subcategory: text("subcategory"),
    area: text("area"),
    prefecture: text("prefecture"),
    region: text("region"),
    price: text("price"),
    lat: doublePrecision("lat"),
    lng: doublePrecision("lng"),
    imageUrl: text("image_url"),
    imageEmoji: text("image_emoji"),
    websiteUrl: text("website_url"),
    hiddenGem: boolean("hidden_gem").default(false),
    auditScore: integer("audit_score"),
    auditGrade: text("audit_grade"),
    mdxBody: text("mdx_body"),
    mdxUrl: text("mdx_url"),
    publishedSubdomain: text("published_subdomain"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("restaurant_slug_idx").on(table.slug),
    index("restaurant_prefecture_idx").on(table.prefecture),
    index("restaurant_category_idx").on(table.category),
  ],
);

export type Restaurant = typeof restaurant.$inferSelect;
export type NewRestaurant = typeof restaurant.$inferInsert;
