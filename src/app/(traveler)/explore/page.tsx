import { listRestaurants, getRestaurantsForMap } from "@/lib/restaurants/queries";
import { ExploreClient } from "./ExploreClient";

export const metadata = { title: "Explore verified gems — AIVIBLE" };

export default async function ExplorePage() {
  const [restaurants, mapRows] = await Promise.all([
    listRestaurants(),
    getRestaurantsForMap(),
  ]);
  const mapRestaurants = mapRows.filter((r) => r.lat != null && r.lng != null);
  return <ExploreClient restaurants={restaurants} mapRestaurants={mapRestaurants} />;
}
