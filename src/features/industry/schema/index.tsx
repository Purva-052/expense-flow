import { z } from "zod";

export const IndustrySchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, {
      message: "Industry name must be at least 2 characters long.",
    })
    .max(50, { message: "Industry name cannot exceed 50 characters." }),
});

export type TIndustrySchema = z.infer<typeof IndustrySchema>;
