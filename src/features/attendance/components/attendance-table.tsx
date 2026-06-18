import React from "react";
import { Badge } from "@/components/ui/badge";

interface AttendanceTableProps {
  detailedLogs: any[];
  onRowClick: (rawDateStr: string) => void;
}

const getStatusBadge = (status: "P" | "A" | "WO" | "AH" | "E" | "L" | "") => {
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

export const AttendanceTable: React.FC<AttendanceTableProps> = ({
  detailedLogs,
  onRowClick,
}) => {
  return (
    <div className="border border-border rounded-xl shadow-lg bg-card overflow-hidden">
      <div className="overflow-auto max-h-[480px]">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="bg-muted border-b border-border text-muted-foreground text-xs font-bold sticky top-0 z-10">
              <th className="px-4 py-3 bg-muted sticky top-0">Date</th>
              <th className="px-4 py-3 bg-muted sticky top-0">Status</th>
              <th className="px-4 py-3 bg-muted sticky top-0">First In</th>
              <th className="px-4 py-3 bg-muted sticky top-0">Last Out</th>
              <th className="px-4 py-3 bg-muted sticky top-0">Break Time</th>
              <th className="px-4 py-3 bg-muted sticky top-0">Working Hours</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border text-xs text-foreground">
            {detailedLogs.map((log: any) => (
              <tr
                key={log.day}
                className="hover:bg-muted/10 transition-colors cursor-pointer"
                onClick={() => onRowClick(log.rawDateStr)}
              >
                <td className="px-4 py-3 font-semibold text-muted-foreground">
                  {log.date}
                </td>
                <td className="px-4 py-3">{getStatusBadge(log.status)}</td>
                <td className="px-4 py-3 font-semibold text-foreground">
                  {log.firstIn}
                </td>
                <td className="px-4 py-3 font-semibold text-foreground">
                  {log.lastOut}
                </td>
                <td className="px-4 py-3 font-medium text-muted-foreground/85">
                  {log.breakHrs}
                </td>
                <td
                  className={`px-4 py-3 font-bold transition-colors ${
                    isLessThanEightFifteen(log.workingHrs)
                      ? "bg-rose-500/15 text-rose-600 dark:text-rose-400"
                      : "text-sky-600 dark:text-sky-400"
                  }`}
                >
                  {log.workingHrs}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
