import * as z from "zod";

export const transactionLogSchema = z
  .object({
    reason: z.string().min(2, "Reason must be at least 2 characters long"),
    projectId: z.preprocess((val) => {
      if (val === "" || val === null) return undefined;
      return String(val); // number -> string
    }, z.string().optional()),
    transactionType: z.string().min(1, "Transaction Type is required"),
    subscriptionType: z.string().optional(),
    amount: z.preprocess(
      (val) => Number(val),
      z.number().min(1, "Amount must be at least 1")
    ),
    cardLast4: z
      .string()
      .min(1, "Card last 4 digits is required")
      .max(4, "Card last 4 digits must be 4 characters"),
    transactionDate: z.string().min(1, "Transaction Date is required"),
  })
  .refine(
    (data) => {
      if (data.transactionType === "subscription") {
        return !!data.subscriptionType;
      }
      return true;
    },
    {
      message: "Subscription Type is required required",
      path: ["subscriptionType"],
    }
  );

export type TTransactionFormSchema = z.infer<typeof transactionLogSchema>;
