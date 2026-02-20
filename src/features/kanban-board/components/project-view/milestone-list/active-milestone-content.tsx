"use client";

import { useState, useMemo } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Pencil, Trash2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { GlobalTable } from "@/components/table/global-table";
import { DeleteModal } from "@/components/model/delete-model";
import { useAuthStore } from "@/stores/use-auth-store";
import { roles } from "@/utils/constant";
import {
  useGetMilestoneTasks,
  useDeleteMilestone,
} from "@/features/kanban-board/services";
import API from "@/config/api/api";
import { MilestoneTask } from "./types";
import { TaskActions } from "./task-actions";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ActiveMilestoneContentProps {
  projectId: string | number;
  milestoneId: number;
  onViewTaskLog: (task: MilestoneTask) => void;
  onEditMilestone: (data: any) => void;
  isCurrentUserProjectHandler: boolean;
  tasksFromParent?: MilestoneTask[];
}

const getReportColumns = (
  onViewLog: (row: MilestoneTask) => void,
  onDeleteTask: (row: MilestoneTask) => void,
  projectId: string | number,
  milestoneId: number,
  onAddLogSuccess: () => void,
  isAuthorized: boolean,
  isCurrentUserProjectHandler: boolean,
  milestoneStatus?: string
): ColumnDef<MilestoneTask>[] => {
  const columns: ColumnDef<MilestoneTask>[] = [
    {
      accessorKey: "taskName",
      header: "Functionality Name",
      cell: ({ row }) => {
        const taskName = row.original.taskName;

        return (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="font-medium truncate max-w-[200px] block cursor-pointer">
                  {taskName}
                </span>
              </TooltipTrigger>

              <TooltipContent
                side="top"
                align="start"
                className="max-w-xs break-words"
              >
                {taskName}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        );
      },
    },
    {
      accessorKey: "estimatedTime",
      header: "Estimated Time (hrs)",
      cell: ({ row }) => (
        <span className="font-semibold">
          {formatTime(row.original.estimatedTime)}
        </span>
      ),
    },
    {
      accessorKey: "actualTime",
      header: "Actual Hours (hrs)",
      cell: ({ row }) => (
        <span className="font-semibold text-green-600">
          {formatTime(row.original.actualTime)}
        </span>
      ),
    },
    {
      accessorKey: "weightedHours",
      header: "Weightage Hours (hrs)",
      cell: ({ row }) => (
        <span className="font-semibold text-blue-600">
          {formatTime(row.original.weightedHours)}
        </span>
      ),
    },
  ];

  if (isAuthorized) {
    columns.push({
      id: "action",
      header: "Action",
      cell: ({ row }) => (
        <TaskActions
          task={row.original}
          onViewLog={onViewLog}
          onDeleteTask={onDeleteTask}
          projectId={projectId}
          milestoneId={milestoneId}
          onAddLogSuccess={onAddLogSuccess}
          isCurrentUserProjectHandler={isCurrentUserProjectHandler}
          milestoneStatus={milestoneStatus}
        />
      ),
    });
  }

  return columns;
};

const formatTime = (value: any) => {
  if (value === null || value === undefined) return "0:00";
  const str = String(value);
  if (str.includes(":")) return str;
  const num = parseFloat(str);
  if (isNaN(num)) return "0:00";
  return num.toFixed(2).replace(".", ":");
};

