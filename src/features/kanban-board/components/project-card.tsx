/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import type React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Project, ProjectPriority } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useDroppable } from "@dnd-kit/core";
import { ArrowDown, ArrowRight, ArrowUp, CalendarDays } from "lucide-react";

// --- Priority styles ---
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

  const priority =
    priorityStyles[project.priority] ?? priorityStyles[ProjectPriority.LOW];

  const isActive = project.currentStatus === "active";

  // --- ✅ Extract project completion percentage ---
  const completion = project.percentageComplete ?? 0; // Default to 0 if not provided

  return (
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
            <div className="flex items-start gap-3 ">
              {/* Status Indicator */}
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

              {/* Project Name with inline percentage */}
              <div className="flex flex-wrap items-center gap-1 min-w-0">
                <h3 className="text-lg font-bold text-card-foreground wrap-break-word leading-tight">
                  {project.name}
                </h3>
                <span className="text-sm font-semibold text-muted-foreground shrink-0">
                  ({completion}%)
                </span>
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
                "p-4 min-h-[100px] transition-colors duration-300",
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
