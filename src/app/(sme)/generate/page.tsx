import { Suspense } from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { GenerateClient } from "./GenerateClient";

export const metadata = { title: "Generate Storefront — AIVIBLE" };

export default async function GeneratePage({
  searchParams,
}: {
  searchParams: Promise<{ url?: string }>;
}) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    const { url } = await searchParams;
    const next = url ? `/generate?url=${encodeURIComponent(url)}` : "/generate";
    redirect(`/signin?next=${encodeURIComponent(next)}`);
  }

  return (
    <Suspense>
      <GenerateClient />
    </Suspense>
  );
}
