import React, { useState, useMemo } from "react";
import useFetchData from "@/hooks/use-fetch-data";
import API from "@/config/api/api";
import { ClockAlert } from "lucide-react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { MonthYearPicker } from "./month-year-picker";
import SimpleDropDownSearchable from "@/components/shared/custome-simple-dropdown";
import { useGetUserDropdownList } from "../../users/services";
import { GlobalTable } from "@/components/table/global-table";
import { ColumnDef, PaginationState } from "@tanstack/react-table";

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
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(10);

  const { data: fetchRes, isPending: isLoading } = useFetchData({
    url: API.attendance.eligible_dates,
    params: {
      month: currentMonth,
      year: currentYear,
      page,
      limit,
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

  const columns = useMemo<ColumnDef<MissingHoursRow>[]>(
    () => [
      {
        accessorKey: "employeeName",
        header: "Employee",
        cell: ({ row }) => (
          <span className="font-bold text-foreground">
            {row.original.employeeName || "-"}
          </span>
        ),
      },
      {
        accessorKey: "date",
        header: "Date",
        cell: ({ row }) => {
          const rowDate = row.original.date ? new Date(row.original.date) : null;
          const formattedDate =
            rowDate && !isNaN(rowDate.getTime())
              ? format(rowDate, "dd MMM yyyy")
              : row.original.date;
          return (
            <span className="font-semibold text-muted-foreground">
              {formattedDate}
            </span>
          );
        },
      },
      {
        accessorKey: "workingTime",
        header: () => <div className="text-center">Working Time</div>,
        cell: ({ row }) => (
          <div className="text-center font-medium text-muted-foreground">
            {row.original.workingTime}
          </div>
        ),
      },
      {
        accessorKey: "status",
        header: () => <div className="text-center">Status</div>,
        cell: ({ row }) => {
          const statusColor = row.original.status?.toLowerCase().includes("half day")
            ? "text-rose-600 dark:text-rose-400 bg-rose-500/10 border-rose-500/30"
            : "text-yellow-600 dark:text-yellow-400 bg-yellow-500/10 border-yellow-500/30";

          return (
            <div className="flex justify-center">
              <Badge
                className={`flex items-center gap-1 w-fit text-[10px] font-semibold rounded-md px-2 py-0.5 border ${statusColor}`}
              >
                {row.original.status}
              </Badge>
            </div>
          );
        },
      },
    ],
    []
  );

  const handlePaginationChange = (newPagination: PaginationState) => {
    setLimit(newPagination.pageSize);
    setPage(newPagination.pageIndex + 1);
  };

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
              setPage(1);
            }}
          />

          <SimpleDropDownSearchable
            options={employeeOptions}
            value={currentEmployeeFilter ? String(currentEmployeeFilter) : undefined}
            placeholder="Filter by employee"
            className="w-full sm:w-[220px]"
            isLoading={isLoadingEmployees}
            onChange={(value) => {
              setCurrentEmployeeFilter(value ? Number(value) : null);
              setPage(1);
            }}
            allowClear
          />
        </div>
      </div>

      <div className="p-4">
        <GlobalTable
          data={listData}
          columns={columns}
          totalCount={totalCount}
          currentPage={page}
          pageSize={limit}
          onPaginationChange={handlePaginationChange}
          isPaginationEnabled={true}
          loading={isLoading}
        />
      </div>
    </div>
  );
};
