import { useState } from "react";
import PageLayout from "@/components/layout/layout-provider";
import { GlobalTable } from "@/components/table/global-table";
import GlobalFilterSection from "@/components/table/global-table-filter";
import TablePageHeader from "@/components/table/table-page-header";
import { FilterConfig } from "@/components/table/table-toolbar";
// import { PaginationState } from "@tanstack/react-table";
import {
  useGetDailyReportList,
  useGetProjectMilestonesList,
  useGetTasksDropdownList,
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

export default function DailyReportPage() {
  const { user } = useAuthStore();
  const [listParams, setListParams] = useState({
    pageSize: 10,
    currentPage: 1,
    search: "",
    projectId: undefined,
    milestoneId: undefined,
    taskId: undefined,
    employeeId: undefined,
    fromDate: undefined as string | undefined,
    toDate: undefined as string | undefined,
  });

  const [editReport, setEditReport] = useState<DailyReport | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);

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

  const handleDelete = (report: DailyReport) => {
    setDeleteId(String(report.id));
    setDeleteOpen(true);
  };

  const apiParams = {
    page: listParams.currentPage,
    limit: listParams.pageSize,
    search: listParams.search,
    projectId: listParams.projectId,
    milestoneId: listParams.milestoneId,
    taskId: listParams.taskId,
    employeeId: listParams.employeeId,
    fromDate: listParams.fromDate,
    toDate: listParams.toDate,
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
            projectMilestoneId: listParams.milestoneId,
          }
        : undefined,
      !!listParams.milestoneId
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
      value: listParams.milestoneId,
      onChange: (value: any) => {
        setListParams({
          ...listParams,
          milestoneId: value ?? undefined,
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
      <TablePageHeader title="Daily Reports" showActionButton={false}>
        Get list of daily report logs
      </TablePageHeader>
      <GlobalFilterSection
        filters={filters.filter((f) => {
          if (f.key === "milestoneId" && !listParams.projectId) {
            return false;
          }
          if (f.key === "taskId" && !listParams.milestoneId) {
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
        columns={columns(handleEdit, handleDelete).filter((col) => {
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
      <DeleteModal
        isOpen={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={() => deleteId && deleteReport(deleteId)}
        loading={isDeleting}
      />
    </PageLayout>
  );
}
