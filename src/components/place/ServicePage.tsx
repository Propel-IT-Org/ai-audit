"use client";

import type { ReactNode } from "react";
import { Wrench } from "lucide-react";
import { CATEGORY_META } from "@/lib/places/categories";
import type { DetailFallback, ServicePlace } from "@/lib/places/place-types";
import { PlaceDetailLayout, BulletList, rowsFromOverview } from "./parts";

export default function ServicePage({
  data,
  body,
  fallback,
  galleryImages,
}: {
  data: ServicePlace;
  body: ReactNode;
  fallback: DetailFallback;
  galleryImages?: string[];
}) {
  const middle = data.notes?.length
    ? {
        label: CATEGORY_META.service.section,
        content: <BulletList title="Details" items={data.notes} />,
      }
    : null;

  return (
    <PlaceDetailLayout
      data={data}
      fallback={fallback}
      aiOverview={body}
      overviewRows={rowsFromOverview(data.overview)}
      middle={middle}
      middleIcon={Wrench}
      galleryImages={galleryImages}
    />
  );
}
