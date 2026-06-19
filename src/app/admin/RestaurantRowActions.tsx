"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { deleteRestaurantAction } from "@/lib/restaurants/admin-actions";

export function RestaurantRowActions({ id, slug }: { id: string; slug: string }) {
  const router = useRouter();

  const handleDelete = async () => {
    if (!confirm(`Delete "${slug}"? This also removes the MDX file.`)) return;
    const res = await deleteRestaurantAction(id);
    if (res.ok) {
      toast.success("Restaurant deleted");
      router.refresh();
    } else {
      toast.error(res.error);
    }
  };

  return (
    <div className="flex items-center justify-end gap-3">
      <Link
        href={`/admin/${id}/edit`}
        className="text-[#223A70] hover:underline"
      >
        Edit
      </Link>
      <button
        type="button"
        onClick={handleDelete}
        className="text-destructive hover:underline"
      >
        Delete
      </button>
    </div>
  );
}
