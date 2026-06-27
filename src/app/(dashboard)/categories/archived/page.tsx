import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { CategoryArchiveTable } from "@/components/categories/category-archive-table";
import { Button } from "@/components/ui/button";

export default async function ArchivedCategoriesPage() {
  const supabase = await createClient();
  const { data: categories, error } = await supabase
    .from("categories")
    .select("id, name, is_active")
    .eq("is_active", false)
    .order("name");

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">
            Archived Categories
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Restore a category to make it active again.
          </p>
        </div>
        <Link href="/categories">
          <Button variant="outline">Back to active categories</Button>
        </Link>
      </div>

      {error && (
        <p className="mt-4 rounded-md border border-danger/20 bg-danger/10 px-3 py-2 text-sm text-danger">
          Failed to load archived categories: {error.message}
        </p>
      )}

      <div className="mt-6">
        <CategoryArchiveTable categories={categories ?? []} />
      </div>
    </div>
  );
}