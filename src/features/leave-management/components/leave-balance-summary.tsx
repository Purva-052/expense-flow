import {
  Wallet,
  Calendar,
  Briefcase,
  GraduationCap,
  Layers,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDays } from "../types/action-form-helpers";

interface LeaveBalanceSummaryProps {
  casualBalance: number;
  paidBalance: number;
  isExamLeaveEligible: boolean;
  examBalance: number;
  totalBalance: number;
  balanceLoading: boolean;
}

export const LeaveBalanceSummary = ({
  casualBalance,
  paidBalance,
  isExamLeaveEligible,
  examBalance,
  totalBalance,
  balanceLoading,
}: LeaveBalanceSummaryProps) => {
  const summaryItems = [
    {
      label: "Casual Leave",
      value: casualBalance,
      icon: Calendar,
      className:
        "border-emerald-100/85 bg-emerald-50/40 text-emerald-800 dark:border-emerald-900/30 dark:bg-emerald-950/10 dark:text-emerald-300",
      iconColor: "text-emerald-500 dark:text-emerald-400",
    },
    {
      label: "Paid Leave",
      value: paidBalance,
      icon: Briefcase,
      className:
        "border-blue-100/85 bg-blue-50/40 text-blue-800 dark:border-blue-900/30 dark:bg-blue-950/10 dark:text-blue-300",
      iconColor: "text-blue-500 dark:text-blue-400",
    },
    ...(isExamLeaveEligible
      ? [
          {
            label: "Exam Leave",
            value: examBalance,
            icon: GraduationCap,
            className:
              "border-amber-100/85 bg-amber-50/40 text-amber-800 dark:border-amber-900/30 dark:bg-amber-950/10 dark:text-amber-300",
            iconColor: "text-amber-500 dark:text-amber-400",
          },
        ]
      : []),
    {
      label: "Total Balance",
      value: totalBalance,
      icon: Layers,
      className:
        "border-violet-100/85 bg-violet-50/40 text-violet-800 dark:border-violet-900/30 dark:bg-violet-950/10 dark:text-violet-300",
      iconColor: "text-violet-500 dark:text-violet-400",
    },
  ];

  return (
    <div
      className={cn(
        "space-y-3 rounded-xl border border-slate-200 bg-card p-4 shadow-sm dark:border-slate-800 w-full"
      )}
    >
      <div className="flex items-center gap-2 font-semibold text-slate-800 dark:text-slate-200">
        <Wallet className="h-4 w-4 text-rose-500 shrink-0" />
        <span className="text-xs uppercase tracking-wider font-bold opacity-80">
          Complete Leave Balance
        </span>
        {balanceLoading && (
          <span className="text-xs font-normal text-muted-foreground italic animate-pulse">
            (Updating...)
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {summaryItems.map((item) => (
          <div
            key={item.label}
            className={cn(
              "rounded-xl border p-3 transition-all flex items-center justify-between h-[88px] shadow-sm relative overflow-hidden",
              item.className
            )}
          >
            <div className="flex flex-col justify-between h-full">
              <span className="text-[10px] font-bold uppercase tracking-wider opacity-80 select-none">
                {item.label}
              </span>
              <div
                className={cn(
                  "font-extrabold tracking-tight mt-0.5",
                  item.label === "Exam Leave" && item.value === 0
                    ? "text-xs sm:text-sm uppercase opacity-90"
                    : "text-xl sm:text-2xl tabular-nums"
                )}
              >
                {balanceLoading ? (
                  <span className="inline-block h-4 w-8 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
                ) : item.label === "Exam Leave" && item.value === 0 ? (
                  "Unlimited"
                ) : (
                  formatDays(item.value)
                )}
              </div>
            </div>
            <item.icon
              className={cn("h-5 w-5 shrink-0 opacity-80", item.iconColor)}
            />
          </div>
        ))}
      </div>
    </div>
  );
};
