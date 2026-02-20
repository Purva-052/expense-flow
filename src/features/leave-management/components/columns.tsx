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

export const columns: ColumnDef<any>[] = [
  {
    accessorKey: "employee.fullName",
    header: "Employee",
    cell: ({ row }) => {
      const employeeName = row.original.employee?.fullName;
      return <span className="text-sm font-medium">{employeeName || "-"}</span>;
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
  },

  // ✅ Actions
  {
    id: "actions",
    header: "Actions",
    cell: function Cell({ row }) {
      const data = row.original;
      const { setOpen, setCurrentRow } = useLeaveStore();

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
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuSeparator />

            <DropdownMenuItem onClick={handleView}>
              View Details
            </DropdownMenuItem>

            <DropdownMenuItem onClick={handleEdit}>
              Edit Details
            </DropdownMenuItem>

            <DropdownMenuItem
              className="text-red-600 focus:bg-red-50"
              onClick={handleDelete}
            >
              Delete Details
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
    enableSorting: false,
  },
];
