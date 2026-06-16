import type { SVGProps } from "react";

export interface IconProps extends Omit<SVGProps<SVGSVGElement>, "width" | "height"> {
  size?: number;
}

function Svg({ size = 24, children, ...rest }: IconProps & { children: React.ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden={rest["aria-label"] ? undefined : "true"}
      style={{ display: "inline-block", flex: "none", verticalAlign: "middle" }}
      {...rest}
    >
      {children}
    </svg>
  );
}

export function HomeIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path
        fill="currentColor"
        fillRule="evenodd"
        d="M12 3.4 L21.6 11.2 L20 11.2 L20 19.8 Q20 20.5 19.3 20.5 L4.7 20.5 Q4 20.5 4 19.8 L4 11.2 L2.4 11.2 Z M10.1 20.5 L10.1 15.2 Q10.1 14.6 10.7 14.6 L13.3 14.6 Q13.9 14.6 13.9 15.2 L13.9 20.5 Z"
      />
    </Svg>
  );
}

export function CompassIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <circle cx="12" cy="12" r="8.6" fill="none" stroke="currentColor" strokeWidth="2.1" />
      <path d="M15.5 8.5 L13.27 13.27 L10.73 10.73 Z" fill="#D6452C" />
      <path d="M8.5 15.5 L13.27 13.27 L10.73 10.73 Z" fill="currentColor" />
      <circle cx="12" cy="12" r="1" fill="currentColor" />
    </Svg>
  );
}

export function ItineraryMapIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <rect x="3.2" y="5.2" width="17.6" height="13.6" rx="2" fill="none" stroke="currentColor" strokeWidth="1.9" />
      <path d="M9 5.2 V18.8 M15 5.2 V18.8" stroke="currentColor" strokeWidth="1.3" opacity="0.55" />
      <path
        d="M5.6 16 Q9 16 9.6 12.4 Q10.2 9 14 9.2"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeDasharray="0.2 2.2"
      />
      <path
        d="M16.4 6.2 C18 6.2 18.9 7.4 18.9 8.6 C18.9 10 16.4 12 16.4 12 C16.4 12 13.9 10 13.9 8.6 C13.9 7.4 14.8 6.2 16.4 6.2 Z"
        fill="currentColor"
      />
      <circle cx="16.4" cy="8.6" r="0.95" fill="#fff" />
    </Svg>
  );
}

export function GemIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M8.5 6 L15.5 6 L20.5 10 L12 19 L3.5 10 Z" fill="#C8A859" />
      <path d="M8.5 6 L15.5 6 L20.5 10 L3.5 10 Z" fill="#D8BE78" />
      <path
        d="M3.5 10 H20.5 M12 10 V19 M8.5 6 L12 10 L15.5 6 M8.5 6 L8 10 M15.5 6 L16 10 M8 10 L12 19 M16 10 L12 19"
        stroke="#A8884A"
        strokeWidth="0.8"
        fill="none"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </Svg>
  );
}

export function BrushIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <g transform="rotate(45 12 12)">
        <rect x="10.75" y="2.8" width="2.5" height="7.6" rx="1.25" fill="currentColor" />
        <rect x="10.2" y="9.9" width="3.6" height="1.6" rx="0.5" fill="currentColor" opacity="0.6" />
        <path d="M10.2 11.3 Q12 10.9 13.8 11.3 L12 18.7 Z" fill="currentColor" />
      </g>
      <path d="M5.3 17.8 Q7.6 19.2 10 18.2" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" opacity="0.7" />
    </Svg>
  );
}

export function TravelerMapIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <rect x="3.2" y="5.2" width="17.6" height="13.6" rx="2" fill="none" stroke="#223A70" strokeWidth="1.9" />
      <path d="M9 5.2 V18.8 M15 5.2 V18.8" stroke="#223A70" strokeWidth="1.3" opacity="0.45" />
      <path
        d="M5.6 16 Q9 16 9.6 12.4 Q10.2 9.4 13.4 9.2"
        fill="none"
        stroke="#223A70"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeDasharray="0.2 2.2"
      />
      <path
        d="M16.4 5.4 C18.1 5.4 19.1 6.7 19.1 8 C19.1 9.5 16.4 11.8 16.4 11.8 C16.4 11.8 13.7 9.5 13.7 8 C13.7 6.7 14.7 5.4 16.4 5.4 Z"
        fill="#C8A859"
      />
      <path d="M16.4 6.7 L17.5 8 L16.4 9.3 L15.3 8 Z" fill="#fff" opacity="0.85" />
    </Svg>
  );
}

