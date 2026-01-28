"use client";

import { useState, useMemo } from "react";
import { ColumnDef, PaginationState } from "@tanstack/react-table";
import { GlobalTable } from "@/components/table/global-table";
import { Input } from "@/components/ui/input";
import { useGetDailyReportList } from "@/features/daily-report/services";
import { useGetUserDropdownList } from "@/features/users/services";
import SimpleDropDownSearchable from "@/components/shared/custome-simple-dropdown";
import DateRangeFilter from "@/components/table/custome-dateRange";
import { format } from "date-fns";
import { Search } from "lucide-react";
import { useAuthStore } from "@/stores/use-auth-store";
import { roles } from "@/utils/constant";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";

/* =======================
   Types
 ======================= */
export interface ProjectReport {
  id: number;
  reportingDate: string;
  employee: {
    id: number;
    fullName: string;
  };
  milestone: {
    id: number;
    name: string;
  };
  taskDescription: string;
  timeSpent: string;
}

/* =======================
   Columns
 ======================= */
const reportColumns: ColumnDef<ProjectReport>[] = [
  {
    accessorKey: "reportingDate",
    header: "Report Date",
    cell: ({ row }) =>
      row.original.reportingDate
        ? format(new Date(row.original.reportingDate), "dd/MM/yyyy")
        : "-",
  },
  {
    accessorKey: "employee.fullName",
    header: "Employee Name",
    cell: ({ row }) => row.original.employee?.fullName || "-",
  },

  {
    accessorKey: "taskDescription",
    header: "Description",
    cell: ({ row }) => (
      <span className="line-clamp-2 text-muted-foreground">
        {row.original.taskDescription}
      </span>
    ),
  },
  {
    accessorKey: "milestone.name",
    header: "Milestone",
    cell: ({ row }) => (
      <span className="font-medium">{row.original.milestone?.name || "-"}</span>
    ),
  },
  {
    accessorKey: "timeSpent",
    header: "Hours",
    cell: ({ row }) => (
      <span className="font-semibold">{row.original.timeSpent}</span>
    ),
  },
];

/* =======================
   Component
 ======================= */
const ProjectReportTable = ({ projectId }: { projectId?: string | number }) => {
  const user = useAuthStore((state) => state.user);
  const [searchTerm, setSearchTerm] = useState("");
  const [employeeId, setEmployeeId] = useState<string>("all");
  const [dateRange, setDateRange] = useState<
    { from: Date; to?: Date } | undefined
  >();
  const [pagination, setPagination] = useState<PaginationState>({
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

  // Params for fetching reports
  const params = {
    projectId,
    search: searchTerm,
    employeeId: employeeId !== "all" ? employeeId : undefined,
    fromDate: dateRange?.from
      ? format(dateRange.from, "yyyy-MM-dd")
      : undefined,
    toDate: dateRange?.to ? format(dateRange.to, "yyyy-MM-dd") : undefined,
    page: pagination.pageIndex + 1,
    limit: pagination.pageSize,
  };

  const { data: reportsResponse, isLoading } = useGetDailyReportList(params);
  const { data: usersResponse, isLoading: usersLoading } =
    useGetUserDropdownList();

  const reports = useMemo(() => {
    return (reportsResponse as any)?.data || [];
  }, [reportsResponse]);

  const metadata = (reportsResponse as any)?.metadata;

  const userOptions = useMemo(() => {
    const options =
      (usersResponse as any)?.data?.map((u: any) => ({
        label: u.fullName,
        value: String(u.id),
      })) || [];
    return [{ label: "All Employees", value: "all" }, ...options];
  }, [usersResponse]);

  const handlePaginationChange = (newPagination: PaginationState) => {
    setPagination(newPagination);
  };

  return (
    <>
      <Card className="gap-3">
        <CardHeader className="px-0 gap-0">
          <CardTitle className="text-2xl">Report list</CardTitle>
        </CardHeader>
        <div className="flex flex-wrap gap-4 items-center">
          {/* Search */}
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Employee Dropdown */}
          <div className="w-full sm:w-64">
            <SimpleDropDownSearchable
              options={userOptions}
              value={employeeId}
              onChange={setEmployeeId}
              placeholder="Select Employee"
              isLoading={usersLoading}
              disabled={!canSelectEmployee}
            />
          </div>

          {/* Date Range */}
          <div className="w-full sm:w-auto">
            <DateRangeFilter
              placeholder="Filter by date range"
              onChange={setDateRange}
              disabled={{ after: new Date() }}
            />
          </div>
        </div>

        <GlobalTable<ProjectReport>
          data={reports}
          columns={reportColumns}
          totalCount={metadata?.total || reports.length}
          currentPage={pagination.pageIndex + 1}
          pageSize={pagination.pageSize}
          onPaginationChange={handlePaginationChange}
          isPaginationEnabled
          loading={isLoading}
        />
      </Card>
    </>
  );
};

export default ProjectReportTable;
