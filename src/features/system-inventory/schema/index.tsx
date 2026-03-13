import z from "zod";

const selectValueSchema = z
  .union([z.string(), z.number()])
  .nullable()
  .optional();

export const deviceOwnershipSchema = z.enum(["self", "company"], {
  errorMap: () => ({ message: "Ownership is required" }),
});

export type SelectValue = string | number | null | undefined;

export const systemInventorySchema = z
  .object({
    mouseEnabled: z.boolean(),
    mouseConnectionType: z.string().optional(),
    mouseOwnershipType: deviceOwnershipSchema,

    keyboardEnabled: z.boolean(),
    keyboardConnectionType: z.string().optional(),
    keyboardOwnershipType: deviceOwnershipSchema,

    cpuEnabled: z.boolean(),
    cpuProcessorId: selectValueSchema,
    cpuStorageId: selectValueSchema,
    cpuRamId: selectValueSchema,
    cpuOwnershipType: deviceOwnershipSchema,

    laptopEnabled: z.boolean(),
    laptopBrandId: selectValueSchema,
    laptopProcessorId: selectValueSchema,
    laptopStorageId: selectValueSchema,
    laptopRamId: selectValueSchema,
    laptopOwnershipType: deviceOwnershipSchema,

    monitorEnabled: z.boolean(),
    monitorBrandId: selectValueSchema,
    monitorSizeId: selectValueSchema,
    monitorOwnershipType: deviceOwnershipSchema,

    headphoneEnabled: z.boolean(),
    headphoneBrandId: selectValueSchema,
    headphoneConnectionType: z.string().optional(),
    headphoneOwnershipType: deviceOwnershipSchema,

    notes: z.string().max(500, "Notes cannot exceed 500 characters").optional(),
  })
  .superRefine((values, ctx) => {
    const hasValue = (value: SelectValue | string | undefined) =>
      !(value === null || value === undefined || value === "");

    if (values.cpuEnabled && !hasValue(values.cpuProcessorId)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["cpuProcessorId"],
        message: "Processor is required",
      });
    }

    if (values.cpuEnabled && !hasValue(values.cpuStorageId)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["cpuStorageId"],
        message: "Storage is required",
      });
    }

    if (values.cpuEnabled && !hasValue(values.cpuRamId)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["cpuRamId"],
        message: "RAM is required",
      });
    }

    if (values.laptopEnabled && !hasValue(values.laptopBrandId)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["laptopBrandId"],
        message: "Brand is required",
      });
    }

    if (values.laptopEnabled && !hasValue(values.laptopProcessorId)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["laptopProcessorId"],
        message: "Processor is required",
      });
    }

    if (values.laptopEnabled && !hasValue(values.laptopStorageId)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["laptopStorageId"],
        message: "Storage is required",
      });
    }

    if (values.laptopEnabled && !hasValue(values.laptopRamId)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["laptopRamId"],
        message: "RAM is required",
      });
    }

    if (values.monitorEnabled && !hasValue(values.monitorBrandId)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["monitorBrandId"],
        message: "Brand is required",
      });
    }

    if (values.mouseEnabled && !hasValue(values.mouseConnectionType)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["mouseConnectionType"],
        message: "Connection type is required",
      });
    }

    if (values.keyboardEnabled && !hasValue(values.keyboardConnectionType)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["keyboardConnectionType"],
        message: "Connection type is required",
      });
    }

    if (values.headphoneEnabled && !hasValue(values.headphoneConnectionType)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["headphoneConnectionType"],
        message: "Connection type is required",
      });
    }

    if (
      !values.mouseEnabled &&
      !values.keyboardEnabled &&
      !values.cpuEnabled &&
      !values.laptopEnabled &&
      !values.monitorEnabled &&
      !values.headphoneEnabled
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["mouseEnabled"], // Arbitrary base path for the overall error
        message: "Please select CPU/Computer or Laptop",
      });
    }
  });

export type TSystemInventorySchema = z.infer<typeof systemInventorySchema>;
