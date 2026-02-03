"use client";

import API from "@/config/api/api";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
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
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { DailyReport } from "../schema";
import { ProjectSelect } from "./project-select";
import {
  useUpdateDailyReport,
  useGetProjectMilestonesList,
  useGetTasksDropdownList,
  useGetDailyReportById,
  useCreateDailyReport,
} from "../services";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useAuthStore } from "@/stores/use-auth-store";
import SimpleDropDownSearchable from "@/components/shared/custome-simple-dropdown";
import { CustomDatePicker } from "@/components/shared/custome-datePicker";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { WorkDescriptionEditor } from "@/components/shared/work-description-editor";

const formSchema = z.object({
  reportingDate: z.date({ required_error: "Date is required" }),
  employeeName: z.string().optional(),
  projectId: z
    .union([z.string(), z.null()])
    .refine((val) => val && val.length > 0, {
      message: "Project is required",
    }),
  milestoneId: z.union([z.string(), z.null()]).optional(),
  taskId: z
    .union([z.string(), z.null()])
    .refine((val) => val && val.length > 0, {
      message: "Task is required",
    }),
  taskDescription: z
    .string({ required_error: "Description is required" })
    .min(1, "Description is required"),
  hours: z.string().refine((v) => Number(v) >= 0, "Invalid hours"),
  minutes: z.string().refine((v) => Number(v) >= 0, "Invalid minutes"),
  remark: z.string().optional(),
});

interface DailyReportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  report?: DailyReport | null; // For Edit mode
  initialData?: {
    projectId?: string | number;
    milestoneId?: string | number;
    taskId?: string | number;
  };
  onSuccess?: () => void;
  isView?: boolean;
  isDescriptionOnly?: boolean;
}

const parseTimeSpent = (time: any) => {
  let h = "0";
  let m = "00";

  if (!time) return { h, m };

  const timeStr = String(time).trim();
  const formatHour = (val: string) => String(parseInt(val || "0", 10));

  // Helper to ensure minutes are 2 digits (e.g. "5" -> "05")
  const formatMinute = (val: string) => {
    const num = parseInt(val || "0", 10);
    return String(num).padStart(2, "0");
  };

  // "6h10m"
  const hmMatch = timeStr.match(/(\d+)h(\d+)m/);
  if (hmMatch) {
    h = formatHour(hmMatch[1]);
    m = formatMinute(hmMatch[2]);
    return { h, m };
  }

  // "6h"
  const hMatch = timeStr.match(/(\d+)h$/);
  if (hMatch) {
    h = formatHour(hMatch[1]);
    return { h, m };
  }

  // "10m"
  const mMatch = timeStr.match(/^(\d+)m$/);
  if (mMatch) {
    m = formatMinute(mMatch[1]);
    return { h, m };
  }

  if (timeStr.includes(".")) {
    const [hoursPart, minutesPart] = timeStr.split(".");
    h = formatHour(hoursPart);
    m = formatMinute(minutesPart);
    return { h, m };
  }

  // Fallback: treat as hours only
  h = formatHour(timeStr);
  return { h, m };
};

