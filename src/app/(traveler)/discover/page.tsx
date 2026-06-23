import { getRestaurantsForMap } from "@/lib/restaurants/queries";
import { DiscoverClient } from "./DiscoverClient";

export const metadata = { title: "Discover — AIVIBLE" };

export default async function DiscoverPage() {
  const places = await getRestaurantsForMap();
  return <DiscoverClient places={places} />;
}
