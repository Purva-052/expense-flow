import { z } from "zod";

export const DeviceSchema = z.object({
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
  modelName: z
    .string()
    .trim()
    .min(2, {
      message: "Model name must be at least 2 characters long.",
    })
    .max(50, { message: "Model name cannot exceed 50 characters." }),
  osType: z.enum(["Android", "iOS", "other"], {
    message: "OS type must be either 'Android' or 'iOS' or 'other'.",
  }),
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

export type TDeviceSchema = z.infer<typeof DeviceSchema>;
