import * as z from "zod";

const numberField = (fieldName: string) =>
  z.preprocess(
    (val) => {
      if (val === "" || val === null || val === undefined) {
        return undefined;
      }
      const parsed = Number(val);
      return isNaN(parsed) ? undefined : parsed;
    },
    z.number({
      required_error: `${fieldName} is required`,
      invalid_type_error: `${fieldName} is required`,
    })
  );

export const toolsSchema = z.object({
  toolName: z.string().trim().min(1, "Tool Name is required"),

  description: z.string().trim().min(1, "Description is required"),

  purchaseDate: z.date({
    required_error: "Purchase Date is required",
    invalid_type_error: "Please select a valid date",
  }),

  expiryDate: z.date({
    required_error: "Expiry Date is required",
    invalid_type_error: "Please select a valid date",
  }),

  purchasedBy: numberField("Purchased By"),
});

export type TToolsFormSchema = z.infer<typeof toolsSchema>;
