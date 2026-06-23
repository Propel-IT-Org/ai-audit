import type { ReactNode } from "react";
import { normalizeCategory } from "@/lib/places/categories";
import type {
  AccommodationPlace,
  AttractionPlace,
  DetailFallback,
  EventPlace,
  ExperiencePlace,
  OnsenPlace,
  Place,
  RestaurantPlace,
  ServicePlace,
  ShoppingPlace,
  TransportPlace,
} from "@/lib/places/place-types";
import RestaurantPage from "./RestaurantPage";
import AttractionPage from "./AttractionPage";
import AccommodationPage from "./AccommodationPage";
import OnsenPage from "./OnsenPage";
import ExperiencePage from "./ExperiencePage";
import ShoppingPage from "./ShoppingPage";
import TransportPage from "./TransportPage";
import ServicePage from "./ServicePage";
import EventPage from "./EventPage";

/**
 * Dispatches a place to its category-specific renderer. `data` is the parsed
 * MDX frontmatter (cast to the right shape per case); `body` is the compiled
 * AI-overview prose; `fallback` supplies identity/location from the DB row.
 */
export function PlaceDetail({
  data,
  body,
  fallback,
  galleryImages,
}: {
  data: Place;
  body: ReactNode;
  fallback: DetailFallback;
  galleryImages?: string[];
}) {
  const shared = { body, fallback, galleryImages };

  switch (normalizeCategory(data.category)) {
    case "attraction":
      return <AttractionPage data={data as AttractionPlace} {...shared} />;
    case "accommodation":
      return <AccommodationPage data={data as AccommodationPlace} {...shared} />;
    case "onsen":
      return <OnsenPage data={data as OnsenPlace} {...shared} />;
    case "experience":
      return <ExperiencePage data={data as ExperiencePlace} {...shared} />;
    case "shopping":
      return <ShoppingPage data={data as ShoppingPlace} {...shared} />;
    case "transport":
      return <TransportPage data={data as TransportPlace} {...shared} />;
    case "service":
      return <ServicePage data={data as ServicePlace} {...shared} />;
    case "event":
      return <EventPage data={data as EventPlace} {...shared} />;
    case "restaurant":
    default:
      return <RestaurantPage data={data as RestaurantPlace} {...shared} />;
  }
}
