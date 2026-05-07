import { z } from "zod";

export const ProductInquirySchema = z.object({
  companyName: z.string().trim().min(1, "Company Name is required"),
  contactPerson: z.string().trim().min(1, "Contact Person is required"),
  phoneNumber: z.string().optional().nullable(),
  emailId: z
    .string()
    .trim()
    .email("Invalid email address")
    .optional()
    .or(z.literal(""))
    .nullable(),
  demoDate: z.date().optional().nullable(),
  city: z.string().optional().nullable(),
  industryId: z.number().optional().nullable(),
  numberOfUsers: z.number().optional().nullable(),
  requirements: z.string().optional().nullable(),
  status: z.string().optional().nullable(),
  others: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  trialStartDate: z.date().optional().nullable(),
  trialEndDate: z.date().optional().nullable(),
}).superRefine((values, ctx) => {
  if (values.status === "others" && !values.others?.trim()) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["others"],
      message: "Additional notes are required for Others status",
    });
  }
});

export type TProductInquirySchema = z.infer<typeof ProductInquirySchema>;
