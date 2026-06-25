import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { CategoryTable } from "@/components/categories/category-table";
import { Button } from "@/components/ui/button";

export default async function CategoriesPage() {
  const supabase = await createClient();
  const { data: categories, error } = await supabase
    .from("categories")
    .select("id, name, is_active")
    .eq("is_active", true)
    .order("name");

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-semibold text-slate-900">Categories</h1>
        <div className="flex gap-2">
          <Link href="/categories/archived">
            <Button variant="outline">Archived</Button>
          </Link>
          <Link href="/categories/new">
            <Button>Add category</Button>
          </Link>
        </div>
      </div>

      {error && (
        <p className="mt-4 rounded-md border border-danger/20 bg-danger/10 px-3 py-2 text-sm text-danger">
          Failed to load categories: {error.message}
        </p>
      )}

      <div className="mt-6">
        <CategoryTable categories={categories ?? []} />
      </div>
    </div>
  );
}