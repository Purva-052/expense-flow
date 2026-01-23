"use client";

import { MoreVertical, Calendar, Pin, UserSquare, Users } from "lucide-react";
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
import { useProjectsStore } from "../../../projects/stores/useProjectsStore";
import { useDroppable } from "@dnd-kit/core";
import { cn } from "@/lib/utils";
import { FormProvider, useForm } from "react-hook-form";
import { useProjectStatusChange } from "../../services";
import { ReasonDialog } from "../status-reason-dialog";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { roles } from "@/utils/constant";
import { usePinProject, useUnpinProject } from "../../../projects/services";
import CustomDropDownSearchable from "@/components/shared/custome-searchable-dropdown";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useAuthStore } from "@/stores/use-auth-store";

const priorityColorMap: any = {
  high: "bg-red-100 text-red-700",
  medium: "bg-yellow-100 text-yellow-700",
  low: "bg-green-100 text-green-700",
};

const priorityBorderMap: any = {
  high: "border-l-orange-500",
  medium: "border-l-yellow-500",
  low: "border-l-teal-500",
};

export function ProjectCard({ project, children, onStatusChanged }: any) {
  const [openDrawer, setOpenDrawer] = useState(false);
  const { setOpen, setCurrentRow } = useProjectsStore();
  const { setNodeRef, isOver } = useDroppable({ id: project?.id });

  const [isReasonDialogOpen, setReasonDialogOpen] = useState(false);
  const [pendingStatus, setPendingStatus] = useState<string | null>(null);
  const [isPinConfirmOpen, setIsPinConfirmOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { user } = useAuthStore();
  const userRole = user?.user?.role;
  const isProjectHandler =
    userRole === roles.PROJECT_MANAGER || userRole === roles.TEAM_LEAD;
  const isAdmin = userRole === roles.ADMIN;

  const { mutateAsync: ProjectStatusChange } = useProjectStatusChange(() => {
    onStatusChanged?.();
  });

  const { mutateAsync: pinProject } = usePinProject(project?.id);
  const { mutateAsync: unpinProject } = useUnpinProject(project?.id);

  const form = useForm({
    defaultValues: { status: project?.currentStatus },
  });

  const statusOptions = [
    { value: "active-discovery", label: "Active Discovery" },
    { value: "running", label: "Running" },
    { value: "slow", label: "Slow" },
    { value: "stop", label: "Stop" },
    { value: "completed", label: "Completed" },
  ];

  const handleStatusChange = async (value: string) => {
    if (value === "slow") {
      setPendingStatus(value);
      setReasonDialogOpen(true);
    } else {
      await ProjectStatusChange({
        projectId: project.id,
        status: value,
        effectiveDate: new Date().toISOString(),
      });
      form.setValue("status", value);
    }
  };

  const handleStatusChangeWithReason = async (reason: string) => {
    if (pendingStatus) {
      await ProjectStatusChange({
        projectId: project.id,
        status: pendingStatus,
        reason: reason,
        effectiveDate: new Date().toISOString(),
      });
      form.setValue("status", pendingStatus);
      setPendingStatus(null);
      setReasonDialogOpen(false);
    }
  };

  const handleReasonDialogChange = (isOpen: boolean) => {
    if (!isOpen && pendingStatus) {
      form.setValue("status", project.currentStatus);
      setPendingStatus(null);
    }
    setReasonDialogOpen(isOpen);
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
    setCurrentRow(project);
    setOpen("history");
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
          "bg-white border-l-4 rounded-lg shadow-sm p-6 hover:shadow-md transition-all duration-300 relative",
          priorityBorderMap[priority.toLowerCase()] || "border-l-gray-400",
          isOver && "ring-2 ring-primary bg-primary/5"
        )}
      >
        {/* Pin Icon - Top Right Corner */}
        <div className="absolute top-7 right-10">
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
        </div>

        {/* Info Icon for Timeline */}
        {/* <div className="absolute top-4 right-16">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info
                  className="h-5 w-5 cursor-pointer text-muted-foreground transition-colors duration-200 hover:text-primary"
                  onClick={handleViewTimeline}
                />
              </TooltipTrigger>
              <TooltipContent side="top" className="text-sm">
                Project History
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div> */}

        {/* Header */}
        <div className="flex items-start justify-between mb-4 pr-12">
          <div className="flex-1">
            <div className="flex flex-col gap-1 mb-1">
              <h3 className="text-lg font-semibold text-gray-900 leading-tight pr-4">
                {title}
              </h3>
              <span className="text-sm font-semibold text-muted-foreground">
                ({progress}%)
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent side="bottom" align="end">
                <DropdownMenuGroup>
                  <DropdownMenuItem onClick={() => setOpenDrawer(true)}>
                    View Details
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleViewTimeline}>
                    View Timeline
                  </DropdownMenuItem>
                  {/* <DropdownMenuItem>Edit Project</DropdownMenuItem> */}
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Coordinator and Client Info */}
        <div className="flex flex-col gap-2 mb-4">
          {project?.projectHandler?.fullName && (
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <UserSquare className="h-4 w-4 shrink-0" />
              <span className="truncate">{coordinatorName}</span>
            </div>
          )}
          {project?.client?.name && (
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Users className="h-4 w-4 shrink-0" />
              <span className="truncate">Client: {clientName}</span>
            </div>
          )}

          {/* Status Dropdown */}
          <div className="mt-1">
            {canEditStatus ? (
              <FormProvider {...form}>
                <form>
                  <CustomDropDownSearchable
                    form={form}
                    className="text-muted-foreground max-w-[200px]"
                    name="status"
                    label=" "
                    options={statusOptions}
                    placeholder="Select Status"
                    searchEnabled={false}
                    onChangeValue={handleStatusChange}
                    showClearButton={false}
                  />
                </form>
              </FormProvider>
            ) : (
              <div className="inline-flex px-3 py-1 rounded-full text-xs font-medium capitalize bg-gray-100 text-gray-700">
                {currentStatus.replace("-", " ")}
              </div>
            )}
          </div>
        </div>

        {/* Deadline and Progress */}
        <div className="flex items-center justify-between mb-3 pt-2 border-t border-gray-100">
          <div className="flex items-center gap-2 text-gray-600">
            <Calendar className="h-4 w-4" />
            <span className="text-xs text-muted-foreground">
              Deadline: {deadline}
            </span>
          </div>
          <span className="text-xs font-bold text-gray-900">{progress}%</span>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
          <div
            className="h-2 rounded-full transition-all bg-[#E80339]"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Team Allocation Area (Children) */}
        <div className="mb-4 min-h-[40px]">{children}</div>

        {/* Details Grid */}
        <div className="grid grid-cols-3 gap-4 border-t border-gray-100 pt-4 mt-3">
          {/* <div>
            <p className="text-[10px] text-gray-400 uppercase font-medium tracking-wider mb-1">
              Client
            </p>
            <p className="text-sm font-semibold text-gray-800 truncate">
              {clientName}
            </p>
          </div> */}

          <div>
            <p className="text-[10px] text-gray-400 uppercase font-medium tracking-wider mb-1">
              Start Date
            </p>
            <p className="text-sm font-semibold text-gray-800 truncate">
              {startDate}
            </p>
          </div>

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

          {/* <div>
            <p className="text-[10px] text-gray-400 uppercase font-medium tracking-wider mb-1">
              Project Coordinator
            </p>
            <p className="text-sm font-semibold text-gray-800 truncate">
              {coordinatorName}
            </p>
          </div> */}
        </div>
      </div>

      <Drawer open={openDrawer} onOpenChange={setOpenDrawer} direction="right">
        <ProjectDetails projectId={project?.id} />
      </Drawer>

      <ReasonDialog
        isOpen={isReasonDialogOpen}
        onOpenChange={handleReasonDialogChange}
        onSubmit={handleStatusChangeWithReason}
      />

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
