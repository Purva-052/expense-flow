import * as z from "zod";

export const conferenceRoomBookingFormSchema = z
  .object({
    meetingName: z.string().min(1, "Meeting name is required"),
    projectId: z.preprocess((val) => {
      if (val === "" || val === null) return undefined;
      return String(val); // number -> string
    }, z.string().optional()),
    startTime: z.string().min(1, "Start time is required"),
    endTime: z.string().min(1, "End time is required"),
    meetingType: z
      .string()
      .nullable()
      .refine((val) => val !== null && val !== "", {
        message: "Meeting type is required",
      }),
    recurringType: z.any().refine(
      (val) => {
        return val != null && val !== "" && String(val).trim().length > 0;
      },
      {
        message: "Recurring type is required",
      }
    ),
    notes: z.string().optional(),
    // Optional endDate for recurring bookings (startDate comes from calendar selection)
    startDate: z.date(),
    endDate: z.date().optional(),
    daysOfWeek: z
      .object({
        mon: z.boolean().optional(),
        tue: z.boolean().optional(),
        wed: z.boolean().optional(),
        thu: z.boolean().optional(),
        fri: z.boolean().optional(),
        sat: z.boolean().optional(),
        sun: z.boolean().optional(),
      })
      .optional(),
  })
  .refine(
    (data) => {
      if (data.startTime && data.endTime) {
        const [startHours, startMinutes] = data.startTime
          .split(":")
          .map(Number);
        const [endHours, endMinutes] = data.endTime.split(":").map(Number);
        const startTotal = startHours * 60 + startMinutes;
        const endTotal = endHours * 60 + endMinutes;
        return endTotal > startTotal;
      }
      return true;
    },
    {
      message: "End time must be after start time",
      path: ["endTime"],
    }
  )
  .refine(
    (data) => {
      // If recurring type is not "none", endDate is required
      if (data.recurringType && data.recurringType !== "none") {
        return !!data.endDate;
      }
      return true;
    },
    {
      message: "End date is required for recurring bookings",
      path: ["endDate"],
    }
  )
  .refine(
    (data) => {
      // If recurring type is "daily", at least one day must be selected
      if (data.recurringType === "daily" && data.daysOfWeek) {
        const hasAtLeastOneDay = Object.values(data.daysOfWeek).some(
          (day) => day === true
        );
        return hasAtLeastOneDay;
      }
      return true;
    },
    {
      message: "Please select at least one day for daily recurring meetings",
      path: ["daysOfWeek"],
    }
  );

// Export the inferred TypeScript type for use in your components
export type ConferenceRoomFormValues = z.infer<
  typeof conferenceRoomBookingFormSchema
>;
