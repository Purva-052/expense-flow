import { z } from "zod";

export const ProductInquirySchema = z
  .object({
    companyName: z.string().trim().optional().nullable(),
    contactPerson: z.string().optional().nullable(),
    attendingPerson: z.preprocess(
      (val) => (val === "" || val === null ? undefined : Number(val)),
      z
        .number({
          required_error: "Attending Person is required",
          invalid_type_error: "Attending Person is required",
        })
        .min(1, "Attending Person is required")
    ),
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
    industryId: z.preprocess(
      (val) => (val === "" ? null : val),
      z.number().optional().nullable()
    ),
    productId: z.preprocess(
      (val) => (val === "" || val === null ? undefined : Number(val)),
      z
        .number({
          required_error: "Product is required",
          invalid_type_error: "Product is required",
        })
        .min(1, "Product is required")
    ),
    numberOfUsers: z.preprocess(
      (val) => (val === "" ? null : val),
      z
        .number()
        .min(0, "Number of users cannot be negative")
        .optional()
        .nullable()
    ),
    requirements: z.string().optional().nullable(),
    status: z.string().optional().nullable(),
    others: z.string().optional().nullable(),
    notes: z.string().optional().nullable(),
    inquiryDate: z.preprocess(
      (val) => {
        if (
          val === "" ||
          val === null ||
          val === undefined ||
          (val instanceof Date && isNaN(val.getTime()))
        ) {
          return undefined;
        }
        return val;
      },
      z.date({
        required_error: "Inquiry date is required",
        invalid_type_error: "Inquiry date is required",
      })
    ),
    trialStartDate: z.date().optional().nullable(),
    trialEndDate: z.date().optional().nullable(),
  })
  .superRefine((values, ctx) => {
    if (values.status === "others" && !values.others?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["others"],
        message: "Additional notes are required for Others status",
      });
    }

    if (
      values.trialStartDate &&
      values.trialEndDate &&
      values.trialEndDate < values.trialStartDate
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["trialEndDate"],
        message: "Trial end date cannot be before trial start date",
      });
    }
  });

export type TProductInquirySchema = z.infer<typeof ProductInquirySchema>;
