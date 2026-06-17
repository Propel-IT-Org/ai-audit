"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { createRestaurant, updateRestaurant, getRestaurant } from "./queries";
import { writeRestaurantMdx } from "./mdx-storage";

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
    const { mdxBody, ...rest } = parsed.data;

    // Store MDX content in Vercel Blob (not inline in Postgres). Persist the
    // returned blob URL; clear the legacy inline column.
    let mdxUrl: string | undefined;
    if (mdxBody && mdxBody.trim()) {
      mdxUrl = await writeRestaurantMdx(rest.slug, mdxBody);
    }

    const values = { ...rest, mdxUrl, mdxBody: null as string | null };

    const existing = await getRestaurant(rest.slug);
    if (existing) {
      await updateRestaurant(existing.id, values);
    } else {
      const id = `r_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
      await createRestaurant({ id, ...values });
    }

    // Server components cache these routes — revalidate so the new/updated
    // pin and detail page appear immediately.
    revalidatePath("/explore");
    revalidatePath("/map");
    revalidatePath(`/stop/${rest.slug}`);
    revalidatePath(`/restaurants/${rest.slug}`);

    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Database error" };
  }
}
