import { z } from "zod";

export const categorySchema = z.object({
  name: z.string().min(1, "Name is required"),
  is_active: z.boolean().default(true),
});

export type CategoryInput = z.infer<typeof categorySchema>;