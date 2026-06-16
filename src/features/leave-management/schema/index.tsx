/* eslint-disable @typescript-eslint/no-explicit-any */
import * as z from "zod";

const numberField = (fieldName: string) =>
  z.preprocess(
    (val) => {
      if (val === "" || val === null || val === undefined) return undefined;
      const parsed = Number(val);
      return isNaN(parsed) ? undefined : parsed;
    },
    z.number({
      required_error: `${fieldName} is required`,
      invalid_type_error: `${fieldName} is required`,
    })
  );

const leaveDaySchema = z.object({
  date: z.string(),
  dayName: z.string(),
  isWeekend: z.boolean().optional(),
  dayType: z.enum(["full", "half"]),
  halfType: z.enum(["first_half", "second_half"]).nullable().optional(),
});

export const leaveSchema = z
  .object({
    // Optional – only required when applying for another employee (Admin/PM "For Others" tab)
    employeeId: numberField("Employee").optional(),

    isExamLeave: z.boolean().optional(),

    // Leave type — "1" = Casual, "2" = Paid (maps to LEAVE_TYPE constant values)
    leaveTypeId: z.string().min(1, "Leave type is required"),

    reason: z.string().trim().min(2, "Reason is required"),

    description: z.string().optional(),

    fromDate: z.date({ required_error: "Start date is required" }),
    toDate: z.date({ required_error: "End date is required" }),

    // Per-day configuration (generated from date range)
    leaveDays: z
      .array(leaveDaySchema)
      .min(1, "Please select at least a half-day or full-day leave."),

    attachments: z
      .any()
      .optional()
      .nullable()
      .refine(
        (file) => {
          if (!file) return true;
          // Accept: new File upload, plain string URL, or array of attachment objects from API
          return (
            file instanceof File ||
            typeof file === "string" ||
            Array.isArray(file)
          );
        },
        { message: "Attachment must be a file or URL" }
      )
      .refine(
        (file) => {
          if (!file || !(file instanceof File)) return true;
          return file.size <= 5 * 1024 * 1024; // 5 MB
        },
        { message: "File size must be less than 5MB" }
      )
      .refine(
        (file) => {
          if (!file || !(file instanceof File)) return true;
          const validTypes = ["application/pdf", "image/jpeg", "image/jpg"];
          return validTypes.includes(file.type);
        },
        { message: "Only PDF and JPEG formats are allowed" }
      ),
  })
  .superRefine((data, ctx) => {
    if (data.fromDate && data.toDate && data.fromDate > data.toDate) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Invalid Date Range",
        path: ["fromDate"],
      });
    }
    // Validate each half day has a halfType
    data.leaveDays?.forEach((day, idx) => {
      if (day.dayType === "half" && !day.halfType) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Session required for half day",
          path: ["leaveDays", idx, "halfType"],
        });
      }
    });
  });

export type TLeaveFormSchema = z.infer<typeof leaveSchema>;
export type TLeaveDaySchema = z.infer<typeof leaveDaySchema>;
