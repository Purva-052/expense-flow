import { z } from "zod";

export const InquirySchema = z.object({
  clientName: z
    .string()
    .trim()
    .min(2, { message: "Client name must be at least 2 characters long." })
    .max(50, { message: "Client name cannot exceed 50 characters." })
    .trim(),

  countryName: z
    .string()
    .trim()
    .min(2, { message: "Country must be at least 2 characters long." })
    .max(50, { message: "Country cannot exceed 50 characters." }),
  clientContactNo: z.string().optional(),
  clientCompanyName: z.string().trim().optional(),
  sourceOfInquiry: z.string().trim().optional(),
  clientEmailId: z.string().trim().email().optional().or(z.literal("")),
  requirements: z
    .array(z.number())
    .min(1, { message: "Please select a type." }),

  status: z.string().nonempty({ message: "Please select a status." }),

  notes: z
    .string()
    .trim()
    .max(500, { message: "Notes cannot exceed 500 characters." })
    .optional(),
});

export type TInquirySchema = z.infer<typeof InquirySchema>;
