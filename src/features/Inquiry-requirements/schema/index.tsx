import { z } from "zod";

export const InquiryTypeSchema = z.object({
  name: z
    .string()
    .min(2, {
      message: "Inquiry Requirement name must be at least 2 characters long.",
    })
    .max(50, {
      message: "Inquiry Requirement name cannot exceed 50 characters.",
    })
    .trim(),
});

export type TInquiryTypeSchema = z.infer<typeof InquiryTypeSchema>;
