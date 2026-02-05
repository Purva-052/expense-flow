"use client";

import { Calendar, Pin, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState } from "react";
import { ProjectDetails } from "./project-details";
import { Drawer } from "@/components/ui/drawer";
import { useDroppable } from "@dnd-kit/core";
import { cn } from "@/lib/utils";
import { useProjectStatusChange } from "../../services";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { roles } from "@/utils/constant";
import { usePinProject, useUnpinProject } from "../../../projects/services";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useAuthStore } from "@/stores/use-auth-store";
import { ChangeStatusDialog } from "@/components/shared/custom-status-change";
import { StatusConfirmDialog } from "@/components/shared/status-confirm-dialog";
import ProjectDetailsDialog from "../ProjectDetailsDialog";
import { useProjectsStore } from "@/features/projects/stores/useProjectsStore";

const priorityColorMap: any = {
  high: "bg-red-100 text-red-700",
  medium: "bg-yellow-100 text-yellow-700",
  low: "bg-green-100 text-green-700",
};

// const priorityBorderMap: any = {
//   high: "border-l-orange-500",
//   medium: "border-l-black",
//   low: "border-l-teal-500",
// };

const getStatusBadgeClasses = (status?: string) => {
  const s = (status || "").toLowerCase();
  switch (s) {
    case "active-discovery":
      return "bg-blue-100 text-blue-700";
    case "running":
      return "bg-green-100 text-green-700";
    case "slow":
      return "bg-amber-100 text-amber-700";
    case "stop":
      return "bg-red-100 text-red-700";
    case "completed":
      return "bg-emerald-100 text-emerald-700";
    default:
      return "bg-gray-100 text-gray-700";
  }
};

