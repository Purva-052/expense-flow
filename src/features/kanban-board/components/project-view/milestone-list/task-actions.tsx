"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/stores/use-auth-store";
import { roles } from "@/utils/constant";
import { AddHoursLogDialog } from "./add-hours-log-dialog";
import { UpdateTaskStatusDialog } from "./update-task-status-dialog";
import { MilestoneTask } from "./types";

interface TaskActionsProps {
  task: MilestoneTask;
  onViewLog: (task: MilestoneTask) => void;
  onDeleteTask: (task: MilestoneTask) => void;
  projectId: string | number;
  milestoneId: number;
  onAddLogSuccess: () => void;
  milestoneStatus?: string;
}

export const TaskActions = ({
  task,
  onViewLog,
  onDeleteTask,
  projectId,
  milestoneId,
  onAddLogSuccess,
  milestoneStatus,
}: TaskActionsProps) => {
  const { user } = useAuthStore();
  const Role = user?.user?.role;
  const [addLogOpen, setAddLogOpen] = useState(false);
  const [updateStatusOpen, setUpdateStatusOpen] = useState(false);

  return (
    <div className="flex items-center gap-2">
      <AddHoursLogDialog
        open={addLogOpen}
        onOpenChange={setAddLogOpen}
        projectId={projectId}
        milestoneId={milestoneId}
        taskId={task.id || ""}
        taskName={task.taskName}
        onSuccess={onAddLogSuccess}
        milestoneStatus={milestoneStatus}
      />

      <Button variant="outline" size="sm" onClick={() => onViewLog(task)}>
        View Log
      </Button>

      <UpdateTaskStatusDialog
        open={updateStatusOpen}
        onOpenChange={setUpdateStatusOpen}
        milestoneId={milestoneId}
        task={task}
        onSuccess={onAddLogSuccess}
      />

      <Button
        variant="outline"
        size="sm"
        onClick={() => setUpdateStatusOpen(true)}
        disabled={task.status === "completed"}
      >
        <Check className="mr-2 h-4 w-4" />
        {task.status === "completed" ? "Task Completed" : "Complete Task"}
      </Button>

      {(Role === roles.PROJECT_MANAGER ||
        Role === roles.TEAM_LEAD ||
        Role === roles.ADMIN) &&
        parseFloat(task.actualTime || "0") === 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onDeleteTask(task)}
          >
            Delete task
          </Button>
        )}
    </div>
  );
};
