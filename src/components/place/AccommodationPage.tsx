"use client";

import type { ReactNode } from "react";
import { BedDouble } from "lucide-react";
import { CATEGORY_META } from "@/lib/places/categories";
import type { AccommodationPlace, DetailFallback } from "@/lib/places/place-types";
import {
  PlaceDetailLayout,
  PicksBox,
  SectionList,
  BulletList,
  BookingLinks,
  rowsFromOverview,
} from "./parts";

export default function AccommodationPage({
  data,
  body,
  fallback,
  galleryImages,
}: {
  data: AccommodationPlace;
  body: ReactNode;
  fallback: DetailFallback;
  galleryImages?: string[];
}) {
  const hasContent = !!(
    data.rooms?.length ||
    data.picks?.items?.length ||
    data.amenities?.length ||
    data.bookingLinks?.length
  );
  const middle = hasContent
    ? {
        label: CATEGORY_META.accommodation.section,
        content: (
          <>
            <PicksBox picks={data.picks} label="AI pick" />
            <SectionList sections={data.rooms} />
            <BulletList title="Amenities" items={data.amenities} />
            <BookingLinks links={data.bookingLinks} />
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
      middleIcon={BedDouble}
      galleryImages={galleryImages}
    />
  );
}
