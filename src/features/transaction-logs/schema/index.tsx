import * as z from "zod";

const transactionLogSchemaBase = z
  .object({
    reason: z
      .string()
      .trim()
      .min(2, "Reason must be at least 2 characters long"),
    projectId: z.preprocess(
      (val) => (val === "" || val === null ? undefined : String(val)),
      z.string().optional()
    ),
    transactionType: z.preprocess(
      (val) => (val === null || val === "" ? undefined : val),
      z.string({ required_error: "Transaction Type is required" })
    ),
    currency: z.string(),
    subscriptionCycle: z.preprocess(
      (val) => (val === "" || val === null ? undefined : val),
      z.string().optional()
    ),
    amount: z.preprocess(
      (val) => {
        if (val === "" || val === null || val === undefined) return undefined;
        return Number(val);
      },
      z
        .number({
          required_error: "Amount is required",
          invalid_type_error: "Invalid amount",
        })
        .positive("Amount must be greater than 0")
        .refine((val) => Number.isFinite(val), {
          message: "Invalid amount",
        })
    ),
    cardLast4: z.preprocess(
      (val) => (val === "" || val === null ? undefined : String(val)),
      z
        .string()
        .regex(/^\d{4}$/, "Card last 4 digits must be exactly 4 numbers")
        .optional()
    ),
    transactionDate: z.preprocess(
      (val) => (val === "" || val === null ? undefined : val),
      z.date({
        invalid_type_error: "Please select a valid date",
      }).optional()
    ),
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
    additionalNotes: z.string().trim().optional(),
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

export const getTransactionLogSchema = (isEdit: boolean) =>
  transactionLogSchemaBase.superRefine((data, ctx) => {
    if (isEdit) {
      if (!data.cardLast4) {
        ctx.addIssue({
          path: ["cardLast4"],
          message: "Card Last 4 digits is required",
          code: z.ZodIssueCode.custom,
        });
      }
      if (!data.transactionDate) {
        ctx.addIssue({
          path: ["transactionDate"],
          message: "Transaction Date is required",
          code: z.ZodIssueCode.custom,
        });
      }
    }
  });

export const transactionLogSchema = getTransactionLogSchema(false);

export type TTransactionFormSchema = z.infer<typeof transactionLogSchema>;
