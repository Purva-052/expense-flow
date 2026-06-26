import React from "react";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Award, TrendingUp, UserCheck, UserX, CalendarOff, Clock, Timer } from "lucide-react";
import { cn } from "@/lib/utils";

interface EmployeeStatsProps {
  presentPct: number;
  absentPct: number;
  presentCount: number;
  absentCount: number;
  lateCount: number;
  woCount: number;
  leaveCount: number;
  resolvedProfilePic: string;
  employeeName: string;
  employeeAvatarFallback: string;
  employee: any;
  monthlyData: any;
  variant?: "default" | "compact";
}

const formatTimeString = (timeStr: string | null | undefined) => {
  if (!timeStr) return "0h 0m";
  const parts = timeStr.split(":");
  if (parts.length < 2) return timeStr;
  return `${parseInt(parts[0])}h ${parseInt(parts[1])}m`;
};

export const EmployeeStats: React.FC<EmployeeStatsProps> = ({
  presentPct,
  absentPct,
  presentCount,
  absentCount,
  lateCount,
  woCount,
  leaveCount,
  resolvedProfilePic,
  employeeName,
  employeeAvatarFallback,
  employee,
  monthlyData,
  variant = "default",
}) => {
  if (variant === "compact") {
    const totalHours = employee
      ? monthlyData?.totalWorkingHours
        ? formatTimeString(monthlyData.totalWorkingHours)
        : "0h 0m"
      : `${presentCount * 8}h 15m`;
    const avgHours = employee
      ? monthlyData?.avgWorkingHours
        ? formatTimeString(monthlyData.avgWorkingHours)
        : "0h 0m"
      : "8h 49m";

    const stripItems = [
      {
        icon: UserCheck,
        iconBg: "bg-emerald-500/10",
        iconColor: "text-emerald-600 dark:text-emerald-400",
        label: "Present",
        value: String(presentCount),
        valueClass: "text-emerald-600 dark:text-emerald-400",
      },
      {
        icon: UserX,
        iconBg: "bg-rose-500/10",
        iconColor: "text-rose-600 dark:text-rose-400",
        label: "Absent",
        value: String(absentCount),
        valueClass: "text-rose-600 dark:text-rose-400",
      },
      {
        icon: Timer,
        iconBg: "bg-orange-500/10",
        iconColor: "text-orange-600 dark:text-orange-400",
        label: "Late In",
        value: String(lateCount),
        valueClass: "text-orange-600 dark:text-orange-400",
      },
      {
        icon: CalendarOff,
        iconBg: "bg-blue-500/10",
        iconColor: "text-blue-600 dark:text-blue-400",
        label: "Wo / Holiday",
        value: String(woCount + leaveCount),
        valueClass: "text-blue-600 dark:text-blue-400",
      },
      {
        icon: Clock,
        iconBg: "bg-amber-500/10",
        iconColor: "text-amber-600 dark:text-amber-400",
        label: "Working Hours",
        value: totalHours,
        valueClass: "text-amber-600 dark:text-amber-400",
      },
      {
        icon: TrendingUp,
        iconBg: "bg-purple-500/10",
        iconColor: "text-purple-600 dark:text-purple-400",
        label: "Avg. Wrk Hrs",
        value: avgHours,
        valueClass: "text-foreground",
      },
    ];

    return (
      <Card className="w-full overflow-hidden border-border shadow-sm">
        <div className="w-full overflow-x-auto">
          <div className="flex divide-x divide-border min-w-max">
            {stripItems.map((item) => (
              <div
                key={item.label}
                className="flex-1 p-4 min-w-[150px] flex items-center gap-3 hover:bg-muted/20 transition-colors"
              >
                <div className={cn("p-2 rounded-lg shrink-0", item.iconBg, item.iconColor)}>
                  <item.icon className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">
                    {item.label}
                  </p>
                  <p
                    className={cn("text-sm font-bold truncate", item.valueClass)}
                    title={item.value}
                  >
                    {item.value}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Left Box: Attendance breakdown */}
      <div className="bg-[#f2f6fc] dark:bg-zinc-900/20 p-5 rounded-xl border border-[#e2e8f0] dark:border-border/60 flex flex-col md:flex-row items-center justify-around gap-6">
        {/* Donut Pie chart */}
        <div className="relative flex items-center justify-center shrink-0">
          <div
            className="w-28 h-28 rounded-full flex items-center justify-center shadow-md transition-transform duration-500 hover:scale-105"
            style={{
              background: `conic-gradient(
                #22c55e 0% ${presentPct}%, 
                #ef4444 ${presentPct}% ${presentPct + absentPct}%, 
                #3b82f6 ${presentPct + absentPct}% 100%
              )`,
            }}
          >
            <div className="w-[76px] h-[76px] rounded-full bg-card flex flex-col items-center justify-center shadow-inner">
              <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">
                Present
              </span>
              <span className="text-base font-extrabold text-emerald-600 dark:text-emerald-500 mt-0.5">
                {presentPct}%
              </span>
            </div>
          </div>
        </div>

        {/* Donut Legend */}
        <div className="space-y-3 flex-1 min-w-[130px]">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 shrink-0" />
            <div className="flex flex-col">
              <span className="text-xs font-bold text-foreground">
                {presentCount} Present
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-rose-500 shrink-0" />
            <div className="flex flex-col">
              <span className="text-xs font-bold text-foreground">
                {absentCount} Absent / Error
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-blue-500 shrink-0" />
            <div className="flex flex-col">
              <span className="text-xs font-bold text-foreground">
                {woCount + leaveCount} Wo / Holiday / Leave
              </span>
            </div>
          </div>
        </div>

        {/* Regularizations Widget */}
        <div className="bg-card p-4 rounded-xl border border-[#e2e8f0] dark:border-border/60 w-full max-w-[160px] space-y-3 shadow-sm shrink-0">
          <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
            Regularizations
          </h4>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500 shrink-0" />
              <span className="text-xs font-semibold text-foreground">
                0 Approved
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-amber-500 shrink-0" />
              <span className="text-xs font-semibold text-foreground">
                0 Pending
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Box: Productivity statistics */}
      <div className="bg-[#fff8ea] dark:bg-zinc-900/20 border border-[#ffe0b2] dark:border-border/60 p-5 rounded-xl flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Trophy & Total hrs */}
        <div className="flex flex-col items-center text-center space-y-2 shrink-0">
          <Avatar className="h-12 w-12 border-2 border-amber-500 shadow-sm">
            <AvatarImage src={resolvedProfilePic} alt={employeeName} />
            <AvatarFallback className="bg-amber-500/20 text-amber-600 dark:text-amber-500 font-extrabold text-sm flex items-center justify-center">
              {employeeAvatarFallback}
            </AvatarFallback>
          </Avatar>

          <div className="flex items-center justify-center p-1 bg-amber-500/10 rounded-full border border-amber-500/20 text-amber-500">
            <Award className="h-4.5 w-4.5" />
          </div>

          <div>
            <span className="text-xl font-black text-amber-600 dark:text-amber-500 tracking-tight block">
              {employee
                ? monthlyData?.totalWorkingHours
                  ? formatTimeString(monthlyData.totalWorkingHours)
                  : "0h 0m"
                : `${presentCount * 8}h 15m`}
            </span>
            <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">
              Working Hours
            </span>
          </div>
        </div>

        {/* Productivity widget */}
        <div className="bg-card p-5 rounded-xl border border-[#e2e8f0] dark:border-border/60 flex-1 w-full flex flex-col justify-between h-full min-h-[136px]">
          <h4 className="text-xs font-extrabold text-foreground flex items-center gap-2 pb-2 border-b border-border/60">
            <TrendingUp className="h-4 w-4 text-emerald-500" />
            Productivity
          </h4>

          <div className="pt-3">
            <span className="text-2xl font-black text-foreground font-mono block">
              {employee
                ? monthlyData?.avgWorkingHours
                  ? formatTimeString(monthlyData.avgWorkingHours)
                  : "0h 0m"
                : "8h 49m"}
            </span>
            <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider mt-0.5 block">
              Avg. Wrk Hrs
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
