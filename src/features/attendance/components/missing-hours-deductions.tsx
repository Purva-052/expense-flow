import React, { useState, useMemo } from "react";
import useFetchData from "@/hooks/use-fetch-data";
import API from "@/config/api/api";
import { ClockAlert } from "lucide-react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { MonthYearPicker } from "./month-year-picker";
import SimpleDropDownSearchable from "@/components/shared/custome-simple-dropdown";
import { useGetUserDropdownList } from "../../users/services";

interface MissingHoursRow {
  date: string;
  workingTime: string;
  status: string;
  employeeId: number;
  employeeName: string;
}

export const MissingHoursDeductions: React.FC = () => {
  const [currentMonth, setCurrentMonth] = useState<number>(new Date().getMonth() + 1);
  const [currentYear, setCurrentYear] = useState<number>(new Date().getFullYear());
  const [currentEmployeeFilter, setCurrentEmployeeFilter] = useState<number | null>(null);

  const { data: fetchRes, isPending: isLoading } = useFetchData({
    url: API.attendance.eligible_dates,
    params: {
      month: currentMonth,
      year: currentYear,
      ...(currentEmployeeFilter ? { employeeId: currentEmployeeFilter } : {}),
    },
  });

  const { data: employeeDropdownData, isPending: isLoadingEmployees } =
    useGetUserDropdownList({ status: "active" });

  const employeeOptions = useMemo(
    () =>
      ((employeeDropdownData as any)?.data || []).map((emp: any) => ({
        value: String(emp.employee?.id || emp.employeeId || emp.id),
        label: emp.fullName,
      })),
    [employeeDropdownData]
  );

  const listData: MissingHoursRow[] =
    (fetchRes as any)?.data?.data ||
    (fetchRes as any)?.data ||
    [];

  const totalCount =
    (fetchRes as any)?.data?.metadata?.totalCount ??
    (fetchRes as any)?.metadata?.totalCount ??
    listData.length;

  return (
    <div className="w-full">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 px-4 py-3 border-b border-border bg-card">
        <div className="flex items-center gap-2">
          <ClockAlert className="h-4 w-4 text-rose-500" />
          <span className="text-sm font-semibold text-foreground">
            Incomplete Working Hours
          </span>
          {totalCount > 0 && (
            <span className="text-[10px] font-bold bg-rose-500 text-white rounded-full px-1.5 py-0.5">
              {totalCount}
            </span>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <MonthYearPicker
            month={currentMonth}
            year={currentYear}
            onChange={(m, y) => {
              setCurrentMonth(m);
              setCurrentYear(y);
            }}
          />

          <SimpleDropDownSearchable
            options={employeeOptions}
            value={currentEmployeeFilter ? String(currentEmployeeFilter) : undefined}
            placeholder="Filter by employee"
            className="w-full sm:w-[220px]"
            isLoading={isLoadingEmployees}
            onChange={(value) =>
              setCurrentEmployeeFilter(value ? Number(value) : null)
            }
            allowClear
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="bg-muted border-b border-border text-muted-foreground text-xs font-bold">
              <th className="px-4 py-2.5 bg-muted">Employee</th>
              <th className="px-4 py-2.5 bg-muted">Date</th>
              <th className="px-4 py-2.5 bg-muted text-center">Working Time</th>
              <th className="px-4 py-2.5 bg-muted text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border text-xs text-foreground">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, index) => (
                <tr key={index} className="border-b border-border">
                  <td className="px-4 py-3">
                    <div className="h-4 w-32 bg-muted animate-pulse rounded" />
                  </td>
                  <td className="px-4 py-3">
                    <div className="h-4 w-28 bg-muted animate-pulse rounded" />
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="h-4 w-12 bg-muted animate-pulse rounded mx-auto" />
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="h-6 w-20 bg-muted animate-pulse rounded-md mx-auto" />
                  </td>
                </tr>
              ))
            ) : listData.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-center py-10 text-muted-foreground text-xs font-medium">
                  No missing hours records found.
                </td>
              </tr>
            ) : (
              listData.map((row, idx) => {
                const rowDate = row.date ? new Date(row.date) : null;
                const formattedDate = rowDate && !isNaN(rowDate.getTime())
                  ? format(rowDate, "dd MMM yyyy")
                  : row.date;

                const statusColor = row.status?.toLowerCase().includes("half day")
                  ? "text-rose-600 dark:text-rose-400 bg-rose-500/10 border-rose-500/30"
                  : "text-yellow-600 dark:text-yellow-400 bg-yellow-500/10 border-yellow-500/30";

                return (
                  <tr
                    key={`${row.employeeId}-${row.date}-${idx}`}
                    className="hover:bg-muted/10 transition-colors"
                  >
                    <td className="px-4 py-2.5 font-bold text-foreground">
                      {row.employeeName || "-"}
                    </td>
                    <td className="px-4 py-2.5 font-semibold text-muted-foreground">
                      {formattedDate}
                    </td>
                    <td className="px-4 py-2.5 font-medium text-muted-foreground text-center">
                      {row.workingTime}
                    </td>
                    <td className="px-4 py-2.5 flex justify-center">
                      <Badge
                        className={`flex items-center gap-1 w-fit text-[10px] font-semibold rounded-md px-2 py-0.5 border ${statusColor}`}
                      >
                        {row.status}
                      </Badge>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
