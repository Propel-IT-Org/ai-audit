import { listStorefrontSummaries } from "@/lib/sites/queries";
import { BusinessClient } from "./BusinessClient";

export const metadata = { title: "AI Audit — AIVIBLE" };

export default async function BusinessPage() {
  const storefronts = await listStorefrontSummaries(3);
  return <BusinessClient storefronts={storefronts} />;
}
