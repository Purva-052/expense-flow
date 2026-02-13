"use client";

import { useState } from "react";
import { Check, Eye, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/stores/use-auth-store";
import { roles } from "@/utils/constant";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
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
  isCurrentUserProjectHandler: boolean;
  milestoneStatus?: string;
}

export const TaskActions = ({
  task,
  onViewLog,
  onDeleteTask,
  projectId,
  milestoneId,
  onAddLogSuccess,
  isCurrentUserProjectHandler,
  milestoneStatus,
}: TaskActionsProps) => {
  const { user } = useAuthStore();
  const Role = user?.user?.role;
  const [addLogOpen, setAddLogOpen] = useState(false);
  const [updateStatusOpen, setUpdateStatusOpen] = useState(false);
  const isAdmin = Role === roles.ADMIN;
  const isDeveloper = Role === roles.DEVELOPER;

  const isAuthorized = isAdmin || isCurrentUserProjectHandler || isDeveloper;

  if (!isAuthorized) return null;

  return (
    <div className="flex items-center gap-2">
      <AddHoursLogDialog
        open={addLogOpen}
        onOpenChange={setAddLogOpen}
        projectId={projectId}
        milestoneId={milestoneId}
        taskId={task.id || ""}
        taskName={task.taskName}
        taskStatus={task.status}
        onSuccess={onAddLogSuccess}
        milestoneStatus={milestoneStatus}
      />

      <UpdateTaskStatusDialog
        open={updateStatusOpen}
        onOpenChange={setUpdateStatusOpen}
        milestoneId={milestoneId}
        task={task}
        onSuccess={onAddLogSuccess}
      />

      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => onViewLog(task)}
            >
              <Eye className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>View log</p>
          </TooltipContent>
        </Tooltip>

        {Role !== roles.DEVELOPER && (
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="inline-flex">
                <Button
                  variant="outline"
                  size="icon"
                  className={cn(
                    "h-8 w-8",
                    (task.status === "pending" ||
                      task.status === "completed") &&
                      "cursor-not-allowed opacity-50"
                  )}
                  onClick={() => {
                    if (
                      task.status === "pending" ||
                      task.status === "completed"
                    )
                      return;

                    setUpdateStatusOpen(true);
                  }}
                >
                  <Check
                    className={cn(
                      "h-4 w-4",
                      task.status === "completed"
                        ? "text-muted-foreground"
                        : "text-green-600 font-bold"
                    )}
                  />
                </Button>
              </span>
            </TooltipTrigger>

            <TooltipContent side="top">
              <p>
                {task.status === "completed"
                  ? "Task Completed"
                  : task.status === "pending"
                    ? "Task not started yet"
                    : "Complete Task"}
              </p>
            </TooltipContent>
          </Tooltip>
        )}

        {(Role === roles.PROJECT_MANAGER ||
          Role === roles.TEAM_LEAD ||
          Role === roles.ADMIN) &&
          parseFloat(task.actualTime || "0") === 0 && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                  onClick={() => onDeleteTask(task)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Delete task</p>
              </TooltipContent>
            </Tooltip>
          )}
      </TooltipProvider>
    </div>
  );
};
