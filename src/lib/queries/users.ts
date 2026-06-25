"use server";

// Query/RPC functions for users — see API_CONTRACT.md for which calls are
// direct vs RPC. createStaffUser() below is the "RPC for creation" the
// contract describes, implemented as a Next.js Server Action using the
// Supabase Admin API rather than a Postgres function (see conversation
// for why: avoids hand-rolling auth.users password hashing in SQL).

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  createStaffUserSchema,
  type CreateStaffUserInput,
} from "@/lib/validations/user";

type CreateStaffUserResult =
  | { success: true; userId: string }
  | { success: false; error: string };

/**
 * Creates a staff account (auth.users + public.users) atomically from the
 * caller's point of view — if the public.users insert fails after the
 * auth user was created, the auth user is rolled back so you never end
 * up with an orphaned login that has no role/branch attached to it.
 *
 * Authorization (re-derived server-side from the caller's own session,
 * never trusted from the client — same principle as the contract's
 * reporting RPCs):
 *   - admin: can create any role, any branch. role 'admin' forces
 *     branch_id to null regardless of what was passed in.
 *   - branch_manager: can only create role 'cashier', and branch_id is
 *     forced to the manager's own branch_id — whatever branch_id the
 *     client sent is ignored.
 *   - cashier / no session: denied outright.
 *
 * On success, also writes an admin_notifications row when the new
 * account is a branch_manager or cashier (not for newly created admins).
 * This has to happen here rather than via a DB trigger on public.users:
 * the insert below runs through the service-role admin client, which has
 * no auth.uid() (service role bypasses auth entirely, there's no real
 * session) — a trigger would have no reliable way to know who actually
 * triggered the creation. This function already has that caller id in
 * scope, so it writes the notification directly instead.
 */
export async function createStaffUser(
  input: CreateStaffUserInput
): Promise<CreateStaffUserResult> {
  const parsed = createStaffUserSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues.map((i) => i.message).join(", "),
    };
  }
  const { email, password, full_name, role, branch_id } = parsed.data;

  // --- Resolve the caller's own role/branch from their session ---
  const supabase = await createClient();
  const {
    data: { user: caller },
  } = await supabase.auth.getUser();

  if (!caller) {
    return { success: false, error: "Not authenticated." };
  }

  const { data: callerProfile } = await supabase
    .from("users")
    .select("role, branch_id")
    .eq("id", caller.id)
    .single();

  if (!callerProfile) {
    return { success: false, error: "Caller profile not found." };
  }

  // --- Authorization + server-derived final role/branch_id ---
  let finalRole: CreateStaffUserInput["role"];
  let finalBranchId: string | null;

  if (callerProfile.role === "admin") {
    finalRole = role;
    finalBranchId = finalRole === "admin" ? null : branch_id;
    if (finalRole !== "admin" && !finalBranchId) {
      return {
        success: false,
        error: "branch_id is required for branch_manager/cashier accounts.",
      };
    }
  } else if (callerProfile.role === "branch_manager") {
    if (role !== "cashier") {
      return {
        success: false,
        error: "Branch managers can only create cashier accounts.",
      };
    }
    finalRole = "cashier";
    finalBranchId = callerProfile.branch_id; // ignore client-sent branch_id entirely
  } else {
    return { success: false, error: "Not authorized to create staff accounts." };
  }

  // --- Create the auth user (Admin API, service role) ---
  const adminClient = createAdminClient();

  const { data: createdAuthUser, error: authError } =
    await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // staff accounts are provisioned, not self-verified
      user_metadata: { full_name },
    });

  if (authError || !createdAuthUser.user) {
    return {
      success: false,
      error: authError?.message ?? "Failed to create auth user.",
    };
  }

  const newUserId = createdAuthUser.user.id;

  // --- Insert the matching public.users row ---
  const { error: profileError } = await adminClient.from("users").insert({
    id: newUserId,
    branch_id: finalBranchId,
    role: finalRole,
    full_name,
  });

  if (profileError) {
    // Roll back the auth user so we never leave an orphaned login with
    // no role/branch attached to it.
    await adminClient.auth.admin.deleteUser(newUserId);
    return {
      success: false,
      error: `Failed to create staff profile, rolled back: ${profileError.message}`,
    };
  }

  // --- Notify admins, but only for branch_manager/cashier accounts ---
  // Not for newly created admins — an admin creating another admin
  // doesn't need to alert itself the same way a manager onboarding a
  // cashier does.
  if (finalRole !== "admin") {
    const { error: notificationError } = await adminClient
      .from("admin_notifications")
      .insert({
        branch_id: finalBranchId,
        performed_by: caller.id,
        action: "staff_account_created",
        target_table: "users",
        target_id: newUserId,
        details: { role: finalRole, full_name, email },
      });

    // Deliberately not rolled back on failure — the staff account itself
    // is real and should stand even if the notification insert hiccups.
    // Logged server-side so it's not silently lost.
    if (notificationError) {
      console.error(
        "createStaffUser: account created but notification insert failed:",
        notificationError
      );
    }
  }

  return { success: true, userId: newUserId };
}