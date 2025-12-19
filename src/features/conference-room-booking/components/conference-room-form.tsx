/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarClock, Check } from "lucide-react";

import {
  ConferenceRoomFormValues,
  conferenceRoomBookingFormSchema,
} from "../schema";
import { ConferenceRoomEvent } from "../types";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
// import { Textarea } from "@/components/ui/textarea";
// import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

// --- Import your custom components and constants ---
import CustomDropDownSearchable from "@/components/shared/custome-searchable-dropdown";
import { recurringTypes } from "../constants";
import TimePicker from "@/components/shared/custome-timepicker";
import { CustomDatePicker } from "@/components/shared/custome-datePicker";

interface ConferenceRoomFormProps {
  selectedDate: Date;
  onSubmit: (data: ConferenceRoomFormValues) => void;
  onClose: () => void;
  projectsList: any;
  projectsListLoading: boolean;
  isSubmitting?: boolean;
  initialData?: any; // ConferenceRoomApiResponse for edit mode
  existingEvents?: ConferenceRoomEvent[];
}

const steps = [{ id: 1, name: "Meeting Details", icon: CalendarClock }];

const step1Fields: (keyof ConferenceRoomFormValues)[] = [
  "meetingName",
  "projectId",
  "color",
  "startTime",
  "endTime",
  "recurringType",
  "endDate",
  "recurringType",
  "endDate",
  "daysOfWeek",
  "notes",
];

const DAYS_OF_WEEK = [
  { id: "mon", label: "Mon" },
  { id: "tue", label: "Tue" },
  { id: "wed", label: "Wed" },
  { id: "thu", label: "Thu" },
  { id: "fri", label: "Fri" },
  { id: "sat", label: "Sat" },
  { id: "sun", label: "Sun" },
] as const;

