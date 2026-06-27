"use server";

// Query/RPC functions for categories — see API_CONTRACT.md. categories
// is "Direct" access, admin-write-only, archive-only (no real DELETE
// policy exists at all per 003_rls_policies.sql) — so unlike branches,
// there is deliberately no deleteCategory() here. Archiving is the final
// word; there's no further "permanently delete" step to build.

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { categorySchema, type CategoryInput } from "@/lib/validations/category";

type ActionResult = { success: true } | { success: false; error: string };

export async function createCategory(input: CategoryInput): Promise<ActionResult> {
  const parsed = categorySchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues.map((i) => i.message).join(", ") };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("categories").insert(parsed.data);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/categories");
  return { success: true };
}

export async function updateCategory(
  id: string,
  input: CategoryInput
): Promise<ActionResult> {
  const parsed = categorySchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues.map((i) => i.message).join(", ") };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("categories").update(parsed.data).eq("id", id);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/categories");
  revalidatePath("/categories/archived");
  revalidatePath(`/categories/${id}`);
  return { success: true };
}

export async function archiveCategory(id: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("categories")
    .update({ is_active: false })
    .eq("id", id);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/categories");
  revalidatePath("/categories/archived");
  return { success: true };
}

export async function restoreCategory(id: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("categories")
    .update({ is_active: true })
    .eq("id", id);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/categories");
  revalidatePath("/categories/archived");
  return { success: true };
}