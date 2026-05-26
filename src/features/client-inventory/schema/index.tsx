import z from "zod";

const selectValueSchema = z
  .union([z.string(), z.number()])
  .nullable()
  .optional();

export type SelectValue = string | number | null | undefined;

export const ClientInventorySchema = z.object({
  clientId: z.union([z.string(), z.number()]).refine((val) => val !== null && val !== undefined && val !== "", {
    message: "Client is required",
  }),
  projectId: z.union([z.string(), z.number()]).refine((val) => val !== null && val !== undefined && val !== "", {
    message: "Project is required",
  }),
  inventoryTypeId: z.union([z.string(), z.number()]).refine((val) => val !== null && val !== undefined && val !== "", {
    message: "Inventory Type is required",
  }),
  quantity: z.coerce.number().int().min(1, { message: "Quantity must be at least 1" }),
  brandId: selectValueSchema,
  monitorSizeId: selectValueSchema,
  processorId: selectValueSchema,
  ramId: selectValueSchema,
  storageId: selectValueSchema,
  printerTypeId: selectValueSchema,
  deviceId: selectValueSchema,
  notes: z.string().max(500, "Notes cannot exceed 500 characters").optional(),
});

export type TClientInventorySchema = z.infer<typeof ClientInventorySchema>;
