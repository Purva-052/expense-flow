/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  UserCheck,
  CalendarDays,
  CalendarRange,
  Clock,
} from "lucide-react";
import { StatCard } from "@/features/admob-analytics/components/stat-card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface LeaveDashboardStatsProps {
  onLeaveToday: number;
  onLeaveTomorrow: number;
  thisWeek: number;
  pendingCount: number;
  lowBalanceCount: number;
  loading?: boolean;
  onTodayCardClick?: () => void;
  onTomorrowCardClick?: () => void;
  onPendingCardClick?: () => void;
}

export function LeaveDashboardStats({
  onLeaveToday,
  onLeaveTomorrow,
  thisWeek,
  pendingCount,
  loading,
  onTodayCardClick,
  onTomorrowCardClick,
  onPendingCardClick,
}: LeaveDashboardStatsProps) {
  const cards = [
    {
      key: "today",
      label: "On Leave Today",
      value: String(onLeaveToday),
      helperText: "Click to view by technology",
      icon: (
        <UserCheck className="h-5 w-5 text-emerald-700 dark:text-emerald-400" />
      ),
      iconBg: "bg-emerald-100 dark:bg-emerald-900/30",
      clickable: true,
    },
    {
      key: "tomorrow",
      label: "On Leave Tomorrow",
      value: String(onLeaveTomorrow),
      helperText: "Click to view by technology",
      icon: (
        <CalendarDays className="h-5 w-5 text-violet-700 dark:text-violet-400" />
      ),
      iconBg: "bg-violet-100 dark:bg-violet-900/30",
      clickable: true,
    },
    {
      key: "week",
      label: "This Week",
      value: String(thisWeek),
      helperText: "Employees on leave this week",
      icon: (
        <CalendarRange className="h-5 w-5 text-blue-700 dark:text-blue-400" />
      ),
      iconBg: "bg-blue-100 dark:bg-blue-900/30",
      clickable: false,
    },
    {
      key: "pending",
      label: "Pending Approvals",
      value: String(pendingCount),
      helperText: "Awaiting your action",
      icon: <Clock className="h-5 w-5 text-amber-700 dark:text-amber-400" />,
      iconBg: "bg-amber-100 dark:bg-amber-900/30",
      clickable: true,
    },
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-[120px] rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
      {cards.map((card) => {
        const content = (
          <StatCard
            label={card.label}
            value={card.value}
            helperText={card.helperText}
            icon={card.icon}
            iconBg={card.iconBg}
          />
        );

        if (card.clickable) {
          const clickHandler =
            card.key === "today"
              ? onTodayCardClick
              : card.key === "tomorrow"
                ? onTomorrowCardClick
                : onPendingCardClick;
          if (clickHandler) {
            return (
              <button
                key={card.key}
                type="button"
                onClick={clickHandler}
                className={cn(
                  "text-left rounded-xl transition-all w-full",
                  card.key === "today"
                    ? "hover:ring-2 hover:ring-emerald-500/40 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    : card.key === "tomorrow"
                      ? "hover:ring-2 hover:ring-violet-500/40 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                      : "hover:ring-2 hover:ring-amber-500/40 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                )}
              >
                {content}
              </button>
            );
          }
        }

        return <div key={card.key}>{content}</div>;
      })}
    </div>
  );
}
