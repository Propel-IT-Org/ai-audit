"use client";

import { useState } from "react";
import Link from "next/link";
import {
  MapProvider,
  GoogleMap,
  GemPin,
  AdvancedMarker,
  InfoWindow,
} from "@/components/map/GoogleMap";
import type { Restaurant } from "@/lib/db/schema/restaurant";

const JAPAN_CENTER = { lat: 36.2, lng: 138.2 };

interface Props {
  restaurants: Restaurant[];
  language: string;
}

export default function MapView({ restaurants, language }: Props) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const active = restaurants.find((r) => r.id === activeId) ?? null;

  return (
    <MapProvider>
      <GoogleMap defaultCenter={JAPAN_CENTER} defaultZoom={5} style={{ width: "100%", height: "100%" }}>
        {restaurants.map((r) => (
          <AdvancedMarker
            key={r.id}
            position={{ lat: r.lat as number, lng: r.lng as number }}
            onClick={() => setActiveId(r.id)}
          >
            <GemPin />
          </AdvancedMarker>
        ))}

        {active && (
          <InfoWindow
            position={{ lat: active.lat as number, lng: active.lng as number }}
            onCloseClick={() => setActiveId(null)}
          >
            <div className="min-w-45">
              <p className="font-semibold">
                {language === "ja" ? active.nameJp || active.nameEn : active.nameEn}
              </p>
              {active.address && <p className="text-xs text-gray-500">{active.address}</p>}
              {active.aiOverview && (
                <p className="mt-1 line-clamp-3 text-xs text-gray-600">{active.aiOverview}</p>
              )}
              <div className="mt-2 flex flex-col gap-1">
                {(active.mdxUrl || active.mdxBody) && (
                  <Link
                    href={`/restaurants/${active.slug}`}
                    className="inline-block text-sm font-medium text-[#223A70] hover:underline"
                  >
                    View full page →
                  </Link>
                )}
                {active.websiteUrl && (
                  <a
                    href={active.websiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block text-xs text-gray-500 hover:underline"
                  >
                    Visit website ↗
                  </a>
                )}
              </div>
            </div>
          </InfoWindow>
        )}
      </GoogleMap>
    </MapProvider>
  );
}
