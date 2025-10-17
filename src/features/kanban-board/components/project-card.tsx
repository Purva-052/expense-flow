/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import type React from "react";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Project, ProjectPriority } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useDroppable } from "@dnd-kit/core";
// --- ✅ 1. IMPORT THE CALENDAR ICON ---
import { ArrowDown, ArrowRight, ArrowUp, CalendarDays } from "lucide-react";

type ProjectStatus = "active" | "on_hold" | "cancelled" | "completed";

// --- Status styles (no changes) ---
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

// --- Priority styles (no changes) ---
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

  const status = statusStyles[project.currentStatus as ProjectStatus];
  const priority =
    priorityStyles[project.priority] ?? priorityStyles[ProjectPriority.LOW];

  const isActive = project.currentStatus === "active";

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
              // --- ✅ 2. REDUCED PADDING AND GAP ---
              "flex flex-col gap-3 p-4 bg-secondary/50 border-l-8 h-full",
              priority.borderColor
            )}
          >
            {/* --- ✅ 3. RESTRUCTURED HEADER TO BE A SINGLE ROW --- */}
            <div className="flex items-center gap-3">
              {/* Status Indicator */}
              <div className="flex h-6 items-center">
                {isActive ? (
                  <div title="Status: Active">
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
                    </span>
                  </div>
                ) : (
                  status && (
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-xs font-bold whitespace-nowrap",
                        status.className
                      )}
                    >
                      {status.label}
                    </Badge>
                  )
                )}
              </div>

              {/* Project Name */}
              <h3 className="text-lg font-bold text-card-foreground truncate">
                {project.name}
              </h3>
            </div>

            {/* --- ✅ 4. RESTYLED DATE (NO LONGER IN A GRID) --- */}
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
                "p-4 min-h-[100px] transition-colors duration-300", // Reduced padding and min-height
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