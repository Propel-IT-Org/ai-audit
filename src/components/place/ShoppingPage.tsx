"use client";

import type { ReactNode } from "react";
import { ShoppingBag } from "lucide-react";
import { CATEGORY_META } from "@/lib/places/categories";
import type { DetailFallback, ShoppingPlace } from "@/lib/places/place-types";
import {
  PlaceDetailLayout,
  PicksBox,
  SectionList,
  BulletList,
  SectionNote,
  rowsFromOverview,
} from "./parts";

export default function ShoppingPage({
  data,
  body,
  fallback,
  galleryImages,
}: {
  data: ShoppingPlace;
  body: ReactNode;
  fallback: DetailFallback;
  galleryImages?: string[];
}) {
  const hasContent = !!(data.sells?.length || data.picks?.items?.length || data.specialties?.length);
  const middle = hasContent
    ? {
        label: CATEGORY_META.shopping.section,
        content: (
          <>
            <PicksBox picks={data.picks} label="AI pick · what to buy" />
            <SectionList sections={data.sells} />
            <BulletList title="Local specialties" items={data.specialties} />
            <SectionNote recorded={data.priceRecorded} />
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
      middleIcon={ShoppingBag}
      galleryImages={galleryImages}
    />
  );
}
