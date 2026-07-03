/* eslint-disable @typescript-eslint/no-explicit-any */
import { ColumnDef } from "@tanstack/react-table";
import { ArrowDown, ArrowUp, ArrowUpDown, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useLeaveStore } from "../stores";
import { useAuthStore } from "@/stores/use-auth-store";
import { Badge } from "@/components/ui/badge";
import { roles, LEAVE_TYPE } from "@/utils/constant";

// Status badge variant mapping
const statusVariantMap: Record<
  string,
  "default" | "secondary" | "destructive" | "outline" | "success" | "warning"
> = {
  pending: "warning",
  approved: "success",
  rejected: "destructive",
};

const statusLabelMap: Record<string, string> = {
  pending: "Pending",
  approved: "Approved",
  rejected: "Rejected",
};

const getLeaveTypeLabel = (id: any) => {
  const match = LEAVE_TYPE.find((type) => String(type.value) === String(id));
  return match ? match.label : `Type ${id}`;
};

export const getColumns = (tab: string, data?: any[]): ColumnDef<any>[] => {
  const columns: ColumnDef<any>[] = [
  {
    id: "employeeName",
    accessorKey: "employee.fullName",
    header: ({ column }) => {
      const sorted = column.getIsSorted();

      return (
        <button
          type="button"
          onClick={() => column.toggleSorting(sorted === "asc")}
          className="flex items-center gap-1 text-left text-sm font-medium hover:text-primary"
        >
          Employee
          {sorted === "asc" && <ArrowUp className="h-4 w-4" />}
          {sorted === "desc" && <ArrowDown className="h-4 w-4" />}
          {!sorted && <ArrowUpDown className="h-4 w-4 opacity-50" />}
        </button>
      );
    },
    cell: ({ row }) => {
      const employeeName = row.original.employee?.fullName;
      return <span className="text-sm font-medium">{employeeName || "-"}</span>;
    },
    enableSorting: true,
    sortingFn: (rowA, rowB) => {
      const a = rowA.original.employee?.fullName || "";
      const b = rowB.original.employee?.fullName || "";
      return a.localeCompare(b);
    },
  },
  {
    id: tab === "pending" ? "approver" : "actionedByUser",
    accessorKey:
      tab === "pending" ? "approver.fullName" : "actionedByUser.fullName",
    header: ({ column }) => {
      const sorted = column.getIsSorted();
      const headerText =
        tab === "pending"
          ? "Approver"
          : tab === "approved"
            ? "Approved by"
            : "Rejected by";

      return (
        <button
          type="button"
          onClick={() => column.toggleSorting(sorted === "asc")}
          className="flex items-center gap-1 text-left text-sm font-medium hover:text-primary"
        >
          {headerText}
          {sorted === "asc" && <ArrowUp className="h-4 w-4" />}
          {sorted === "desc" && <ArrowDown className="h-4 w-4" />}
          {!sorted && <ArrowUpDown className="h-4 w-4 opacity-50" />}
        </button>
      );
    },
    cell: ({ row }) => {
      if (tab === "pending") {
        const approverName = row.original.approver?.fullName;
        return <span className="text-sm">{approverName || "-"}</span>;
      } else if (tab === "approved") {
        const actionedByUserName = row.original.actionedByUser?.fullName;
        return <span className="text-sm">{actionedByUserName || "-"}</span>;
      } else {
        const actionedByUserName = row.original.actionedByUser?.fullName;
        return <span className="text-sm">{actionedByUserName || "-"}</span>;
      }
    },
    enableSorting: true,
    sortingFn: (rowA, rowB) => {
      if (tab === "pending") {
        const a = rowA.original.approver?.fullName || "";
        const b = rowB.original.approver?.fullName || "";
        return a.localeCompare(b);
      } else {
        const a = rowA.original.actionedByUser?.fullName || "";
        const b = rowB.original.actionedByUser?.fullName || "";
        return a.localeCompare(b);
      }
    },
  },

  // ✅ From Date
  {
    accessorKey: "fromDate",
    header: ({ column }) => {
      const sorted = column.getIsSorted();

      return (
        <button
          type="button"
          onClick={() => column.toggleSorting(sorted === "asc")}
          className="flex items-center gap-1 text-left text-sm font-medium hover:text-primary"
        >
          From Date
          {sorted === "asc" && <ArrowUp className="h-4 w-4" />}
          {sorted === "desc" && <ArrowDown className="h-4 w-4" />}
          {!sorted && <ArrowUpDown className="h-4 w-4 opacity-50" />}
        </button>
      );
    },
    cell: ({ row }) => {
      const fromDate = row.original.fromDate;
      if (!fromDate) return <span className="text-sm">-</span>;

      const date = new Date(fromDate);
      return (
        <span className="text-sm">
          {date.toLocaleDateString("en-IN", {
            year: "numeric",
            month: "short",
            day: "numeric",
          })}
        </span>
      );
    },
    enableSorting: true,
    sortingFn: (rowA, rowB) => {
      const a = rowA.original.fromDate
        ? new Date(rowA.original.fromDate).getTime()
        : 0;

      const b = rowB.original.fromDate
        ? new Date(rowB.original.fromDate).getTime()
        : 0;

      return a - b;
    },
  },

  // ✅ To Date
  {
    accessorKey: "toDate",
    header: ({ column }) => {
      const sorted = column.getIsSorted();

      return (
        <button
          type="button"
          onClick={() => column.toggleSorting(sorted === "asc")}
          className="flex items-center gap-1 text-left text-sm font-medium hover:text-primary"
        >
          To Date
          {sorted === "asc" && <ArrowUp className="h-4 w-4" />}
          {sorted === "desc" && <ArrowDown className="h-4 w-4" />}
          {!sorted && <ArrowUpDown className="h-4 w-4 opacity-50" />}
        </button>
      );
    },
    cell: ({ row }) => {
      const toDate = row.original.toDate;
      if (!toDate) return <span className="text-sm">-</span>;

      const date = new Date(toDate);
      return (
        <span className="text-sm">
          {date.toLocaleDateString("en-IN", {
            year: "numeric",
            month: "short",
            day: "numeric",
          })}
        </span>
      );
    },
    enableSorting: true,
    sortingFn: (rowA, rowB) => {
      const a = rowA.original.toDate
        ? new Date(rowA.original.toDate).getTime()
        : 0;

      const b = rowB.original.toDate
        ? new Date(rowB.original.toDate).getTime()
        : 0;

      return a - b;
    },
  },
  {
    header: "Leave Type",
    accessorKey: "leaveTypeId",
    cell: ({ row }) => {
      const leaveTypeIds: any[] = row.original.leaveTypeId || [];
      if (!leaveTypeIds || leaveTypeIds.length === 0) {
        return <span className="text-sm">-</span>;
      }
      return (
        <div className="flex flex-wrap gap-1">
          {leaveTypeIds.map((id) => {
            const label = getLeaveTypeLabel(id);
            return (
              <Badge key={id} variant="default" className="whitespace-nowrap">
                {label}
              </Badge>
            );
          })}
        </div>
      );
    },
    enableSorting: false,
  },
  {
    header: "Total Leaves Taken",
    accessorKey: "employee.totalLeavesTaken",
    cell: ({ row }) => {
      const totalLeavesTaken = row.original.employee?.totalLeavesTaken;
      return <span className="text-sm">{totalLeavesTaken || "-"}</span>;
    },
    enableSorting: false,
  },

  // ✅ Reason
  {
    accessorKey: "reason",
    header: "Reason",
    cell: ({ row }) => {
      const reason = row.original.reason;
      if (!reason) return <span className="text-sm">-</span>;

      const truncated =
        reason.length > 50 ? `${reason.slice(0, 50)}...` : reason;

      return (
        <span className="text-sm" title={reason}>
          {truncated}
        </span>
      );
    },
    enableSorting: false,
  },

  // ✅ Status
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.original.status;
      if (!status) return <span className="text-sm">-</span>;

      const variant = statusVariantMap[status] || "default";
      const label = statusLabelMap[status] || status;

      return <Badge variant={variant}>{label}</Badge>;
    },
    enableSorting: false,
  },
  // ✅ Rejection Reason (shown when rejected)
  {
    accessorKey: "rejectionReason",
    header: "Rejection Reason",
    cell: ({ row }) => {
      const reason = row.original.rejectionReason;
      if (!reason)
        return <span className="text-sm text-muted-foreground">-</span>;

      const truncated =
        reason.length > 40 ? `${reason.slice(0, 40)}...` : reason;

      return (
        <span className="text-sm text-destructive" title={reason}>
          {truncated}
        </span>
      );
    },
    enableSorting: false,
  },

  // ✅ Actions
  {
    id: "actions",
    header: "Actions",
    cell: function Cell({ row }) {
      const data = row.original;
      const { setOpen, setCurrentRow } = useLeaveStore();

      const user = useAuthStore((state) => state.user);
      const rawRole = user?.role || user?.user?.role;
      const roleName = String(
        rawRole && typeof rawRole === "object" ? rawRole?.name : rawRole || ""
      ).toLowerCase();
      const currentUserId = user?.user?.id || user?.user_id;

      const isAdmin = roleName === roles.ADMIN;
      const isPM = roleName === roles.PROJECT_MANAGER;
      const isTL = roleName === roles.TEAM_LEAD;
      const isDeveloper = roleName === roles.DEVELOPER;
      const isBDE = roleName === roles.BDE;

      const creatorId = row.original.employeeId || row.original.employee?.id;
      const isCreator = String(creatorId) === String(currentUserId);

      // Normalize status to lowercase for case-insensitive comparison
      const rowStatus = String(row.original.status || "").toLowerCase();

      const employeeReportingToId =
        row.original.employee?.reportingToId ??
        row.original.employee?.reportToId ??
        row.original.employee?.reporttoId ??
        row.original.employee?.reportingTo?.id;

      const isReportingManager =
        (employeeReportingToId != null &&
          String(employeeReportingToId) === String(currentUserId)) ||
        (row.original.approverId != null &&
          String(row.original.approverId) === String(currentUserId)) ||
        (row.original.approver?.id != null &&
          String(row.original.approver?.id) === String(currentUserId));

      // ✅ Only Admin, PM, and Reporting Manager can approve/reject
      const canApproveReject =
        (isAdmin || isPM || isReportingManager) && rowStatus === "pending";

      // ✅ Edit/Delete rules:
      //   - Admin & PM: can edit/delete any record
      //   - Reporting Manager: can edit/delete pending record of subordinates
      //   - TL, Developer, BDE: can only edit/delete their own pending leave
      const canEditDelete =
        isAdmin ||
        isPM ||
        (isReportingManager && rowStatus === "pending") ||
        ((isTL || isDeveloper || isBDE) &&
          isCreator &&
          rowStatus === "pending");

      const handleEdit = () => {
        setOpen("edit");
        setCurrentRow(data);
      };

      const handleDelete = () => {
        setOpen("delete");
        setCurrentRow(data);
      };

      const handleView = () => {
        setOpen("view");
        setCurrentRow(data);
      };

      const handleReviewRequest = () => {
        setOpen("action");
        setCurrentRow(data);
      };

      const canDelete =
        rowStatus === "pending" &&
        (isAdmin || isPM || isCreator || isReportingManager);

      const adminDelete =
        (rowStatus === "approved" || rowStatus === "rejected") && isAdmin;

      // const hasActions =
      //   canApproveReject || canEditDelete || canDelete || adminDelete;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuSeparator />

            <DropdownMenuItem onClick={handleView}>
              View Details
            </DropdownMenuItem>

            {canApproveReject && (
              <DropdownMenuItem onClick={handleReviewRequest}>
                Review Request
              </DropdownMenuItem>
            )}

            {canEditDelete && rowStatus != "rejected" && (
              <DropdownMenuItem onClick={handleEdit}>
                Edit Details
              </DropdownMenuItem>
            )}

            {(canDelete || adminDelete) && (
              <DropdownMenuItem
                className="text-red-600 focus:bg-red-50 focus:text-red-600"
                onClick={handleDelete}
              >
                Delete Request
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
    enableSorting: false,
  },
];

  const hasRejectionReason = data?.some(
    (item: any) => String(item?.status).toLowerCase() === "rejected"
  );

  return columns.filter((col: any) => {
    if (col.accessorKey === "rejectionReason") {
      return !!hasRejectionReason;
    }
    return true;
  });
};
