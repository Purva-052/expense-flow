/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import type React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Project, ProjectPriority } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useDroppable } from "@dnd-kit/core";
import {
  ArrowDown,
  ArrowRight,
  ArrowUp,
  CalendarDays,
  Info,
  UserSquare,
} from "lucide-react";
import { useState } from "react";
import { ProjectDetailsDialog } from "./ProjectDetailsDialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Form, FormProvider, useForm } from "react-hook-form";
import CustomDropDownSearchable from "@/components/shared/custome-searchable-dropdown";
import { useProjectStatusChange } from "../services";

// --- Priority styles (assuming this remains the same) ---
const priorityStyles: Record<
  ProjectPriority,
  {
    label: string;
    icon: React.ElementType;
    borderColor: string;
    textColor: string;
    badgeClasses: string;
  }
> = {
  [ProjectPriority.HIGH]: {
    label: "High",
    icon: ArrowUp,
    borderColor: "border-orange-500",
    textColor: "text-orange-600",
    badgeClasses: "bg-orange-500/10 text-orange-600",
  },
  [ProjectPriority.MEDIUM]: {
    label: "Medium",
    icon: ArrowRight,
    borderColor: "border-yellow-500",
    textColor: "text-yellow-600",
    badgeClasses: "bg-yellow-500/10 text-yellow-600",
  },
  [ProjectPriority.LOW]: {
    label: "Low",
    icon: ArrowDown,
    borderColor: "border-teal-500",
    textColor: "text-teal-600",
    badgeClasses: "bg-teal-500/10 text-teal-600",
  },
};

export function ProjectCard({
  project,
  children,
}: {
  project: Project;
  children: any;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: project.id });
  const [isDialogOpen, setDialogOpen] = useState(false); // State is now managed here

  const { mutateAsync: ProjectStatusChange } = useProjectStatusChange();

  const form = useForm({
    defaultValues: { status: project.currentStatus },
  });

  const handleStatusChange = (value: string) => {
    ProjectStatusChange({
      projectId: project.id,
      status: value,
      effectiveDate: new Date().toISOString(),
    });
  };

  const priority =
    priorityStyles[project.priority] ?? priorityStyles[ProjectPriority.LOW];
  const isActive = project.currentStatus === "active";
  const completion = project.percentageComplete ?? 0;

  return (
    <>
      <Card
        ref={setNodeRef}
        className={cn(
          "overflow-hidden transition-shadow duration-300 hover:shadow-lg py-0",
          isOver ? "ring-2 ring-primary" : "shadow-md"
        )}
      >
        <CardContent className="p-0">
          <div className="grid grid-cols-1 items-start lg:grid-cols-[230px_1fr]">
            {/* Left Side: Project Details */}
            <div
              className={cn(
                "flex flex-col gap-3 p-4 bg-secondary/50 border-l-8 h-full",
                priority.borderColor
              )}
            >
              {/* Header Row */}
              <div className="flex w-full items-start justify-between gap-2">
                <div className="flex flex-1 items-start gap-3 overflow-hidden">
                  {isActive && (
                    <div
                      className="flex h-6 items-center shrink-0"
                      title="Status: Active"
                    >
                      <span className="relative flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
                      </span>
                    </div>
                  )}
                  <div className="flex min-w-0 flex-wrap items-center gap-x-1">
                    <h3 className="text-lg font-bold text-card-foreground wrap-break-word leading-tight">
                      {project.name}
                    </h3>
                    <span className="text-sm font-semibold text-muted-foreground shrink-0">
                      ({completion}%)
                    </span>
                  </div>
                </div>

                {/* --- Icon to trigger the dialog --- */}
                <div className="shrink-0">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info
                          className="h-4 w-4 cursor-pointer text-muted-foreground"
                          onClick={() => setDialogOpen(true)}
                        />
                      </TooltipTrigger>
                      <TooltipContent side="top" className="text-sm">
                        Project History
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>
              <div className="flex flex-col gap-2 mt-1">
                {/* Project Manager */}
                {project.projectHandler?.fullName && (
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <UserSquare className="h-4 w-4 shrink-0" />
                    <span className="font-semibold"> Coordinator:</span>
                    <span className="truncate">
                      {project.projectHandler.fullName}
                    </span>
                  </div>
                )}
                {/* ✅ Project Status Dropdown */}
                <div className="mt-1">
                  <FormProvider {...form}>
                    <Form>
                      <CustomDropDownSearchable
                        form={form}
                        className="text-muted-foreground"
                        name="status"
                        label="Project Status"
                        options={[
                          { value: "active-discovery", label: "Active" },
                          { value: "running", label: "Running" },
                          { value: "slow", label: "Slow" },
                          { value: "stop", label: "Stop" },
                          { value: "completed", label: "Completed" },
                        ]}
                        placeholder="Select Status"
                        searchEnabled={false}
                        onChangeValue={handleStatusChange}
                        showClearButton={false}
                      />
                    </Form>
                  </FormProvider>
                </div>
              </div>

              {/* Date */}
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-auto">
                <CalendarDays className="h-3.5 w-3.5" />
                <span>
                  {new Date(project.expectedCompletionDate).toLocaleDateString(
                    "en-GB",
                    { day: "2-digit", month: "short", year: "numeric" }
                  )}
                </span>
              </div>
            </div>

            {/* Right Side: Developer Drop Zone */}
            {children && (
              <div
                className={cn(
                  "p-4 h-full transition-colors duration-300",
                  isOver ? "bg-primary/10" : "bg-transparent"
                )}
              >
                {children}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* --- Render the Dialog Component --- */}
      {/* It will be invisible until isDialogOpen is true */}
      <ProjectDetailsDialog
        projectId={project?.id}
        isOpen={isDialogOpen}
        onOpenChange={setDialogOpen}
      />
    </>
  );
}
