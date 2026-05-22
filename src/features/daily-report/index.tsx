/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { useNavigate, useSearch } from "@tanstack/react-router";
import PageLayout from "@/components/layout/layout-provider";
import { GlobalTable } from "@/components/table/global-table";
import GlobalFilterSection from "@/components/table/global-table-filter";
import { FilterConfig } from "@/components/table/table-toolbar";
// import { PaginationState } from "@tanstack/react-table";
import {
  useGetDailyReportList,
  useGetProjectMilestonesList,
  useGetTasksDropdownList,
  useGetReportsAnalytics,
  useExportCSV,
  useExportProjectLogsCSV,
} from "./services";
import { columns } from "./components/columns";
import { useGetProjectSDropdownList } from "../Project-type/services";
import { useGetUserDropdownList } from "../users/services";
import { roles } from "@/utils/constant";
import { DailyReport } from "./schema";
import { useAuthStore } from "@/stores/use-auth-store";
import { DailyReportDialog } from "./components/daily-report-dialog";
import { DeleteModal } from "@/components/model/delete-model";
import { useDeleteDailyReport } from "./services";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { ReportsStatsDialog } from "./components/reports-stats-dialog";
import { Clock, AlertCircle, CalendarDays, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { parseAsInteger, parseAsString, useQueryStates } from "nuqs";
import { formatDate } from "@/utils/commonFunctions";
import { format } from "date-fns";

export default function DailyReportPage() {
  const search = useSearch({ from: "/_authenticated/daily-report/" });
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [queryParams, setQueryParams] = useQueryStates({
    pageSize: parseAsInteger.withDefault(10),
    currentPage: parseAsInteger.withDefault(1),
    search: parseAsString.withDefault(""),
    projectId: parseAsInteger,
    projectMilestoneId: parseAsInteger,
    taskId: parseAsInteger,
    employeeId: parseAsInteger,
    startDate: parseAsString,
    fromDate: parseAsString,
    toDate: parseAsString,
  });

  const listParams = {
    pageSize: queryParams.pageSize,
    currentPage: queryParams.currentPage,
    search: queryParams.search,
    projectId: queryParams.projectId ?? undefined,
    projectMilestoneId: queryParams.projectMilestoneId ?? undefined,
    taskId: queryParams.taskId ?? undefined,
    employeeId: queryParams.employeeId ?? undefined,
    fromDate: queryParams.fromDate ?? undefined,
    toDate: queryParams.toDate ?? undefined,
  };
  // const [listParams, setQueryParams] = useState({
  //   pageSize: 10,
  //   currentPage: 1,
  //   search: "",
  //   projectId: undefined,
  //   projectMilestoneId: undefined,
  //   taskId: undefined,
  //   employeeId: undefined,
  //   fromDate: undefined as string | undefined,
  //   toDate: undefined as string | undefined,
  // });

  const [editReport, setEditReport] = useState<DailyReport | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [viewReport, setViewReport] = useState<DailyReport | null>(null);
  const [viewOpen, setViewOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [reportType, setReportType] = useState<
    "pending" | "incomplete" | "holiday" | null
  >(null);
  const [statsUserId, setStatsUserId] = useState<string | undefined>(undefined);
  const [statsOpen, setStatsOpen] = useState(false);

  useEffect(() => {
    if (!search.openPendingReports && !search.type) return;

    const nextType =
      search.type === "pending" ||
      search.type === "incomplete" ||
      search.type === "holiday"
        ? search.type
        : "pending";

    setReportType(nextType);
    setStatsUserId(
      search.userId != null
        ? String(search.userId).replace(/^"+|"+$/g, "")
        : undefined
    );
    setStatsOpen(true);
  }, [
    search.openPendingReports,
    search.openPendingReportsAt,
    search.type,
    search.userId,
  ]);

  const queryClient = useQueryClient();
  const { mutate: deleteReport, isPending: isDeleting } = useDeleteDailyReport(
    () => {
      toast.success("Daily report deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["daily-reports"] });
      setDeleteOpen(false);
    }
  );

  const handleEdit = (report: DailyReport) => {
    setEditReport(report);
    setEditOpen(true);
  };

  const handleView = (report: DailyReport) => {
    setViewReport(report);
    setViewOpen(true);
  };

  const handleDelete = (report: DailyReport) => {
    setDeleteId(String(report.id));
    setDeleteOpen(true);
  };

  const apiParams = {
    page: listParams.currentPage,
    limit: listParams.pageSize,
    search: listParams.search,
    projectId: listParams.projectId,
    projectMilestoneId: listParams.projectMilestoneId,
    taskId: listParams.taskId,
    employeeId: listParams.employeeId,
    fromDate: listParams.fromDate,
    toDate: listParams.toDate,
  };

  const { data: analyticsData } = useGetReportsAnalytics();
  const analytics = (analyticsData as any)?.data;

  const handleCardClick = (type: "pending" | "incomplete" | "holiday") => {
    setReportType(type);
    setStatsUserId(undefined);
    setStatsOpen(true);
  };

  const { data: listData, isPending: loading } =
    useGetDailyReportList(apiParams);
  const userRole = user?.user?.role;

  const { mutate: exportCSV, isPending: exportCSVLoading } = useExportCSV();
  const { mutate: exportProjectLogs, isPending: exportProjectLogsLoading } =
    useExportProjectLogsCSV();

  const canExportCSV =
    userRole === roles.ADMIN ||
    userRole === roles.PROJECT_MANAGER ||
    userRole === roles.TEAM_LEAD;

  const canExportProjectCSV =
    userRole === roles.ADMIN || userRole === roles.PROJECT_MANAGER;

  const totalCount = (listData as any)?.metadata?.totalCount;

  const isDeveloperOrBDE =
    userRole === roles.DEVELOPER || userRole === roles.BDE;

  const { data: projectsList, isPending: projectsListLoading }: any =
    useGetProjectSDropdownList(
      isDeveloperOrBDE
        ? { includeAll: false, developerId: user?.user?.id }
        : { includeAll: true }
    );

  const { data: usersList, isPending: usersListLoading }: any =
    useGetUserDropdownList({
      role: [
        roles.TEAM_LEAD,
        roles.ADMIN,
        roles.PROJECT_MANAGER,
        roles.DEVELOPER,
      ],
      status: "active",
    });

  const { data: milestonesList, isPending: milestonesLoading }: any =
    useGetProjectMilestonesList(
      listParams.projectId ? { projectId: listParams.projectId } : undefined,
      !!listParams.projectId
    );

  const { data: tasksList, isPending: tasksLoading }: any =
    useGetTasksDropdownList(
      listParams.projectId
        ? {
            projectId: listParams.projectId,
            projectMilestoneId: listParams.projectMilestoneId,
          }
        : undefined,
      !!listParams.projectMilestoneId
    );

  const handleExportCSV = () => {
    // Use apiParams directly instead of localStorage
    const payload = Object.fromEntries(
      Object.entries(apiParams).filter(
        ([, value]) => value !== "" && value !== null && value !== undefined
      )
    );

    exportCSV(payload, {
      onSuccess: (response: any) => {
        const fileBlob = response?.blob;
        const filename =
          response?.filename ||
          `daily_reports_export_${format(new Date(), "yyyy-MM-dd")}.xlsx`;

        if (fileBlob) {
          const fileUrl = URL.createObjectURL(fileBlob);
          const link = document.createElement("a");
          link.href = fileUrl;
          link.download = filename;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(fileUrl);
          toast.success("CSV export generated successfully");
        } else {
          console.error("No file URL found in response:", response);
          toast.error("Failed to generate CSV file");
        }
      },
      onError: (error: Error) => {
        console.error("CSV export failed:", error);
        // toast.error(error.message || "Failed to generate CSV file");
      },
    });
  };

  const handleExportProjectLogsCSV = () => {
    const payload = Object.fromEntries(
      Object.entries(apiParams).filter(
        ([, value]) => value !== "" && value !== null && value !== undefined
      )
    );

    if (payload.projectMilestoneId) {
      payload.milestoneId = payload.projectMilestoneId;
    }

    exportProjectLogs(
      payload,
      {
        onSuccess: (response: any) => {
          const fileBlob = response?.blob;
          const filename =
            response?.filename ||
            `project_logs_export_${format(new Date(), "yyyy-MM-dd")}.xlsx`;

          if (fileBlob) {
            const fileUrl = URL.createObjectURL(fileBlob);
            const link = document.createElement("a");
            link.href = fileUrl;
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(fileUrl);
            toast.success("Project logs CSV export generated successfully");
          } else {
            console.error("No file URL found in response:", response);
            toast.error("Failed to generate project logs CSV file");
          }
        },
        onError: (error: Error) => {
          console.error("Project logs CSV export failed:", error);
          // toast.error(error.message || "Failed to generate project logs CSV file");
        },
      }
    );
  };

  const handleSearch = (search: string | undefined) => {
    setQueryParams({ ...listParams, search: search ?? "", currentPage: 1 });
  };

  const handlePaginationChange = (newPagination: {
    pageIndex: number;
    pageSize: number;
  }) => {
    setQueryParams({
      ...listParams,
      pageSize: newPagination.pageSize,
      currentPage: newPagination.pageIndex + 1,
    });
  };

  const filters: FilterConfig[] = [
    {
      type: "search",
      placeholder: "Search...",
      key: "search",
      value: listParams.search,
      onChange: handleSearch,
    },
    {
      type: "dateRange",
      key: "dateRange",
      placeholder: "Filter by Date",
      disable: { after: new Date() },
      value: {
        from: listParams.fromDate ? new Date(listParams.fromDate) : undefined,
        to: listParams.toDate ? new Date(listParams.toDate) : undefined,
      },
      onChange: (range: { from?: Date; to?: Date } | undefined) => {
        setQueryParams({
          fromDate: formatDate(range?.from) ?? null,
          toDate: formatDate(range?.to) ?? null,
          currentPage: 1,
        });
      },
    },
    {
      type: "select",
      key: "projectId",
      placeholder: "Filter by Project",
      options: projectsList?.data?.map((project: any) => ({
        value: project.id,
        label: project.name,
      })),
      value: listParams.projectId,
      onChange: (value: any) => {
        setQueryParams({
          projectId: value ?? null,
          currentPage: 1,
        });
      },
      isLoading: projectsListLoading,
    },
    {
      type: "select",
      key: "milestoneId",
      placeholder: "Filter by Milestone",
      options: milestonesList?.data?.map((milestone: any) => ({
        value: milestone.id,
        label: milestone.name,
      })),
      value: listParams.projectMilestoneId,
      onChange: (value: any) => {
        setQueryParams({
          projectMilestoneId: value ?? null,
          currentPage: 1,
        });
      },
      isLoading: milestonesLoading,
    },
    {
      type: "select",
      key: "taskId",
      placeholder: "Filter by Task",
      options: tasksList?.data?.map((task: any) => ({
        value: task.id,
        label: task.taskName ?? task.name,
      })),
      value: listParams.taskId,
      onChange: (value: any) => {
        setQueryParams({
          taskId: value ?? null,
          currentPage: 1,
        });
      },
      isLoading: tasksLoading,
    },
    {
      type: "select",
      key: "employeeId",
      placeholder: "Filter by Employee",
      options: usersList?.data?.map((user: any) => ({
        value: user.id,
        label: user.fullName,
      })),
      value: listParams.employeeId,
      onChange: (value: any) => {
        setQueryParams({
          employeeId: value ?? null,
          currentPage: 1,
        });
      },
      isLoading: usersListLoading,
    },
  ];

  return (
    <PageLayout>
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Pending Reports Card */}
          <Card
            className={`border transition-all cursor-pointer hover:shadow-md ${
              reportType === "pending"
                ? "bg-orange-50 border-orange-200 ring-2 ring-orange-100 dark:bg-orange-900/20 dark:border-orange-800 dark:ring-orange-900/30"
                : "border-slate-200 dark:border-slate-800"
            }`}
            onClick={() => handleCardClick("pending")}
          >
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <span
                  className={`text-xs font-semibold uppercase tracking-wide ${
                    reportType === "pending"
                      ? "text-orange-700 dark:text-orange-400"
                      : "text-slate-400"
                  }`}
                >
                  Pending Reports (Last 30 Days)
                </span>
                <div
                  className={`p-2 rounded-xl ${
                    reportType === "pending"
                      ? "bg-orange-200 text-orange-700 dark:bg-orange-900 dark:text-orange-300"
                      : "bg-orange-50 text-orange-500 dark:bg-orange-900/30 dark:text-orange-400"
                  }`}
                >
                  <Clock size={20} />
                </div>
              </div>
              <div
                className={`text-3xl font-bold tracking-tight ${
                  reportType === "pending"
                    ? "text-orange-900 dark:text-orange-100"
                    : "text-slate-900 dark:text-slate-100"
                }`}
              >
                {analytics?.pendingCount ?? 0}
              </div>
            </CardContent>
          </Card>

          {/* Incomplete Reports Card */}
          <Card
            className={`border transition-all cursor-pointer hover:shadow-md ${
              reportType === "incomplete"
                ? "bg-red-50 border-red-200 ring-2 ring-red-100 dark:bg-red-900/20 dark:border-red-800 dark:ring-red-900/30"
                : "border-slate-200 dark:border-slate-800"
            }`}
            onClick={() => handleCardClick("incomplete")}
          >
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <span
                  className={`text-xs font-semibold uppercase tracking-wide ${
                    reportType === "incomplete"
                      ? "text-red-700 dark:text-red-400"
                      : "text-slate-400"
                  }`}
                >
                  Incomplete Reports (Last 30 Days)
                </span>
                <div
                  className={`p-2 rounded-xl ${
                    reportType === "incomplete"
                      ? "bg-red-200 text-red-700 dark:bg-red-900 dark:text-red-300"
                      : "bg-red-50 text-red-500 dark:bg-red-900/30 dark:text-red-400"
                  }`}
                >
                  <AlertCircle size={20} />
                </div>
              </div>
              <div
                className={`text-3xl font-bold tracking-tight ${
                  reportType === "incomplete"
                    ? "text-red-900 dark:text-red-100"
                    : "text-slate-900 dark:text-slate-100"
                }`}
              >
                {analytics?.incompleteCount ?? 0}
              </div>
            </CardContent>
          </Card>

          {/* Total Holidays Card */}
          {/* Total Holidays Card */}
          <Card
            className={`border transition-all cursor-pointer hover:shadow-md ${
              reportType === "holiday"
                ? "bg-indigo-50 border-indigo-200 ring-2 ring-indigo-100 dark:bg-indigo-900/20 dark:border-indigo-800 dark:ring-indigo-900/30"
                : "border-slate-200 dark:border-slate-800"
            }`}
            onClick={() => handleCardClick("holiday")}
          >
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <span
                  className={`text-xs font-semibold uppercase tracking-wide ${
                    reportType === "holiday"
                      ? "text-indigo-700 dark:text-indigo-400"
                      : "text-slate-400"
                  }`}
                >
                  Holiday List 2026
                </span>

                <div
                  className={`p-2 rounded-xl ${
                    reportType === "holiday"
                      ? "bg-indigo-200 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300"
                      : "bg-indigo-50 text-indigo-500 dark:bg-indigo-900/30 dark:text-indigo-400"
                  }`}
                >
                  <CalendarDays size={20} />
                </div>
              </div>

              <div
                className={`text-3xl font-bold tracking-tight ${
                  reportType === "holiday"
                    ? "text-indigo-900 dark:text-indigo-100"
                    : "text-slate-900 dark:text-slate-100"
                }`}
              >
                {analytics?.holidayCount ?? 0}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* <TablePageHeader title="Daily Reports" showActionButton={false}>
          Get list of daily report logs
        </TablePageHeader> */}

        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-4 items-start">
          <div>
            <GlobalFilterSection
              filters={filters.filter((f) => {
                if (f.key === "milestoneId" && !listParams.projectId) {
                  return false;
                }
                if (f.key === "taskId" && !listParams.projectMilestoneId) {
                  return false;
                }
                if (f.key === "employeeId") {
                  const userRole = String(
                    user?.user?.role?.name || user?.user?.role
                  ).toLowerCase();
                  return (
                    userRole === roles.ADMIN ||
                    userRole === roles.TEAM_LEAD ||
                    userRole === roles.PROJECT_MANAGER
                  );
                }
                return true;
              })}
            />
          </div>
          <div className="flex flex-wrap gap-2 items-center my-4">
            {canExportCSV && (
              <Button
                onClick={handleExportCSV}
                disabled={exportCSVLoading}
                className="whitespace-nowrap h-10 px-5"
              >
                {exportCSVLoading ? (
                  "Exporting..."
                ) : (
                  <>
                    <Download className="w-4 h-4 mr-2" />
                    Export CSV
                  </>
                )}
              </Button>
            )}
            {canExportProjectCSV && (
              <Button
                onClick={handleExportProjectLogsCSV}
                disabled={exportProjectLogsLoading}
                className="whitespace-nowrap h-10 px-5"
              >
                {exportProjectLogsLoading ? (
                  "Exporting..."
                ) : (
                  <>
                    <Download className="w-4 h-4 mr-2" />
                    Export Project Logs CSV
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
        <GlobalTable<DailyReport>
          pageSize={listParams.pageSize}
          currentPage={listParams.currentPage}
          totalCount={totalCount ?? 0}
          data={(listData as any)?.data ?? []}
          onPaginationChange={handlePaginationChange}
          columns={columns(
            handleEdit,
            handleDelete,
            handleView,
            String(user?.user?.role?.name || user?.user?.role).toLowerCase()
          ).filter((col) => {
            if ((col as any).accessorKey === "employee.fullName") {
              const userRole = String(
                user?.user?.role?.name || user?.user?.role
              ).toLowerCase();
              return (
                userRole === roles.ADMIN ||
                userRole === roles.TEAM_LEAD ||
                userRole === roles.PROJECT_MANAGER
              );
            }
            return true;
          })}
          loading={loading}
          isPaginationEnabled
        />

        <DailyReportDialog
          open={editOpen}
          onOpenChange={setEditOpen}
          report={editReport}
        />
        <DailyReportDialog
          open={viewOpen}
          onOpenChange={setViewOpen}
          report={viewReport}
          isView={true}
          isDescriptionOnly={true}
        />
        <DeleteModal
          isOpen={deleteOpen}
          onClose={() => setDeleteOpen(false)}
          onConfirm={() => deleteId && deleteReport(deleteId)}
          loading={isDeleting}
        />
        <ReportsStatsDialog
          open={statsOpen}
          onOpenChange={(open) => {
            setStatsOpen(open);
            if (!open) {
              // Clear URL params so a page refresh doesn't reopen the dialog
              navigate({
                to: "/daily-report",
                search: {
                  openPendingReports: undefined,
                  openPendingReportsAt: undefined,
                  type: undefined,
                  userId: undefined,
                },
                replace: true,
              });
            }
          }}
          type={reportType}
          userId={statsUserId}
        />
      </div>
    </PageLayout>
  );
}