export const ConferenceRoomForm = ({
  // selectedDate,
  onSubmit,
  onClose,
  projectsList,
  projectsListLoading,
  isSubmitting = false,
  initialData,
  // existingEvents = [],
}: ConferenceRoomFormProps) => {
  const currentStep = 1;
  const isEditMode = !!initialData;

  const form = useForm<ConferenceRoomFormValues>({
    resolver: zodResolver(
      conferenceRoomBookingFormSchema
    ) as Resolver<ConferenceRoomFormValues>,
    mode: "onSubmit",
    reValidateMode: "onChange",
    defaultValues: {
      meetingName: "",
      projectId: "",
      color: "#2563eb",
      startTime: "10:00",
      endTime: "11:00",
      recurringType: "none",
      notes: "",
      endDate: undefined,
      daysOfWeek: {
        mon: false,
        tue: false,
        wed: false,
        thu: false,
        fri: false,
        sat: false,
        sun: false,
      },
    },
  });

  // const extractTime = (isoString: string) => {
  //   if (!isoString) return "";
  //   const date = new Date(isoString);
  //   const h = String(date.getHours()).padStart(2, "0");
  //   const m = String(date.getMinutes()).padStart(2, "0");
  //   return `${h}:${m}`;
  // };

  const toHM = (timeStr: string) => {
    if (!timeStr) return "";
    const [h, m] = timeStr.split(":");
    return `${h}:${m}`;
  };

  const extractDate = (isoString: string): Date | undefined => {
    if (!isoString) return undefined;
    return new Date(isoString);
  };

  useEffect(() => {
    if (initialData && currentStep === 1) {
      const formData: any = {
        meetingName: initialData.meetingName || "",
        projectId: initialData.projectId?.toString() || "",
        startTime: toHM(initialData.startTime),
        endTime: toHM(initialData.endTime),
        recurringType: initialData.recurringType || "none",
        notes: initialData.notes || "",
        color: initialData.color || "#2563eb",
      };

      // Add endDate for recurring bookings
      if (initialData.recurringType && initialData.recurringType !== "none") {
        formData.endDate = extractDate(initialData.endDate);
      }

      if (initialData.recurringType === "daily" && initialData.daysOfWeek) {
        formData.daysOfWeek = initialData.daysOfWeek;
      }

      form.reset(formData);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialData, currentStep]);

  const { trigger, formState } = form;
  const startTime = form.watch("startTime");
  const recurringType = form.watch("recurringType");

  // Removed auto-increment of end time - user can now select any duration

  const handleFormSubmit = async (data: ConferenceRoomFormValues) => {
    const isValid = await trigger(step1Fields, { shouldFocus: true });

    if (isValid) {
      // --- Client-Side Overlap Validation ---
      // const parseDateTime = (dateStr: Date | string, timeStr: string) => {
      //   const d = new Date(dateStr);
      //   const [h, m] = timeStr.split(":").map(Number);
      //   d.setHours(h, m, 0, 0);
      //   return d;
      // };

      // Only validate for single instances for now or the start of a recurring series
      // Validating entire recurring series on client side against other series is complex
      // and usually better handled by backend or strict "slot availability" API.
      // Here we validate the *first* instance or the single booking.

      // --- recurring date generation helper ---
      // const generateRecurringDates = (
      //   start: Date,
      //   end: Date | undefined,
      //   type: string,
      //   days: any
      // ): Date[] => {
      //   const dates: Date[] = [];
      //   const current = new Date(start);
      //   // If no end date for recurring, default to occurrence limit or some reasonable future limit
      //   // For UI validation, if endDate is missing, we might just validate the start date (or assume single occurrence for safety)
      //   // But schema usually requires endDate for recurring.
      //   const limitDate = end ? new Date(end) : new Date(start);
      //   limitDate.setHours(23, 59, 59, 999); // ensure we include the full end day

      //   // If 'none', just return start
      //   if (type === "none") return [new Date(start)];

      //   while (current <= limitDate) {
      //     if (type === "daily") {
      //       // For daily, check if current day of week is selected
      //       // daysOfWeek keys: mon, tue, wed, thu, fri, sat, sun
      //       // current.getDay(): 0=Sun, 1=Mon, ..., 6=Sat
      //       const mapDay: Record<number, string> = {
      //         0: "sun",
      //         1: "mon",
      //         2: "tue",
      //         3: "wed",
      //         4: "thu",
      //         5: "fri",
      //         6: "sat",
      //       };
      //       const dayKey = mapDay[current.getDay()];
      //       if (days && days[dayKey]) {
      //         dates.push(new Date(current));
      //       }
      //     } else if (type === "weekly") {
      //       dates.push(new Date(current)); // already initialized to start date, so adds first, then adds 7 days
      //     } else if (type === "biweekly") {
      //       dates.push(new Date(current));
      //     } else if (type === "monthly") {
      //       dates.push(new Date(current));
      //     }

      //     // Advance current date
      //     if (type === "daily") {
      //       current.setDate(current.getDate() + 1);
      //     } else if (type === "weekly") {
      //       current.setDate(current.getDate() + 7);
      //     } else if (type === "biweekly") {
      //       current.setDate(current.getDate() + 14);
      //     } else if (type === "monthly") {
      //       current.setMonth(current.getMonth() + 1);
      //     } else {
      //       break; // prevent infinite loop for unknown types
      //     }
      //   }
      //   return dates;
      // };

      // const baseStart = selectedDate || new Date(initialData.startDate);
      // const instancesToCheck = generateRecurringDates(
      //   baseStart,
      //   data.endDate ? new Date(data.endDate) : undefined,
      //   data.recurringType,
      //   data.daysOfWeek
      // );

      // Loop through all instances
      // let overlappingEventFound = false;

      // for (const instanceDate of instancesToCheck) {
      //   const currentStart = parseDateTime(instanceDate, data.startTime);
      //   const currentEnd = parseDateTime(instanceDate, data.endTime);

      //   const hasOverlap = existingEvents.some((event) => {
      //     if (initialData && String(initialData.id) === event.id) {
      //       return false;
      //     }

      //     const eventStart = new Date(event.start || "");
      //     const eventEnd = new Date(event.end || "");

      //     // Check if event is on the same day as this instance
      //     const isSameDay =
      //       currentStart.getFullYear() === eventStart.getFullYear() &&
      //       currentStart.getMonth() === eventStart.getMonth() &&
      //       currentStart.getDate() === eventStart.getDate();

      //     if (!isSameDay) return false;

      //     return currentStart < eventEnd && currentEnd > eventStart;
      //   });

      //   if (hasOverlap) {
      //     overlappingEventFound = true;
      //     break; // Stop checking if we found one
      //   }
      // }

      // if (overlappingEventFound) {
      //   form.setError("startTime", {
      //     type: "manual",
      //     message: "Time slot overlaps with existing meeting",
      //   });
      //   form.setError("endTime", {
      //     type: "manual",
      //     message: "Time slot overlaps with existing meeting",
      //   });
      //   return;
      // }

      onSubmit(data);
    } else {
      // Scroll to first error
      const step1Errors = step1Fields.filter(
        (field) => formState.errors[field]
      );
      if (step1Errors.length > 0) {
        const firstError = step1Errors[0];
        const errorElement = document.querySelector(`[name="${firstError}"]`);
        if (errorElement) {
          errorElement.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
        }
      }
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit(handleFormSubmit)();
        }}
        className="space-y-4"
      >
        {/* --- Stepper Navigation --- */}
        <nav className="flex items-center justify-center mb-4 sm:mb-6 px-2">
          {steps.map((step, index) => (
            <div
              key={step.id}
              className="flex items-center flex-1 sm:flex-initial"
            >
              <div className="flex flex-col items-center w-full sm:w-auto">
                <div
                  className={cn(
                    "w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-bold transition-all text-xs sm:text-sm",
                    currentStep > step.id
                      ? "bg-primary text-primary-foreground"
                      : currentStep === step.id
                        ? "bg-primary/90 text-primary-foreground border-2 border-primary-foreground shadow-lg"
                        : "bg-muted text-muted-foreground"
                  )}
                >
                  {currentStep > step.id ? (
                    <Check className="h-4 w-4 sm:h-5 sm:w-5" />
                  ) : (
                    <step.icon className="h-4 w-4 sm:h-5 sm:w-5" />
                  )}
                </div>
                <p
                  className={cn(
                    "mt-1 sm:mt-2 text-xs sm:text-sm text-center px-1",
                    currentStep >= step.id
                      ? "text-primary font-medium"
                      : "text-muted-foreground"
                  )}
                >
                  <span className="hidden sm:inline">{step.name}</span>
                  <span className="sm:hidden">Meeting</span>
                </p>
              </div>
              {index < steps.length - 1 && (
                <div className="flex-auto border-t-2 mx-2 sm:mx-4 transition-all hidden sm:block" />
              )}
            </div>
          ))}
        </nav>

        <Card className="border-none shadow-none max-h-[50vh] sm:max-h-[60vh] overflow-y-auto p-1">
          {/* --- Step 1: Meeting Details --- */}
          {currentStep === 1 && (
            <CardContent className="p-2 sm:p-4">
              <div className="space-y-4 rounded-md border p-3 sm:p-4">
                <h3 className="text-base sm:text-lg font-medium">
                  Meeting Details
                </h3>
                <div className="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="meetingName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Meeting Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Team Standup" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <CustomDropDownSearchable
                    form={form}
                    name="projectId"
                    label="Project"
                    options={projectsList?.data?.map((project: any) => {
                      return { value: project.id, label: project.name };
                    })}
                    placeholder="Select project"
                    isLoading={projectsListLoading}
                    sortOptions={false}
                  />
                  <FormField
                    control={form.control}
                    name="startTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Start Time</FormLabel>
                        <FormControl>
                          <TimePicker
                            value={field.value}
                            onChange={field.onChange}
                            placeholder="Select start time"
                            className={cn(
                              form.formState.errors.startTime &&
                                "border-destructive"
                            )}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="endTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>End Time</FormLabel>
                        <FormControl>
                          <TimePicker
                            minTime={startTime}
                            value={field.value}
                            onChange={field.onChange}
                            placeholder="Select end time"
                            className={cn(
                              form.formState.errors.endTime &&
                                "border-destructive"
                            )}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <CustomDropDownSearchable
                    form={form}
                    name="recurringType"
                    label="Recurring Type"
                    options={recurringTypes}
                    placeholder="Select recurring type"
                    searchEnabled={false}
                  />

                  {/* {recurringType && recurringType !== "daily" && (
                    <CustomDropDownSearchable
                      form={form}
                      name="recurringType"
                      label="Recurring Type"
                      options={recurringTypes}
                      placeholder="Select recurring type"
                      searchEnabled={false}
                    />
                  )} */}

                  {recurringType && recurringType !== "none" && (
                    <CustomDatePicker
                      control={form.control as any}
                      name="endDate"
                      label="Recurring End Date"
                      placeholder="Select end date for recurring"
                    />
                  )}

                  {recurringType === "daily" && (
                    <FormField
                      control={form.control}
                      name="daysOfWeek"
                      render={() => (
                        <FormItem className="col-span-1 md:col-span-2">
                          <FormLabel className="text-sm font-semibold text-foreground">
                            Select Days for Daily Recurring Meeting
                          </FormLabel>
                          <div className="flex flex-wrap gap-2">
                            {DAYS_OF_WEEK.map((day) => (
                              <FormField
                                key={day.id}
                                control={form.control}
                                name={`daysOfWeek.${day.id}`}
                                render={({ field }) => (
                                  <FormItem className="space-y-0">
                                    <FormControl>
                                      <div
                                        onClick={() =>
                                          field.onChange(!field.value)
                                        }
                                        className={cn(
                                          "flex h-9 min-w-[3rem] cursor-pointer items-center justify-center rounded-md border text-xs font-medium transition-all select-none shadow-sm hover:shadow-md",
                                          field.value
                                            ? "border-primary bg-gradient-primary text-primary-foreground hover:bg-primary/90"
                                            : "border-input bg-background text-muted-foreground hover:bg-accent hover:text-accent-foreground hover:border-accent-foreground/30"
                                        )}
                                      >
                                        {day.label}
                                      </div>
                                    </FormControl>
                                  </FormItem>
                                )}
                              />
                            ))}
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  <FormField
                    control={form.control}
                    name="color"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Meeting Color</FormLabel>
                        <FormControl>
                          <div className="flex items-center gap-3">
                            {/*  Color Picker */}
                            <input
                              type="color"
                              value={field.value}
                              onChange={(e) => field.onChange(e.target.value)}
                              className="h-10 w-12 cursor-pointer rounded border"
                            />

                            {/*  Manual HEX Input */}
                            <Input
                              value={field.value}
                              onChange={(e) => field.onChange(e.target.value)}
                              placeholder="#2563eb"
                              className="font-mono"
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Show end date field only when recurring type is not "none" */}

                  {/* <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel>Notes</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Any additional notes about the meeting..."
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  /> */}
                </div>
              </div>
            </CardContent>
          )}
        </Card>

        {/* --- Navigation Buttons --- */}
        <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-2 pt-4 border-t">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            className="w-full sm:w-auto order-2 sm:order-1"
          >
            Cancel
          </Button>
          <div className="flex gap-2 w-full sm:w-auto order-1 sm:order-2">
            <Button
              type="submit"
              className="flex-1 sm:flex-initial"
              disabled={isSubmitting}
            >
              {isEditMode
                ? "Update Booking"
                : isSubmitting
                  ? "Booking..."
                  : "Book Conference Room"}
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
};
