"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { AlarmClockPlus, CalendarIcon, Loader2 } from "lucide-react";
import { useAuthStore } from "@/stores/use-auth-store";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useCreateDailyReport,
  useUpdateDailyReport,
} from "@/features/daily-report/services";
import { useUpdateMileStone } from "@/features/kanban-board/services";
import { WorkDescriptionEditor } from "@/components/shared/work-description-editor";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const parseTime = (time: string | null) => {
  if (!time) return { hours: "0", minutes: "0" };

  if (time.includes(".")) {
    const [h, m] = time.split(".");
    return {
      hours: String(parseInt(h || "0")),
      minutes: String(parseInt(m || "0")),
    };
  }

  const timeMatch = time.match(/(\d+)h(\d+)m/);
  if (timeMatch) {
    return {
      hours: String(parseInt(timeMatch[1])),
      minutes: String(parseInt(timeMatch[2])),
    };
  }

  const hourMatch = time.match(/(\d+)h/);
  if (hourMatch) {
    return { hours: String(parseInt(hourMatch[1])), minutes: "0" };
  }

  const minMatch = time.match(/(\d+)m/);
  if (minMatch) {
    return { hours: "0", minutes: String(parseInt(minMatch[1])) };
  }

  return { hours: String(parseInt(time)), minutes: "0" };
};

const MIN_DESCRIPTION_LENGTH = 3;

const getPlainTextDescription = (value: string) =>
  value
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();

interface AddHoursLogDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string | number;
  milestoneId?: string | number;
  taskId?: string | number;
  taskName?: string;
  taskStatus?: string;
  onSuccess?: () => void;
  milestoneStatus?: string;
  reportId?: string | number;
  initialData?: {
    date: string | Date;
    description: string;
    timeSpent: string;
  };
  hideTrigger?: boolean;
}

export const AddHoursLogDialog = ({
  open,
  onOpenChange,
  projectId,
  milestoneId,
  taskId,
  taskName,
  taskStatus,
  onSuccess,
  milestoneStatus,
  reportId,
  initialData,
  hideTrigger,
}: AddHoursLogDialogProps) => {
  const { user } = useAuthStore();
  const [date, setDate] = useState<Date>(new Date());
  const [hours, setHours] = useState("0");
  const [minutes, setMinutes] = useState("0");
  const [description, setDescription] = useState("");
  const [hasTriedSave, setHasTriedSave] = useState(false);
  const { mutate: updateMilestone } = useUpdateMileStone();

  useEffect(() => {
    if (open) {
      setHasTriedSave(false);
      if (initialData) {
        setDate(new Date(initialData.date));
        setDescription(initialData.description);
        const { hours: h, minutes: m } = parseTime(initialData.timeSpent);
        setHours(h);
        setMinutes(m);
      } else {
        setDate(new Date());
        setHours("0");
        setMinutes("0");
        setDescription("");
      }
    }
  }, [open, initialData]);

  // --- REMOVED THE USEEFFECT BLUR HANDLER HERE ---
  // The logic inside DialogContent > onFocusOutside is sufficient
  // and prevents the tab-switching conflict.

  const { mutate: updateReport, isPending: isUpdating } = useUpdateDailyReport(
    reportId?.toString() || "",
    () => {
      onSuccess?.();
      onOpenChange(false);
    }
  );

  const { mutate: createReport, isPending: isCreating } = useCreateDailyReport(
    () => {
      if (milestoneStatus === "pending" && milestoneId) {
        updateMilestone({
          id: milestoneId,
          data: { status: "in_progress", projectId: Number(projectId) },
        });
      }
      onSuccess?.();
      onOpenChange(false);
    }
  );

  const isPending = isCreating || isUpdating;
  const plainDescription = getPlainTextDescription(description);
  const isDescriptionValid =
    plainDescription.length >= MIN_DESCRIPTION_LENGTH;
  const descriptionError =
    hasTriedSave && !isDescriptionValid
      ? plainDescription.length === 0
        ? "Work description is required."
        : `Work description must be at least ${MIN_DESCRIPTION_LENGTH} characters.`
      : "";
  const handleDateSelect = (selectedDate?: Date) => {
    // Keep a valid selected date; do not allow calendar clear on repeated clicks.
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  const handleSave = () => {
    setHasTriedSave(true);

    if (!isDescriptionValid || (hours === "0" && minutes === "0")) {
      return;
    }

    if (reportId) {
      updateReport({
        taskDescription: description,
        timeSpent: `${hours}h${minutes}m`,
      });
    } else {
      const payload = {
        reportingDate: format(date, "yyyy-MM-dd"),
        employeeId: Number(user?.user?.id),
        projectId: Number(projectId),
        projectMilestoneId: Number(milestoneId),
        taskId: Number(taskId),
        taskDescription: description,
        timeSpent: `${hours}h${minutes}m`,
      };
      createReport(payload);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {!hideTrigger && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <DialogTrigger asChild>
                <button
                  type="button"
                  disabled={taskStatus === "completed"}
                  className="p-2 rounded-md hover:bg-[#fee2e2] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <AlarmClockPlus className="h-5 w-5 text-[#e11d48]" />
                </button>
              </DialogTrigger>
            </TooltipTrigger>

            <TooltipContent side="top">
              <p>Add Log Hours</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}

      <DialogContent
        className="max-w-2xl"
        // These 3 props are critical for CKEditor/Iframes inside Radix Dialogs
        onPointerDownOutside={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
        onFocusOutside={(e) => {
          // Prevents the dialog from closing when focus moves to the iframe
          // or when returning from a different browser tab
          e.preventDefault();
        }}
      >
        <DialogHeader>
          <DialogTitle className="pt-4">
            {reportId ? "Edit" : "Add"} Log Hours{" "}
            {taskName ? `- ${taskName}` : ""}
          </DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium">Date</label>
              <Popover>
                <PopoverTrigger asChild disabled={!!reportId}>
                  <Button
                    variant="outline"
                    className="justify-start text-left font-normal h-9"
                    disabled={!!reportId}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {format(date, "PPP")}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    disabled={(date) => {
                      const today = new Date();
                      today.setHours(0, 0, 0, 0);
                      // const day = date.getDay();
                      return date > today;
                    }}
                    mode="single"
                    selected={date}
                    onSelect={handleDateSelect}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium">Hours</label>
              <div className="flex gap-2">
                <Select value={hours} onValueChange={setHours}>
                  <SelectTrigger className="h-9 flex-1">
                    <SelectValue placeholder="Hrs" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 15 }).map((_, i) => (
                      <SelectItem key={i} value={String(i)}>
                        {String(i).padStart(2, "0")} hrs
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={minutes} onValueChange={setMinutes}>
                  <SelectTrigger className="h-9 flex-1">
                    <SelectValue placeholder="Min" />
                  </SelectTrigger>
                  <SelectContent>
                    {[0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55].map((m) => (
                      <SelectItem key={m} value={String(m)}>
                        {String(m).padStart(2, "0")} min
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium">Work Description</label>
            <WorkDescriptionEditor
              placeholder="What did you work on?"
              value={description}
              onChange={setDescription}
            />
            {descriptionError && (
              <p className="text-sm text-destructive">{descriptionError}</p>
            )}
          </div>

          <div className="flex justify-end gap-3 mt-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              className="bg-[#e11d48] hover:bg-[#be123c] text-white min-w-[100px]"
              onClick={handleSave}
              disabled={
                isPending ||
                !isDescriptionValid ||
                (hours === "0" && minutes === "0")
              }
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Log"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
