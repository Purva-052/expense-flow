/* eslint-disable @typescript-eslint/no-explicit-any */
// src/components/project-chip.tsx
import { cn } from "@/lib/utils";
import { Briefcase } from "lucide-react";

export const ProjectChip = ({ project }: { project: any }) => {
  const completion = project.percentageComplete ?? 0;

  // Dynamically set border color based on completion status
  const getBorderColor = () => {
    if (completion === 100) return "border-green-500"; // Completed
    if (project.currentStatus === "active") return "border-blue-500"; // Active
    return "border-gray-300"; // Default
  };

  return (
    <div
      className={cn(
        "flex flex-col gap-2 rounded-lg border p-3 text-sm shadow-sm bg-secondary/50",
        getBorderColor()
      )}
    >
      <div className="flex flex-col gap-1">
        {/* --- Top Row: Dot + Icon + Project Name --- */}
        <div className="flex items-center gap-2 truncate">
          {project.isCurrentProject && (
            <span
              className="h-2.5 w-2.5 rounded-full bg-green-500 animate-pulse"
              title="Currently working on this project"
            />
          )}

          <Briefcase className="h-4 w-4 text-muted-foreground shrink-0" />
          <span className="truncate font-bold text-card-foreground">
            {project.name}
          </span>
        </div>

        {/* --- Completion Percentage Below Project Name --- */}
        <span className="text-xs text-muted-foreground ml-6">
          {completion}% Complete
        </span>
      </div>
    </div>
  );
};
