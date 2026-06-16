"use server";

import { listRestaurants, getRestaurant, getRestaurantsForMap } from "./queries";

export async function listRestaurantsAction(opts?: {
  prefecture?: string;
  region?: string;
  category?: string;
  hiddenGem?: boolean;
  limit?: number;
}) {
  return listRestaurants(opts ?? {});
}

export async function getRestaurantsForMapAction() {
  return getRestaurantsForMap();
}

export async function getRestaurantAction(slug: string) {
  return getRestaurant(slug);
}
