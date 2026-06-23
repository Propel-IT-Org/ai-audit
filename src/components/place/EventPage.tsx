"use client";

import type { ReactNode } from "react";
import { CalendarDays } from "lucide-react";
import { CATEGORY_META } from "@/lib/places/categories";
import type { DetailFallback, EventPlace } from "@/lib/places/place-types";
import { PlaceDetailLayout, PicksBox, SectionList, BulletList, rowsFromOverview } from "./parts";

export default function EventPage({
  data,
  body,
  fallback,
  galleryImages,
}: {
  data: EventPlace;
  body: ReactNode;
  fallback: DetailFallback;
  galleryImages?: string[];
}) {
  const hasContent = !!(data.highlights?.length || data.dontMiss?.items?.length || data.tips?.length);
  const middle = hasContent
    ? {
        label: CATEGORY_META.event.section,
        content: (
          <>
            <PicksBox picks={data.dontMiss} label="Don't miss" />
            <SectionList sections={data.highlights} />
            <BulletList title="Tips" items={data.tips} />
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
      middleIcon={CalendarDays}
      galleryImages={galleryImages}
    />
  );
}
