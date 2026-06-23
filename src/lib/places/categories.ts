export type Category =
  | "restaurant"
  | "attraction"
  | "accommodation"
  | "onsen"
  | "experience"
  | "shopping"
  | "transport"
  | "service"
  | "event";

export interface CategoryMeta {
  label: string;
  verb: string;
  pin: string;
  icon: string;
  section: string;
}

export const CATEGORY_META: Record<Category, CategoryMeta> = {
  restaurant:    { label: "Restaurant",   verb: "Dine",   pin: "#B0512F", icon: "restaurant",    section: "Menu"           },
  attraction:    { label: "Attraction",   verb: "Visit",  pin: "#2B4C7E", icon: "attraction",    section: "What to see"    },
  accommodation: { label: "Stay",         verb: "Stay",   pin: "#6B4C9A", icon: "accommodation", section: "Rooms"          },
  onsen:         { label: "Onsen",        verb: "Soak",   pin: "#1F7A8C", icon: "onsen",         section: "Baths"          },
  experience:    { label: "Experience",   verb: "Try",    pin: "#C77D2E", icon: "experience",    section: "Things to do"   },
  shopping:      { label: "Shopping",     verb: "Shop",   pin: "#3F8F5B", icon: "shopping",      section: "What to buy"    },
  transport:     { label: "Transport",    verb: "Travel", pin: "#5B6675", icon: "transport",      section: "Getting around" },
  service:       { label: "Service",      verb: "Visit",  pin: "#8A93A0", icon: "service",       section: "Details"        },
  event:         { label: "Event",        verb: "Attend", pin: "#C0392B", icon: "event",         section: "Programme"      },
};

export const CATEGORIES: Category[] = [
  "restaurant",
  "attraction",
  "accommodation",
  "onsen",
  "experience",
  "shopping",
  "transport",
  "service",
  "event",
];

const LEGACY_MAP: Record<string, Category> = {
  cafe:  "restaurant",
  stay:  "accommodation",
  other: "service",
};

export function normalizeCategory(raw?: string | null): Category {
  if (!raw) return "restaurant";
  const lower = raw.trim().toLowerCase();
  if (lower in CATEGORY_META) return lower as Category;
  if (lower in LEGACY_MAP) return LEGACY_MAP[lower];
  return "restaurant";
}
