// src/components/developer-chip.tsx
import { useSortable } from "@dnd-kit/sortable";
import type { Developer } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Clock } from "lucide-react"; // Using an icon for better UI
import React from "react";

/**
 * Calculates the difference in days between a future date and today.
 * Returns null if the date is in the past, null, or undefined.
 */
const getDaysRemaining = (
  endDate: string | null | undefined
): number | null => {
  if (!endDate) return null;

  const end = new Date(endDate);
  const now = new Date();

  // Set hours to 0 to compare dates only, ignoring time
  end.setHours(0, 0, 0, 0);
  now.setHours(0, 0, 0, 0);

  // If the end date has already passed, we don't need to show a warning
  if (end < now) return null;

  const diffTime = end.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return diffDays;
};

export function DeveloperChip({
  developer,
  containerId,
  onClick,
  disabled, // This prop now correctly *only* disables DND
  endDate,
}: {
  developer: Developer;
  containerId: string;
  onClick?: () => void;
  disabled?: boolean;
  endDate?: string | null;
}) {
  const sortableId = `${containerId}-${developer.id}`;

  const { attributes, listeners, setNodeRef, isDragging } = useSortable({
    id: sortableId,
    data: { containerId, developer },
    disabled, // This correctly disables DND functionality
  });

  // --- Calculate remaining days and determine if the warning should be shown ---
  const daysRemaining = getDaysRemaining(endDate);
  const showReleaseWarning = daysRemaining !== null && daysRemaining <= 5;

  // Helper to generate the text content
  const getReleaseText = (): React.ReactNode => {
    if (daysRemaining === 1)
      return (
        <>
          <strong>1 day</strong>
        </>
      );
    return (
      <>
        <strong>{daysRemaining}</strong>
      </>
    );
  };

  const techColor = developer?.technology?.color || "#e2e8f0";

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      // ✅ FIX: Attach onClick directly. The logic for passing it is handled in board.tsx.
      onClick={onClick}
      className={cn(
        "max-w-[250px] flex flex-col gap-2 rounded-lg border p-3 text-sm shadow-sm outline-none transition-all duration-200 bg-secondary/50",
        // ✅ FIX: Base cursor style on the presence of an onClick function
        onClick && "cursor-pointer hover:shadow-md",
        // The grab cursor should only show for users who can drag (i.e., not developers)
        !disabled && "cursor-grab",
        isDragging && "ring-2 opacity-50 ring-offset-2",
        isDragging && { ringColor: techColor }
      )}
    >
      {/* Top Part: Developer Info + Tech Badge */}
      <div className="flex items-start gap-3 justify-between">
        <div className="flex flex-col gap-0.5 truncate">
          <div className="flex items-center gap-2">
            {/* Conditionally render the green dot */}
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
          </div>
        </div>
        <Badge
          className="text-xs text-white shrink-0" // prevent badge from shrinking
          style={{ backgroundColor: techColor }}
        >
          {developer?.technology?.name}
        </Badge>
      </div>
    </div>
  );
}
