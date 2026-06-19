import { notFound, redirect } from "next/navigation";
import { headers } from "next/headers";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { auth } from "@/lib/auth";
import { getRestaurantById } from "@/lib/restaurants/queries";
import { AdminForm } from "../../AdminForm";

export const metadata = { title: "Edit Restaurant — Admin" };

export default async function AdminEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || session.user.role !== "admin") redirect("/");

  const restaurant = await getRestaurantById(id);
  if (!restaurant) notFound();

  return (
    <div className="container mx-auto max-w-2xl px-4 py-10">
      <Link
        href="/admin"
        className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> All restaurants
      </Link>
      <h1 className="mb-2 text-2xl font-bold text-foreground">Edit: {restaurant.nameEn}</h1>
      <p className="mb-8 text-sm text-muted-foreground">
        Upload a new MDX file to replace content, or edit fields directly.
      </p>
      <AdminForm initial={restaurant} mode="edit" />
    </div>
  );
}
