"use client";

import Link, { type LinkProps } from "next/link";
import { usePathname } from "next/navigation";
import {
  HomeIcon,
  CompassIcon,
  ItineraryMapIcon,
  GemIcon,
  BrushIcon,
  type IconProps,
} from "@/components/icons";

const ITINERARY_HREF = "/plan";

type IconComponent = (props: IconProps) => React.JSX.Element;

export function BottomNav() {
  const pathname = usePathname();

  const isActive = (href: string, exact = false) =>
    exact
      ? pathname === href
      : pathname === href || pathname.startsWith(href + "/");

  function sideTab<Href>(
    href: LinkProps<Href>["href"],
    Icon: IconComponent,
    label: string,
    active: boolean,
  ) {
    return (
      <Link
        href={href}
        aria-current={active ? "page" : undefined}
        className={`flex flex-1 flex-col items-center justify-end gap-0.5 py-1 transition-colors ${
          active ? "text-[#223A70]" : "text-gray-400 hover:text-gray-700"
        }`}
      >
        <Icon size={22} />
        <span
          className={`text-[10px] ${active ? "font-semibold" : "font-medium"}`}
        >
          {label}
        </span>
      </Link>
    );
  }

  return (
    <nav
      aria-label="Primary"
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-gray-100 bg-white/95 shadow-[0_-1px_4px_rgba(0,0,0,0.05)] backdrop-blur-sm"
    >
      <div className="mx-auto flex w-full max-w-md items-end justify-around px-2 pb-2 pt-1.5">
        {sideTab("/", HomeIcon, "Home", isActive("/", true))}
        {sideTab("/explore", CompassIcon, "Explore", isActive("/explore"))}

        <Link
          href={ITINERARY_HREF}
          aria-current={isActive("/itinerary") ? "page" : undefined}
          className="group flex flex-1 flex-col items-center gap-1"
        >
          <span className="flex h-12 w-12 -mt-5 items-center justify-center rounded-full bg-[#223A70] text-white shadow-lg ring-4 ring-white transition group-hover:brightness-110">
            <ItineraryMapIcon size={24} />
          </span>
          <span className="text-[10px] font-bold text-[#223A70]">
            Itinerary
          </span>
        </Link>

        {sideTab("/discover", GemIcon, "Discover", isActive("/discover"))}
        {sideTab("/plan", BrushIcon, "Plan", isActive("/plan"))}
      </div>
    </nav>
  );
}
