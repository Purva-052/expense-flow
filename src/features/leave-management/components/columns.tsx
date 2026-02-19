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
        <span className="text-sm font-medium">
          {employeeName ? employeeName : "-"}
        </span>
      );
    },
  },
  {
    accessorKey: "leaveDate",
    header: ({ column }) => {
      const sorted = column.getIsSorted();

      return (
        <button
          type="button"
          onClick={() => column.toggleSorting(sorted === "asc")}
          className="flex items-center gap-1 text-left text-sm font-medium hover:text-primary"
        >
          Leave Date
          {sorted === "asc" && <ArrowUp className="h-4 w-4" />}
          {sorted === "desc" && <ArrowDown className="h-4 w-4" />}
          {!sorted && <ArrowUpDown className="h-4 w-4 opacity-50" />}
        </button>
      );
    },
    cell: ({ row }) => {
      const leaveDate = row.original.leaveDate;
      if (!leaveDate) return <span className="text-sm">-</span>;

      const date = new Date(leaveDate);
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
  },
  {
    accessorKey: "dayType",
    header: "Day Type",
    cell: ({ row }) => {
      const type = row.original.dayType; // 'full' or 'half'
      return (
        <Badge variant={type === "full" ? "default" : "secondary"}>
          {type === "full" ? "Full Day" : "Half Day"}
        </Badge>
      );
    },
  },
  {
    accessorKey: "halfType",
    header: "Session",
    cell: ({ row }) => {
      const type = row.original.halfType; // 'first_half', 'second_half' or null
      if (!type) return <span className="text-xs text-gray-400">-</span>;
      return (
        <span className="text-sm capitalize">{type.replace("_", " ")}</span>
      );
    },
  },
  {
    accessorKey: "reason",
    header: "Reason",
    cell: ({ row }) => {
      const reason = row.original.reason;
      if (!reason) return <span className="text-sm">-</span>;
      const truncated =
        reason.length > 40 ? `${reason.slice(0, 40)}...` : reason;
      return (
        <span className="text-sm" title={reason}>
          {truncated}
        </span>
      );
    },
  },
  {
    id: "actions",
    header: "Actions",
    cell: function Cell({ row }) {
      const data = row.original;
      const { setOpen, setCurrentRow } = useLeaveStore();

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
