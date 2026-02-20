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
import { useExtraWorkStore } from "../stores";
import { Badge } from "@/components/ui/badge";
import { useAuthStore } from "@/stores/use-auth-store";
import { roles } from "@/utils/constant";

export const columns: ColumnDef<any>[] = [
  {
    accessorKey: "employee.fullName",
    header: "Employee",
    cell: ({ row }) => {
      const employeeName = row.original.employee?.fullName;
      return (
        <span className="text-sm">{employeeName ? employeeName : "-"}</span>
      );
    },
  },
  {
    accessorKey: "project.name",
    header: "Project",
    cell: ({ row }) => {
      const projectName = row.original.project?.name;
      return <span className="text-sm">{projectName ? projectName : "-"}</span>;
    },
  },
  {
    accessorKey: "reportingDate",
    header: ({ column }) => {
      const sorted = column.getIsSorted();

      return (
        <button
          type="button"
          onClick={() => column.toggleSorting(sorted === "asc")}
          className="flex items-center gap-1 text-left text-sm font-medium hover:text-primary"
        >
          Reporting Date
          {sorted === "asc" && <ArrowUp className="h-4 w-4" />}
          {sorted === "desc" && <ArrowDown className="h-4 w-4" />}
          {!sorted && <ArrowUpDown className="h-4 w-4 opacity-50" />}
        </button>
      );
    },

    cell: ({ row }) => {
      const reportingDate = row.original.reportingDate;
      if (!reportingDate) {
        return <span className="text-sm">-</span>;
      }

      const date = new Date(reportingDate);

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
      const a = rowA.original.reportingDate
        ? new Date(rowA.original.reportingDate).getTime()
        : 0;

      const b = rowB.original.reportingDate
        ? new Date(rowB.original.reportingDate).getTime()
        : 0;

      return a - b;
    },
  },
  {
    accessorKey: "taskDescription",
    header: "Task Description",
    cell: ({ row }) => {
      const taskDescription = row.original.taskDescription;

      if (!taskDescription) {
        return <span className="text-sm">-</span>;
      }

      const truncated =
        taskDescription.length > 50
          ? `${taskDescription.slice(0, 50)}...`
          : taskDescription;

      return (
        <span className="text-sm" title={taskDescription}>
          {truncated}
        </span>
      );
    },
  },
  {
    accessorKey: "timeSpent",
    header: "Time Spent",
    cell: ({ row }) => (
      <span className="text-sm">{row.original.timeSpent}</span>
    ),
  },
  {
    accessorKey: "inCashOrLeave",
    header: "In Cash/Leave",
    cell: ({ row }) => {
      const status = row.original.inCashOrLeave;
      return (
        <Badge variant={status === 0 ? "default" : "secondary"}>
          {status === 0 ? "Cash" : "Leave"}
        </Badge>
      );
    },
  },
  {
    id: "actions",
    header: "Actions",
    cell: function Cell({ row }) {
      const data = row.original;
      const { setOpen, setCurrentRow } = useExtraWorkStore();

      const user = useAuthStore((state) => state.user);
      const userRole = user?.role || user?.user?.role;
      const currentUserId = user?.user.id;
      const isAdmin = userRole === roles.ADMIN;
      const employeeId = row.original.employeeId;
      const isOwner = String(employeeId) === String(currentUserId);

      const canEditDelete = isAdmin || isOwner;

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

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleView}>
              View Details
            </DropdownMenuItem>
            {canEditDelete && (
              <DropdownMenuItem onClick={handleEdit}>
                Edit Details
              </DropdownMenuItem>
            )}
            {canEditDelete && (
              <DropdownMenuItem
                className="text-red-600 focus:bg-red-50 focus:text-red-600"
                onClick={handleDelete}
              >
                Delete Details
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
    enableSorting: false,
  },
];
