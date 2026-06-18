import React from "react";
import { Badge } from "@/components/ui/badge";

interface EmployeeTableProps {
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

export const EmployeeTable: React.FC<EmployeeTableProps> = ({
  detailedLogs,
  onRowClick,
}) => {
  return (
    <div className="border border-border rounded-xl shadow-md bg-card overflow-hidden">
      <div className="overflow-auto max-h-[400px]">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="bg-muted border-b border-border text-muted-foreground text-xs font-bold">
              <th className="px-4 py-3 sticky top-0 bg-muted z-10">Date</th>
              <th className="px-4 py-3 sticky top-0 bg-muted z-10">Status</th>
              <th className="px-4 py-3 sticky top-0 bg-muted z-10">Shift</th>
              <th className="px-4 py-3 sticky top-0 bg-muted z-10">First In</th>
              <th className="px-4 py-3 sticky top-0 bg-muted z-10">Last Out</th>
              <th className="px-4 py-3 sticky top-0 bg-muted z-10">Working Hours</th>
              <th className="px-4 py-3 sticky top-0 bg-muted z-10">Overtime Hours</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border text-xs text-foreground">
            {detailedLogs.map((log: any) => (
              <tr
                key={log.day}
                className="hover:bg-muted/10 transition-colors cursor-pointer"
                onClick={() => onRowClick(log.rawDateStr)}
              >
                <td className="px-4 py-2.5 font-semibold text-muted-foreground">
                  {log.date}
                </td>
                <td className="px-4 py-2.5">{getStatusBadge(log.status)}</td>
                <td className="px-4 py-2.5 text-muted-foreground font-medium">
                  {log.shift}
                </td>
                <td className="px-4 py-2.5 font-semibold text-foreground">
                  {log.firstIn}
                </td>
                <td className="px-4 py-2.5 font-semibold text-foreground">
                  {log.lastOut}
                </td>
                <td className="px-4 py-2.5 font-bold text-sky-600 dark:text-sky-400">
                  {log.workingHrs}
                </td>
                <td className="px-4 py-2.5 text-muted-foreground font-medium">
                  {log.overtimeHrs}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
