import { z } from "zod";

export const PrinterTypeSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, {
      message: "Printer type name must be at least 2 characters long.",
    })
    .max(50, { message: "Printer type name cannot exceed 50 characters." }),
});

export type TPrinterTypeSchema = z.infer<typeof PrinterTypeSchema>;
