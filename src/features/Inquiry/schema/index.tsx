import { z } from "zod";

export const InquirySchema = z.object({
  clientName: z
    .string()
    .min(2, { message: "Client name must be at least 2 characters long." })
    .max(50, { message: "Client name cannot exceed 50 characters." })
    .trim(),

  country: z
    .string()
    .min(2, { message: "Country must be at least 2 characters long." })
    .max(50, { message: "Country cannot exceed 50 characters." })
    .trim(),

  type: z.array(z.number()).min(1, { message: "Please select a type." }),

  status: z.string().nonempty({ message: "Please select a status." }),

  notes: z
    .string()
    .max(500, { message: "Notes cannot exceed 500 characters." })
    .optional(),
});

export type TInquirySchema = z.infer<typeof InquirySchema>;
