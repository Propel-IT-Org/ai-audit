"use client";

import type { ReactNode } from "react";
import { Droplets } from "lucide-react";
import { CATEGORY_META } from "@/lib/places/categories";
import type { DetailFallback, OnsenPlace } from "@/lib/places/place-types";
import { PlaceDetailLayout, PicksBox, SectionList, BulletList, rowsFromOverview } from "./parts";

export default function OnsenPage({
  data,
  body,
  fallback,
  galleryImages,
}: {
  data: OnsenPlace;
  body: ReactNode;
  fallback: DetailFallback;
  galleryImages?: string[];
}) {
  const hasContent = !!(data.features?.length || data.dontMiss?.items?.length || data.tips?.length);
  const middle = hasContent
    ? {
        label: CATEGORY_META.onsen.section,
        content: (
          <>
            <PicksBox picks={data.dontMiss} label="How to enjoy it" />
            <SectionList sections={data.features} />
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
      middleIcon={Droplets}
      galleryImages={galleryImages}
    />
  );
}
