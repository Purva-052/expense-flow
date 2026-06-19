import React from "react";
import { ChevronsLeft, ChevronsRight, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

interface MonthNavigatorProps {
  label: string;
  onPrev: () => void;
  onNext: () => void;
  isLoading?: boolean;
  className?: string;
}

export const MonthNavigator: React.FC<MonthNavigatorProps> = ({
  label,
  onPrev,
  onNext,
  isLoading = false,
  className,
}) => {
  return (
    <div
      className={cn(
        "inline-flex items-stretch overflow-hidden rounded-lg border border-border bg-card shadow-sm",
        className
      )}
    >
      <button
        type="button"
        onClick={onPrev}
        disabled={isLoading}
        aria-label="Previous month"
        className="flex items-center justify-center px-3 py-2 text-sky-600 dark:text-sky-400 hover:bg-muted/50 transition-colors disabled:opacity-50 border-r border-border"
      >
        <ChevronsLeft className="h-4 w-4" />
      </button>

      <div className="flex items-center justify-center gap-2 px-5 py-2 min-w-[120px] border-r border-border">
        <span className="text-sm font-bold text-foreground whitespace-nowrap">
          {label}
        </span>
        {isLoading && (
          <RotateCcw className="h-3.5 w-3.5 text-rose-500 animate-spin shrink-0" />
        )}
      </div>

      <button
        type="button"
        onClick={onNext}
        disabled={isLoading}
        aria-label="Next month"
        className="flex items-center justify-center px-3 py-2 text-sky-600 dark:text-sky-400 hover:bg-muted/50 transition-colors disabled:opacity-50"
      >
        <ChevronsRight className="h-4 w-4" />
      </button>
    </div>
  );
};
