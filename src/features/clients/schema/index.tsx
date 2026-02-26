import { z } from "zod";

// Regex for a valid IANA timezone format (e.g., "Asia/Kolkata", "America/New_York")
const timezoneRegex = /^[A-Za-z]+(?:\/[A-Za-z_]+(?:\/[A-Za-z_]+)?)$/;

export const clientFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, { message: "Client name must be at least 2 characters long." })
    .max(100, { message: "Client name cannot exceed 100 characters." }),
  company: z
    .string()
    .trim()
    // .min(2, { message: "Company field must be at least 2 characters long." })
    .max(100, { message: "Company field cannot exceed 100 characters." })
    .optional(),
  countryId: z.coerce.number().min(1, "Country is required"),
  timezone: z.string().regex(timezoneRegex, {
    message:
      "Invalid timezone format. Example: Asia/Kolkata, America/New_York, Europe/London",
  }),
});

export type TClientFormSchema = z.infer<typeof clientFormSchema>;
