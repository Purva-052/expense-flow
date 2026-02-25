import { useEffect, useState } from "react";
import { useSearch } from "@tanstack/react-router";
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
import { Clock, AlertCircle, CalendarDays } from "lucide-react";

export default function DailyReportPage() {
  const search = useSearch({ from: "/_authenticated/daily-report/" });
  const { user } = useAuthStore();
  const [listParams, setListParams] = useState({
    pageSize: 10,
    currentPage: 1,
    search: "",
    projectId: undefined,
    projectMilestoneId: undefined,
    taskId: undefined,
    employeeId: undefined,
    fromDate: undefined as string | undefined,
    toDate: undefined as string | undefined,
  });

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

  const nextType: any = search.type ?? "pending";

  setReportType(nextType);
  setStatsUserId(
    search.userId ? String(search.userId).replace(/^"+|"+$/g, "") : undefined
  );
  setStatsOpen(true);
}, [search.openPendingReports, search.type, search.userId]);

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

  const totalCount = (listData as any)?.metadata?.totalCount;

  const { data: projectsList, isPending: projectsListLoading }: any =
    useGetProjectSDropdownList();

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

  const formatDate = (date?: Date) => {
    if (!date) return undefined;
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  };

  const handleSearch = (search: string | undefined) => {
    setListParams({ ...listParams, search: search ?? "", currentPage: 1 });
  };

  const handlePaginationChange = (newPagination: {
    pageIndex: number;
    pageSize: number;
  }) => {
    setListParams({
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
        setListParams({
          ...listParams,
          fromDate: formatDate(range?.from),
          toDate: formatDate(range?.to),
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
        setListParams({
          ...listParams,
          projectId: value ?? undefined,
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
        setListParams({
          ...listParams,
          projectMilestoneId: value ?? undefined,
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
        setListParams({
          ...listParams,
          taskId: value ?? undefined,
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
        setListParams({
          ...listParams,
          employeeId: value ?? undefined,
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
                ? "bg-orange-50 border-orange-200 ring-2 ring-orange-100"
                : "border-slate-200"
            }`}
            onClick={() => handleCardClick("pending")}
          >
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <span
                  className={`text-xs font-semibold uppercase tracking-wide ${
                    reportType === "pending"
                      ? "text-orange-700"
                      : "text-slate-400"
                  }`}
                >
                  Pending Reports (Last 30 Days)
                </span>
                <div
                  className={`p-2 rounded-xl ${
                    reportType === "pending"
                      ? "bg-orange-200 text-orange-700"
                      : "bg-orange-50 text-orange-500"
                  }`}
                >
                  <Clock size={20} />
                </div>
              </div>
              <div
                className={`text-3xl font-bold tracking-tight ${
                  reportType === "pending"
                    ? "text-orange-900"
                    : "text-slate-900"
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
                ? "bg-red-50 border-red-200 ring-2 ring-red-100"
                : "border-slate-200"
            }`}
            onClick={() => handleCardClick("incomplete")}
          >
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <span
                  className={`text-xs font-semibold uppercase tracking-wide ${
                    reportType === "incomplete"
                      ? "text-red-700"
                      : "text-slate-400"
                  }`}
                >
                  Incomplete Reports (Last 30 Days)
                </span>
                <div
                  className={`p-2 rounded-xl ${
                    reportType === "incomplete"
                      ? "bg-red-200 text-red-700"
                      : "bg-red-50 text-red-500"
                  }`}
                >
                  <AlertCircle size={20} />
                </div>
              </div>
              <div
                className={`text-3xl font-bold tracking-tight ${
                  reportType === "incomplete"
                    ? "text-red-900"
                    : "text-slate-900"
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
                ? "bg-indigo-50 border-indigo-200 ring-2 ring-indigo-100"
                : "border-slate-200"
            }`}
            onClick={() => handleCardClick("holiday")}
          >
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <span
                  className={`text-xs font-semibold uppercase tracking-wide ${
                    reportType === "holiday"
                      ? "text-indigo-700"
                      : "text-slate-400"
                  }`}
                >
                  Holiday List 2026
                </span>

                <div
                  className={`p-2 rounded-xl ${
                    reportType === "holiday"
                      ? "bg-indigo-200 text-indigo-700"
                      : "bg-indigo-50 text-indigo-500"
                  }`}
                >
                  <CalendarDays size={20} />
                </div>
              </div>

              <div
                className={`text-3xl font-bold tracking-tight ${
                  reportType === "holiday"
                    ? "text-indigo-900"
                    : "text-slate-900"
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
          onOpenChange={setStatsOpen}
          type={reportType}
          reportingDate={listParams.fromDate}
          userId={statsUserId}
        />
      </div>
    </PageLayout>
  );
}
