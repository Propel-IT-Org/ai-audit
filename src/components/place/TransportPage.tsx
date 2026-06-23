"use client";

import type { ReactNode } from "react";
import { Bus } from "lucide-react";
import { CATEGORY_META } from "@/lib/places/categories";
import type { DetailFallback, TransportPlace } from "@/lib/places/place-types";
import { PlaceDetailLayout, BulletList, rowsFromOverview } from "./parts";

export default function TransportPage({
  data,
  body,
  fallback,
  galleryImages,
}: {
  data: TransportPlace;
  body: ReactNode;
  fallback: DetailFallback;
  galleryImages?: string[];
}) {
  const middle = data.notes?.length
    ? {
        label: CATEGORY_META.transport.section,
        content: <BulletList title="Notes" items={data.notes} />,
      }
    : null;

  return (
    <PlaceDetailLayout
      data={data}
      fallback={fallback}
      aiOverview={body}
      overviewRows={rowsFromOverview(data.overview)}
      middle={middle}
      middleIcon={Bus}
      galleryImages={galleryImages}
    />
  );
}
