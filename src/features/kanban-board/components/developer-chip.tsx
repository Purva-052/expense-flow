/* eslint-disable @typescript-eslint/no-explicit-any */
// src/components/developer-chip.tsx
import { useSortable } from "@dnd-kit/sortable";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
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
  const diffInMonths = diffInDays / 30.44; // avg days per month

  if (diffInYears < 1) {
    const months = Math.floor(diffInMonths);
    return `${months} month${months !== 1 ? "s" : ""}`;
  } else {
    const years =
      diffInYears < 10 ? diffInYears.toFixed(1) : Math.round(diffInYears);
    return `${years} year${Number(years) > 1 ? "s" : ""}`;
  }
};

export function DeveloperChip({
  developer,
  containerId,
  onClick,
  disabled,
  endDate,
  variant = "default", // ✅ ADD: New prop with a default value
}: {
  developer: any;
  containerId: string;
  onClick?: () => void;
  disabled?: boolean;
  endDate?: string | null;
  variant?: "default" | "compact"; // ✅ ADD: Define the prop type
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
  // ✅ Calculate years of experience
  const experience = getYearsOfExperience(developer?.careerStartDate);

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      onClick={onClick}
      className={cn(
        "max-w-[250px] bg-white flex flex-col gap-2 rounded-lg border p-3 text-sm shadow-sm outline-none transition-all duration-200",
        // ✅ CHANGE: Conditionally apply background color based on variant
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
            <span className="truncate font-bold text-card-foreground">
              {developer.fullName}
            </span>
            {showReleaseWarning && (
              <div className="flex items-center gap-1 text-orange-600 dark:text-orange-400 text-xs font-semibold animate-pulse">
                <Clock className="h-3 w-3" />
                <span>{getReleaseText()}</span>
              </div>
            )}

            {/* ✅ Show Years of Experience */}
            {experience && (
              <span className="text-xs text-muted-foreground">
                {experience} of experience
              </span>
            )}
          </div>
        </div>

        {/* ✅ CHANGE: Conditionally render the badge based on variant */}
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
  );
}
