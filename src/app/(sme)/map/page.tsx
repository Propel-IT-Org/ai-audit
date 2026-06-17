import { getRestaurantsForMap } from "@/lib/restaurants/queries";
import { SmeMapClient } from "./SmeMapClient";

export const metadata = { title: "SME Map — AIVIBLE" };

export default async function MapPage() {
  const restaurants = (await getRestaurantsForMap()).filter(
    (r) => r.lat != null && r.lng != null,
  );
  return <SmeMapClient restaurants={restaurants} />;
}
