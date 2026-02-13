import * as z from "zod";

export const interviewFormSchema = z
  .object({
    // Candidate Details
    candidateName: z.string().trim().min(1, "Name is required"),
    technology: z.any().refine(
      (val) => {
        return val != null && val !== "" && String(val).trim().length > 0;
      },
      { message: "Technology is required" }
    ),
    email: z.string().min(1, "Email is required").email("Invalid email address"),
    phoneNumber: z
      .string()
      .optional()
      .refine(
        (val) => {
          if (!val) return true; // optional
          return /^[+0-9()\-\s]+$/.test(val);
        },
        { message: "Phone number contains invalid characters." }
      )
      .refine(
        (val) => {
          if (!val) return true;
          const digits = val.replace(/\D/g, "");
          return digits.length >= 7 && digits.length <= 15;
        },
        { message: "Invalid phone number length." }
      ),
    location: z.string().optional(),
    link: z
      .string()
      .optional()
      .refine(
        (val) => {
          if (!val || val.trim() === "") return true; // Allow empty
          try {
            new URL(val);
            return true;
          } catch {
            return false;
          }
        },
        { message: "Must be a valid URL" }
      ),
    notes: z.string().trim().optional(),
    experience: z.coerce.number().min(0, "Experience must be a positive number"),
    resume: z
      .any()
      .optional()
      .refine((file) => {
        if (!file) return true; // Allow empty/null
        if (!(file instanceof File)) return true; // Allow if not a File object
        const validExtensions = [".pdf", ".doc", ".docx"];
        const fileName = file.name.toLowerCase();
        const hasValidExtension = validExtensions.some((ext) =>
          fileName.endsWith(ext)
        );
        if (!hasValidExtension) {
          return false;
        }
        const maxSize = 5 * 1024 * 1024; // 5MB
        return file.size <= maxSize;
      }, "Resume must be a PDF, DOC, or DOCX file and not exceed 5MB"),
    resumeS3Key: z.string().optional(),
    currentCtc: z.coerce.number().min(0, "CTC must be a positive number"),
    expectedCtc: z.coerce.number().min(0, "CTC must be a positive number"),
    noticePeriod: z.string().optional(),

    // Interviewer Details
    interviewerName: z.any().refine(
      (val) => {
        return val != null && val !== "" && String(val).trim().length > 0;
      },
      { message: "Interviewer Name is required" }
    ),
    startTime: z.string().min(1, "Start time is required"),
    endTime: z.string().min(1, "End time is required"),
    interviewType: z.any().refine(
      (val) => {
        return val != null && val !== "" && String(val).trim().length > 0;
      },
      { message: "Interview type is required" }
    ),
    interviewUrl: z.string().optional(),
    interviewStatus: z.any().refine(
      (val) => {
        return val != null && val !== "" && String(val).trim().length > 0;
      },
      { message: "Interviewer Status is required" }
    ),
    joiningDate: z
      .union([z.date(), z.string()])
      .optional()
      .refine(
        (val) => {
          if (!val) return true;
          if (val instanceof Date) return true;
          return !isNaN(Date.parse(val));
        },
        { message: "Invalid date format." }
      ),
  })
  .refine(
    (data) => {
      if (data.interviewType === "video_call") {
        return !!data.interviewUrl && data.interviewUrl.trim().length > 0;
      }
      return true;
    },
    {
      message: "URL is required for video calls",
      path: ["interviewUrl"],
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

export type InterviewFormValues = z.infer<typeof interviewFormSchema>;