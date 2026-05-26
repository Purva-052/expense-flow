import { z } from "zod";

export const ClientInventoryTypeSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, {
      message: "Client inventory type name must be at least 2 characters long.",
    })
    .max(50, { message: "Client inventory type name cannot exceed 50 characters." }),
});

export type TClientInventoryTypeSchema = z.infer<typeof ClientInventoryTypeSchema>;
