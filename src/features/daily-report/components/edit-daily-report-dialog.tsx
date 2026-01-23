import API from "@/config/api/api";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
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
import { useUpdateDailyReport } from "../services";
import {
  useGetProjectMilestonesList,
  useGetTasksDropdownList,
  useGetDailyReportById,
} from "../services";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
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
  hours: z.string().min(1, "Hours are required"),
  minutes: z.string().min(1, "Minutes are required"),
  remark: z.string().optional(),
});

interface EditDailyReportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  report: DailyReport | null;
}

export function EditDailyReportDialog({
  open,
  onOpenChange,
  report,
}: EditDailyReportDialogProps) {
  const queryClient = useQueryClient();

  const { data: reportData, isPending: isReportLoading }: any =
    useGetDailyReportById(String(report?.id || ""));

  const fetchedReport = reportData?.data;

  const { mutate: updateReport, isPending: isUpdating } = useUpdateDailyReport(
    String(report?.id),
    () => {
      //   toast.success("Daily report updated successfully");
      queryClient.invalidateQueries({ queryKey: ["daily-reports"] });
      if (report?.id) {
        queryClient.invalidateQueries({
          queryKey: [`${API.daily_report.list}/${report.id}`],
        });
      }
      onOpenChange(false);
    }
  );

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      reportingDate: new Date(),
      employeeName: "",
      projectId: "",
      milestoneId: "",
      taskId: "",
      taskDescription: "",
      hours: "0",
      minutes: "0",
      remark: "",
    },
  });

  useEffect(() => {
    if (fetchedReport && open) {
      let h = "0";
      let m = "0";
      if (fetchedReport.timeSpent) {
        const parts = String(fetchedReport.timeSpent).split(".");
        if (parts.length > 0) h = String(Number(parts[0]));
        if (parts.length > 1) m = String(Number(parts[1]));
      }

      const resetValues = {
        reportingDate: new Date(fetchedReport.reportingDate),
        employeeName: fetchedReport.employee?.id
          ? String(fetchedReport.employee.id)
          : "",
        projectId: String(fetchedReport.project?.id || ""),
        milestoneId: String(fetchedReport.milestone?.id || ""),
        taskId: String(fetchedReport.task?.id || ""),
        taskDescription: fetchedReport.taskDescription || "",
        hours: h,
        minutes: m,
        remark: fetchedReport.remark || "",
      };

      form.reset(resetValues);
    }
  }, [fetchedReport, open, form]);

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
    if (!report) return;

    const yyyy = values.reportingDate.getFullYear();
    const mm = String(values.reportingDate.getMonth() + 1).padStart(2, "0");
    const dd = String(values.reportingDate.getDate()).padStart(2, "0");
    const dateString = `${yyyy}-${mm}-${dd}`;

    const timeSpent = `${values.hours}.${values.minutes}`;

    const payload = {
      employeeId: Number(values.employeeName) || 0,
      reportingDate: dateString,
      projectId: Number(values.projectId) || 0,
      projectMilestoneId: Number(values.milestoneId) || 0,
      taskId: Number(values.taskId) || 0,
      taskDescription: values.taskDescription,
      timeSpent: timeSpent,
      remark: values.remark,
    };

    updateReport(payload);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] p-0 flex flex-col">
        <DialogHeader className="px-6 py-4 border-b">
          <DialogTitle>Edit Daily Report</DialogTitle>
        </DialogHeader>

        {isReportLoading ? (
          <div className="flex flex-1 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : (
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="flex flex-col flex-1 overflow-hidden"
            >
              <ScrollArea className="flex-1 p-6">
                <div className="grid grid-cols-2 gap-4">
                  {/* Reporting Date & Employee Name */}
                  <div className="col-span-1">
                    <CustomDatePicker
                      control={form.control}
                      name="reportingDate"
                      label="Reporting Date"
                      placeholder="Pick a date"
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
                              value={fetchedReport?.employee?.fullName || ""}
                              disabled
                              className="bg-gray-100"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Project (Full Width) */}
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
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Milestone & Task */}
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
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Description (Full Width) */}
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
                            <Textarea {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Hours and Minutes */}
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
                              key={`h-${field.value}`}
                              onValueChange={field.onChange}
                              value={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Hours" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {Array.from({ length: 13 }).map((_, i) => (
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
                              key={`m-${field.value}`}
                              onValueChange={field.onChange}
                              value={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Minutes" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {[
                                  0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55,
                                ].map((m) => (
                                  <SelectItem key={m} value={String(m)}>
                                    {String(m).padStart(2, "0")}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  {/* Remarks (Full Width) */}
                  <div className="col-span-2">
                    <FormField
                      control={form.control}
                      name="remark"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Remarks</FormLabel>
                          <FormControl>
                            <Textarea {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </ScrollArea>

              <div className="px-6 py-4 border-t flex justify-end gap-2 bg-white">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isUpdating}>
                  {isUpdating && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Save Changes
                </Button>
              </div>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
}
