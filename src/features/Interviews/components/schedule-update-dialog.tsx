/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import CustomDropDownSearchable from "@/components/shared/custome-searchable-dropdown";
import { interviewTypes, interviewStatuses } from "../constants";
import TimePicker from "@/components/shared/custome-timepicker";
import { roles } from "@/utils/constant";
import { useAuthStore } from "@/stores/use-auth-store";
import { CustomDatePicker } from "@/components/shared/custome-datePicker";
import { InterviewApiResponse } from "../types";

// Schema for schedule update (only step 2 fields)
const scheduleUpdateSchema = z
  .object({
    interviewerName: z.any().refine(
      (val) => {
        return val != null && val !== "" && String(val).trim().length > 0;
      },
      {
        message: "Interviewer Name is required",
      }
    ),
    startTime: z.string().min(1, "Start time is required"),
    endTime: z.string().min(1, "End time is required"),
    interviewType: z.any().refine(
      (val) => {
        return val != null && val !== "" && String(val).trim().length > 0;
      },
      {
        message: "Interview type is required",
      }
    ),
    interviewUrl: z.string().optional(),
    notes: z.string().trim().optional(),
    interviewStatus: z.any().refine(
      (val) => {
        return val != null && val !== "" && String(val).trim().length > 0;
      },
      {
        message: "Interview Status is required",
      }
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
        {
          message: "Invalid date format.",
        }
      ),
    statusChangedDate: z
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
  )
  .refine(
    (data) => {
      if (data.statusChangedDate && data.interviewStatus) {
        return true;
      }
      return true;
    },
    {
      message: "Status changed date is required",
      path: ["statusChangedDate"],
    }
  );

type ScheduleUpdateFormValues = z.infer<typeof scheduleUpdateSchema>;

interface ScheduleUpdateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData: InterviewApiResponse;
  onSubmit: (data: ScheduleUpdateFormValues) => void;
  usersList: any;
  usersListLoading: boolean;
  isSubmitting?: boolean;
}

const RequiredIndicator = ({ error }: { error?: boolean }) => (
  <span className={cn("ml-1", error ? "text-red-500" : "text-red-500")}>*</span>
);

