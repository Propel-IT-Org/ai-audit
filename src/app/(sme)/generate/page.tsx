import { Suspense } from "react";
import { GenerateClient } from "./GenerateClient";

export const metadata = { title: "Generate Storefront — AIVIBLE" };

export default function GeneratePage() {
  return (
    <Suspense>
      <GenerateClient />
    </Suspense>
  );
}
