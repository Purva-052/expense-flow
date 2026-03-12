import { z } from "zod";

export const InquirySchema = z.object({
  projectName: z.string().trim().optional(),
  clientName: z
    .string()
    .trim()
    .min(2, { message: "Client name must be at least 2 characters long." })
    .max(50, { message: "Client name cannot exceed 50 characters." })
    .trim(),

  countryId: z.coerce.number().min(1, "Country is required"),
  clientContactNo: z.any().optional(),
  clientCompanyName: z.string().trim().optional(),
  sourceOfInquiry: z.string().trim().optional(),
  clientEmailId: z.string().trim().email().optional().or(z.literal("")),
  clientLinkedInProfile: z.string().trim().optional(),
  requirements: z
    .array(z.coerce.number())
    .min(1, { message: "Please select a type." }),
  inquirySourceId: z.coerce.number().min(1, "Inquiry Channel is required"),
  inboundSourceId: z.coerce.number().optional().nullable(),
  domainId: z.coerce.number().optional().nullable(),
  outboundSourceId: z.coerce.number().optional().nullable(),
  industryId: z.coerce.number().optional().nullable(),
  inquiryTypeId: z.coerce.number().min(1, "Inquiry type is required"),
  salesPersonId: z.coerce.number().min(1, "Sales person is required"),
  inquiryDate: z.coerce.date({
    invalid_type_error: "Inquiry Date is required.",
  }),
  status: z.string().nonempty({ message: "Please select a status." }),

  notes: z
    .string()
    .trim()
    .max(500, { message: "Notes cannot exceed 500 characters." })
    .optional(),
});

export type TInquirySchema = z.infer<typeof InquirySchema>;
