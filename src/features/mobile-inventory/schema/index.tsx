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
    .min(1, {
      message: "Color is required.",
    })
    .max(50, { message: "Color cannot exceed 50 characters." }),
  os: z
    .string()
    .trim()
    .min(1, {
      message: "OS is required.",
    })
    .max(50, { message: "OS cannot exceed 50 characters." }),
  serialNumber: z
    .string()
    .trim()
    .min(5, {
      message: "Serial number must be at least 5 characters long.",
    })
    .max(100, {
      message: "Serial number cannot exceed 100 characters.",
    }),
});

export type TMobileInventorySchema = z.infer<typeof MobileInventorySchema>;
