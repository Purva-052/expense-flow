import { z } from "zod";

// Base schema (common to both add and edit)
const baseUserSchema = z.object({
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
  technologyId: z.coerce
    .number({ invalid_type_error: "Technology is required." })
    .min(1, { message: "Please select a technology." })
    .optional(),
  reportLogAccessIds: z.array(z.coerce.number()).optional(),
  careerStartDate: z.any().refine((val) => !isNaN(Date.parse(val)), {
    message: "Invalid date format.",
  }),
  dateOfBirth: z.any().refine((val) => !isNaN(Date.parse(val)), {
    message: "Invalid date format.",
  }),
  status: z.boolean(),
  joining: z.boolean(),
  currentWorkingProjectId: z.any().optional(),
  profilePicS3Key: z.string().optional(),
  file: z
    .any()
    .optional()
    .nullable()
    .refine((file) => {
      if (!file) return true; // Allow empty/null
      if (!(file instanceof File)) return true; // Allow if not a File object

      const validExtensions = [".jpg", ".jpeg", ".png"];
      const fileName = file.name.toLowerCase();
      const hasValidExtension = validExtensions.some((ext) =>
        fileName.endsWith(ext)
      );

      if (!hasValidExtension) {
        return false;
      }

      const maxSize = 2 * 1024 * 1024; // 2MB
      return file.size <= maxSize;
    }, "Profile picture must be a JPG, JPEG, or PNG file and not exceed 2MB"),
});

// Separate field for add/edit mode
const passwordField = z
  .string()
  .min(6, { message: "Password must be at least 6 characters long." })
  .max(100, { message: "Password cannot exceed 100 characters." })
  .trim();

// For add user (password required)
export const addUserSchema = baseUserSchema.extend({
  password: passwordField,
});

// For edit user (password optional)
export const editUserSchema = baseUserSchema.extend({
  password: passwordField.optional(),
});

export type TUserFormSchema = z.infer<typeof baseUserSchema> & {
  password?: string;
};
