"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { createRestaurant, updateRestaurant, getRestaurant, getRestaurantById, deleteRestaurant } from "./queries";
import { writeRestaurantMdx, deleteRestaurantMdx } from "./mdx-storage";

/** Parse MDX frontmatter + body to extract restaurant fields — no external deps. */
function parseFrontmatter(text: string): Record<string, string | number | boolean> {
  const match = text.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) return {};
  const data: Record<string, string | number | boolean> = {};
  for (const line of match[1].split(/\r?\n/)) {
    const kv = line.match(/^(\w+):\s*(.+)$/);
    if (!kv) continue;
    const raw = kv[2].trim().replace(/^["']|["']$/g, "");
    if (/^-?\d+(\.\d+)?$/.test(raw)) data[kv[1]] = parseFloat(raw);
    else if (raw === "true" || raw === "false") data[kv[1]] = raw === "true";
    else data[kv[1]] = raw;
  }
  return data;
}

type MdxFields = Partial<{
  nameEn: string; nameJp: string; address: string; aiOverview: string;
  lat: string; lng: string; prefecture: string; websiteUrl: string; slug: string;
}>;

export async function parseRestaurantMdxAction(text: string): Promise<{ fields: MdxFields }> {
  const fm = parseFrontmatter(text);
  const fields: MdxFields = {};
  if (fm.name) fields.nameEn = String(fm.name);
  if (fm.nameJa ?? fm.nameJp) fields.nameJp = String(fm.nameJa ?? fm.nameJp);
  if (fm.addressEn ?? fm.address) fields.address = String(fm.addressEn ?? fm.address);
  if (fm.website) fields.websiteUrl = String(fm.website);
  if (fm.prefecture) fields.prefecture = String(fm.prefecture);
  if (fm.slug) fields.slug = String(fm.slug);
  if (fm.lat != null) fields.lat = String(fm.lat);
  if (fm.lng != null) fields.lng = String(fm.lng);
  const afterFrontmatter = text.replace(/^---[\s\S]*?---\r?\n?/, "").trim();
  const firstPara = afterFrontmatter.split(/\n\n+/).find((p) => p.trim() && !p.trim().startsWith("#"));
  if (firstPara) fields.aiOverview = firstPara.trim().slice(0, 600);
  return { fields };
}

export async function deleteRestaurantAction(id: string): Promise<{ ok: true } | { ok: false; error: string }> {
  const h = await headers();
  const session = await auth.api.getSession({ headers: h });
  if (session?.user?.role !== "admin") return { ok: false, error: "Unauthorized" };

  try {
    const row = await getRestaurantById(id);
    if (!row) return { ok: false, error: "Not found" };
    await deleteRestaurant(id);
    if (row.slug) await deleteRestaurantMdx(row.slug);
    revalidatePath("/admin");
    revalidatePath("/explore");
    revalidatePath("/map");
    revalidatePath(`/restaurants/${row.slug}`);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Delete failed" };
  }
}

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