export const ScheduleUpdateDialog = ({
  open,
  onOpenChange,
  initialData,
  onSubmit,
  usersList,
  usersListLoading,
  isSubmitting = false,
}: ScheduleUpdateDialogProps) => {
  const user = useAuthStore((state) => state.user);
  const userRole = user?.user?.role;
  const [isSubmittingForm, setIsSubmittingForm] = useState(false);

  const extractTime = (isoString: string) => {
    if (!isoString) return "";
    const date = new Date(isoString);
    const h = String(date.getHours()).padStart(2, "0");
    const m = String(date.getMinutes()).padStart(2, "0");
    return `${h}:${m}`;
  };

  const baseStatuses = interviewStatuses;
  const EDIT_STATUSES = [
    "technical_round",
    "practical_round",
    "hr_round",
    "joining",
    "rejected",
  ];

  const filteredStatuses =
    userRole === roles.ADMIN
      ? baseStatuses
      : baseStatuses.filter((s) => EDIT_STATUSES.includes(s.value));

  // Adjust schema based on role and status
  let activeSchema = scheduleUpdateSchema;
  if (userRole === roles.ADMIN) {
    activeSchema = scheduleUpdateSchema.refine(
      (data) => {
        if (data.interviewStatus !== "joining") return true;
        const val = data.joiningDate;
        if (val instanceof Date) return true;
        return !!val && typeof val === "string" && val.trim().length > 0;
      },
      {
        message: "Joining Date is required when status is Joining",
        path: ["joiningDate"],
      }
    ) as any;
  }

  const form = useForm<ScheduleUpdateFormValues>({
    resolver: zodResolver(activeSchema),
    mode: "onBlur",
    reValidateMode: "onChange",
    defaultValues: {
      interviewerName: "",
      startTime: "10:00",
      endTime: "11:00",
      interviewType: "on_site",
      interviewUrl: "",
      notes: "",
      interviewStatus: "",
      joiningDate: "",
      statusChangedDate: "",
    },
  });

  useEffect(() => {
    if (initialData && open) {
      form.reset({
        interviewerName: initialData.interviewer?.id?.toString() || "",
        startTime: extractTime(initialData.interviewStart),
        endTime: extractTime(initialData.interviewEnd),
        interviewType: initialData.interviewType || "on_site",
        interviewUrl: initialData.interviewUrl || "",
        notes: initialData.notes || "",
        interviewStatus: initialData.status || "",
        joiningDate: initialData.joiningDate || "",
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialData, open]);

  const interviewType = form.watch("interviewType");
  const interviewStatus = form.watch("interviewStatus");
  const startTime = form.watch("startTime");

  // Automatically set endTime to startTime + 30 minutes
  useEffect(() => {
    if (startTime) {
      const [hours, minutes] = startTime.split(":").map(Number);
      const startDate = new Date();
      startDate.setHours(hours, minutes, 0, 0);

      const endDate = new Date(startDate.getTime() + 30 * 60 * 1000);

      const endHours = String(endDate.getHours()).padStart(2, "0");
      const endMinutes = String(endDate.getMinutes()).padStart(2, "0");
      const calculatedEndTime = `${endHours}:${endMinutes}`;

      form.setValue("endTime", calculatedEndTime, { shouldValidate: false });
    }
  }, [startTime, form]);

  // Re-validate interviewUrl when interviewType changes
  useEffect(() => {
    if (interviewType) {
      form.trigger("interviewUrl");
    }
  }, [interviewType, form]);

  // Reset submission state on unmount
  useEffect(() => {
    return () => {
      setIsSubmittingForm(false);
    };
  }, []);

  const handleFormSubmit = async (data: ScheduleUpdateFormValues) => {
    if (isSubmittingForm) return;

    setIsSubmittingForm(true);
    try {
      onSubmit(data);
    } catch (error) {
      console.error("Form submission error", error);
      setIsSubmittingForm(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] sm:w-full sm:max-w-[700px] p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle>Update Interview Schedule</DialogTitle>
          <DialogDescription>
            Update the scheduling details for this interview.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation();
              form.handleSubmit(handleFormSubmit)();
            }}
            className="space-y-4"
          >
            <div className="space-y-4 rounded-md border p-3 sm:p-4 max-h-[60vh] overflow-y-auto">
              <h3 className="text-base sm:text-lg font-medium">
                Scheduling Details
              </h3>
              <div className="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2">
                <div>
                  <FormField
                    control={form.control}
                    name="interviewerName"
                    render={({ fieldState }) => (
                      <FormItem>
                        <FormLabel
                          className={cn(
                            "flex items-center gap-1",
                            fieldState.error && "text-red-500"
                          )}
                        >
                          Interviewer Name
                          <span className="text-red-500">*</span>
                        </FormLabel>

                        <CustomDropDownSearchable
                          form={form}
                          name="interviewerName"
                          label=""
                          options={usersList?.data?.map((user: any) => ({
                            value: user.id,
                            label: user.fullName,
                          }))}
                          placeholder="Select interviewer"
                          isLoading={usersListLoading}
                        />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="startTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Interview Time</FormLabel>
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
                <div>
                  <FormField
                    control={form.control}
                    name="interviewType"
                    render={({ fieldState }) => (
                      <FormItem>
                        <FormLabel
                          className={cn(
                            "flex items-center gap-1",
                            fieldState.error && "text-red-500"
                          )}
                        >
                          Interview Type
                          <span className="text-red-500">*</span>
                        </FormLabel>
                        <CustomDropDownSearchable
                          form={form}
                          name="interviewType"
                          label=""
                          options={interviewTypes}
                          placeholder="Select type"
                          searchEnabled={false}
                        />
                      </FormItem>
                    )}
                  />
                </div>
                {interviewType === "video_call" && (
                  <>
                    <FormField
                      control={form.control}
                      name="interviewUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Interview URL
                            <RequiredIndicator
                              error={!!form.formState.errors.interviewUrl}
                            />
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="https://meet.google.com/..."
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </>
                )}
                <div>
                  <FormField
                    control={form.control}
                    name="interviewStatus"
                    render={({ fieldState }) => (
                      <FormItem>
                        <FormLabel
                          className={cn(
                            "flex items-center gap-1",
                            fieldState.error && "text-red-500"
                          )}
                        >
                          Interview Status
                          <span className="text-red-500">*</span>
                        </FormLabel>
                        <CustomDropDownSearchable
                          form={form}
                          name="interviewStatus"
                          label=""
                          options={filteredStatuses}
                          placeholder="Select status"
                          searchEnabled={false}
                          sortOptions={false}
                        />
                      </FormItem>
                    )}
                  />
                </div>

                {initialData && interviewStatus !== initialData.status && (
                  <CustomDatePicker
                    control={form.control}
                    name="statusChangedDate"
                    label="Status Changed Date"
                  />
                )}

                {userRole === roles.ADMIN && interviewStatus === "joining" && (
                  <CustomDatePicker
                    control={form.control}
                    name="joiningDate"
                    label="Joining Date"
                  />
                )}

                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Interviewer Comment</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Instructions or notes for the interviewer..."
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-2 pt-4 border-t">
              <Button
                type="button"
                variant="ghost"
                onClick={() => onOpenChange(false)}
                className="w-full sm:w-auto"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="w-full sm:w-auto"
                disabled={isSubmitting || isSubmittingForm}
              >
                {isSubmitting || isSubmittingForm
                  ? "Updating..."
                  : "Update Schedule"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