export function NorenIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M3.5 6 L20.5 6 L18 2.8 L6 2.8 Z" fill="#18243F" />
      <rect x="3" y="5.9" width="18" height="1.7" rx="0.6" fill="#18243F" />
      <rect x="4" y="7.6" width="4.7" height="10.6" rx="0.8" fill="#1F4788" />
      <rect x="9.65" y="7.6" width="4.7" height="10.6" rx="0.8" fill="#1F4788" />
      <rect x="15.3" y="7.6" width="4.7" height="10.6" rx="0.8" fill="#1F4788" />
      <circle cx="12" cy="12.2" r="1.7" fill="#F5EEDC" />
    </Svg>
  );
}

export function RestaurantIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path
        d="M9 4.5 q1.3 1.4 0 2.8 q-1.3 1.4 0 2.8 M13 4.5 q1.3 1.4 0 2.8 q-1.3 1.4 0 2.8"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        opacity="0.65"
      />
      <path d="M3.6 12.4 H20.4 A8.4 8.4 0 0 1 3.6 12.4 Z" fill="currentColor" />
      <rect x="2.6" y="11.2" width="18.8" height="1.9" rx="0.95" fill="currentColor" />
      <path d="M15 4 L21.4 9.4 M16.7 3.4 L21.8 7.8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </Svg>
  );
}

export function CafeIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path
        d="M9.5 3.6 q1.2 1.3 0 2.6 q-1.2 1.3 0 2.6 M13.5 3.6 q1.2 1.3 0 2.6 q-1.2 1.3 0 2.6"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
        opacity="0.6"
      />
      <path d="M6.4 10.4 H16.6 V13 A5.1 5.1 0 0 1 6.4 13 Z" fill="currentColor" />
      <path d="M16.6 11 a2.6 2.6 0 0 1 0 4" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <rect x="5.2" y="17.3" width="13" height="1.7" rx="0.85" fill="currentColor" />
    </Svg>
  );
}

export function StayIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path
        d="M7.5 11.5 q1.4 -1.6 0 -3.2 q-1.4 -1.6 0 -3.2 M12 11.5 q1.4 -1.6 0 -3.2 q-1.4 -1.6 0 -3.2 M16.5 11.5 q1.4 -1.6 0 -3.2 q-1.4 -1.6 0 -3.2"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <path d="M3.8 14.6 H20.2 V16.4 A3.2 3.2 0 0 1 17 19.6 H7 A3.2 3.2 0 0 1 3.8 16.4 Z" fill="currentColor" />
    </Svg>
  );
}

export function ExperienceIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M3.2 5.6 Q12 4 20.8 5.6 L20.8 7.6 Q12 6 3.2 7.6 Z" fill="currentColor" />
      <rect x="5" y="9.4" width="14" height="1.9" rx="0.5" fill="currentColor" />
      <rect x="6.1" y="7" width="2.4" height="13" rx="0.4" fill="currentColor" />
      <rect x="15.5" y="7" width="2.4" height="13" rx="0.4" fill="currentColor" />
    </Svg>
  );
}

export function PinIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path
        d="M12 2.6 C7.9 2.6 5 5.6 5 9.4 C5 14.4 12 21.4 12 21.4 C12 21.4 19 14.4 19 9.4 C19 5.6 16.1 2.6 12 2.6 Z"
        fill="currentColor"
      />
      <circle cx="12" cy="9.3" r="2.5" fill="#fff" />
    </Svg>
  );
}

const CATEGORY_ICONS: Record<string, (p: IconProps) => React.JSX.Element> = {
  restaurant: RestaurantIcon,
  cafe: CafeIcon,
  stay: StayIcon,
  experience: ExperienceIcon,
};

export function CategoryIcon({ category, ...props }: IconProps & { category?: string | null }) {
  const Icon = (category && CATEGORY_ICONS[category.trim().toLowerCase()]) || PinIcon;
  return <Icon {...props} />;
}
