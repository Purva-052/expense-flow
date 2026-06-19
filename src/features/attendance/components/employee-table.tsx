import React from "react";
import { Badge } from "@/components/ui/badge";
import { MonthNavigator } from "./month-navigator";

interface EmployeeTableProps {
  detailedLogs: any[];
  onRowClick: (rawDateStr: string) => void;
  embedded?: boolean;
  monthNavigator?: {
    label: string;
    onPrev: () => void;
    onNext: () => void;
    isLoading?: boolean;
  };
}

const isFutureDate = (dateStr: string) => {
  if (!dateStr) return false;
  const parts = dateStr.split("-");
  if (parts.length < 3) return false;
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1;
  const day = parseInt(parts[2], 10);
  
  const target = new Date(year, month, day);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  return target.getTime() > today.getTime();
};

const getStatusBadge = (status: "P" | "A" | "WO" | "AH" | "E" | "L" | "", isFuture: boolean = false) => {
  if (isFuture && status === "A") {
    return (
      <Badge className="bg-muted text-muted-foreground/60 text-[10px] rounded-md px-2 py-0.5">
        -
      </Badge>
    );
  }
  switch (status) {
    case "P":
      return (
        <Badge className="bg-emerald-500/15 text-emerald-500 border border-emerald-500/30 hover:bg-emerald-500/20 text-[10px] font-bold rounded-md px-2 py-0.5">
          PRESENT
        </Badge>
      );
    case "A":
      return (
        <Badge className="bg-rose-500/15 text-rose-500 border border-rose-500/30 hover:bg-rose-500/20 text-[10px] font-bold rounded-md px-2 py-0.5">
          ABSENT
        </Badge>
      );
    case "WO":
      return (
        <Badge className="bg-muted text-muted-foreground border border-border hover:bg-muted text-[10px] font-bold rounded-md px-2 py-0.5">
          WEEKLY OFF
        </Badge>
      );
    case "AH":
      return (
        <Badge className="bg-amber-500/15 text-amber-600 dark:text-amber-500 border border-amber-500/30 hover:bg-amber-500/20 text-[10px] font-bold rounded-md px-2 py-0.5">
          HALF DAY
        </Badge>
      );
    case "E":
      return (
        <Badge className="bg-yellow-500/15 text-yellow-600 dark:text-yellow-500 border border-yellow-500/30 hover:bg-yellow-500/20 text-[10px] font-bold rounded-md px-2 py-0.5">
          LATE/EXCUSED
        </Badge>
      );
    case "L":
      return (
        <Badge className="bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border border-indigo-500/30 hover:bg-indigo-500/20 text-[10px] font-bold rounded-md px-2 py-0.5">
          ON LEAVE
        </Badge>
      );
    default:
      return (
        <Badge className="bg-muted text-muted-foreground/60 text-[10px] rounded-md px-2 py-0.5">
          -
        </Badge>
      );
  }
};

const isLessThanEightFifteen = (workingHrs: string | null | undefined): boolean => {
  if (!workingHrs || workingHrs === "-") return false;
  const cleanStr = workingHrs.replace(/HRS/gi, "").trim();
  const parts = cleanStr.split(":");
  if (parts.length < 2) return false;
  const hours = parseInt(parts[0], 10);
  const minutes = parseInt(parts[1], 10);
  if (isNaN(hours) || isNaN(minutes)) return false;
  return hours * 60 + minutes < 495; // 8 * 60 + 15 = 495
};

export const EmployeeTable: React.FC<EmployeeTableProps> = ({
  detailedLogs,
  onRowClick,
  embedded = false,
  monthNavigator,
}) => {
  return (
    <div
      className={
        embedded
          ? "overflow-hidden flex flex-col"
          : "border border-border rounded-xl shadow-md bg-card overflow-hidden flex flex-col"
      }
    >
      {monthNavigator && (
        <div className="flex justify-center py-3 px-4 border-b border-border bg-card">
          <MonthNavigator
            label={monthNavigator.label}
            onPrev={monthNavigator.onPrev}
            onNext={monthNavigator.onNext}
            isLoading={monthNavigator.isLoading}
          />
        </div>
      )}
      <div className="overflow-auto max-h-[400px]">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="bg-muted border-b border-border text-muted-foreground text-xs font-bold sticky top-0 z-10">
              <th className="px-4 py-3 bg-muted sticky top-0">Date</th>
              <th className="px-4 py-3 bg-muted sticky top-0">Status</th>
              <th className="px-4 py-3 bg-muted sticky top-0">Shift</th>
              <th className="px-4 py-3 bg-muted sticky top-0">First In</th>
              <th className="px-4 py-3 bg-muted sticky top-0">Last Out</th>
              <th className="px-4 py-3 bg-muted sticky top-0">Working Hours</th>
              <th className="px-4 py-3 bg-muted sticky top-0">Overtime Hours</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border text-xs text-foreground">
            {detailedLogs.map((log: any) => {
              const future = isFutureDate(log.rawDateStr);
              return (
                <tr
                  key={log.day}
                  className={`transition-colors ${
                    future
                      ? "cursor-not-allowed opacity-80"
                      : "hover:bg-muted/10 cursor-pointer"
                  }`}
                  onClick={() => !future && onRowClick(log.rawDateStr)}
                >
                  <td className="px-4 py-2.5 font-semibold text-muted-foreground">
                    {log.date}
                  </td>
                  <td className="px-4 py-2.5">{getStatusBadge(log.status, future)}</td>
                  <td className="px-4 py-2.5 text-muted-foreground font-medium">
                    {log.shift}
                  </td>
                  <td className="px-4 py-2.5 font-semibold text-foreground">
                    {log.firstIn}
                  </td>
                  <td className="px-4 py-2.5 font-semibold text-foreground">
                    {log.lastOut}
                  </td>
                  <td
                    className={`px-4 py-2.5 font-bold transition-colors ${
                      isLessThanEightFifteen(log.workingHrs)
                        ? "bg-rose-500/15 text-rose-600 dark:text-rose-400"
                        : "text-sky-600 dark:text-sky-400"
                    }`}
                  >
                    {log.workingHrs}
                  </td>
                  <td className="px-4 py-2.5 text-muted-foreground font-medium">
                    {log.overtimeHrs}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
