import * as z from "zod";

export const interviewFormSchema = z
  .object({
    // Candidate Details
    candidateName: z.string().min(1, "Name is required"),
    technology: z.any().refine(
      (val) => {
        return val != null && val !== "" && String(val).trim().length > 0;
      },
      {
        message: "Technology is required",
      }
    ),
    email: z
      .string()
      .min(1, "Email is required")
      .email("Invalid email address"),
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
    location: z.string().optional(),
    notes: z.string().optional(),
    experience: z.coerce
      .number()
      .min(0, "Experience must be a positive number"),
    resume: z.any().optional(), // Making resume optional as it can be complex to require
    resumeS3Key: z.string().min(1, "Resume is required"),
    currentCtc: z.coerce.number().min(0, "CTC must be a positive number"),
    expectedCtc: z.coerce.number().min(0, "CTC must be a positive number"),
    noticePeriod: z.string().optional(),

    // Interviewer Details
    interviewerName: z.any().refine(
      (val) => {
        return val != null && val !== "" && String(val).trim().length > 0;
      },
      {
        message: "Interview Name is required",
      }
    ),
    startTime: z.string().min(1, "Start time is required"),
    endTime: z.string().min(1, "End time is required"),
    interviewType: z.string().min(1, "Interview type is required"),
    interviewUrl: z.string().optional(),
    interviewRound: z.string().min(1, "Interview round is required"),
    interviewerComment: z.string().optional(),
    interviewStatus: z.string().min(1, "Status is required"),
    joiningDate: z
      .union([z.date(), z.string()])
      .optional()
      .refine(
        (val) => {
          if (!val) return true;
          if (val instanceof Date) return true;
          return !isNaN(Date.parse(val));
        },
        {
          message: "Invalid date format.",
        }
      ),
  })
  // This refine function ensures that the interviewUrl is provided only when 'video_call' is selected
  .refine(
    (data) => {
      if (data.interviewType === "video_call") {
        return !!data.interviewUrl && data.interviewUrl.trim().length > 0;
      }
      return true;
    },
    {
      message: "URL is required for video calls",
      path: ["interviewUrl"], // This attaches the error message to the interviewUrl field
    }
  )
  .refine(
    (data) => {
      if (data.interviewType === "video_call" && data.interviewUrl) {
        try {
          new URL(data.interviewUrl);
          return true;
        } catch {
          return false;
        }
      }
      return true;
    },
    {
      message: "Must be a valid URL",
      path: ["interviewUrl"],
    }
  );

// Export the inferred TypeScript type for use in your components
export type InterviewFormValues = z.infer<typeof interviewFormSchema>;
