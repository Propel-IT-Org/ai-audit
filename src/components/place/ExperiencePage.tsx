"use client";

import type { ReactNode } from "react";
import { Ticket } from "lucide-react";
import { CATEGORY_META } from "@/lib/places/categories";
import type { DetailFallback, ExperiencePlace } from "@/lib/places/place-types";
import {
  PlaceDetailLayout,
  PicksBox,
  SectionList,
  BulletList,
  BookingLinks,
  rowsFromOverview,
} from "./parts";

export default function ExperiencePage({
  data,
  body,
  fallback,
  galleryImages,
}: {
  data: ExperiencePlace;
  body: ReactNode;
  fallback: DetailFallback;
  galleryImages?: string[];
}) {
  const hasContent = !!(
    data.options?.length ||
    data.dontMiss?.items?.length ||
    data.tips?.length ||
    data.bookingLinks?.length
  );
  const middle = hasContent
    ? {
        label: CATEGORY_META.experience.section,
        content: (
          <>
            <PicksBox picks={data.dontMiss} label="Don't miss" />
            <SectionList sections={data.options} />
            <BulletList title="Tips" items={data.tips} />
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
      middleIcon={Ticket}
      galleryImages={galleryImages}
    />
  );
}
