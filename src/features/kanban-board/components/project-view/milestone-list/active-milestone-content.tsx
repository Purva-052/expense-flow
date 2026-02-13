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
          {row.original.estimatedTime || "0"}
        </span>
      ),
    },
    {
      accessorKey: "actualTime",
      header: "Actual Hours (hrs)",
      cell: ({ row }) => (
        <span className="font-semibold text-green-600">
          {row.original.actualTime || "0"}
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
    if (Array.isArray(milestone?.tasks)) return milestone.tasks;
    if (Array.isArray(milestone?.data?.tasks)) return milestone.data.tasks;
    if (Array.isArray(milestone)) return milestone;
    return [];
  }, [milestone]);

  const actualMilestone = useMemo<any>(() => {
    let base: any = {};
    if (milestone?.tasks) base = milestone;
    else if (milestone?.data?.tasks) base = milestone.data;
    else base = milestone || {};

    return { ...base, id: milestoneId };
  }, [milestone, milestoneId]);

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
      <div className="mb-4 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="grid flex-1 grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="rounded-xl border p-3 bg-card text-card-foreground shadow-sm">
            <p className="text-sm text-muted-foreground">
              Total Estimated Hours
            </p>
            <p className="text-3xl font-bold">
              {actualMilestone?.estimatedTime || "0"}
            </p>
          </div>
          <div className="rounded-xl border p-3 bg-card text-card-foreground shadow-sm">
            <p className="text-sm text-muted-foreground">Total Actual Hours</p>
            <p className="text-3xl font-bold">
              {actualMilestone?.actualTime || "0"}
            </p>
          </div>
        </div>

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
