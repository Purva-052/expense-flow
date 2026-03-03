import * as z from "zod";

const numberField = (fieldName: string) =>
  z.preprocess(
    (val) => {
      // Handle empty values
      if (val === "" || val === null || val === undefined) {
        return undefined;
      }

      const parsed = Number(val);

      // Prevent NaN from passing
      return isNaN(parsed) ? undefined : parsed;
    },
    z.number({
      required_error: `${fieldName} is required`,
      invalid_type_error: `${fieldName} is required`,
    })
  );

export const extraWorkSchema = z.object({
  reportingDate: z.date({
    required_error: "Reporting Date is required",
    invalid_type_error: "Please select a valid date",
  }),

  inCashOrLeave: numberField("In Cash or Leave"),

  employeeId: numberField("Employee"),

  projectId: numberField("Project"),

  taskDescription: z
    .string()
    .trim()
    .min(2, "Task Description must be at least 2 characters long"),

  timeSpent: z
    .string()
    .min(1, "Time Spent is required")
    .refine((val) => {
      const hMatch = val.match(/(\d+)\s*h/i);
      const mMatch = val.match(/(\d+)\s*m/i);

      const hours = hMatch ? parseInt(hMatch[1], 10) : 0;
      const minutes = mMatch ? parseInt(mMatch[1], 10) : 0;

      return hours > 0 || minutes > 0;
    }, "Time Spent cannot be 0 hours and 0 minutes"),

  remark: z.string().optional(),
});

export type TExtraWorkFormSchema = z.infer<typeof extraWorkSchema>;
