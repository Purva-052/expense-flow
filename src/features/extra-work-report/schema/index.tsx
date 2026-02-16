import * as z from "zod";

export const extraWorkSchema = z.object({
  reportingDate: z.date({
    required_error: "Reporting Date is required",
    invalid_type_error: "Please select a valid date",
  }),

  inCashOrLeave: z.preprocess(
    (val) => (val === "" || val === null ? undefined : Number(val)),
    z.number({ required_error: "In Cash or Leave is required" })
  ),

  employeeId: z.preprocess(
    (val) => (val === "" || val === null ? undefined : Number(val)),
    z.number({ required_error: "Employee is required" })
  ),

  projectId: z.preprocess(
    (val) => (val === "" || val === null ? undefined : Number(val)),
    z.number({ required_error: "Project is required" })
  ),

  taskDescription: z
    .string()
    .min(2, "Task Description must be at least 2 characters long"),

  timeSpent: z
    .string()
    .min(1, "Time Spent is required")
    .refine((val) => {
      // Extract hours & minutes
      const hMatch = val.match(/(\d+)\s*h/i);
      const mMatch = val.match(/(\d+)\s*m/i);

      const hours = hMatch ? parseInt(hMatch[1], 10) : 0;
      const minutes = mMatch ? parseInt(mMatch[1], 10) : 0;

      return hours > 0 || minutes > 0;
    }, "Time Spent cannot be 0 hours and 0 minutes"),

  remark: z.string().optional(),
});

export type TExtraWorkFormSchema = z.infer<typeof extraWorkSchema>;
