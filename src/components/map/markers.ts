import L from "leaflet";

const GOLD = "#C8A859";
const NAVY = "#223A70";
const GREY = "#9CA3AF";

function teardrop(opts: {
  className: string;
  color: string;
  size: number;
  content?: string;
}): L.DivIcon {
  const { className, color, size, content = "" } = opts;
  const half = size / 2;
  const html = `
    <div class="aivible-pin" style="position:relative;width:${size}px;height:${size}px;">
      <div style="
        position:absolute;
        left:0;top:0;
        width:${size}px;height:${size}px;
        background:${color};
        border:2px solid #ffffff;
        border-radius:50% 50% 50% 0;
        transform:rotate(-45deg);
        box-shadow:0 2px 6px rgba(0,0,0,0.35);
      "></div>
      <div style="
        position:absolute;
        left:0;top:0;
        width:${size}px;height:${size}px;
        display:flex;align-items:center;justify-content:center;
        color:#ffffff;font-weight:700;font-size:${Math.round(size * 0.4)}px;
        line-height:1;
      ">${content}</div>
    </div>`;
  return L.divIcon({
    html,
    className,
    iconSize: [size, size],
    iconAnchor: [half, size],
    popupAnchor: [0, -size],
  });
}

export function gemPinIcon(): L.DivIcon {
  return teardrop({ className: "gem-pin", color: GOLD, size: 30, content: "★" });
}

export function numberedPinIcon(n: number): L.DivIcon {
  return teardrop({ className: "numbered-pin", color: NAVY, size: 32, content: String(n) });
}

export function osmPinIcon(): L.DivIcon {
  return teardrop({ className: "osm-pin", color: GREY, size: 22 });
}
