import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { CategoryForm } from "@/components/categories/category-form";

export default async function CategoryDetailPage({
  params,
}: {
  params: Promise<{ categoryId: string }>;
}) {
  const { categoryId } = await params;

  const supabase = await createClient();
  const { data: category } = await supabase
    .from("categories")
    .select("id, name, is_active")
    .eq("id", categoryId)
    .single();

  if (!category) {
    notFound();
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold text-slate-900">Edit category</h1>
      <div className="mt-6">
        <CategoryForm
          mode="edit"
          categoryId={category.id}
          initialValues={{ name: category.name, is_active: category.is_active }}
        />
      </div>
    </div>
  );
}