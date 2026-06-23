// ============================================================================
// place-types.ts — the authoritative data model for AIVIBLE place pages.
//
// Every place is a `Place`: a discriminated union keyed on `category`. Shared
// identity/location fields live on `BasePlace`; cross-cutting traveler info on
// `info`; each category adds its own `overview` (operational rows) and a content
// section (menu / highlights / rooms / features / options / sells / notes).
//
// The AI-overview *prose* is the compiled MDX body (rendered as `children`),
// not a field here.
//
// `Category` is imported from ./categories (the single source of truth — the
// map, explore list, admin dropdown and detail dispatcher all key off it).
// Fields the live MDX/DB may omit are optional so renderers can guard safely.
// ============================================================================

import type { Category } from "./categories";

export type { Category };

/* ----------------------------- building blocks ---------------------------- */

/** A single labelled row in a content section (menu item, pond, room, plan…). */
export type DetailItem = {
  en: string;
  ja?: string;
  desc?: string;
  price?: string | null;
  badge?: string;
};

/** A titled group of items (a menu category, a group of ponds, room types…). */
export type Section = { category: string; items: DetailItem[] };

/** The "AI pick / Don't miss" box. */
export type Picks = { lead?: string; note?: string; items?: string[] };

/** A gallery tile: a real photo (`src`) or an icon placeholder. */
export type GalleryItem = {
  label?: string;
  icon?: string; // sprite id when no photo (e.g. "store", "bowl", "water")
  src?: string; // image URL — preferred
  alt?: string;
};

/** Optional outbound booking / official links. */
export type LinkRef = { label: string; url: string };

/** Cross-cutting traveler metadata — the tourist-specific differentiators. */
export type TravelerInfo = {
  englishSupport?: string;
  payment?: string;
  cash?: boolean;
  card?: boolean;
  icPayment?: boolean;
  taxFree?: boolean;
  tattooPolicy?: string;
  dietary?: {
    halal?: string;
    vegetarian?: string;
    vegan?: string;
    allergens?: string;
  };
  wifi?: boolean;
  kidFriendly?: boolean;
  accessibility?: string;
  bestTime?: string;
};

/* --------------------------------- base ----------------------------------- */

/** Fields shared by every place, regardless of category. */
export type BasePlace = {
  slug?: string;
  category?: Category | string; // discriminator (selects schema + renderer + pin)
  subtype?: string;
  name?: string;
  nameJa?: string;
  reading?: string;
  area?: string;

  rating?: number;
  reviewCount?: number;
  tags?: string[];
  /** Legacy alias for `tags` used by existing restaurant MDX. */
  cuisineTags?: string[];
  flags?: string[];

  lat?: number;
  lng?: number;
  phone?: string;
  website?: string;
  addressEn?: string;
  addressJa?: string;

  goodToKnow?: string[];
  gallery?: GalleryItem[];
  nearby?: string[]; // slugs of related places (cross-category linking)
  info?: TravelerInfo;
};

/* ------------------------------ categories -------------------------------- */

/** 1) RESTAURANT — eat & drink. */
export type RestaurantPlace = BasePlace & {
  category: "restaurant";
  overview?: {
    hours?: string;
    priceRange?: string;
    payment?: string;
    seating?: string;
    english?: string;
    reservations?: string;
    families?: string;
    halal?: string;
    gettingThere?: string;
  };
  picks?: Picks;
  menu?: Section[];
  menuNote?: string;
  priceRecorded?: string;
};

/** 2) ATTRACTION — see. */
export type AttractionPlace = BasePlace & {
  category: "attraction";
  overview?: {
    openingHours?: string;
    admission?: string;
    duration?: string;
    bestTime?: string;
    english?: string;
    accessibility?: string;
    facilities?: string;
    gettingThere?: string;
    suitability?: string;
  };
  dontMiss?: Picks;
  highlights?: Section[];
  tips?: string[];
};

