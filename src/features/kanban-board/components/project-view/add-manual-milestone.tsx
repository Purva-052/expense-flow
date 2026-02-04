"use client";

import { useForm, useFieldArray } from "react-hook-form";
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
import { useCreateManualMilestone, useUpdateMileStone } from "../../services";
import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import API from "@/config/api/api";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

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
  estimatedTime: z.string().min(1, "Total estimated time is required"),
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

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      estimatedTime: "",
      status: "pending",
      tasks: [{ taskName: "", estimatedTime: "" }],
    },
  });

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

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "tasks",
  });

  const onSubmit = (values: FormValues) => {
    if (initialData) {
      const payload: any = {
        name: values.name,
        estimatedTime: values.estimatedTime,
        status: values.status,
        projectId: Number(projectId),
      };

      const initialTasks =
        initialData.tasks?.map((t: any) => ({
          taskId: t.id,
          taskName: t.taskName,
          estimatedTime: t.estimatedTime,
        })) || [];

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
            // Also invalidate the specific milestone details
            queryClient.invalidateQueries({
              queryKey: [`${API.projects.milestone_list}/${initialData.id}`],
            });
            onOpenChange(false);
            if (onSuccess) onSuccess();
          },
          onError: () => {
            onOpenChange(false);
            toast.error(
              "Complete all tasks to mark the milestone as completed"
            );
          },
        }
      );
    } else {
      const payload = {
        ...values,
        projectId: Number(projectId),
      };
      createMilestone(payload);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px] max-h-[95vh] flex flex-col p-0">
        {/* 🔒 Header (fixed) */}
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
            {/* 🔽 Scrollable content only */}
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

                {/* Estimated Time */}
                <FormField
                  control={form.control}
                  name="estimatedTime"
                  render={({ field }: any) => (
                    <FormItem>
                      <FormLabel>
                        Total Estimated Time{" "}
                        <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="1h10m" {...field} />
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

                {fields.map((item: any, index: number) => (
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
                              Task Name <span className="text-red-500">*</span>
                            </FormLabel>
                            <FormControl>
                              <Input placeholder="Task Name" {...field} />
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
                              Estimated Time{" "}
                              <span className="text-red-500">*</span>
                            </FormLabel>
                            <FormControl>
                              <Input placeholder="1h10m" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {!initialData && (
                      <div className="col-span-1 flex items-end">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => remove(index)}
                          disabled={fields.length === 1}
                          className="text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* 🔒 Footer (fixed) */}
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
      </DialogContent>
    </Dialog>
  );
}
