"use client";

import { useState, useMemo } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { GlobalTable } from "@/components/table/global-table";
import { Input } from "@/components/ui/input";
import { useGetDailyReportList } from "@/features/daily-report/services";
import { useQueryClient } from "@tanstack/react-query";
import { useGetUserDropdownList } from "@/features/users/services";
import SimpleDropDownSearchable from "@/components/shared/custome-simple-dropdown";
import DateRangeFilter from "@/components/table/custome-dateRange";
import { format } from "date-fns";
import { Search, Eye } from "lucide-react";
import { useAuthStore } from "@/stores/use-auth-store";
import { roles } from "@/utils/constant";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useDeleteDailyReport } from "@/features/daily-report/services";
import { toast } from "sonner";
import { DeleteModal } from "@/components/model/delete-model";
import { AddHoursLogDialog } from "./milestone-list/add-hours-log-dialog";
import API from "@/config/api/api";

const stripHtml = (html: string) => {
  const tmp = document.createElement("DIV");
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || "";
};

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
    cell: ({ row }) => {
      const desc = row.original.taskDescription;
      return (
        <div className="flex items-start gap-2 max-w-[400px]">
          <span className="line-clamp-2 text-muted-foreground flex-1">
            {desc}
          </span>
        </div>
      );
    },
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
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);

  const [listParams, setListParams] = useState({
    pageSize: 10,
    currentPage: 1,
    search: "",
    employeeId: "all" as string | undefined,
    dateRange: undefined as { from: Date; to?: Date } | undefined,
  });

  const [viewDescription, setViewDescription] = useState<string | null>(null);
  const [editingReport, _] = useState<ProjectReport | null>(null);
  const [reportToDelete, setReportToDelete] = useState<ProjectReport | null>(
    null
  );
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const userRole = String(
    user?.user?.role?.name || user?.user?.role
  ).toLowerCase();
  const canSelectEmployee = [
    roles.ADMIN,
    roles.TEAM_LEAD,
    roles.PROJECT_MANAGER,
  ].includes(userRole);

  const { data: usersData, isLoading: usersLoading } = useGetUserDropdownList();
  const userOptions = useMemo(() => {
    const base = [{ label: "All Employees", value: "all" }];
    const users = (usersData as any)?.data;
    if (!users || !Array.isArray(users)) return base;
    return [
      ...base,
      ...users.map((u: any) => ({
        label: u.fullName,
        value: String(u.id),
      })),
    ];
  }, [usersData]);

  const { mutate: deleteReport, isPending: isDeleting } = useDeleteDailyReport(
    () => {
      setIsDeleteModalOpen(false);
      setReportToDelete(null);
      toast.success("Report deleted successfully");
      queryClient.invalidateQueries({
        queryKey: [API.daily_report.list],
      });
    }
  );

  // const handleEdit = (report: ProjectReport) => {
  //   setEditingReport(report);
  //   setIsEditModalOpen(true);
  // };

  // const handleDelete = (report: ProjectReport) => {
  //   setReportToDelete(report);
  //   setIsDeleteModalOpen(true);
  // };

  const handleEditSuccess = () => {
    queryClient.invalidateQueries({
      queryKey: [API.daily_report.list],
    });
  };

  // Columns definition
  const columns: ColumnDef<ProjectReport>[] = useMemo(() => {
    return [
      ...reportColumns.slice(0, 2),
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
      // ...reportColumns.slice(3),
      // {
      //   id: "actions",
      //   header: "Actions",
      //   cell: ({ row }) => {
      //     const isCurrentUser = row.original.employee?.id === user?.user?.id;
      //     if (!isCurrentUser) return null;

      //     return (
      //       <div className="flex items-center gap-1">
      //         <Button
      //           variant="ghost"
      //           size="icon"
      //           className="h-8 w-8 text-muted-foreground hover:text-primary"
      //           onClick={() => handleEdit(row.original)}
      //         >
      //           <Pencil className="h-4 w-4" />
      //         </Button>
      //         <Button
      //           variant="ghost"
      //           size="icon"
      //           className="h-8 w-8 text-muted-foreground hover:text-destructive"
      //           onClick={() => handleDelete(row.original)}
      //         >
      //           <Trash2 className="h-4 w-4" />
      //         </Button>
      //       </div>
      //     );
      //   },
      // },
    ];
  }, [user?.user?.id]);

  // Fetch reports
  const { data: reportsResponse, isLoading } = useGetDailyReportList({
    projectId: projectId?.toString(),
    employeeId:
      listParams.employeeId === "all" ? undefined : listParams.employeeId,
    fromDate: listParams.dateRange?.from
      ? format(listParams.dateRange.from, "yyyy-MM-dd")
      : undefined,
    toDate: listParams.dateRange?.to
      ? format(listParams.dateRange.to, "yyyy-MM-dd")
      : undefined,
    search: listParams.search || undefined,
    page: listParams.currentPage,
    limit: listParams.pageSize,
  });

  const reports = useMemo(() => {
    return (reportsResponse as any)?.data || [];
  }, [reportsResponse]);

  const totalCount = (reportsResponse as any)?.metadata?.totalCount;

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

  const handleSearchChange = (value: string) => {
    setListParams({
      ...listParams,
      search: value,
      currentPage: 1,
    });
  };

  const handleEmployeeChange = (value: string) => {
    setListParams({
      ...listParams,
      employeeId: value,
      currentPage: 1,
    });
  };

  const handleDateRangeChange = (
    range: { from: Date; to?: Date } | undefined
  ) => {
    setListParams({
      ...listParams,
      dateRange: range,
      currentPage: 1,
    });
  };

  return (
    <>
      <Card className="gap-3">
        <div className="flex flex-wrap gap-4 items-center">
          {/* Search */}
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search description..."
              value={listParams.search}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-9 rounded-full"
            />
          </div>

          {canSelectEmployee && (
            <div className="w-full sm:w-64">
              <SimpleDropDownSearchable
                options={userOptions}
                value={listParams.employeeId!}
                onChange={handleEmployeeChange}
                placeholder="Select Employee"
                isLoading={usersLoading}
                disabled={!canSelectEmployee}
              />
            </div>
          )}

          {/* Date Range */}
          <div className="w-full sm:w-auto">
            <DateRangeFilter
              placeholder="Filter by date range"
              onChange={handleDateRangeChange}
              className="rounded-full h-10"
              disabled={{ after: new Date() }}
            />
          </div>
        </div>

        <GlobalTable<ProjectReport>
          data={reports}
          columns={columns}
          totalCount={totalCount ?? 0}
          currentPage={listParams.currentPage}
          pageSize={listParams.pageSize}
          onPaginationChange={handlePaginationChange}
          isPaginationEnabled
          loading={isLoading}
        />
      </Card>

      {/* View Description Dialog */}
      <Dialog
        open={!!viewDescription}
        onOpenChange={(open) => !open && setViewDescription(null)}
      >
        <DialogContent className="max-w-[95vw] sm:max-w-2xl overflow-hidden">
          <DialogHeader>
            <DialogTitle>Full Description</DialogTitle>
          </DialogHeader>
          <div
            className="py-4 whitespace-normal leading-relaxed text-muted-foreground break-words overflow-y-auto max-h-[70vh] w-full ck-content"
            dangerouslySetInnerHTML={{ __html: viewDescription || "" }}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Dialog - Using Shared Component */}
      <AddHoursLogDialog
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        projectId={projectId || ""}
        reportId={editingReport?.id}
        initialData={
          editingReport
            ? {
                date: editingReport.reportingDate,
                description: editingReport.taskDescription,
                timeSpent: editingReport.timeSpent,
              }
            : undefined
        }
        onSuccess={handleEditSuccess}
        hideTrigger
      />

      {/* Delete Confirmation */}
      <DeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={() =>
          reportToDelete && deleteReport(reportToDelete.id.toString())
        }
        itemName="this hour log"
        loading={isDeleting}
      />
    </>
  );
};

export default ProjectReportTable;
