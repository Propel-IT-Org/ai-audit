"use client";

import { MapProvider, GoogleMap, NumberedPin, AdvancedMarker } from "@/components/map/GoogleMap";

export default function RestaurantMiniMap({
  lat,
  lng,
}: {
  lat: number;
  lng: number;
  label?: string;
}) {
  return (
    <MapProvider>
      <GoogleMap
        defaultCenter={{ lat, lng }}
        defaultZoom={16}
        style={{ width: "100%", height: "240px" }}
        disableDefaultUI
      >
        <AdvancedMarker position={{ lat, lng }}>
          <NumberedPin n={1} />
        </AdvancedMarker>
      </GoogleMap>
    </MapProvider>
  );
}
