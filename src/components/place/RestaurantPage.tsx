"use client";

import type { ReactNode } from "react";
import { UtensilsCrossed } from "lucide-react";
import { CATEGORY_META } from "@/lib/places/categories";
import type { DetailFallback, RestaurantPlace } from "@/lib/places/place-types";
import {
  PlaceDetailLayout,
  PicksBox,
  SectionList,
  SectionNote,
  rowsFromOverview,
} from "./parts";

export default function RestaurantPage({
  data,
  body,
  fallback,
  galleryImages,
}: {
  data: RestaurantPlace;
  body: ReactNode;
  fallback: DetailFallback;
  galleryImages?: string[];
}) {
  const middle = data.menu?.length
    ? {
        label: CATEGORY_META.restaurant.section,
        content: (
          <>
            <PicksBox picks={data.picks} label="AI pick · what to try" />
            <SectionList sections={data.menu} />
            <SectionNote note={data.menuNote} recorded={data.priceRecorded} />
          </>
        ),
      }
    : null;

  return (
    <PlaceDetailLayout
      data={data}
      fallback={fallback}
      aiOverview={body}
      overviewRows={rowsFromOverview(data.overview)}
      middle={middle}
      middleIcon={UtensilsCrossed}
      galleryImages={galleryImages}
    />
  );
}
