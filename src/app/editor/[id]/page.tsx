import { notFound, redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { readPublishedSite } from "@/lib/sites/storage";
import { EditorClient } from "./EditorClient";

export const metadata = { title: "Storefront Editor — AIVIBLE" };

export default async function EditorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/");

  const site = await readPublishedSite(id);
  if (!site) notFound();

  return <EditorClient subdomain={id} name={site.data.name} />;
}
