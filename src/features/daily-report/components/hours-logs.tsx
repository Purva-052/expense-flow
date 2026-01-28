"use client";

import { useState, useMemo, useEffect } from "react";
import { format } from "date-fns";
import { Input } from "@/components/ui/input";
import { GlobalTable } from "@/components/table/global-table";
import { ColumnDef } from "@tanstack/react-table";
import { useGetTaskLogs } from "../services";
import { useGetUserDropdownList } from "@/features/users/services";
import SimpleDropDownSearchable from "@/components/shared/custome-simple-dropdown";
import DateRangeFilter from "@/components/table/custome-dateRange";
import { Search } from "lucide-react";
import { useAuthStore } from "@/stores/use-auth-store";
import { roles } from "@/utils/constant";

interface HoursLogsProps {
  projectId?: string | number;
  milestoneId?: string | number;
  taskId?: string | number;
  onTotalHoursChange?: (hours: number) => void;
}

const HoursLogs = ({
  projectId,
  milestoneId,
  taskId,
  onTotalHoursChange,
}: HoursLogsProps) => {
  const user = useAuthStore((state) => state.user);
  const [searchTerm, setSearchTerm] = useState("");
  const [employeeId, setEmployeeId] = useState<string>(
    String(user?.user?.id || "")
  );
  const [dateRange, setDateRange] = useState<
    { from: Date; to?: Date } | undefined
  >();
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });

  const userRole = String(
    user?.user?.role?.name || user?.user?.role
  ).toLowerCase();
  const canSelectEmployee = [
    roles.ADMIN,
    roles.TEAM_LEAD,
    roles.PROJECT_MANAGER,
  ].includes(userRole);

  // Initialize employeeId when user or taskId becomes available
  useEffect(() => {
    if (user?.user?.id) {
      setEmployeeId(String(user.user.id));
    }
  }, [user?.user?.id, taskId]);

  // Params for fetching logs
  const params = {
    projectId,
    projectMilestoneId: milestoneId,
    search: searchTerm,
    employeeId: employeeId && employeeId !== "all" ? employeeId : undefined,
    fromDate: dateRange?.from
      ? format(dateRange.from, "yyyy-MM-dd")
      : undefined,
    toDate: dateRange?.to ? format(dateRange.to, "yyyy-MM-dd") : undefined,
    page: pagination.pageIndex + 1,
    limit: pagination.pageSize,
  };

  const { data: logsResponse, isLoading }: any = useGetTaskLogs(
    taskId!,
    params
  );
  const { data: usersResponse, isLoading: usersLoading }: any =
    useGetUserDropdownList();

  const logs = useMemo(() => {
    return logsResponse?.data?.logs || [];
  }, [logsResponse]);

  const metadata = logsResponse?.metadata;

  const totalHours = Number(logsResponse?.data?.totalHours) || 0;

  useMemo(() => {
    onTotalHoursChange?.(totalHours);
  }, [totalHours, onTotalHoursChange]);

  const userOptions = useMemo(() => {
    const options =
      usersResponse?.data?.map((u: any) => ({
        label: u.fullName,
        value: String(u.id),
      })) || [];
    return [{ label: "All Employees", value: "all" }, ...options];
  }, [usersResponse]);

  const columns = useMemo<ColumnDef<any>[]>(
    () => [
      {
        accessorKey: "employee.fullName",
        header: "Employee Name",
        cell: ({ row }) => row.original.employee?.fullName || "-",
      },
      {
        accessorKey: "reportingDate",
        header: "Date",
        cell: ({ row }) =>
          row.original.reportingDate
            ? format(new Date(row.original.reportingDate), "dd/MM/yyyy")
            : "-",
      },
      {
        accessorKey: "timeSpent",
        header: "Hours",
        cell: ({ row }) => (
          <span className="font-semibold text-green-600">
            {row.original.timeSpent}
          </span>
        ),
      },
    ],
    []
  );

  return (
    <div className="flex flex-col h-[550px] space-y-4 overflow-hidden">
      {/* Filters Row */}
      <div className="flex flex-nowrap items-center gap-3 overflow-x-auto pb-2 shrink-0">
        <div className="relative w-56 shrink-0">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8 h-9"
          />
        </div>

        <div className="w-56 shrink-0">
          <SimpleDropDownSearchable
            options={userOptions}
            value={employeeId}
            onChange={setEmployeeId}
            placeholder="Select Employee"
            isLoading={usersLoading}
            disabled={!canSelectEmployee}
          />
        </div>

        <div className="shrink-0">
          <DateRangeFilter
            placeholder="Filter by date range"
            onChange={setDateRange}
            disabled={{ after: new Date() }}
          />
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-hidden flex flex-col min-h-0 bg-white">
        <GlobalTable
          data={logs}
          columns={columns}
          totalCount={metadata?.total || logs.length}
          currentPage={metadata?.page || pagination.pageIndex + 1}
          pageSize={metadata?.limit || pagination.pageSize}
          onPaginationChange={setPagination}
          isPaginationEnabled={true}
          loading={isLoading}
          scrollY="400px"
        />
      </div>
    </div>
  );
};

export default HoursLogs;
