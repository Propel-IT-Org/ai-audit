"use client";

import type { ReactNode } from "react";
import {
  APIProvider,
  Map as GMap,
  AdvancedMarker,
  InfoWindow,
  useMap,
  useMapsLibrary,
  type MapProps,
} from "@vis.gl/react-google-maps";

const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? "";
export const MAP_ID = process.env.NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID ?? "DEMO_MAP_ID";

/** Loads the Google Maps JS API. Wrap any tree that renders maps. */
export function MapProvider({ children }: { children: ReactNode }) {
  return <APIProvider apiKey={API_KEY}>{children}</APIProvider>;
}

/** Themed <Map> with the mapId AdvancedMarker requires. */
export function GoogleMap({
  children,
  ...props
}: MapProps & { children?: ReactNode }) {
  return (
    <GMap mapId={MAP_ID} gestureHandling="greedy" {...props}>
      {children}
    </GMap>
  );
}

/* ---- teardrop pins (replace the old Leaflet divIcons) ---- */

function PinShell({
  color,
  size = 30,
  children,
}: {
  color: string;
  size?: number;
  children?: ReactNode;
}) {
  return (
    <div
      style={{
        width: size,
        height: size,
        background: color,
        border: "2px solid #ffffff",
        borderRadius: "50% 50% 50% 0",
        transform: "rotate(-45deg)",
        boxShadow: "0 2px 6px rgba(0,0,0,0.35)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <span
        style={{
          transform: "rotate(45deg)",
          color: "#fff",
          fontWeight: 700,
          fontSize: Math.round(size * 0.4),
          lineHeight: 1,
        }}
      >
        {children}
      </span>
    </div>
  );
}

export function GemPin() {
  return <PinShell color="#C8A859">★</PinShell>;
}

export function PlacePin() {
  return <PinShell color="#223A70" />;
}

export function NumberedPin({ n }: { n: number }) {
  return (
    <PinShell color="#223A70" size={32}>
      {n}
    </PinShell>
  );
}

export function DotPin() {
  return <PinShell color="#9CA3AF" size={20} />;
}

export { AdvancedMarker, InfoWindow, useMap, useMapsLibrary };
