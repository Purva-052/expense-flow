import { z } from "zod";

export const userFormSchema = z.object({
  fullName: z
    .string()
    .min(2, { message: "Full name must be at least 2 characters long." })
    .max(50, { message: "Full name cannot exceed 50 characters." })
    .trim(),
  email: z
    .string()
    .email({ message: "Invalid email address." })
    .max(100, { message: "Email cannot exceed 100 characters." })
    .trim(),
  role: z
    .string()
    .min(3, { message: "Role is required." })
    .max(30, { message: "Role cannot exceed 30 characters." })
    .trim(),
  technologyId: z
    .number({ invalid_type_error: "Technology is required." })
    .min(1, { message: "Please select a technology." }),
  joiningDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Invalid date format.",
  }),
  status: z.boolean(), // checkbox will map true = active, false = inactive
  currentWorkingProjectId: z.any().optional(), // only for edit form
});

export type TUserFormSchema = z.infer<typeof userFormSchema>;
