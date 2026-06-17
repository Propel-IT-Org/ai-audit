"use client";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { numberedPinIcon } from "@/components/map/markers";

export default function RestaurantMiniMap({
  lat,
  lng,
  label,
}: {
  lat: number;
  lng: number;
  label: string;
}) {
  return (
    <MapContainer
      center={[lat, lng]}
      zoom={16}
      scrollWheelZoom={false}
      style={{ height: "240px", width: "100%" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker position={[lat, lng]} icon={numberedPinIcon(1)}>
        <Popup>{label}</Popup>
      </Marker>
    </MapContainer>
  );
}
