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

// Schema for an individual day row in the table
const dayRowSchema = z
  .object({
    date: z.string(),
    dayName: z.string().optional(),
    dayType: z.enum(["full", "half"]),
    halfType: z.enum(["first_half", "second_half"]).nullable().optional(),
    description: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.dayType === "half") {
        return !!data.halfType;
      }
      return true;
    },
    {
      message: "Session required",
      path: ["halfType"],
    }
  );

export const leaveSchema = z
  .object({
    employeeId: numberField("Employee"),
    reason: z.string().trim().min(2, "Reason is required"),

    // Create Mode Fields
    fromDate: z.date().optional(),
    toDate: z.date().optional(),

    // The array of days for the table
    leaveDays: z.array(dayRowSchema).optional(),

    // Edit Mode Fields (Single day)
    leaveDate: z.date().optional(),
    dayType: z.enum(["full", "half"]).optional(),
    halfType: z.enum(["first_half", "second_half"]).optional(),
    description: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    // Validation logic
    if (!data.leaveDate) {
      // Create Mode Validations
      if (!data.fromDate) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Start date is required",
          path: ["fromDate"],
        });
      }
      if (!data.toDate) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "End date is required",
          path: ["toDate"],
        });
      }
      if (data.fromDate && data.toDate && data.fromDate > data.toDate) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Invalid Date Range",
          path: ["fromDate"],
        });
      }
      // Ensure days array is populated in Create Mode
      if (
        (!data.leaveDays || data.leaveDays.length === 0) &&
        data.fromDate &&
        data.toDate
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Please configure leave days",
          path: ["leaveDays"],
        });
      }
    } else {
      // Edit Mode Validations
      if (data.dayType === "half" && !data.halfType) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Session is required",
          path: ["halfType"],
        });
      }
    }
  });

export type TLeaveFormSchema = z.infer<typeof leaveSchema>;
