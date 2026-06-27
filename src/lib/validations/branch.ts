import { z } from "zod";

export const branchSchema = z.object({
  name: z.string().min(1, "Name is required"),
  address: z.string().nullable().optional(),
  is_active: z.boolean().default(true),
});

export type BranchInput = z.infer<typeof branchSchema>;
