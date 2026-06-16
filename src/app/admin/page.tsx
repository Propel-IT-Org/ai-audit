import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { AdminForm } from "./AdminForm";

export const metadata = { title: "Admin — Restaurant Pins" };

export default async function AdminPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session || session.user.role !== "admin") {
    redirect("/");
  }

  return (
    <div className="container mx-auto max-w-2xl px-4 py-10">
      <h1 className="text-2xl font-bold text-foreground mb-2">Admin Panel</h1>
      <p className="text-muted-foreground mb-8 text-sm">
        Add or update a restaurant pin. Provide MDX content for the full detail page.
      </p>
      <AdminForm />
    </div>
  );
}
