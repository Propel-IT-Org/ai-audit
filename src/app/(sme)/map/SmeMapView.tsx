"use client";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import Link from "next/link";
import { gemPinIcon } from "@/components/map/markers";
import type { Restaurant } from "@/lib/db/schema/restaurant";

const JAPAN_CENTER: [number, number] = [36.2, 138.2];
const JAPAN_ZOOM = 5;

export default function SmeMapView({ restaurants }: { restaurants: Restaurant[] }) {
  return (
    <MapContainer
      center={JAPAN_CENTER}
      zoom={JAPAN_ZOOM}
      style={{ height: "100%", width: "100%" }}
      scrollWheelZoom
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
      />
      {restaurants.map((r) => (
        <Marker key={r.id} position={[r.lat as number, r.lng as number]} icon={gemPinIcon()}>
          <Popup>
            <div className="min-w-[180px]">
              <p className="font-semibold">{r.nameEn}</p>
              {r.address && <p className="text-xs text-gray-500">{r.address}</p>}
              {r.aiOverview && (
                <p className="mt-1 text-xs text-gray-600 line-clamp-3">{r.aiOverview}</p>
              )}
              <div className="mt-2 flex flex-col gap-1">
                {(r.mdxUrl || r.mdxBody) && (
                  <Link
                    href={`/restaurants/${r.slug}`}
                    className="inline-block text-sm font-medium text-[#223A70] hover:underline"
                  >
                    View full page →
                  </Link>
                )}
                {r.websiteUrl && (
                  <a
                    href={r.websiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block text-xs text-gray-500 hover:underline"
                  >
                    Visit website ↗
                  </a>
                )}
              </div>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
