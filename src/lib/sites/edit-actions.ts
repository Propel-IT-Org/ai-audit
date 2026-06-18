"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { editStorefront, type EditTurn } from "./edit";

export async function editStorefrontAction(
  subdomain: string,
  message: string,
  history: EditTurn[],
): Promise<{ ok: true; reply: string } | { ok: false; reply: string }> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return { ok: false, reply: "You must be signed in to edit a storefront." };
  }
  if (!message.trim()) {
    return { ok: false, reply: "Type what you'd like to change." };
  }

  const res = await editStorefront(subdomain, message.trim(), history);
  if (res.ok) {
    revalidatePath(`/storefront/${subdomain}`);
    return { ok: true, reply: res.reply };
  }
  return { ok: false, reply: res.reply };
}
