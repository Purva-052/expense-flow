/* eslint-disable @typescript-eslint/no-explicit-any */
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { LeaveDashboardGroup } from "../types/leave-dashboard";
import {
  flattenDashboardEmployees,
  formatDashboardEmployeeDateRange,
} from "../utils/leave-helpers";

interface UpcomingLeavesListProps {
  groups: LeaveDashboardGroup[];
  loading?: boolean;
}

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function UpcomingLeavesList({ groups, loading }: UpcomingLeavesListProps) {
  const upcoming = flattenDashboardEmployees(groups, 10);

  return (
    <Card className="border border-border/60 shadow-md h-full">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="text-sm font-bold">Upcoming Leaves</CardTitle>
        <span className="text-[11px] text-muted-foreground font-medium">
          From tomorrow onwards
        </span>
      </CardHeader>
      <CardContent className="pt-0">
        {loading ? (
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-14 w-full rounded-lg" />
            ))}
          </div>
        ) : upcoming.length === 0 ? (
          <p className="text-sm text-muted-foreground py-6 text-center">
            No upcoming approved leaves.
          </p>
        ) : (
          <ul className="space-y-3">
            {upcoming.map((emp) => {
              const techColor = emp.technologyColor ?? "#94a3b8";
              return (
                <li
                  key={`${emp.employeeId}-${emp.leaveId}`}
                  className="flex items-center gap-3 rounded-lg border border-border/40 p-3 bg-muted/20"
                >
                  {emp.profilePicUrl ? (
                    <img
                      src={emp.profilePicUrl}
                      alt={emp.employeeName}
                      className="h-9 w-9 rounded-full object-cover shrink-0"
                    />
                  ) : (
                    <div
                      className="h-9 w-9 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
                      style={{ backgroundColor: techColor }}
                    >
                      {getInitials(emp.employeeName)}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-foreground truncate">
                      {emp.employeeName}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {formatDashboardEmployeeDateRange(emp)}
                    </p>
                    <div className="flex items-center gap-1.5 mt-1">
                      <span
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{ backgroundColor: techColor }}
                      />
                      <span
                        className="text-[10px] font-semibold truncate"
                        style={{ color: techColor }}
                      >
                        {emp.technologyName}
                      </span>
                    </div>
                  </div>
                  <span className="text-[11px] font-medium text-primary shrink-0 text-right">
                    {emp.leaveTypeName}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
