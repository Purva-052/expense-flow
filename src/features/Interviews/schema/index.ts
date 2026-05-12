import * as z from "zod";

export const interviewFormSchema = z
  .object({
    /** 🔹 INTERNAL STEP FLAG */
    step: z.number().default(1),

    // -----------------------------
    // Candidate Details
    // -----------------------------
    candidateName: z.string().trim().min(1, "Name is required"),

    technology: z
      .any()
      .refine(
        (val) => val != null && val !== "" && String(val).trim().length > 0,
        { message: "Technology is required" }
      ),

    email: z
      .string()
      .min(1, "Email is required")
      .email("Invalid email address"),

    phoneNumber: z
      .string()
      .optional()
      .refine((val) => {
        if (!val || val.trim() === "") return true;
        if (!/^[+0-9()\-\s]+$/.test(val)) return false;
        const digits = val.replace(/\D/g, "");
        return digits.length >= 7 && digits.length <= 15;
      }, "Phone number must contain 7–15 digits"),

    location: z.string().optional(),

    link: z
      .string()
      .optional()
      .refine((val) => {
        if (!val || val.trim() === "") return true;
        try {
          new URL(val);
          return true;
        } catch {
          return false;
        }
      }, "Must be a valid URL"),

    notes: z.string().trim().optional(),
    interviewerComments: z.string().trim().optional(),

    experience: z.coerce
      .number()
      .min(0, "Experience must be a positive number"),

    resume: z
      .any()
      .optional()
      .refine((file) => {
        if (!file) return true;
        if (!(file instanceof File)) return true;
        const validExtensions = [".pdf", ".doc", ".docx"];
        const fileName = file.name.toLowerCase();
        const hasValidExtension = validExtensions.some((ext) =>
          fileName.endsWith(ext)
        );
        if (!hasValidExtension) return false;
        const maxSize = 5 * 1024 * 1024; // 5MB
        return file.size <= maxSize;
      }, "Resume must be a PDF, DOC, or DOCX file and not exceed 5MB"),

    resumeS3Key: z.string().optional(),

    currentCtc: z.coerce.number({
      required_error: "Current CTC is required",
    }),
    // .gt(0, "Current CTC must be greater than 0"),

    expectedCtc: z.coerce.number({
      required_error: "Expected CTC is required",
    }),
    // .gt(0, "Expected CTC must be greater than 0"),

    noticePeriod: z.string().optional(),

    // -----------------------------
    // Interviewer Details
    // -----------------------------
    interviewerName: z.any().optional(),

    startTime: z.string().optional(),

    endTime: z.string().optional(),

    interviewType: z.any().optional(),

    interviewUrl: z.string().optional(),

    interviewStatus: z.any().optional(),

    joiningDate: z
      .union([z.date(), z.string()])
      .optional()
      .refine((val) => {
        if (!val) return true;
        if (val instanceof Date) return true;
        return !isNaN(Date.parse(val));
      }, "Invalid date format"),
  })

  // -----------------------------
  // STEP-WISE REQUIRED VALIDATION
  // -----------------------------
  .superRefine((data, ctx) => {
    /** Step-1: Resume is required */
    if (!data.resume && !data.resumeS3Key) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Resume is required",
        path: ["resume"],
      });
    }

    /** Step-2 validation only on submit */
    if (data.step !== 2) return;

    const requiredFields: (keyof typeof data)[] = [
      "interviewerName",
      "startTime",
      "endTime",
      "interviewType",
      "interviewStatus",
    ];

    requiredFields.forEach((field) => {
      const value = data[field];
      if (!value || String(value).trim() === "") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `${field} is required`,
          path: [field],
        });
      }
    });

    /** Video call URL rule */
    if (data.interviewType === "video_call") {
      if (!data.interviewUrl) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "URL is required for video calls",
          path: ["interviewUrl"],
        });
      } else {
        try {
          new URL(data.interviewUrl);
        } catch {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Must be a valid URL",
            path: ["interviewUrl"],
          });
        }
      }
    }
  });

export type InterviewFormValues = z.infer<typeof interviewFormSchema>;