// --- MAIN COMPONENT ---
export function DailyReportDialog({
  open,
  onOpenChange,
  report,
  initialData,
  onSuccess,
  isView,
  isDescriptionOnly,
}: DailyReportDialogProps) {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const isEdit = !!report;

  const { data: reportData, isPending: isReportLoading }: any =
    useGetDailyReportById(isEdit ? String(report?.id || "") : "");

  const fetchedReport = Array.isArray(reportData?.data)
    ? reportData.data.find(
        (item: any) => String(item.id) === String(report?.id)
      ) || reportData.data[0]
    : reportData?.data;

  const { mutate: updateReport, isPending: isUpdating } = useUpdateDailyReport(
    String(report?.id),
    () => {
      queryClient.invalidateQueries({ queryKey: [API.daily_report.list] });
      if (onSuccess) onSuccess();
      onOpenChange(false);
    }
  );

  const { mutate: createReport, isPending: isCreating } = useCreateDailyReport(
    () => {
      queryClient.invalidateQueries({ queryKey: [API.daily_report.list] });
      if (onSuccess) onSuccess();
      onOpenChange(false);
    }
  );

  // FIX 2: Set default minutes to "00" (string) to match Select options
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      reportingDate: new Date(),
      employeeName: String(user?.user?.id || ""),
      projectId: "",
      milestoneId: "",
      taskId: "",
      taskDescription: "",
      hours: "0",
      minutes: "00",
      remark: "",
    },
  });

  useEffect(() => {
    if (open) {
      if (isEdit && fetchedReport) {
        // Parse time safely
        const { h, m } = parseTimeSpent(fetchedReport.timeSpent);
        form.reset({
          reportingDate: new Date(fetchedReport.reportingDate),
          employeeName: String(fetchedReport.employee?.id || ""),
          projectId: String(fetchedReport.project?.id || ""),
          milestoneId: String(fetchedReport.milestone?.id || ""),
          taskId: String(fetchedReport.task?.id || ""),
          taskDescription: fetchedReport.taskDescription || "",
          hours: h,
          minutes: m,
          remark: fetchedReport.remark || "",
        });
      } else if (!isEdit) {
        form.reset({
          reportingDate: new Date(),
          employeeName: String(user?.user?.id || ""),
          projectId: initialData?.projectId
            ? String(initialData.projectId)
            : "",
          milestoneId: initialData?.milestoneId
            ? String(initialData.milestoneId)
            : "",
          taskId: initialData?.taskId ? String(initialData.taskId) : "",
          taskDescription: "",
          hours: "0",
          minutes: "00",
          remark: "",
        });
      }
    }
  }, [open, isEdit, fetchedReport, initialData, user, form]);

  const watchProjectId = form.watch("projectId");
  const watchMilestoneId = form.watch("milestoneId");

  const { data: milestonesList, isPending: milestonesLoading }: any =
    useGetProjectMilestonesList(
      watchProjectId ? { projectId: watchProjectId } : undefined,
      !!watchProjectId
    );

  const { data: tasksList, isPending: tasksLoading }: any =
    useGetTasksDropdownList(
      watchProjectId
        ? {
            projectId: watchProjectId,
            projectMilestoneId: watchMilestoneId,
          }
        : undefined,
      !!watchMilestoneId
    );

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    const yyyy = values.reportingDate.getFullYear();
    const mm = String(values.reportingDate.getMonth() + 1).padStart(2, "0");
    const dd = String(values.reportingDate.getDate()).padStart(2, "0");
    const dateString = `${yyyy}-${mm}-${dd}`;

    const timeSpent = `${values.hours}h${values.minutes}m`;

    const payload = {
      employeeId: isEdit
        ? Number(values.employeeName) || 0
        : Number(user?.user?.id) || 0,
      reportingDate: dateString,
      projectId: Number(values.projectId) || 0,
      projectMilestoneId: Number(values.milestoneId) || 0,
      taskId: Number(values.taskId) || 0,
      taskDescription: values.taskDescription,
      timeSpent: timeSpent,
      remark: values.remark,
    };

    if (isEdit) {
      updateReport(payload);
    } else {
      createReport(payload);
    }
  };

  const isLoading = isEdit && isReportLoading;
  const isSubmitting = isUpdating || isCreating;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] p-0 flex flex-col">
        <DialogHeader className="px-6 py-4 border-b">
          <DialogTitle>
            {isDescriptionOnly
              ? "Work Description"
              : isView
                ? "View Daily Report"
                : isEdit
                  ? "Edit Daily Report"
                  : "Add Daily Report"}
          </DialogTitle>
          <DialogDescription className="sr-only">
            {isDescriptionOnly
              ? "View work description"
              : `Form to ${isView ? "view" : isEdit ? "edit" : "add"} a daily work report`}
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex flex-1 items-center justify-center p-12">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : (
          <Form {...form}>
            {/* 
                FIX 3: Added 'key'. 
                When fetchedReport changes (API loads), this forces the form 
                to re-render. This ensures the Select components pick up 
                the values from form.reset() immediately.
            */}
            <form
              key={fetchedReport?.id || "form-key"}
              onSubmit={form.handleSubmit(onSubmit)}
              className="flex flex-col flex-1 overflow-hidden"
            >
              <ScrollArea className="flex-1 p-6">
                {isDescriptionOnly ? (
                  <div className="space-y-4">
                    <WorkDescriptionEditor
                      placeholder="What did you work on?"
                      value={form.getValues("taskDescription")}
                      onChange={() => {}}
                      disabled={true}
                    />
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-1">
                      <CustomDatePicker
                        control={form.control}
                        name="reportingDate"
                        label="Reporting Date"
                        placeholder="Pick a date"
                        disabled={isView}
                      />
                    </div>

                    <div className="col-span-1">
                      <FormField
                        control={form.control}
                        name="employeeName"
                        render={() => (
                          <FormItem>
                            <FormLabel>Employee Name</FormLabel>
                            <FormControl>
                              <Input
                                value={
                                  isEdit
                                    ? fetchedReport?.employee?.fullName || ""
                                    : user?.user?.fullName || ""
                                }
                                disabled
                                className="bg-gray-100"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="col-span-2">
                      <FormField
                        control={form.control}
                        name="projectId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              Project <span className="text-red-500">*</span>
                            </FormLabel>
                            <FormControl>
                              <ProjectSelect
                                value={field.value ?? undefined}
                                onChange={field.onChange}
                                disabled={
                                  !!initialData?.projectId || isEdit || isView
                                }
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="col-span-1">
                      <FormField
                        control={form.control}
                        name="milestoneId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              Milestone <span className="text-red-500">*</span>
                            </FormLabel>
                            <FormControl>
                              <SimpleDropDownSearchable
                                options={
                                  milestonesList?.data?.map((m: any) => ({
                                    label: m.name,
                                    value: String(m.id),
                                  })) || []
                                }
                                value={field.value ?? undefined}
                                onChange={field.onChange}
                                placeholder="Select milestone"
                                isLoading={milestonesLoading}
                                disabled={
                                  !!initialData?.milestoneId || isEdit || isView
                                }
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="col-span-1">
                      <FormField
                        control={form.control}
                        name="taskId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              Task <span className="text-red-500">*</span>
                            </FormLabel>
                            <FormControl>
                              <SimpleDropDownSearchable
                                options={
                                  tasksList?.data?.map((t: any) => ({
                                    label: t.taskName || t.name,
                                    value: String(t.id),
                                  })) || []
                                }
                                value={field.value ?? undefined}
                                onChange={field.onChange}
                                placeholder="Select task"
                                isLoading={tasksLoading}
                                disabled={
                                  !!initialData?.taskId || isEdit || isView
                                }
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="col-span-2">
                      <FormField
                        control={form.control}
                        name="taskDescription"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              Description <span className="text-red-500">*</span>
                            </FormLabel>
                            <FormControl>
                              <WorkDescriptionEditor
                                placeholder="What did you work on?"
                                value={field.value}
                                onChange={field.onChange}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="col-span-2 flex gap-2">
                      <div className="w-[85px]">
                        <FormField
                          control={form.control}
                          name="hours"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>
                                Hours <span className="text-red-500">*</span>
                              </FormLabel>
                              <Select
                                key={`hours-${field.value}-${fetchedReport?.id || "new"}`} // Force re-render when value changes
                                onValueChange={field.onChange}
                                value={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger disabled={isView}>
                                    <SelectValue placeholder="Hours" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {Array.from({ length: 24 }).map((_, i) => (
                                    <SelectItem key={i} value={String(i)}>
                                      {String(i).padStart(2, "0")}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="w-[85px]">
                        <FormField
                          control={form.control}
                          name="minutes"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>
                                Minutes <span className="text-red-500">*</span>
                              </FormLabel>
                              <Select
                                key={`minutes-${field.value}-${fetchedReport?.id || "new"}`} // Force re-render when value changes
                                onValueChange={field.onChange}
                                value={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger disabled={isView}>
                                    <SelectValue placeholder="Min" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {[
                                    0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50,
                                    55,
                                  ].map((m) => {
                                    const val = String(m).padStart(2, "0");
                                    return (
                                      <SelectItem key={m} value={val}>
                                        {val}
                                      </SelectItem>
                                    );
                                  })}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>

                    <div className="col-span-2">
                      <FormField
                        control={form.control}
                        name="remark"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Remarks</FormLabel>
                            <FormControl>
                              <Textarea {...field} disabled={isView} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                )}
              </ScrollArea>

              <div className="px-6 py-4 border-t flex justify-end gap-2 bg-white">
                {isView || isDescriptionOnly ? (
                  <Button
                    type="button"
                    className="min-w-[100px]"
                    onClick={() => onOpenChange(false)}
                  >
                    Close
                  </Button>
                ) : (
                  <>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => onOpenChange(false)}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      {isEdit ? "Save Changes" : "Save Report"}
                    </Button>
                  </>
                )}
              </div>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
}

// Export for backward compatibility if needed, but they are now both the same component
export const AddDailyReportDialog = DailyReportDialog;
export const EditDailyReportDialog = DailyReportDialog;
