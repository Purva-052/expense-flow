import * as z from "zod";

export const transactionLogSchema = z
  .object({
    reason: z.string().min(2, "Reason must be at least 2 characters long"),
    projectId: z.preprocess((val) => {
      if (val === "" || val === null) return undefined;
      return String(val); // number -> string
    }, z.string().optional()),
    transactionType: z.string().min(1, "Transaction Type is required"),
    subscriptionCycle: z.string().optional(),
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
      invalid_type_error: "That's not a date!",
    }),
  })
  .refine(
    (data) => {
      if (data.transactionType === "subscription") {
        return !!data.subscriptionCycle;
      }
      return true;
    },
    {
      message: "Subscription Cycle is required",
      path: ["subscriptionCycle"],
    }
  );

export type TTransactionFormSchema = z.infer<typeof transactionLogSchema>;
