/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import type React from "react";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Project, ProjectPriority } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useDroppable } from "@dnd-kit/core";
import { ArrowDown, ArrowRight, ArrowUp } from "lucide-react";

type ProjectStatus = "active" | "on_hold" | "cancelled" | "completed";

// --- REFINED: Status styles with semi-transparent backgrounds ---
const statusStyles: Record<
  ProjectStatus,
  { label: string; className: string }
> = {
  active: {
    label: "Active",
    className: "bg-green-500/10 text-green-700 border-green-500/20",
  },
  on_hold: {
    label: "On Hold",
    className: "bg-orange-500/10 text-orange-700 border-orange-500/20",
  },
  completed: {
    label: "Completed",
    className: "bg-blue-500/10 text-blue-700 border-blue-500/20",
  },
  cancelled: {
    label: "Cancelled",
    className: "bg-red-500/10 text-red-700 border-red-500/20",
  },
};

// --- REFINED: Priority styles with more detailed color properties for a better UI ---
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

  const status =
    statusStyles[project.currentStatus as ProjectStatus] ?? statusStyles.active;
  const priority =
    priorityStyles[project.priority] ?? priorityStyles[ProjectPriority.LOW];
  const PriorityIcon = priority.icon;

  return (
    <Card
      ref={setNodeRef}
      className={cn(
        "overflow-hidden transition-shadow duration-300 hover:shadow-lg !py-0",
        isOver ? "ring-2 ring-primary" : "shadow-md"
      )}
    >
      <CardContent className="p-0">
        <div className="grid grid-cols-1 items-start lg:grid-cols-[300px_1fr]">
          {/* Left Side: Project Details */}
          <div
            className={cn(
              "flex flex-col gap-4 p-5 bg-secondary/50 border-l-4 h-full",
              priority.borderColor
            )}
          >
            {/* Header: Project Name & Status */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground font-medium">
                  PROJECT
                </span>
                <Badge
                  variant="outline"
                  className={cn("text-xs font-bold", status.className)}
                >
                  {status.label}
                </Badge>
              </div>
              <h3 className="text-xl font-bold text-card-foreground truncate">
                {project.name}
              </h3>
            </div>

            {/* Details: Priority & Completion Date */}
            <div className="grid grid-cols-2 gap-4 mt-auto">
              <div>
                <div className="text-xs text-muted-foreground font-medium mb-1">
                  PRIORITY
                </div>
                <Badge
                  className={cn(
                    "flex items-center gap-1.5 w-fit pl-2 pr-3 py-1 text-sm font-bold",
                    priority.badgeClasses
                  )}
                >
                  <PriorityIcon className="h-4 w-4" />
                  {priority.label}
                </Badge>
              </div>
              <div>
                <div className="text-xs text-muted-foreground font-medium mb-1">
                  TARGET DATE
                </div>
                <div className="text-sm font-semibold text-card-foreground">
                  {new Date(project.expectedCompletionDate).toLocaleDateString(
                    "en-GB", // Using a consistent date format
                    { day: "2-digit", month: "short", year: "numeric" }
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right Side: Developer Drop Zone */}
          {children && (
            <div
              className={cn(
                "p-5 min-h-[120px] transition-colors duration-300",
                isOver ? "bg-primary/10" : "bg-transparent"
              )}
            >
              {children}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
