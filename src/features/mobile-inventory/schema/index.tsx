import { z } from "zod";

export const MobileInventorySchema = z.object({
  brandId: z.preprocess(
    (val) => {
      if (val === "" || val === null || val === undefined) return undefined;
      const num = Number(val);
      return isNaN(num) ? undefined : num;
    },
    z.number({
      required_error: "Brand is required",
      invalid_type_error: "Brand is required",
    })
  ),
  model: z
    .string()
    .trim()
    .min(2, {
      message: "Model name must be at least 2 characters long.",
    })
    .max(50, { message: "Model name cannot exceed 50 characters." }),
  color: z
    .string()
    .trim()
    .max(50, { message: "Color cannot exceed 50 characters." })
    .optional(),
  os: z
    .string()
    .trim()
    .max(50, { message: "OS cannot exceed 50 characters." })
    .optional(),
  serialNumber: z
    .string()
    .trim()
    .max(100, {
      message: "Serial number cannot exceed 100 characters.",
    })
    .optional(),
  allocateTo: z.preprocess(
    (val) => {
      if (val === "" || val === null || val === undefined) return undefined;
      const num = Number(val);
      return isNaN(num) ? undefined : num;
    },
    z.number().optional()
  ),
});

export type TMobileInventorySchema = z.infer<typeof MobileInventorySchema>;
