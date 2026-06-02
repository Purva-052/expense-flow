import { z } from "zod";

export const clientNDAFormSchema = z.object({
  clientId: z
    .union([z.string(), z.number()])
    .refine((val) => val !== null && val !== undefined && val !== "", {
      message: "Client is required",
    }),
  clientEmail: z
    .string()
    .trim()
    .email("Invalid email format")
    .min(1, "Client email is required"),
  clientPhoneNumber: z
    .string()
    .trim()
    .min(5, "Client phone number is required"),
  clientCountry: z.string().trim().min(1, "Client country is required"),
  clientAddress: z.string().trim().min(1, "Client address is required"),
});

export type TClientNDAFormSchema = z.infer<typeof clientNDAFormSchema>;
