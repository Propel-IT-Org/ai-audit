import { notFound } from "next/navigation";
import { readItinerary } from "@/lib/itineraries/storage";
import { ItineraryView } from "./ItineraryView";

export const metadata = { title: "Itinerary — AIVIBLE" };

export default async function ItineraryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const itinerary = await readItinerary(slug);
  if (!itinerary) notFound();
  return <ItineraryView initial={itinerary} />;
}
