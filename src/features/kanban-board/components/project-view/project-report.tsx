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
import { Search, Eye, Pencil, Trash2, Loader2 } from "lucide-react";
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
import {
  useDeleteDailyReport,
  useUpdateDailyReport,
} from "@/features/daily-report/services";
import { toast } from "sonner";
import { DeleteModal } from "@/components/model/delete-model";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

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

  const [viewDescription, setViewDescription] = useState<string | null>(null);
  const [editingReport, setEditingReport] = useState<ProjectReport | null>(
    null
  );
  const [reportToDelete, setReportToDelete] = useState<ProjectReport | null>(
    null
  );
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const [editHours, setEditHours] = useState("0");
  const [editMinutes, setEditMinutes] = useState("0");
  const [editDesc, setEditDesc] = useState("");

  const userRole = String(
    user?.user?.role?.name || user?.user?.role
  ).toLowerCase();
  const canSelectEmployee = [
    roles.ADMIN,
    roles.TEAM_LEAD,
    roles.PROJECT_MANAGER,
  ].includes(userRole);

  const { mutate: deleteReport, isPending: isDeleting } = useDeleteDailyReport(
    () => {
      setIsDeleteModalOpen(false);
      setReportToDelete(null);
      toast.success("Report deleted successfully");
    }
  );

  const { mutate: updateReport, isPending: isUpdating } = useUpdateDailyReport(
    editingReport?.id?.toString() || "",
    () => {
      setIsEditModalOpen(false);
      setEditingReport(null);
      toast.success("Report updated successfully");
    }
  );

  const handleEdit = (report: ProjectReport) => {
    setEditingReport(report);
    setEditDesc(report.taskDescription);
    const timeMatch = report.timeSpent.match(/(\d+)h(\d+)m/);
    if (timeMatch) {
      setEditHours(timeMatch[1]);
      setEditMinutes(timeMatch[2]);
    }
    setIsEditModalOpen(true);
  };

  const handleDelete = (report: ProjectReport) => {
    setReportToDelete(report);
    setIsDeleteModalOpen(true);
  };

  const handleSaveEdit = () => {
    if (!editingReport) return;
    updateReport({
      taskDescription: editDesc,
      timeSpent: `${editHours}h${editMinutes}m`,
    });
  };

  // Columns definition inside component to access handlers
  const columns: ColumnDef<ProjectReport>[] = useMemo(() => {
    return [
      ...reportColumns.slice(0, 2),
      {
        accessorKey: "taskDescription",
        header: "Description",
        cell: ({ row }) => {
          const desc = row.original.taskDescription;
          const isLong = desc.length > 100;
          return (
            <div className="flex items-center gap-2 max-w-[400px]">
              <span className="line-clamp-2 text-muted-foreground flex-1">
                {desc}
              </span>
              {isLong && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 shrink-0"
                  onClick={() => setViewDescription(desc)}
                  title="View full description"
                >
                  <Eye className="h-4 w-4" />
                </Button>
              )}
            </div>
          );
        },
      },
      ...reportColumns.slice(3),
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => {
          const isCurrentUser = row.original.employee?.id === user?.user?.id;
          if (!isCurrentUser) return null;

          return (
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-primary"
                onClick={() => handleEdit(row.original)}
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-destructive"
                onClick={() => handleDelete(row.original)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          );
        },
      },
    ];
  }, [user?.user?.id]);

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
          columns={columns}
          totalCount={metadata?.total || reports.length}
          currentPage={pagination.pageIndex + 1}
          pageSize={pagination.pageSize}
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
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Full Description</DialogTitle>
          </DialogHeader>
          <div className="py-4 whitespace-pre-wrap leading-relaxed text-muted-foreground">
            {viewDescription}
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Report Dialog */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Hours Log</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium">Actual Hours</label>
              <div className="grid grid-cols-2 gap-4">
                <Select value={editHours} onValueChange={setEditHours}>
                  <SelectTrigger>
                    <SelectValue placeholder="Hrs" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 13 }).map((_, i) => (
                      <SelectItem key={i} value={String(i)}>
                        {String(i).padStart(2, "0")} hrs
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={editMinutes} onValueChange={setEditMinutes}>
                  <SelectTrigger>
                    <SelectValue placeholder="Min" />
                  </SelectTrigger>
                  <SelectContent>
                    {[0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55].map((m) => (
                      <SelectItem key={m} value={String(m)}>
                        {String(m).padStart(2, "0")} min
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium">Work Description</label>
              <Textarea
                placeholder="What did you work on?"
                value={editDesc}
                onChange={(e) => setEditDesc(e.target.value)}
                className="min-h-[100px]"
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-4">
            <Button
              variant="outline"
              onClick={() => setIsEditModalOpen(false)}
              disabled={isUpdating}
            >
              Cancel
            </Button>
            <Button onClick={handleSaveEdit} disabled={isUpdating}>
              {isUpdating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

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
