import { z } from "zod";

// Shared schema for the "create staff" form. branch_id is nullable here
// because the form itself doesn't enforce admin-vs-manager rules — the
// server action (lib/queries/users.ts) re-derives and overrides branch_id
// /role server-side based on who's actually calling it, the same way the
// contract's reporting RPCs never trust a client-supplied branch_id.
export const createStaffUserSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  full_name: z.string().min(1, "Full name is required"),
  role: z.enum(["admin", "branch_manager", "cashier"]),
  branch_id: z.string().uuid().nullable(),
});

export type CreateStaffUserInput = z.infer<typeof createStaffUserSchema>;