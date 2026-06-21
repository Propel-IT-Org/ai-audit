import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { AdminForm } from "../AdminForm";

export const metadata = { title: "Add Restaurant — Admin" };

export default async function AdminNewPage() {
  return (
    <div className="container mx-auto max-w-2xl px-4 py-10">
      <Link
        href="/admin"
        className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> All restaurants
      </Link>
      <h1 className="mb-2 text-2xl font-bold text-foreground">
        Add Restaurant
      </h1>
      <p className="mb-8 text-sm text-muted-foreground">
        Upload an MDX file to auto-fill the fields, or fill them manually.
      </p>
      <AdminForm mode="create" />
    </div>
  );
}
