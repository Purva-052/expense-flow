import { z } from "zod";

export const technologyFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, { message: "Technology name must be at least 2 characters long." })
    .max(50, { message: "Technology name cannot exceed 50 characters." }),
  color: z
    .string()
    .trim()
    .regex(/^#([0-9A-Fa-f]{6})$/, {
      message: "Color must be a valid HEX code (e.g., #61DAFB).",
    }),
});

export type TTechnologyFormSchema = z.infer<typeof technologyFormSchema>;