/** 3) ACCOMMODATION — sleep. */
export type AccommodationPlace = BasePlace & {
  category: "accommodation";
  overview?: {
    checkIn?: string;
    checkOut?: string;
    priceRange?: string;
    payment?: string;
    english?: string;
    mealsIncluded?: string;
    onsen?: string;
    reservations?: string;
    accessibility?: string;
    gettingThere?: string;
  };
  rooms?: Section[];
  amenities?: string[];
  picks?: Picks;
  bookingLinks?: LinkRef[];
};

/** 4) ONSEN — bathe. */
export type OnsenPlace = BasePlace & {
  category: "onsen";
  overview?: {
    hours?: string;
    admission?: string;
    bathTypes?: string;
    waterType?: string;
    tattooPolicy?: string;
    privateBath?: string;
    gender?: string;
    towels?: string;
    dayUseOrStay?: string;
    english?: string;
    gettingThere?: string;
  };
  features?: Section[];
  dontMiss?: Picks;
  tips?: string[];
};

/** 5) EXPERIENCE / ACTIVITY — do. */
export type ExperiencePlace = BasePlace & {
  category: "experience";
  overview?: {
    pricePerPerson?: string;
    duration?: string;
    schedule?: string;
    bookingRequired?: string;
    languages?: string;
    included?: string;
    suitability?: string;
    english?: string;
    gettingThere?: string;
  };
  options?: Section[];
  dontMiss?: Picks;
  tips?: string[];
  bookingLinks?: LinkRef[];
};

/** 6) SHOPPING — buy. */
export type ShoppingPlace = BasePlace & {
  category: "shopping";
  overview?: {
    hours?: string;
    payment?: string;
    taxFree?: string;
    priceRange?: string;
    english?: string;
    gettingThere?: string;
  };
  sells?: Section[];
  specialties?: string[];
  picks?: Picks;
  priceRecorded?: string;
};

/** 7) TRANSPORT — get around. */
export type TransportPlace = BasePlace & {
  category: "transport";
  overview?: {
    kind?: string;
    lines?: string;
    hours?: string;
    ticketing?: string;
    english?: string;
    gettingThere?: string;
  };
  notes?: string[];
};

/** 8) SERVICE & ESSENTIALS — survive. */
export type ServicePlace = BasePlace & {
  category: "service";
  overview?: {
    hours?: string;
    cost?: string;
    english?: string;
    details?: string;
    gettingThere?: string;
  };
  notes?: string[];
};

/** 9) EVENT / SEASONAL — when. */
export type EventPlace = BasePlace & {
  category: "event";
  overview?: {
    dates?: string;
    recurring?: string;
    time?: string;
    admission?: string;
    venue?: string;
    english?: string;
    gettingThere?: string;
  };
  highlights?: Section[];
  dontMiss?: Picks;
  tips?: string[];
};

/* -------------------------------- the union ------------------------------- */

export type Place =
  | RestaurantPlace
  | AttractionPlace
  | AccommodationPlace
  | OnsenPlace
  | ExperiencePlace
  | ShoppingPlace
  | TransportPlace
  | ServicePlace
  | EventPlace;

/** DB row fields used when the MDX frontmatter is missing identity/location. */
export interface DetailFallback {
  name: string;
  nameJp?: string | null;
  lat?: number | null;
  lng?: number | null;
  address?: string | null;
  website?: string | null;
}

/* ------------------------------ type guards ------------------------------- */

export const isRestaurant = (p: Place): p is RestaurantPlace => p.category === "restaurant";
export const isAttraction = (p: Place): p is AttractionPlace => p.category === "attraction";
export const isAccommodation = (p: Place): p is AccommodationPlace => p.category === "accommodation";
export const isOnsen = (p: Place): p is OnsenPlace => p.category === "onsen";
export const isExperience = (p: Place): p is ExperiencePlace => p.category === "experience";
export const isShopping = (p: Place): p is ShoppingPlace => p.category === "shopping";
export const isTransport = (p: Place): p is TransportPlace => p.category === "transport";
export const isService = (p: Place): p is ServicePlace => p.category === "service";
export const isEvent = (p: Place): p is EventPlace => p.category === "event";
