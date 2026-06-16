"use server";

import { headers } from "next/headers";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { createRestaurant, updateRestaurant, getRestaurant } from "./queries";

const schema = z.object({
  slug: z.string().min(1),
  nameEn: z.string().min(1),
  nameJp: z.string().optional(),
  address: z.string().optional(),
  aiOverview: z.string().optional(),
  shortEn: z.string().optional(),
  shortJp: z.string().optional(),
  category: z.string().optional(),
  subcategory: z.string().optional(),
  area: z.string().optional(),
  prefecture: z.string().optional(),
  region: z.string().optional(),
  price: z.string().optional(),
  lat: z.number().optional(),
  lng: z.number().optional(),
  imageUrl: z.string().url().optional(),
  imageEmoji: z.string().optional(),
  websiteUrl: z.string().url().optional(),
  hiddenGem: z.boolean().optional(),
  auditScore: z.number().int().optional(),
  auditGrade: z.string().optional(),
  mdxBody: z.string().optional(),
  publishedSubdomain: z.string().optional(),
});

export type SaveRestaurantInput = z.infer<typeof schema>;

export async function saveRestaurantAction(data: SaveRestaurantInput): Promise<{ ok: true } | { ok: false; error: string }> {
  const h = await headers();
  const session = await auth.api.getSession({ headers: h });
  if (session?.user?.role !== "admin") {
    return { ok: false, error: "Unauthorized" };
  }

  const parsed = schema.safeParse(data);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues.map((i) => i.message).join("; ") };
  }

  try {
    const existing = await getRestaurant(parsed.data.slug);
    if (existing) {
      await updateRestaurant(existing.id, parsed.data);
    } else {
      const id = `r_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
      await createRestaurant({ id, ...parsed.data });
    }
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Database error" };
  }
}
