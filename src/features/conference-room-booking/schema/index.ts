import * as z from "zod";

export const conferenceRoomBookingFormSchema = z
  .object({
    meetingName: z.string().min(1, "Meeting name is required"),
    projectId: z.preprocess(
      (val) => (val === "" ? undefined : val),
      z.string().optional()
    ),
    color: z
      .string()
      .regex(/^#([0-9A-Fa-f]{6})$/, "Invalid HEX color")
      .optional(),
    startTime: z.string().min(1, "Start time is required"),
    endTime: z.string().min(1, "End time is required"),
    recurringType: z.string().min(1, "Recurring type is required"),
    notes: z.string().optional(),
    // Optional endDate for recurring bookings (startDate comes from calendar selection)
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
  );

// Export the inferred TypeScript type for use in your components
export type ConferenceRoomFormValues = z.infer<
  typeof conferenceRoomBookingFormSchema
>;
