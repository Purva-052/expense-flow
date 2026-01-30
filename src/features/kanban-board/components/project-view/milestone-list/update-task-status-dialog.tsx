"use client";

import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useUpdateTaskStatus } from "@/features/kanban-board/services";
import { WorkDescriptionEditor } from "@/components/shared/work-description-editor";
import { MilestoneTask } from "./types";

interface UpdateTaskStatusDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  milestoneId: string | number;
  task: MilestoneTask;
  onSuccess?: () => void;
}

export const UpdateTaskStatusDialog = ({
  open,
  onOpenChange,
  milestoneId,
  task,
  onSuccess,
}: UpdateTaskStatusDialogProps) => {
  const [comment, setComment] = useState<string>(task.comment || "");

  useEffect(() => {
    if (open) {
      setComment(task.comment || "");
    }
  }, [open, task]);

  const { mutate: updateStatus, isPending } = useUpdateTaskStatus(
    milestoneId,
    () => {
      onSuccess?.();
      onOpenChange(false);
    }
  );

  const handleUpdate = () => {
    updateStatus({
      taskId: task.id || "",
      status: "completed",
      comment,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Complete Task - {task.taskName}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium">Comment</label>
            <WorkDescriptionEditor
              placeholder="Add your comments here..."
              value={comment}
              onChange={setComment}
            />
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
              className="bg-primary text-white min-w-[100px]"
              onClick={handleUpdate}
              disabled={isPending}
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save & Complete"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
