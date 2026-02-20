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
import { Search, Eye } from "lucide-react";
import { useAuthStore } from "@/stores/use-auth-store";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { roles } from "@/utils/constant";

const stripHtml = (html: string) => {
  if (typeof window === "undefined") return html;
  const tmp = document.createElement("DIV");
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || "";
};

// Convert time string (HH:MM or H:MM) to decimal hours
const convertTimeToDecimal = (timeStr: string): number => {
  if (!timeStr) return 0;

  // If it's already a number, return it as is
  const numValue = Number(timeStr);
  if (!isNaN(numValue) && !timeStr.includes(":")) {
    return numValue;
  }

  // Handle HH:MM or H:MM format
  if (typeof timeStr === "string" && timeStr.includes(":")) {
    const parts = timeStr.split(":");
    const hours = parseInt(parts[0], 10) || 0;
    const minutes = parseInt(parts[1], 10) || 0;
    return hours + minutes / 60;
  }

  return 0;
};

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
  const [viewDescription, setViewDescription] = useState<string | null>(null);
  const userRole = String(
    user?.user?.role?.name || user?.user?.role
  ).toLowerCase();
  const canSelectEmployee = [
    roles.ADMIN,
    roles.TEAM_LEAD,
    roles.PROJECT_MANAGER,
  ].includes(userRole);
  const isDeveloperView = userRole === roles.DEVELOPER;

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

  // Calculate total hours by converting each timeSpent value from HH:MM to decimal
  const totalHours = useMemo(() => {
    if (!logs || logs.length === 0) return 0;
    return logs.reduce((sum: any, log: any) => {
      const decimalHours = convertTimeToDecimal(log.timeSpent);
      return sum + decimalHours;
    }, 0);
  }, [logs]);

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
        accessorKey: "taskDescription",
        header: "Description",
        cell: ({ row }) => {
          const rawDesc = row.original.taskDescription || "-";
          const desc = stripHtml(rawDesc);
          return (
            <div className="flex items-center gap-2 max-w-[200px]">
              <span className="line-clamp-2 text-muted-foreground flex-1">
                {desc}
              </span>
              {rawDesc.length > 10 && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 shrink-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                  onClick={() => setViewDescription(rawDesc)}
                  title="View full description"
                >
                  <Eye size={14} />
                </Button>
              )}
            </div>
          );
        },
      },
      {
        accessorKey: "timeSpent",
        header: "Logged Hours",
        cell: ({ row }) => (
          <span className="font-semibold text-green-600">
            {convertTimeToDecimal(row.original.timeSpent)
              .toFixed(2)
              .replace(".", ":")}
          </span>
        ),
      },
      {
        accessorKey: "weightageHours",
        header: "Weightage Hours",
        cell: ({ row }) => (
          <span className="font-semibold text-green-600">
            {convertTimeToDecimal(row.original.weightageHours)
              .toFixed(2)
              .replace(".", ":")}
          </span>
        ),
      },
    ],
    [logs]
  );

  return (
    <div className="flex flex-col h-[550px] space-y-4 overflow-hidden">
      {/* Filters Row */}
      <div className="flex flex-nowrap items-center gap-3 overflow-x-auto pb-2 shrink-0 pl-1">
        <div className="relative w-56 shrink-0">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8 h-9 rounded-full"
          />
        </div>

        {!isDeveloperView && (
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
        )}

        <div className="shrink-0">
          <DateRangeFilter
            placeholder="Filter by date range"
            onChange={setDateRange}
            className="rounded-full h-9"
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

      <Dialog
        open={!!viewDescription}
        onOpenChange={(open) => !open && setViewDescription(null)}
      >
        <DialogContent className="max-w-[95vw] sm:max-w-2xl overflow-hidden text-black">
          <DialogHeader>
            <DialogTitle>Full Description</DialogTitle>
          </DialogHeader>
          <div
            className="py-4 whitespace-normal leading-relaxed text-muted-foreground break-words overflow-y-auto max-h-[70vh] w-full ck-content"
            dangerouslySetInnerHTML={{ __html: viewDescription || "" }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default HoursLogs;
