import { z } from "zod";

export const InquiryTypeSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, {
      message: "Inquiry Type name must be at least 2 characters long.",
    })
    .max(50, { message: "Inquiry Type name cannot exceed 50 characters." }),
});

export type TInquiryTypeSchema = z.infer<typeof InquiryTypeSchema>;
