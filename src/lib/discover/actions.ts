"use server";

import { discoverReply, type DiscoverCandidate, type DiscoverReply } from "./chat";

export async function discoverChatAction(
  message: string,
  candidates: DiscoverCandidate[],
): Promise<{ ok: true; result: DiscoverReply } | { ok: false; error: string }> {
  const msg = message.trim();
  if (!msg) return { ok: false, error: "Say what you're after." };
  try {
    const result = await discoverReply(msg, candidates);
    return { ok: true, result };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Discover chat failed." };
  }
}