export function ProjectCard({ project, children, onStatusChanged }: any) {
  const { setOpen, setCurrentRow } = useProjectsStore();
  const [openDrawer, setOpenDrawer] = useState(false);
  const { setNodeRef, isOver } = useDroppable({ id: project?.id });
  const [isStatusDialogOpen, setStatusDialogOpen] = useState(false);
  const [isStatusUpdating, setIsStatusUpdating] = useState(false);

  const [isPinConfirmOpen, setIsPinConfirmOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { user } = useAuthStore();
  const userRole = user?.user?.role;
  const isProjectHandler =
    userRole === roles.PROJECT_MANAGER || userRole === roles.TEAM_LEAD;
  const isAdmin = userRole === roles.ADMIN;
  const isDeveloperView = userRole === roles.DEVELOPER;

  const { mutateAsync: ProjectStatusChange } = useProjectStatusChange(() => {
    onStatusChanged?.();
  });
  const [activeTab, setActiveTab] = useState<"developers" | "history">(
    "developers"
  );
  const { mutateAsync: pinProject } = usePinProject(project?.id);
  const { mutateAsync: unpinProject } = useUnpinProject(project?.id);
  const [isDialogOpen, setDialogOpen] = useState(false);
  const [isConfirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [pendingStatus, setPendingStatus] = useState<
    "completed" | "stop" | null
  >(null);

  const handleStatusUpdate = async (newStatus: string, note: string) => {
    // If changing to completed or stop, show the confirm dialog
    if ((newStatus === "completed" || newStatus === "stop") && !note) {
      setPendingStatus(newStatus as "completed" | "stop");
      setStatusDialogOpen(false);
      setConfirmDialogOpen(true);
      return;
    }

    // Otherwise, proceed with the status change
    try {
      setIsStatusUpdating(true);
      await ProjectStatusChange({
        projectId: project.id,
        status: newStatus,
        reason: note,
        effectiveDate: new Date().toISOString(),
      });
      setStatusDialogOpen(false);
      setConfirmDialogOpen(false);
    } catch (error) {
      console.error("Failed to update status:", error);
    } finally {
      setIsStatusUpdating(false);
    }
  };

  const handlePinToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsPinConfirmOpen(true);
  };

  const handleConfirmPin = async () => {
    try {
      setIsSubmitting(true);
      if (project.isPinned) {
        await unpinProject();
      } else {
        await pinProject();
      }
      setIsPinConfirmOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleViewTimeline = () => {
    setActiveTab("developers");
    setDialogOpen(true);
    // setCurrentRow(project);
    // setOpen("history");
  };

  const title = project?.name || "N/A";
  const currentStatus = project?.currentStatus || "N/A";
  const deadline = project?.expectedCompletionDate
    ? new Date(project.expectedCompletionDate).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "N/A";
  const progress = project?.percentageComplete || 0;
  const clientName = project?.client?.name || "N/A";
  const coordinatorName = project?.projectHandler?.fullName || "N/A";
  const startDate = project?.startDate
    ? new Date(project.startDate).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : deadline;
  const priority = project?.priority || "low";

  const isHandlerAssigned = !!project?.projectHandler?.id;
  const isCurrentUserAssignedHandler =
    isHandlerAssigned && project?.projectHandler?.id === user?.user?.id;
  const canEditStatus =
    isAdmin ||
    (!isHandlerAssigned && isProjectHandler) ||
    (isHandlerAssigned && isCurrentUserAssignedHandler);

  return (
    <>
      <div
        ref={setNodeRef}
        className={cn(
          "bg-white border-l-4 rounded-lg shadow-sm p-6 hover:shadow-md transition-all duration-300 relative border-l-gray-700",
          isOver && "ring-2 ring-primary bg-primary/5"
        )}
      >
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex flex-col gap-1 mb-1">
              <h3 className="text-lg font-semibold text-gray-900 leading-tight pr-4">
                {title}
              </h3>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {/* Pin Icon */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  {project?.isPinned ? (
                    <Pin
                      className="h-5 w-5 cursor-pointer text-primary fill-primary transition-colors duration-200 hover:text-primary/80"
                      onClick={handlePinToggle}
                    />
                  ) : (
                    <Pin
                      className="h-5 w-5 cursor-pointer text-muted-foreground transition-colors duration-200 hover:text-primary"
                      onClick={handlePinToggle}
                    />
                  )}
                </TooltipTrigger>
                <TooltipContent side="top" className="text-sm">
                  {project?.isPinned ? "Unpin Project" : "Pin Project"}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            {/* Dropdown Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="p-1 rounded-full hover:bg-gray-200"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              {isDeveloperView ? (
                <DropdownMenuContent side="bottom" align="end">
                  <DropdownMenuGroup>
                    <DropdownMenuItem onClick={() => setOpenDrawer(true)}>
                      View Details
                    </DropdownMenuItem>
                    {/* <DropdownMenuItem onClick={handleViewTimeline}>
                    View Timeline
                  </DropdownMenuItem>
                  {canEditStatus && (
                    <DropdownMenuItem onClick={() => setStatusDialogOpen(true)}>
                      Change Status
                    </DropdownMenuItem>
                  )} */}
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              ) : (
                <DropdownMenuContent side="bottom" align="end">
                  <DropdownMenuGroup>
                    <DropdownMenuItem onClick={() => setOpenDrawer(true)}>
                      View Details
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleViewTimeline}>
                      View Timeline
                    </DropdownMenuItem>
                    {canEditStatus && (
                      <>
                        <DropdownMenuItem
                          onClick={() => setStatusDialogOpen(true)}
                        >
                          Change Status
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => {
                            setCurrentRow(project);
                            setOpen("edit");
                          }}
                        >
                          Edit Project
                        </DropdownMenuItem>
                        {/* <DropdownMenuItem
                        onClick={() => setStatusDialogOpen(true)}
                      >
                        Delete Project
                      </DropdownMenuItem> */}
                      </>
                    )}
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              )}
            </DropdownMenu>

            {/* Removed triggerless DropdownMenu */}
          </div>
        </div>

        {/* Coordinator and Client Info */}

        {/* Deadline and Progress */}
        <div className="flex items-center justify-between mb-3 mt-2">
          <div className="flex items-center gap-2 text-gray-600">
            <Calendar className="h-4 w-4" />
            <span className="text-xs text-muted-foreground">
              Deadline: {deadline}
            </span>
          </div>
          <div className="flex flex-col gap-2">
            <div className="mt-1">
              <div
                className={cn(
                  "inline-flex px-3 py-1 rounded-full text-xs font-medium capitalize",
                  getStatusBadgeClasses(currentStatus),
                  canEditStatus && "cursor-pointer hover:bg-gray-200"
                )}
                onClick={() => canEditStatus && setStatusDialogOpen(true)}
              >
                {currentStatus.replace(/-/g, " ")}
              </div>
            </div>
          </div>
        </div>
        <div className="flex justify-between">
          <span className="text-xs text-muted-foreground mb-1">Progress</span>
          <span className="text-xs font-bold text-gray-900">{progress}%</span>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
          <div
            className="h-2 rounded-full transition-all bg-gray-800"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Team Allocation Area (Children) */}
        <div className="mb-4 min-h-[40px]">{children}</div>

        {/* Details Grid */}
        <div className="grid grid-cols-2 gap-x-8 gap-y-4 border-t border-gray-100 pt-4 mt-3">
          {/* Client */}
          <div>
            <p className="text-[10px] text-gray-400 uppercase font-medium tracking-wider mb-1">
              Client
            </p>
            <p className="text-xs font-semibold text-gray-800 truncate">
              {clientName}
            </p>
          </div>

          {/* Coordinator */}
          <div>
            <p className="text-[10px] text-gray-400 uppercase font-medium tracking-wider mb-1">
              Project Coordinator
            </p>
            <p className="text-xs font-semibold text-gray-800">
              {coordinatorName}
            </p>
          </div>

          {/* Start Date */}
          <div>
            <p className="text-[10px] text-gray-400 uppercase font-medium tracking-wider mb-1">
              Start Date
            </p>
            <p className="text-xs font-semibold text-gray-800">{startDate}</p>
          </div>

          {/* Priority */}
          <div>
            <p className="text-[10px] text-gray-400 uppercase font-medium tracking-wider mb-1">
              Priority
            </p>
            <span
              className={cn(
                "inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase",
                priorityColorMap[priority.toLowerCase()] ||
                  "bg-gray-100 text-gray-600"
              )}
            >
              {priority}
            </span>
          </div>
        </div>
      </div>

      <Drawer open={openDrawer} onOpenChange={setOpenDrawer} direction="right">
        {openDrawer && <ProjectDetails projectId={project?.id} />}
      </Drawer>

      <ProjectDetailsDialog
        project={project}
        isOpen={isDialogOpen}
        onOpenChange={setDialogOpen}
        defaultTab={activeTab}
      />
      {/* NEW STATUS DIALOG */}
      <ChangeStatusDialog
        open={isStatusDialogOpen}
        onOpenChange={setStatusDialogOpen}
        currentStatus={project?.currentStatus}
        onSubmit={handleStatusUpdate}
        isLoading={isStatusUpdating}
        projectName={project?.name}
      />

      {/* STATUS CONFIRM DIALOG FOR COMPLETED/STOP */}
      {pendingStatus && (
        <StatusConfirmDialog
          open={isConfirmDialogOpen}
          onOpenChange={setConfirmDialogOpen}
          projectName={project?.name}
          newStatus={pendingStatus}
          onSubmit={handleStatusUpdate}
          isLoading={isStatusUpdating}
        />
      )}

      <ConfirmDialog
        open={isPinConfirmOpen}
        onOpenChange={setIsPinConfirmOpen}
        title={project?.isPinned ? "Unpin Project" : "Pin Project"}
        desc={
          project?.isPinned
            ? `Are you sure you want to unpin ${project.name || "this"} project?`
            : `Are you sure you want to pin ${project.name || "this"} project?`
        }
        confirmText={project?.isPinned ? "Unpin" : "Pin"}
        destructive={false}
        handleConfirm={handleConfirmPin}
        isLoading={isSubmitting}
      />
    </>
  );
}
