import { z } from "zod";

export const newJoineeSchema = z.object({
  candidateName: z
    .string()
    .min(2, { message: "Candidate name must be at least 2 characters long." })
    .max(50, { message: "Candidate name cannot exceed 50 characters." })
    .trim(),
  technology: z
    .number({ invalid_type_error: "Technology is required." })
    .min(1, { message: "Please select a technology." })
    .optional(),
  email: z
    .string()
    .email({ message: "Invalid email address." })
    .max(100, { message: "Email cannot exceed 100 characters." })
    .trim(),
  phoneNumber: z
    .string()
    .optional()
    .refine(
      (val) => {
        if (!val) return true; // optional

        // allow: +1 (827) 943-2645, +91 9876543210, (123) 456-7890, 987-654-3210
        return /^[+0-9()\-\s]+$/.test(val);
      },
      { message: "Phone number contains invalid characters." }
    )
    .refine(
      (val) => {
        if (!val) return true;

        // remove all non-digits
        const digits = val.replace(/\D/g, "");

        // Phone length should be reasonable (min 7, max 15 — international standard)
        return digits.length >= 7 && digits.length <= 15;
      },
      { message: "Invalid phone number length." }
    ),
  experienceInYears: z.coerce
    .number({ invalid_type_error: "Experience must be a number." })
    .min(0, { message: "Experience cannot be negative." })
    .max(50, { message: "Experience cannot exceed 50 years." })
    .optional(),
  notes: z.string().optional(),
  interviewerComments: z.string().optional(),
  joiningDate: z
    .any()
    .refine(
      (val) => {
        if (val === null || val === undefined || val === "") return true; // allow optional
        return !isNaN(Date.parse(val)); // validate only if value exists
      },
      {
        message: "Invalid date format.",
      }
    )
    .optional(),
});

export type TJoineeFormSchema = z.infer<typeof newJoineeSchema>;
