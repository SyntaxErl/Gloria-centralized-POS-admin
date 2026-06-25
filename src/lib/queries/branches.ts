"use server";

// Query/RPC functions for branches — see API_CONTRACT.md for which calls
// are direct vs RPC. branches is a "Direct" access table per the
// contract — these Server Actions just run normal RLS-governed writes
// through the regular cookie-based server client, no admin/service-role
// client needed. RLS (003_rls_policies.sql) already restricts writes to
// is_admin() — these actions don't duplicate that check, they just
// surface a clean error if it fails.
//
// archiveBranch/restoreBranch toggle is_active rather than touching the
// row itself — the default, reversible path. deleteBranch is the real
// hard delete, meant to only be reachable from the archive view, behind
// its own confirmation modal in the UI.

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { branchSchema, type BranchInput } from "@/lib/validations/branch";

type ActionResult = { success: true } | { success: false; error: string };

export async function createBranch(input: BranchInput): Promise<ActionResult> {
  const parsed = branchSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues.map((i) => i.message).join(", "),
    };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("branches").insert(parsed.data);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/branches");
  return { success: true };
}

export async function updateBranch(
  id: string,
  input: BranchInput
): Promise<ActionResult> {
  const parsed = branchSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues.map((i) => i.message).join(", "),
    };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("branches")
    .update(parsed.data)
    .eq("id", id);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/branches");
  revalidatePath("/branches/archived");
  revalidatePath(`/branches/${id}`);
  return { success: true };
}

export async function archiveBranch(id: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("branches")
    .update({ is_active: false })
    .eq("id", id);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/branches");
  revalidatePath("/branches/archived");
  return { success: true };
}

export async function restoreBranch(id: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("branches")
    .update({ is_active: true })
    .eq("id", id);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/branches");
  revalidatePath("/branches/archived");
  return { success: true };
}

export async function deleteBranch(id: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase.from("branches").delete().eq("id", id);

  if (error) {
    // Postgres 23503 = foreign_key_violation — this branch still has
    // users/sales/branch_inventory/etc. pointing at it. None of those
    // FKs have ON DELETE CASCADE (only admin_notifications does), so
    // this is the expected, safe failure mode rather than a bug.
    if (error.code === "23503") {
      return {
        success: false,
        error:
          "Can't delete this branch — it still has staff, inventory, or sales linked to it. Those need to be removed or reassigned first.",
      };
    }
    return { success: false, error: error.message };
  }

  revalidatePath("/branches/archived");
  return { success: true };
}