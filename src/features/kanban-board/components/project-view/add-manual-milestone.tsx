"use client";

import { useForm, useFieldArray, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
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
import { Plus, Trash2, Loader2 } from "lucide-react";
import {
  useCreateManualMilestone,
  useUpdateMileStone,
  useDeleteMilestone,
} from "../../services";
import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import API from "@/config/api/api";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { ConfirmDialog } from "@/components/confirm-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const taskSchema = z.object({
  taskId: z.number().optional(),
  taskName: z.string().min(1, "Task name is required"),
  estimatedTime: z.string().min(1, "Estimated time is required"),
});

const formSchema = z.object({
  name: z
    .string()
    .nonempty("Milestone name is required")
    .min(2, "Milestone name must be at least 2 characters")
    .max(20, "Milestone name should be less than 20 characters"),
  estimatedTime: z.string().min(0, "Estimated time is required"),
  status: z.string().min(1, "Status is required"),
  tasks: z.array(taskSchema).min(1, "At least one task is required"),
});

type FormValues = z.infer<typeof formSchema>;

interface AddManualMilestoneProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string | number;
  initialData?: any;
  onSuccess?: () => void;
  onMilestoneCreated?: (milestone: any) => void;
}

export function AddManualMilestone({
  open,
  onOpenChange,
  projectId,
  initialData,
  onSuccess,
  onMilestoneCreated,
}: AddManualMilestoneProps) {
  const queryClient = useQueryClient();
  const [taskToDelete, setTaskToDelete] = useState<any>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // --- API HOOKS ---
  const { mutate: createMilestone, isPending: isCreating } =
    useCreateManualMilestone((response: any) => {
      onOpenChange(false);
      form.reset();
      const createdMilestone =
        response?.data || response?.milestone || response;
      onMilestoneCreated?.(createdMilestone);
      onSuccess?.();
    });

  const { mutate: updateMilestone, isPending: isUpdating } =
    useUpdateMileStone();

  const { mutate: deleteTaskFromAPI, isPending: isDeletingTask } =
    useDeleteMilestone();

  // --- FORM SETUP ---
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    mode: "onChange", // Ensures validation happens on change
    defaultValues: {
      name: "",
      estimatedTime: "",
      status: "pending",
      tasks: [{ taskName: "", estimatedTime: "" }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "tasks",
  });

  // --- REAL-TIME CALCULATION LOGIC (UPDATED) ---

  // 1. USE USEWATCH: This is critical for real-time updates in Field Arrays
  const watchedTasks = useWatch({
    control: form.control,
    name: "tasks",
  });

  // 2. Parsing Logic
  const parseEstimatedTimeToHours = (val: string | number | undefined) => {
    if (val === undefined || val === null) return 0;
    const str = String(val).trim();
    if (str === "") return 0;

    // Check for purely numeric values (e.g. "1.5" or "2")
    if (/^[0-9]+(\.[0-9]+)?$/.test(str)) return parseFloat(str) || 0;

    // Check for "1h 30m" format
    const hourMatch = str.match(/(\d+)h/);
    const minMatch = str.match(/(\d+)m/);

    const hours = hourMatch ? Number(hourMatch[1]) : 0;
    const mins = minMatch ? Number(minMatch[1]) : 0;

    return hours + mins / 60;
  };

  // 3. Effect: Calculate total immediately when watchedTasks changes
  useEffect(() => {
    // Safety check if tasks aren't loaded yet
    const currentTasks = watchedTasks || [];

    const totalHours = currentTasks.reduce((sum, task) => {
      // Guard against undefined tasks in the array
      if (!task) return sum;
      return sum + parseEstimatedTimeToHours(task.estimatedTime);
    }, 0);

    // Format: "1.50" -> "1.5", "2.00" -> "2"
    const formattedTotal =
      totalHours > 0 ? parseFloat(totalHours.toFixed(2)).toString() : "";

    // Update the field value.
    // IMPORTANT: Check current value prevents infinite loops
    const currentFieldValue = form.getValues("estimatedTime");

    if (currentFieldValue !== formattedTotal) {
      form.setValue("estimatedTime", formattedTotal, {
        shouldValidate: true,
        shouldDirty: true,
        shouldTouch: true,
      });
    }
  }, [watchedTasks, form]); // Dependency array ensures this runs on every keystroke in tasks

  // --- INITIAL DATA LOADING ---
  useEffect(() => {
    if (open) {
      if (initialData) {
        form.reset({
          name:
            initialData.name ||
            initialData.milestoneName ||
            initialData.milestone_name ||
            "",
          estimatedTime: initialData.estimatedTime || "",
          status: initialData.status || "pending",
          tasks: initialData.tasks?.map((t: any) => ({
            taskId: t.id,
            taskName: t.taskName,
            estimatedTime: t.estimatedTime,
          })) || [{ taskName: "", estimatedTime: "" }],
        });
      } else {
        form.reset({
          name: "",
          estimatedTime: "",
          status: "pending",
          tasks: [{ taskName: "", estimatedTime: "" }],
        });
      }
    }
  }, [open, initialData, form]);

  const handleDeleteTask = (task: any, index: number) => {
    if (task.taskId) {
      setTaskToDelete({ task, index, isFromDB: true });
      setShowDeleteConfirm(true);
    } else {
      remove(index);
    }
  };

  const confirmDeleteTask = () => {
    if (!taskToDelete) return;
    const { task, index, isFromDB } = taskToDelete;

    if (isFromDB) {
      deleteTaskFromAPI(
        { id: initialData.id, taskId: task.taskId },
        {
          onSuccess: () => {
            remove(index);
            queryClient.invalidateQueries({
              queryKey: [`${API.projects.milestone_list}/${initialData.id}`],
            });
            setShowDeleteConfirm(false);
            setTaskToDelete(null);
          },
        }
      );
    }
  };

  const onSubmit = (values: FormValues) => {
    const payloadProjectId = Number(projectId);

    // Ensure estimatedTime is the calculated value (redundant safety)
    const totalHours = values.tasks.reduce(
      (sum, task) => sum + parseEstimatedTimeToHours(task.estimatedTime),
      0
    );
    const finalEstimatedTime =
      totalHours > 0 ? parseFloat(totalHours.toFixed(2)).toString() : "";

    if (initialData) {
      const payload: any = {
        name: values.name,
        estimatedTime: finalEstimatedTime, // Ensure we send the calculated string
        status: values.status,
        projectId: payloadProjectId,
      };

      const initialTasks =
        initialData.tasks?.map((t: any) => ({
          taskId: t.id,
          taskName: t.taskName,
          estimatedTime: t.estimatedTime,
        })) || [];

      // Simple dirty check
      const hasTasksChanged =
        JSON.stringify(values.tasks) !== JSON.stringify(initialTasks);

      if (hasTasksChanged) {
        payload.tasks = values.tasks;
      }

      updateMilestone(
        { id: initialData.id, data: payload },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({
              queryKey: [API.dropdown_api.milestones, { projectId }],
            });
            queryClient.invalidateQueries({
              queryKey: [`${API.projects.milestone_list}/${initialData.id}`],
            });
            onOpenChange(false);
            if (onSuccess) onSuccess();
          },
        }
      );
    } else {
      const payload = {
        ...values,
        estimatedTime: finalEstimatedTime,
        projectId: payloadProjectId,
      };
      createMilestone(payload);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px] max-h-[95vh] flex flex-col p-0">
        <DialogHeader className="px-6 py-4 border-b shrink-0">
          <DialogTitle>
            {initialData ? "Edit Milestone" : "Add Milestone"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col flex-1 min-h-0"
          >
            <div className="flex-1 overflow-y-auto px-6 py-4 min-h-0">
              <div className="grid grid-cols-2 gap-4 mb-6">
                {/* Milestone Name */}
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }: any) => (
                    <FormItem className="col-span-2">
                      <FormLabel>
                        Milestone Name <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="Enter milestone name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Estimated Time (Calculated) */}
                <FormField
                  control={form.control}
                  name="estimatedTime"
                  render={({ field }: any) => (
                    <FormItem>
                      <FormLabel>Total Estimated Time (Hours)</FormLabel>
                      <FormControl>
                        {/* 
                          We use readOnly here. 
                          The value is controlled by the useEffect via form.setValue 
                          But {...field} connects it to the form state.
                        */}
                        <Input
                          placeholder="Auto-calculated"
                          {...field}
                          readOnly
                          className="bg-slate-100 text-slate-700 focus-visible:ring-0 cursor-not-allowed"
                          tabIndex={-1}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Status */}
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }: any) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="in_progress">
                            In Progress
                          </SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Tasks */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium">Tasks</h3>
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => append({ taskName: "", estimatedTime: "" })}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Task
                  </Button>
                </div>

                {fields.map((item: any, index: number) => {
                  const isExistingTask = !!item.taskId;
                  const taskStatus = initialData?.tasks?.find(
                    (t: any) => t.id === item.taskId
                  )?.status;

                  return (
                    <div
                      key={item.id}
                      className="grid grid-cols-12 gap-3 p-3 border rounded-lg bg-slate-50"
                    >
                      <div className="col-span-7">
                        <FormField
                          control={form.control}
                          name={`tasks.${index}.taskName`}
                          render={({ field }: any) => (
                            <FormItem>
                              <FormLabel>
                                Task Name{" "}
                                <span className="text-red-500">*</span>
                              </FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Task Name"
                                  {...field}
                                  disabled={
                                    initialData?.tasks[index]?.status ===
                                    "completed"
                                  }
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="col-span-4">
                        <FormField
                          control={form.control}
                          name={`tasks.${index}.estimatedTime`}
                          render={({ field }: any) => (
                            <FormItem>
                              <FormLabel>
                                Est. Time{" "}
                                <span className="text-red-500">*</span>
                              </FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="e.g. 1h 30m"
                                  {...field}
                                  disabled={
                                    initialData?.tasks[index]?.status ===
                                    "completed"
                                  }
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      {(!initialData ||
                        !isExistingTask ||
                        taskStatus === "pending") && (
                        <div className="col-span-1 flex items-start pt-8">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleDeleteTask(item, index)}
                                  disabled={
                                    fields.length === 1 || isDeletingTask
                                  }
                                  className={cn(
                                    "text-destructive hover:text-destructive/90",
                                    isDeletingTask && "opacity-50"
                                  )}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Delete task</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <DialogFooter className="px-6 py-4 border-t shrink-0 bg-slate-50">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>

              <Button type="submit" disabled={isCreating || isUpdating}>
                {(isCreating || isUpdating) && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {initialData ? "Update Milestone" : "Add Milestone"}
              </Button>
            </DialogFooter>
          </form>
        </Form>

        <ConfirmDialog
          open={showDeleteConfirm}
          onOpenChange={setShowDeleteConfirm}
          title="Delete Task"
          desc="Are you sure you want to delete this task? This action cannot be undone."
          cancelBtnText="Cancel"
          confirmText="Delete"
          destructive
          isLoading={isDeletingTask}
          handleConfirm={confirmDeleteTask}
        />
      </DialogContent>
    </Dialog>
  );
}
