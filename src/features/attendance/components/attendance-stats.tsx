import React from "react";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Award, Trophy, UserCheck, UserX, CalendarOff, Clock, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface AttendanceStatsProps {
  presentPct: number;
  absentPct: number;
  presentCount: number;
  absentCount: number;
  woCount: number;
  leaveCount: number;
  resolvedProfilePic: string;
  employeeName: string;
  employeeAvatarFallback: string;
  totalWorkHours: number;
  avgWorkHours: number;
  formatMinutesToHoursMinutes: (mins: number) => string;
  variant?: "default" | "compact";
}

export const AttendanceStats: React.FC<AttendanceStatsProps> = ({
  presentPct,
  absentPct,
  presentCount,
  absentCount,
  woCount,
  leaveCount,
  resolvedProfilePic,
  employeeName,
  employeeAvatarFallback,
  totalWorkHours,
  avgWorkHours,
  formatMinutesToHoursMinutes,
  variant = "default",
}) => {
  if (variant === "compact") {
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
        value: formatMinutesToHoursMinutes(totalWorkHours),
        valueClass: "text-amber-600 dark:text-amber-400",
      },
      {
        icon: TrendingUp,
        iconBg: "bg-purple-500/10",
        iconColor: "text-purple-600 dark:text-purple-400",
        label: "Avg. Wrk Hrs",
        value: formatMinutesToHoursMinutes(avgWorkHours),
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
      <div className="bg-[#f2f6fc]/5 dark:bg-zinc-900/20 p-5 rounded-xl border border-border flex flex-col md:flex-row items-center justify-around gap-6">
        {/* Donut Pie chart */}
        <div className="relative flex items-center justify-center">
          <div
            className="w-32 h-32 rounded-full flex items-center justify-center shadow-lg transition-transform duration-500 hover:scale-105"
            style={{
              background: `conic-gradient(
                #22c55e 0% ${presentPct}%, 
                #ef4444 ${presentPct}% ${presentPct + absentPct}%, 
                #3b82f6 ${presentPct + absentPct}% 100%
              )`,
            }}
          >
            <div className="w-[84px] h-[84px] rounded-full bg-card flex flex-col items-center justify-center shadow-inner">
              <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">
                Present
              </span>
              <span className="text-lg font-extrabold text-emerald-600 dark:text-emerald-500 mt-0.5">
                {presentPct}%
              </span>
            </div>
          </div>
        </div>

        {/* Donut Legend */}
        <div className="space-y-4 flex-1">
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-emerald-500 shrink-0" />
            <div className="flex flex-col">
              <span className="text-xs font-bold text-foreground">Present</span>
              <span className="text-[10px] text-muted-foreground">
                {presentCount} Days
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-rose-500 shrink-0" />
            <div className="flex flex-col">
              <span className="text-xs font-bold text-foreground">
                Absent / Error
              </span>
              <span className="text-[10px] text-muted-foreground">
                {absentCount} Days
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-blue-500 shrink-0" />
            <div className="flex flex-col">
              <span className="text-xs font-bold text-foreground">
                Wo / Holiday / Leave
              </span>
              <span className="text-[10px] text-muted-foreground">
                {woCount + leaveCount} Days
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Box: Productivity statistics */}
      <div className="bg-gradient-to-br from-amber-500/10 to-yellow-600/5 dark:from-amber-950/20 dark:to-yellow-950/5 border border-amber-500/20 dark:border-amber-900/30 p-5 rounded-xl flex flex-col md:flex-row items-center justify-between gap-6 shadow-md">
        {/* Trophy & Total hrs */}
        <div className="flex flex-col items-center text-center space-y-2 shrink-0">
          <Avatar className="h-12 w-12 border-2 border-amber-500 shadow-md">
            <AvatarImage src={resolvedProfilePic} alt={employeeName} />
            <AvatarFallback className="bg-amber-500/20 text-amber-600 dark:text-amber-500 font-extrabold text-sm flex items-center justify-center">
              {employeeAvatarFallback}
            </AvatarFallback>
          </Avatar>

          <div className="flex items-center justify-center p-1 bg-amber-500/10 rounded-full border border-amber-500/20 text-amber-500">
            <Award className="h-5 w-5" />
          </div>

          <div>
            <span className="text-2xl font-black text-amber-600 dark:text-amber-500 tracking-tight block">
              {formatMinutesToHoursMinutes(totalWorkHours)}
            </span>
            <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">
              Working Hours
            </span>
          </div>
        </div>

        {/* Productivity widget */}
        <div className="bg-card p-5 rounded-xl border border-border flex-1 w-full space-y-4">
          <h4 className="text-xs font-bold text-foreground flex items-center gap-2">
            <Trophy className="h-4 w-4 text-yellow-500" />
            Productivity Ratio
          </h4>

          <div className="p-4 bg-muted/50 rounded-xl border border-border flex flex-col items-center justify-center">
            <span className="text-2xl font-black text-foreground font-mono">
              {formatMinutesToHoursMinutes(avgWorkHours)}
            </span>
            <span className="text-[10px] text-muted-foreground font-medium uppercase mt-1">
              Avg. Wrk Hrs
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
