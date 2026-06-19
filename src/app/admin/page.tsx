import { redirect } from "next/navigation";
import { headers } from "next/headers";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { listRestaurants } from "@/lib/restaurants/queries";
import { RestaurantRowActions } from "./RestaurantRowActions";

export const metadata = { title: "Admin Dashboard — Restaurants" };

export default async function AdminPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || session.user.role !== "admin") redirect("/");

  const restaurants = await listRestaurants({ limit: 500 });

  return (
    <div className="container mx-auto max-w-5xl px-4 py-10">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Restaurants</h1>
          <p className="text-sm text-muted-foreground">{restaurants.length} total</p>
        </div>
        <Link
          href="/admin/new"
          className="inline-flex items-center gap-1.5 rounded-md bg-[#223A70] px-4 py-2 text-sm font-medium text-white hover:bg-[#1a2e5a] transition-colors"
        >
          + Add restaurant
        </Link>
      </div>

      {restaurants.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border py-16 text-center text-muted-foreground">
          No restaurants yet. Add one above.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-muted/40">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-foreground">Name</th>
                <th className="px-4 py-3 text-left font-medium text-foreground">JP</th>
                <th className="px-4 py-3 text-left font-medium text-foreground">Category</th>
                <th className="px-4 py-3 text-left font-medium text-foreground">Prefecture</th>
                <th className="px-4 py-3 text-center font-medium text-foreground">Gem</th>
                <th className="px-4 py-3 text-center font-medium text-foreground">MDX</th>
                <th className="px-4 py-3 text-center font-medium text-foreground">Geo</th>
                <th className="px-4 py-3 text-right font-medium text-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {restaurants.map((r) => (
                <tr key={r.id} className="hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-3 font-medium text-foreground max-w-[160px] truncate">{r.nameEn}</td>
                  <td className="px-4 py-3 text-muted-foreground max-w-[120px] truncate">{r.nameJp ?? "—"}</td>
                  <td className="px-4 py-3 text-muted-foreground capitalize">{r.category ?? "—"}</td>
                  <td className="px-4 py-3 text-muted-foreground">{r.prefecture ?? "—"}</td>
                  <td className="px-4 py-3 text-center">{r.hiddenGem ? "★" : "—"}</td>
                  <td className="px-4 py-3 text-center">{r.mdxUrl || r.mdxBody ? "✓" : "—"}</td>
                  <td className="px-4 py-3 text-center">{r.lat != null && r.lng != null ? "✓" : "—"}</td>
                  <td className="px-4 py-3 text-right">
                    <RestaurantRowActions id={r.id} slug={r.slug} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
