/* eslint-disable @typescript-eslint/no-explicit-any */
// src/components/developer-chip.tsx
import { useSortable } from "@dnd-kit/sortable";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"; // 👈 1. Import Tooltip components
import { Clock } from "lucide-react";
import React from "react";

const getDaysRemaining = (
  endDate: string | null | undefined
): number | null => {
  if (!endDate) return null;
  const end = new Date(endDate);
  const now = new Date();
  end.setHours(0, 0, 0, 0);
  now.setHours(0, 0, 0, 0);
  if (end < now) return null;
  const diffTime = end.getTime() - now.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

const getYearsOfExperience = (
  startDate: string | null | undefined
): string | null => {
  if (!startDate) return null;

  const start = new Date(startDate);
  const now = new Date();

  const diffInMs = now.getTime() - start.getTime();
  const diffInDays = diffInMs / (1000 * 60 * 60 * 24);
  const diffInYears = diffInDays / 365.25;

  // Always show experience in years with one decimal place
  const formattedYears =
    diffInYears < 10 ? diffInYears.toFixed(1) : Math.round(diffInYears);

  return `${formattedYears} Year`;
};

export function DeveloperChip({
  developer,
  containerId,
  onClick,
  disabled,
  endDate,
  variant = "default",
  showAssignedProject,
}: {
  developer: any;
  containerId: string;
  onClick?: () => void;
  disabled?: boolean;
  endDate?: string | null;
  variant?: "default" | "compact";
  showAssignedProject?: boolean;
}) {

  const sortableId = `${containerId}-${developer.id}`;

  const { attributes, listeners, setNodeRef, isDragging } = useSortable({
    id: sortableId,
    data: { containerId, developer },
    disabled,
  });

  const daysRemaining = getDaysRemaining(endDate);
  const showReleaseWarning = daysRemaining !== null && daysRemaining <= 5;

  const getReleaseText = (): React.ReactNode => {
    if (daysRemaining === 1) return <strong>1</strong>;
    return <strong>{daysRemaining}</strong>;
  };

  const techColor = developer?.technology?.color || "#e2e8f0";
  const experience = getYearsOfExperience(developer?.careerStartDate);

  const activeProjects: string[] = developer?.activeProjects || [];

  return (
    // 👇 2. Wrap the component with TooltipProvider for context
    <TooltipProvider>
      <div
        ref={setNodeRef}
        {...attributes}
        {...listeners}
        onClick={onClick}
        className={cn(
          "max-w-[250px] bg-white flex flex-col gap-2 rounded-lg border p-3 text-sm shadow-sm outline-none transition-all duration-200",
          variant === "default" && "bg-secondary/50",
          onClick && "cursor-pointer hover:shadow-md",
          !disabled && "cursor-grab",
          isDragging && "ring-2 opacity-50 ring-offset-2",
          isDragging && { ringColor: techColor }
        )}
      >
        <div className="flex items-start gap-3 justify-between">
          <div className="flex flex-col gap-0.5 truncate">
            <div className="flex items-center gap-2">
              {developer.isCurrentProject && (
                <span
                  className="h-2.5 w-2.5 rounded-full bg-green-500 animate-pulse shrink-0"
                  title="Currently working on this project"
                />
              )}
              {/* 👇 3. Wrap the developer's name with the Tooltip components */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="truncate font-bold text-card-foreground">
                    {developer.fullName}
                  </span>
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  {showAssignedProject && activeProjects.length > 0 ? (
                    <div className="space-y-1">
                      <p className="font-semibold text-sm">
                        Assigned Projects:
                      </p>
                      <ul className="list-disc list-inside text-xs text-muted-foreground">
                        {activeProjects.map((project: any) => (
                          <li key={project.id}>
                            <span className="font-medium">{project.name}</span>
                            {project.isCurrentProject && (
                              <span className="text-green-600 ml-1">
                                (Current)
                              </span>
                            )}
                            {typeof project.percentageComplete === "number" && (
                              <span className="ml-1 text-[10px] text-gray-500">
                                {project.percentageComplete}%
                              </span>
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : (
                    <p>{developer.fullName}</p>
                  )}
                </TooltipContent>
              </Tooltip>

              {showReleaseWarning && (
                <div className="flex items-center gap-1 text-orange-600 dark:text-orange-400 text-xs font-semibold animate-pulse">
                  <Clock className="h-3 w-3" />
                  <span>{getReleaseText()}</span>
                </div>
              )}

              {experience && (
                <span className="text-xs text-muted-foreground">
                  {experience}
                </span>
              )}
            </div>
          </div>

          {variant === "default" && (
            <Badge
              className="text-xs text-white shrink-0"
              style={{ backgroundColor: techColor }}
            >
              {developer?.technology?.name}
            </Badge>
          )}
        </div>
      </div>
    </TooltipProvider>
  );
}
