export interface ItineraryStop {
  id: string;
  slug: string;
  name: string;
  nameJp?: string | null;
  category?: string | null;
  area?: string | null;
  lat: number;
  lng: number;
  blurb: string;
  imageUrl?: string | null;
  hiddenGem: boolean;
  price?: string | null;
}

export interface ItineraryDay {
  dayNumber: number;
  title: string;
  area?: string | null;
  stops: ItineraryStop[];
}

export interface Itinerary {
  slug: string;
  destination: string;
  style?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  totalDays: number;
  days: ItineraryDay[];
  createdAt: string;
  meta?: { source: "claude" | "fallback" };
}

export interface PlanItineraryInput {
  destination: string;
  start?: string;
  end?: string;
  style?: string;
}
