import { z } from "zod";

export const newJoineeSchema = z.object({
  candidateName: z
    .string()
    .min(2, { message: "Candidate name must be at least 2 characters long." })
    .max(50, { message: "Candidate name cannot exceed 50 characters." })
    .trim(),
  technology: z
    .number({ invalid_type_error: "Technology is required." })
    .min(1, { message: "Please select a technology." }),
  email: z
    .string()
    .email({ message: "Invalid email address." })
    .max(100, { message: "Email cannot exceed 100 characters." })
    .trim(),
  phoneNumber: z.string().optional(),
  experienceInYears: z.coerce
    .number({ invalid_type_error: "Experience must be a number." })
    .min(0, { message: "Experience cannot be negative." })
    .max(50, { message: "Experience cannot exceed 50 years." })
    .optional(),
  notes: z.string().optional(),
  interviewerComments: z.string().optional(),
  joiningDate: z.any().refine((val) => !isNaN(Date.parse(val)), {
    message: "Invalid date format.",
  }),
});

export type TJoineeFormSchema = z.infer<typeof newJoineeSchema>;
