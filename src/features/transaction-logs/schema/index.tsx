import * as z from "zod";

export const transactionLogSchema = z
  .object({
    reason: z.string().min(2, "Reason must be at least 2 characters long"),
    projectId: z.preprocess(
      (val) => (val === "" || val === null ? undefined : String(val)),
      z.string().optional()
    ),
    transactionType: z.preprocess(
      (val) => (val === null || val === "" ? undefined : val),
      z.string({ required_error: "Transaction Type is required" })
    ),
    subscriptionCycle: z.preprocess(
      (val) => (val === "" || val === null ? undefined : val),
      z.string().optional()
    ),
    amount: z.preprocess(
      (val) => Number(val),
      z
        .number({
          invalid_type_error: "Amount is required",
        })
        .positive("Amount must be greater than 0")
    ),
    cardLast4: z
      .string()
      .min(1, "Card last 4 digits is required")
      .max(4, "Card last 4 digits must be 4 characters"),
    transactionDate: z.date({
      required_error: "Transaction Date is required",
      invalid_type_error: "Please select a valid date",
    }),
    referenceKey: z.string().optional(),
    referenceFileS3Key: z.string().optional(),
    file: z
      .any()
      .optional()
      .nullable()
      .refine((file) => {
        if (!file) return true; // Allow empty/null
        if (!(file instanceof File)) return true; // Allow if not a File object

        const validExtensions = [".pdf", ".doc", ".docx", ".jpg", ".jpeg"];
        const fileName = file.name.toLowerCase();
        const hasValidExtension = validExtensions.some((ext) =>
          fileName.endsWith(ext)
        );

        if (!hasValidExtension) {
          return false;
        }

        const maxSize = 25 * 1024 * 1024; // 25MB
        return file.size <= maxSize;
      }, "Receipt must be a PDF, DOC, DOCX, JPG, or JPEG file and not exceed 25MB"),
    subscriptionEndDate: z.date().optional().nullable(),
  })
  .superRefine((data, ctx) => {
    if (data.transactionType === "subscription") {
      if (!data.subscriptionCycle) {
        ctx.addIssue({
          path: ["subscriptionCycle"],
          message: "Subscription Cycle is required",
          code: z.ZodIssueCode.custom,
        });
      }
      if (!data.subscriptionEndDate) {
        ctx.addIssue({
          path: ["subscriptionEndDate"],
          message: "Subscription End Date is required",
          code: z.ZodIssueCode.custom,
        });
      }
    }
  });

export type TTransactionFormSchema = z.infer<typeof transactionLogSchema>;
