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
  technologyId: z
    .array(z.number(), { invalid_type_error: "Technologies are required" })
    .nonempty("At least one technology is required"),
  projectTypeId: z.number({ invalid_type_error: "Project Type is required" }),
  startDate: z.preprocess(
    (val) => {
      if (val instanceof Date) {
        return val.toISOString().split("T")[0]; // convert Date -> "YYYY-MM-DD"
      }
      if (typeof val === "string") return val;
      return "";
    },
    z.string().min(1, "Start date is required")
  ),
  expectedCompletionDate: z.any(),

  handlerId: z
    .number({ invalid_type_error: "Manager must be a number" })
    .optional()
    .nullable(),

  percentageComplete: z.preprocess(
    (val) => (val === "" || val == null ? 0 : Number(val)),
    z
      .number({ invalid_type_error: "Progress must be a number" })
      .min(0, "Progress cannot be negative")
      .max(100, "Progress cannot exceed 100")
  ),
  status: z
    .string({ required_error: "Status is required" })
    .min(1, "Status is required"),
  priority: z.preprocess(
    (val) => (val === "" ? undefined : val),
    z.enum(["low", "medium", "high"], {
      required_error: "Priority is required",
      invalid_type_error: "Priority is required",
    })
  ),
  projectDocuments: z
    .array(
      z.object({
        link: z.string().url("Enter a valid URL"),
        note: z.string().optional(),
      })
    )
    .optional(),
});

export type TProjectFormSchema = z.infer<typeof projectFormSchema>;
