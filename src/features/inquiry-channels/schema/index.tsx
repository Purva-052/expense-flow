import { z } from "zod";

export const InquiryCategorySchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, {
      message: "Inquiry Channel name must be at least 2 characters long.",
    })
    .max(50, { message: "Inquiry Channel name cannot exceed 50 characters." }),
});

export type TInquiryCategorySchema = z.infer<typeof InquiryCategorySchema>;
