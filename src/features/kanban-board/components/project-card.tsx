"use client";

import type React from "react";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Project } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useDroppable } from "@dnd-kit/core";

// Define a type for the status to ensure type safety
type ProjectStatus = "active" | "on_hold" | "cancelled" | "completed";

// Helper object to map status to specific styles and labels
const statusStyles: Record<
  ProjectStatus,
  { label: string; className: string }
> = {
  active: {
    label: "Active",
    className: "bg-green-100 text-green-800 border-green-200",
  },
  on_hold: {
    label: "On Hold",
    className: "bg-orange-100 text-orange-800 border-orange-200",
  },
  completed: {
    label: "Completed",
    className: "bg-blue-100 text-blue-800 border-blue-200",
  },
  cancelled: {
    label: "Cancelled",
    className: "bg-red-100 text-red-800 border-red-200",
  },
};

export function ProjectCard({
  project,
  children,
}: {
  project: Project;
  children: React.ReactNode;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: project.id });

  // Get the style and label for the current project's status
  const status =
    statusStyles[project.currentStatus as ProjectStatus] || statusStyles.active;

  return (
    <Card
      ref={setNodeRef}
      className={isOver ? "ring-2 ring-sidebar-primary" : ""}
    >
      <CardContent className="p-4">
        <div className="mb-3 grid grid-cols-[220px_1fr] items-start gap-4 md:grid-cols-[280px_1fr]">
          <div className="rounded-md border bg-secondary p-3 space-y-2">
            {/* Project Name and Status Badge Section */}
            <div>
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  Project Name
                </div>
                <Badge
                  className={cn("text-xs font-semibold", status.className)}
                >
                  {status.label}
                </Badge>
              </div>
              <div className="font-medium truncate pr-2">{project.name}</div>
            </div>

            {/* Completion Date Section */}
            <div>
              <div className="text-sm text-muted-foreground">
                Completion Date
              </div>
              <div className="text-sm">
                {new Date(project.expectedCompletionDate).toLocaleDateString()}
              </div>
            </div>
          </div>
          <div className="min-h-12 rounded-md border border-dashed p-3">
            {children}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
