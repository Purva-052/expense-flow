import { z } from "zod";

export const clientNDAFormSchema = z.object({
  clientName: z
    .string()
    .trim()
    .min(1, "Client name is required")
    .max(50, "Client name must be at most 50 characters"),
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