export const ActiveMilestoneContent = ({
  projectId,
  milestoneId,
  onViewTaskLog,
  onEditMilestone,
  isCurrentUserProjectHandler,
  tasksFromParent = [],
}: ActiveMilestoneContentProps) => {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const Role = user?.user?.role;
  const isAdmin = Role === roles.ADMIN;
  const isDeveloper = Role === roles.DEVELOPER;
  const isProjectManager = Role === roles.PROJECT_MANAGER;
  const isTeamLead = Role === roles.TEAM_LEAD;
  const isAuthorized = isAdmin || isDeveloper || isCurrentUserProjectHandler;
  const canDeleteMilestoneRole = isAdmin || isProjectManager || isTeamLead;

  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });

  const [itemToDelete, setItemToDelete] = useState<MilestoneTask | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDeleteMilestoneModal, setShowDeleteMilestoneModal] =
    useState(false);

  const { data: taskDataResponse, isLoading } = useGetMilestoneTasks(
    milestoneId,
    {
      page: pagination.pageIndex + 1,
      limit: pagination.pageSize,
    }
  );

  const { mutate: deleteMilestone, isPending: isDeleting } =
    useDeleteMilestone();

  const handleDeleteTask = (task: MilestoneTask) => {
    setItemToDelete(task);
    setShowDeleteModal(true);
  };

  const confirmDeleteTask = () => {
    if (!itemToDelete) return;
    deleteMilestone(
      { id: milestoneId, taskId: itemToDelete.id },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({
            queryKey: [`${API.projects.milestone_list}/${milestoneId}`],
          });
          setShowDeleteModal(false);
          setItemToDelete(null);
        },
      }
    );
  };

  const confirmDeleteMilestone = () => {
    deleteMilestone(
      { id: milestoneId },
      {
        onSuccess: () => {
          setShowDeleteMilestoneModal(false);
        },
      }
    );
  };

  const milestone = taskDataResponse?.data || taskDataResponse;
  const metadata = taskDataResponse?.metadata;

  const tasks = useMemo<MilestoneTask[]>(() => {
    let baseTasks: MilestoneTask[] = [];
    if (Array.isArray(milestone?.tasks)) baseTasks = milestone.tasks;
    else if (Array.isArray(milestone?.data?.tasks))
      baseTasks = milestone.data.tasks;
    else if (Array.isArray(milestone)) baseTasks = milestone;

    // Merge weightedHours from parent tasks if not present in baseTasks
    return baseTasks.map((task) => {
      if (task.weightedHours && task.weightedHours !== "0.00") return task;

      const parentTask = tasksFromParent.find(
        (pt) => String(pt.id) === String(task.id)
      );
      if (parentTask?.weightedHours) {
        return { ...task, weightedHours: parentTask.weightedHours };
      }
      return task;
    });
  }, [milestone, tasksFromParent]);

  const actualMilestone = useMemo<any>(() => {
    let base: any = {};
    if (milestone?.tasks) base = milestone;
    else if (milestone?.data?.tasks) base = milestone.data;
    else base = milestone || {};

    // Robust parsing function to handle numbers and "Xh Ym" formats
    const parseTimeValue = (value: any): number => {
      if (value === null || value === undefined || value === "") return 0;
      const str = String(value).trim();

      // Handle "1h 30m" or "2h" or "45m" formats
      const hourMatch = str.match(/(\d+)\s*h/i);
      const minMatch = str.match(/(\d+)\s*m/i);

      if (hourMatch || minMatch) {
        const hours = hourMatch ? parseInt(hourMatch[1], 10) : 0;
        const mins = minMatch ? parseInt(minMatch[1], 10) : 0;
        return hours + mins / 60;
      }

      // Default to standard float parsing
      const parsed = parseFloat(str);
      return isNaN(parsed) ? 0 : parsed;
    };

    // Use a unique key that avoids collisions, especially if IDs are missing
    const getTaskKey = (t: any) => {
      const id = t.id ?? t.taskId;
      if (id) return `id-${id}`;
      // Fallback to a combination of name and index as a last resort
      return `name-${t.taskName || "unknown"}`;
    };

    const mergedTasksMap = new Map<string, any>();
    // First, add tasks from parent (the full list)
    tasksFromParent.forEach((t) => {
      if (!t) return;
      mergedTasksMap.set(getTaskKey(t), t);
    });

    // Then, override/add with tasks from the detailed call (which has actualTime/weightedHours)
    tasks.forEach((t) => {
      if (!t) return;
      const key = getTaskKey(t);
      const existing = mergedTasksMap.get(key);
      mergedTasksMap.set(key, { ...existing, ...t });
    });

    const allTasks = Array.from(mergedTasksMap.values());

    // Calculate totals from the merged list
    const calculatedWeightedHours = allTasks
      .reduce((acc, t) => acc + parseTimeValue(t.weightedHours), 0)
      .toFixed(2);

    const calculatedActualHours = allTasks
      .reduce((acc, t) => acc + parseTimeValue(t.actualTime), 0)
      .toFixed(2);

    const calculatedEstimatedHours = allTasks
      .reduce((acc, t) => acc + parseTimeValue(t.estimatedTime), 0)
      .toFixed(2);

    return {
      ...base,
      id: milestoneId,
      estimatedTime: calculatedEstimatedHours,
      actualTime: calculatedActualHours,
      weightedHours: calculatedWeightedHours,
    };
  }, [milestone, milestoneId, tasks, tasksFromParent]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Skeleton className="h-24 w-full rounded-xl" />
          <Skeleton className="h-24 w-full rounded-xl" />
        </div>
        <div className="rounded-md border p-4 space-y-4">
          <div className="flex items-center justify-between border-b pb-4">
            <Skeleton className="h-8 w-48" />
            <div className="flex gap-2">
              <Skeleton className="h-9 w-32" />
            </div>
          </div>
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex gap-4">
                <Skeleton className="h-10 flex-1" />
                <Skeleton className="h-10 w-32" />
                <Skeleton className="h-10 w-32" />
                <Skeleton className="h-10 w-16" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4 flex flex-col gap-4 md:flex-row md:items-stretch md:justify-between">
        {/* Cards Section */}
        <div className="grid flex-1 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <div className="rounded-xl border p-3 bg-card text-card-foreground shadow-sm">
            <p className="text-sm text-muted-foreground">
              Total Estimated Hours
            </p>
            <p className="text-3xl font-bold">
              {formatTime(actualMilestone?.estimatedTime)}
            </p>
          </div>

          <div className="rounded-xl border p-3 bg-card text-card-foreground shadow-sm">
            <p className="text-sm text-muted-foreground">Total Actual Hours</p>
            <p className="text-3xl font-bold">
              {formatTime(actualMilestone?.actualTime)}
            </p>
          </div>

          <div className="rounded-xl border p-3 bg-card text-card-foreground shadow-sm">
            <p className="text-sm text-muted-foreground">
              Total Weightage Hours
            </p>
            <p className="text-3xl font-bold">
              {formatTime(actualMilestone?.weightedHours)}
            </p>
          </div>
        </div>

        {/* Buttons Section */}
        {(isAdmin || isCurrentUserProjectHandler) && (
          <div className="flex shrink-0 flex-col gap-2 min-w-[160px]">
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => onEditMilestone(actualMilestone)}
            >
              <Pencil className="mr-2 h-4 w-4" />
              Edit Milestone
            </Button>

            {canDeleteMilestoneRole &&
              actualMilestone?.status === "pending" && (
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => setShowDeleteMilestoneModal(true)}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Milestone
                </Button>
              )}
          </div>
        )}
      </div>

      <GlobalTable<MilestoneTask>
        data={tasks}
        columns={getReportColumns(
          onViewTaskLog,
          handleDeleteTask,
          projectId,
          milestoneId,
          () => {
            queryClient.invalidateQueries({
              queryKey: [`${API.projects.milestone_list}/${milestoneId}`],
            });
            queryClient.invalidateQueries({
              queryKey: [API.dropdown_api.milestones, { projectId }],
            });
          },
          isAuthorized,
          isCurrentUserProjectHandler,
          actualMilestone?.status
        )}
        totalCount={metadata?.total || tasks.length}
        currentPage={metadata?.page || pagination.pageIndex + 1}
        pageSize={metadata?.limit || pagination.pageSize}
        onPaginationChange={setPagination}
        isPaginationEnabled={true}
        loading={isLoading || isDeleting}
      />

      <DeleteModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={confirmDeleteTask}
        itemName={itemToDelete?.taskName}
        loading={isDeleting}
      />

      <DeleteModal
        isOpen={showDeleteMilestoneModal}
        onClose={() => setShowDeleteMilestoneModal(false)}
        onConfirm={confirmDeleteMilestone}
        itemName={actualMilestone?.name}
        loading={isDeleting}
      />
    </div>
  );
};
