import { z } from "zod";

export const projectFormSchema = z.object({
  name: z
    .string()
    .min(2, "Project name must be at least 2 characters")
    .max(100),
  description: z
    .string()
    .max(500, "Description must be under 500 characters")
    .optional()
    .nullable(),
  clientId: z.number({ invalid_type_error: "Client is required" }),
  startDate: z.any(),
  expectedCompletionDate: z.any(),

  handlerId: z
    .number({ invalid_type_error: "Manager must be a number" })
    .optional()
    .nullable(),

  percentageComplete: z.preprocess(
    (val) => (val === "" || val == null ? 0 : Number(val)),
    z.number().min(0).max(100)
  ),
  priority: z.enum(["low", "medium", "high"]),
});

export type TProjectFormSchema = z.infer<typeof projectFormSchema>;
