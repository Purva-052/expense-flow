import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string;
  growth?: number;
  displayGrowth?: string;
  helperText?: string;
  icon: React.ReactNode;
  iconBg: string;
}

export const StatCard = ({
  label,
  value,
  growth,
  displayGrowth,
  helperText,
  icon,
  iconBg,
}: StatCardProps) => {
  const isUp = (growth ?? 0) > 0;
  const isDown = (growth ?? 0) < 0;

  return (
    <Card className="border-slate-200 dark:border-slate-800 transition-all hover:shadow-md">
      <CardContent className="p-5">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              {label}
            </p>
            <h3 className="mt-1 text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              {value}
            </h3>
          </div>
          <div className={cn("p-2.5 rounded-xl shrink-0", iconBg)}>{icon}</div>
        </div>

        <div className="flex items-center justify-between gap-2">
          {displayGrowth && (
            <div
              className={cn(
                "flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-bold",
                isUp
                  ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                  : isDown
                  ? "bg-rose-50 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400"
                  : "bg-slate-50 text-slate-600 dark:bg-slate-900/30 dark:text-slate-400"
              )}
            >
              {isUp ? (
                <TrendingUp className="h-3 w-3" />
              ) : isDown ? (
                <TrendingDown className="h-3 w-3" />
              ) : (
                <Minus className="h-3 w-3" />
              )}
              {displayGrowth}
            </div>
          )}
          {helperText && (
            <p className="text-[11px] text-slate-400 font-medium truncate">
              {helperText}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
