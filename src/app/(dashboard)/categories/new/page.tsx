import { CategoryForm } from "@/components/categories/category-form";

export default function NewCategoryPage() {
  return (
    <div>
      <h1 className="text-2xl font-semibold text-slate-900">Add category</h1>
      <div className="mt-6">
        <CategoryForm mode="create" />
      </div>
    </div>
  );
}