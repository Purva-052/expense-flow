import { z } from "zod";

const toYMD = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const normalizeOptionalDate = (value: unknown) => {
  if (value === "" || value === null || value === undefined) return null;
  if (value instanceof Date) {
    if (Number.isNaN(value.getTime())) return null;
    return toYMD(value);
  }
  return value;
};

// Base schema (common to both add and edit)
const baseUserSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, { message: "Full name must be at least 2 characters long." })
    .max(50, { message: "Full name cannot exceed 50 characters." }),
  email: z
    .string()
    .trim()
    .email({ message: "Invalid email address." })
    .max(100, { message: "Email cannot exceed 100 characters." }),
  role: z
    .string()
    .trim()
    .min(3, { message: "Role is required." })
    .max(30, { message: "Role cannot exceed 30 characters." }),
  technologyId: z.coerce
    .number({ invalid_type_error: "Technology is required." })
    .min(1, { message: "Please select a technology." })
    .optional(),
  reportLogAccessIds: z.array(z.coerce.number()).optional(),
  reportingToId: z.coerce.number().optional().nullable(),
  careerStartDate: z.any().refine((val) => !isNaN(Date.parse(val)), {
    message: "Career start date is required.",
  }),
  joiningDate: z.any().refine((val) => !isNaN(Date.parse(val)), {
    message: "Joining date is required.",
  }),
  dateOfBirth: z.preprocess(
    normalizeOptionalDate,
    z
      .string()
      .nullable()
      .optional()
      .refine(
        (val) => {
          if (!val) return true; // allow empty/null
          return !isNaN(Date.parse(val));
        },
        {
          message: "Invalid date format.",
        }
      )
  ),
  status: z.boolean(),
  joining: z.boolean(),
  mewurkEmployeeCode: z
    .string()
    .trim()
    .max(50, { message: "Employee code cannot exceed 50 characters." })
    .optional()
    .nullable(),
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
  .trim()
  .min(6, { message: "Password must be at least 6 characters long." })
  .max(100, { message: "Password cannot exceed 100 characters." });

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
