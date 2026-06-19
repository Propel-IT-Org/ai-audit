"use server";

import { generateItinerary, customizeItinerary } from "./generate";
import { writeItinerary, newItinerarySlug } from "./storage";
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
  current: Itinerary,
): Promise<{ ok: true; itinerary: Itinerary; reply: string } | { ok: false; error: string }> {
  try {
    const { itinerary, reply } = await customizeItinerary(current, message);
    try {
      await writeItinerary(itinerary);
    } catch {
      // blob write failure — return updated state to client anyway
    }
    return { ok: true, itinerary, reply };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Failed to update itinerary." };
  }
}
