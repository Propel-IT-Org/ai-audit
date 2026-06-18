"use server";

import { generateItinerary, customizeItinerary } from "./generate";
import { readItinerary, writeItinerary, newItinerarySlug } from "./storage";
import type { Itinerary, PlanItineraryInput } from "./types";

export async function planItineraryAction(
  input: PlanItineraryInput,
): Promise<{ ok: true; slug: string } | { ok: false; error: string }> {
  if (!input.destination?.trim()) {
    return { ok: false, error: "Destination is required." };
  }
  try {
    const slug = newItinerarySlug(input.destination);
    const itinerary = await generateItinerary({ ...input, destination: input.destination.trim() }, slug);
    if (!itinerary.days.length) {
      return { ok: false, error: "No places found for that destination yet." };
    }
    await writeItinerary(itinerary);
    return { ok: true, slug };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Failed to plan trip." };
  }
}

export async function customizeItineraryAction(
  slug: string,
  message: string,
): Promise<{ ok: true; itinerary: Itinerary; reply: string } | { ok: false; error: string }> {
  try {
    const current = await readItinerary(slug);
    if (!current) return { ok: false, error: "Itinerary not found." };
    const { itinerary, reply } = await customizeItinerary(current, message);
    await writeItinerary(itinerary);
    return { ok: true, itinerary, reply };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Failed to update itinerary." };
  }
}
