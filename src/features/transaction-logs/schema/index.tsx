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
      (val) => String(val),
      z.string().min(1, "Amount must be at least 1")
    ),
    cardLast4: z
      .string()
      .min(1, "Card last 4 digits is required")
      .max(4, "Card last 4 digits must be 4 characters"),
    transactionDate: z.date({
      required_error: "Transaction Date is required",
      invalid_type_error: "Please select a valid date",
    }),
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
