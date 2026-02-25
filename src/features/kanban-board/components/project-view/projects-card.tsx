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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

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

// const getStatusBadgeClasses = (status?: string) => {
//   const s = (status || "").toLowerCase();
//   switch (s) {
//     case "active-discovery":
//       return "bg-blue-100 text-blue-700";
//     case "running":
//       return "bg-green-100 text-green-700";
//     case "slow":
//       return "bg-amber-100 text-amber-700";
//     case "stop":
//       return "bg-red-100 text-red-700";
//     case "completed":
//       return "bg-emerald-100 text-emerald-700";
//     default:
//       return "bg-gray-100 text-gray-700";
//   }
// };

export function ProjectCard({
  project,
  children,
  onStatusChanged,
  isArchiveTab,
  view = "grid",
}: any) {
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

  const handleDelete = () => {
    setOpen("delete");
    setCurrentRow(project);
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
  const canDeleteProject = project?.percentageComplete === 0;
  // const currentStatus = project?.currentStatus || "N/A";
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
  const coordinatorProfilePic = project?.projectHandler?.profilePicUrl || "";
  // const startDate = project?.startDate
  //   ? new Date(project.startDate).toLocaleDateString("en-GB", { ytrq
  //       day: "2-digit",
  //       month: "short",
  //       year: "numeric",
  //     })
  //   : deadline;
  const priority = project?.priority || "low";

  const isHandlerAssigned = !!project?.projectHandler?.id;
  const isCurrentUserAssignedHandler =
    isHandlerAssigned && project?.projectHandler?.id === user?.user?.id;
  const canEditStatus =
    isAdmin ||
    (!isHandlerAssigned && isProjectHandler) ||
    (isHandlerAssigned && isCurrentUserAssignedHandler);

  const getStatusBadgeClasses = (status?: string) => {
    const s = (status || "").toLowerCase();
    switch (s) {
      case "active-discovery":
      case "planning":
        return "bg-blue-100 text-blue-700";
      case "running":
      case "in-progress":
        return "bg-amber-100 text-amber-700";
      case "completed":
        return "bg-green-100 text-green-700";
      case "stop":
      case "on-hold":
        return "bg-gray-100 text-gray-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const renderGridView = () => (
    <div
      ref={setNodeRef}
      className={cn(
        "bg-white border-l-4 rounded-lg shadow-sm p-6 hover:shadow-md transition-all duration-300 relative border-l-gray-700",
        isOver && "ring-2 ring-primary bg-primary/5"
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex flex-col gap-1 mb-1">
            <h3
              className="text-lg font-semibold text-gray-900 leading-tight pr-4 cursor-pointer hover:text-primary transition-colors"
              onClick={() => setOpenDrawer(true)}
            >
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
                      {!isArchiveTab && (
                        <DropdownMenuItem
                          onClick={() => {
                            setCurrentRow(project);
                            setOpen("edit");
                          }}
                        >
                          Edit Project
                        </DropdownMenuItem>
                      )}
                      {!isArchiveTab && canDeleteProject && (
                        <DropdownMenuItem onClick={handleDelete}>
                          Delete Project
                        </DropdownMenuItem>
                      )}
                    </>
                  )}
                </DropdownMenuGroup>
              </DropdownMenuContent>
            )}
          </DropdownMenu>
        </div>
      </div>

      {/* Deadline and Progress */}
      <div className="flex items-center justify-between mb-3 mt-2">
        <div className="flex items-center gap-2 text-gray-600">
          <Calendar className="h-4 w-4" />
          <span className="text-xs text-muted-foreground">
            Deadline: {deadline}
          </span>
        </div>
        <div>
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

          <div className="flex items-center gap-2">
            <Avatar className="h-6 w-6">
              <AvatarImage src={coordinatorProfilePic} />
              <AvatarFallback className="text-black text-[10px] font-semibold">
                {coordinatorName?.charAt(0)}
              </AvatarFallback>
            </Avatar>

            <p className="text-xs font-semibold text-gray-800 leading-none">
              {coordinatorName}
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderListView = () => (
    <div
      ref={setNodeRef}
      className={cn(
        "min-w-[860px] bg-white border-b hover:bg-gray-50 transition-colors py-4 px-6 relative group flex items-center gap-4",
        isOver && "bg-primary/5"
      )}
    >
      <div className="w-1 bg-gray-700 rounded-full h-8 shrink-0" />

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h3
            className="text-sm font-bold text-gray-900 truncate cursor-pointer hover:text-primary transition-colors"
            onClick={() => setOpenDrawer(true)}
          >
            {title}
          </h3>
          <Pin
            className={cn(
              "h-3.5 w-3.5 cursor-pointer transition-colors hover:text-primary",
              project?.isPinned
                ? "fill-primary text-primary"
                : "text-muted-foreground"
            )}
            onClick={handlePinToggle}
          />
        </div>
        {/* <div className="py-2"> */}
        <p className="text-[11px] text-muted-foreground truncate font-medium">
          Client : {clientName}
        </p>
        <p className="text-[11px] text-muted-foreground truncate font-medium">
          Coordinator : {coordinatorName}
        </p>
        {/* </div> */}
      </div>

      {/* <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h3
            className="text-sm font-bold text-gray-900 truncate cursor-pointer hover:text-primary transition-colors"
            onClick={() => setOpenDrawer(true)}
          >
            {title}
          </h3>
          <Pin
            className={cn(
              "h-3.5 w-3.5 cursor-pointer transition-colors hover:text-primary",
              project?.isPinned
                ? "fill-primary text-primary"
                : "text-muted-foreground"
            )}
            onClick={handlePinToggle}
          />
        </div>
      </div> */}

      <div className="w-32 shrink-0 text-center">
        <div
          className={cn(
            "px-2.5 py-0.5 rounded-full text-[10px] font-semibold inline-block",
            getStatusBadgeClasses(project?.currentStatus)
          )}
        >
          {capitalizeFirstLetter(project?.currentStatus || "Planning").replace(
            /-/g,
            " "
          )}
        </div>
      </div>

      <div className="w-48 shrink-0 space-y-1.5">
        <div className="flex justify-between items-center text-[12px] font-medium">
          <span>Progress</span>
          <span>{progress}%</span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-1.5">
          <div
            className="h-1.5 rounded-full bg-black"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="w-28 shrink-0 flex items-center gap-2 text-[11px] text-muted-foreground">
        <Calendar className="h-3.5 w-3.5" />
        <span>{deadline}</span>
      </div>

      <div className="w-24 shrink-0 flex -space-x-1.5">{children}</div>

      <div className="w-[64px] shrink-0 flex items-center justify-end pr-4 gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuGroup>
              <DropdownMenuItem onClick={() => setOpenDrawer(true)}>
                View Details
              </DropdownMenuItem>
              {!isDeveloperView && (
                <>
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
                      {!isArchiveTab && (
                        <DropdownMenuItem
                          onClick={() => {
                            setCurrentRow(project);
                            setOpen("edit");
                          }}
                        >
                          Edit Project
                        </DropdownMenuItem>
                      )}
                      {!isArchiveTab && canDeleteProject && (
                        <DropdownMenuItem onClick={handleDelete}>
                          Delete Project
                        </DropdownMenuItem>
                      )}
                    </>
                  )}
                </>
              )}
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );

  function capitalizeFirstLetter(string: string) {
    if (!string) return "";
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

  return (
    <>
      {view === "grid" ? renderGridView() : renderListView()}

      <Drawer
        open={openDrawer}
        onOpenChange={setOpenDrawer}
        direction="right"
        modal
      >
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
            ? `Are you sure you want to unpin ${project?.name || "this"} project?`
            : `Are you sure you want to pin ${project?.name || "this"} project?`
        }
        confirmText={project?.isPinned ? "Unpin" : "Pin"}
        destructive={false}
        handleConfirm={handleConfirmPin}
        isLoading={isSubmitting}
      />
    </>
  );
}
