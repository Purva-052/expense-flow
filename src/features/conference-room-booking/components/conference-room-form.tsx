/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarClock, Check } from "lucide-react";

import {
  ConferenceRoomFormValues,
  conferenceRoomBookingFormSchema,
} from "../schema";
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
}

const steps = [{ id: 1, name: "Meeting Details", icon: CalendarClock }];

const step1Fields: (keyof ConferenceRoomFormValues)[] = [
  "meetingName",
  "projectId",
  "startTime",
  "endTime",
  "recurringType",
  "endDate",
  "notes",
];

export const ConferenceRoomForm = ({
  onSubmit,
  onClose,
  projectsList,
  projectsListLoading,
  isSubmitting = false,
  initialData,
}: ConferenceRoomFormProps) => {
  const currentStep = 1;
  const isEditMode = !!initialData;

  const form = useForm<ConferenceRoomFormValues>({
    resolver: zodResolver(conferenceRoomBookingFormSchema),
    mode: "onSubmit",
    reValidateMode: "onChange",
    defaultValues: {
      meetingName: "",
      projectId: "",
      startTime: "10:00",
      endTime: "11:00",
      recurringType: "none",
      notes: "",
      endDate: undefined,
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
      };

      // Add endDate for recurring bookings
      if (initialData.recurringType && initialData.recurringType !== "none") {
        formData.endDate = extractDate(initialData.endDate);
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

                  {/* Show end date field only when recurring type is not "none" */}
                  {recurringType && recurringType !== "none" && (
                    <CustomDatePicker
                      control={form.control}
                      name="endDate"
                      label="End Date"
                      placeholder="Select end date for recurring"
                    />
                  )}
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
