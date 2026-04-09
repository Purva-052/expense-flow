"use client";

import {
  useState,
  useMemo,
  useEffect,
  useRef,
  useCallback,
  type UIEvent,
} from "react";
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
      accessorKey: "weightageHours",
      header: "Weightage Hours (hrs)",
      cell: ({ row }) => (
        <span className="font-semibold text-blue-600">
          {formatTime(row.original.weightageHours)}
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

const normalizeTasks = (milestone: any): MilestoneTask[] => {
  let baseTasks: MilestoneTask[] = [];
  if (Array.isArray(milestone?.tasks)) baseTasks = milestone.tasks;
  else if (Array.isArray(milestone?.data?.tasks)) baseTasks = milestone.data.tasks;
  else if (Array.isArray(milestone)) baseTasks = milestone;

  return baseTasks.map((task) => {
    const taskWithWeightage = task as MilestoneTask & {
      weightageHours?: string;
      weightageTime?: string;
    };

    return {
      ...task,
      weightageHours:
        taskWithWeightage.weightageHours ??
        taskWithWeightage.weightageTime ??
        "0.00",
    };
  });
};

export const ActiveMilestoneContent = ({
  projectId,
  milestoneId,
  onViewTaskLog,
  onEditMilestone,
  isCurrentUserProjectHandler,
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
  const listRef = useRef<HTMLDivElement | null>(null);
  const pageSize = 10;

  const [page, setPage] = useState(1);
  const [allTasks, setAllTasks] = useState<MilestoneTask[]>([]);
  const [hasMore, setHasMore] = useState(true);

  const [itemToDelete, setItemToDelete] = useState<MilestoneTask | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDeleteMilestoneModal, setShowDeleteMilestoneModal] =
    useState(false);

  const { data: taskDataResponse, isLoading, isFetching } = useGetMilestoneTasks(
    milestoneId,
    {
      page,
      limit: pageSize,
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

  const tasks = useMemo<MilestoneTask[]>(() => normalizeTasks(milestone), [milestone]);

  useEffect(() => {
    setAllTasks([]);
    setPage(1);
    setHasMore(true);
  }, [milestoneId]);

  useEffect(() => {
    if (!taskDataResponse) return;

    setAllTasks((prev) => {
      if (page === 1) return tasks;

      const merged = [...prev, ...tasks];
      return merged.filter(
        (task, index, self) => index === self.findIndex((item) => item.id === task.id)
      );
    });

    const totalPages = metadata?.totalPages;
    const total = metadata?.total;
    const currentPage = metadata?.page ?? page;

    if (totalPages) {
      setHasMore(currentPage < totalPages);
      return;
    }

    if (typeof total === "number") {
      setHasMore(page * pageSize < total);
      return;
    }

    setHasMore(tasks.length >= pageSize);
  }, [taskDataResponse, tasks, metadata?.page, metadata?.totalPages, metadata?.total, page]);

  const handleListScroll = useCallback(
    (event: UIEvent<HTMLDivElement>) => {
      const target = event.currentTarget;
      const reachedBottom =
        target.scrollTop + target.clientHeight >= target.scrollHeight - 100;

      if (reachedBottom && hasMore && !isFetching && !isLoading) {
        setPage((prev) => prev + 1);
      }
    },
    [hasMore, isFetching, isLoading]
  );

  const actualMilestone = useMemo<any>(() => {
    let base: any = {};
    if (milestone?.tasks) base = milestone;
    else if (milestone?.data?.tasks) base = milestone.data;
    else base = milestone || {};

    return {
      ...base,
      id: milestoneId,
      tasks: allTasks.length > 0 ? allTasks : base.tasks,
      estimatedTime: base.estimatedTime || "0.00",
      actualTime: base.actualTime || "0.00",
      weightageHours: base.weightageHours || base.weightageTime || "0.00",
    };
  }, [allTasks, milestone, milestoneId]);

  if (isLoading && allTasks.length === 0) {
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
      <div className="mb-4 flex flex-col gap-4 xl:flex-row xl:items-start">
        {/* Cards Section */}
        <div className="grid flex-1 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {/* Estimated */}
          <div className="rounded-xl border bg-card p-3 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Total Estimated Hours
              </p>
              {" - "}
              <p className="text-[20px] font-semibold tracking-tight">
                {formatTime(actualMilestone?.estimatedTime)}
              </p>
            </div>
          </div>

          {/* Actual */}
          <div className="rounded-xl border bg-card p-3 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Total Actual Hours
              </p>
              {" - "}
              <p className="text-[20px] font-semibold tracking-tight">
                {formatTime(actualMilestone?.actualTime)}
              </p>
            </div>
          </div>

          {/* Weightage */}
          <div className="rounded-xl border bg-card p-3 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Total Weightage Hours
              </p>
              {" - "}
              <p className="text-[20px] font-semibold tracking-tight">
                {formatTime(actualMilestone?.weightageHours)}
              </p>
            </div>
          </div>
        </div>

        {/* Buttons Section */}
        {(isAdmin || isCurrentUserProjectHandler) && (
          <div className="flex flex-col gap-1 sm:flex-row xl:w-auto xl:flex-col xl:min-w-[200px]">
            <Button
              variant="outline"
              className="justify-center xl:justify-start h-8"
              onClick={() => onEditMilestone(actualMilestone)}
            >
              <Pencil className="mr-2 h-4 w-4" />
              Edit Milestone
            </Button>

            {canDeleteMilestoneRole &&
              actualMilestone?.status === "pending" && (
                <Button
                  variant="outline"
                  className="justify-start h-7"
                  onClick={() => setShowDeleteMilestoneModal(true)}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Milestone
                </Button>
              )}
          </div>
        )}
      </div>

      <div
        ref={listRef}
        onScroll={handleListScroll}
        className="max-h-[55dvh] overflow-auto"
      >
        <GlobalTable<MilestoneTask>
          data={allTasks}
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
              setPage(1);
              setHasMore(true);
            },
            isAuthorized,
            isCurrentUserProjectHandler,
            actualMilestone?.status
          )}
          totalCount={metadata?.total || allTasks.length}
          currentPage={1}
          pageSize={allTasks.length || pageSize}
          onPaginationChange={() => {}}
          isPaginationEnabled={false}
          loading={(isLoading && page === 1) || isDeleting}
          scrollY=""
        />
      </div>

      {isFetching && page > 1 && (
        <div className="py-2 text-center text-sm text-muted-foreground">
          Loading more tasks...
        </div>
      )}

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
