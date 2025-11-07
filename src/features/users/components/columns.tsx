/* eslint-disable @typescript-eslint/no-explicit-any */
import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useUsersStore } from "../stores/useUsersStore";
import { useAuthStore } from "@/stores/use-auth-store";

// 🎯 Columns
export const columns: ColumnDef<any>[] = [
  {
    accessorKey: "fullName",
    header: "Full Name",
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "role",
    header: "Role",
    cell: ({ row }) => (
      <Badge
        variant="outline"
        className="capitalize font-medium text-xs px-2 py-1"
      >
        {row.original.role}
      </Badge>
    ),
  },
  {
    accessorKey: "technology.name",
    header: "Technology",
    cell: ({ row }) => {
      const tech = row.original.technology;
      return (
        <div className="flex items-center gap-2">
          <span
            className="h-2.5 w-2.5 rounded-full"
            style={{ backgroundColor: tech?.color }}
          />
          <span>{tech?.name}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "careerStartDate",
    header: "Career Start Date",
    cell: ({ row }) => {
      const date = new Date(row.original.careerStartDate);
      return date.toLocaleDateString("en-IN", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <Badge
        variant={row.original.status === "active" ? "success" : "destructive"}
        className="text-sm font-medium capitalize"
      >
        {row.original.status}
      </Badge>
    ),
  },
  {
    id: "actions",
    header: "Actions",
    cell: function Cell({ row }) {
      const operator = row.original;
      const { setOpen, setCurrentRow } = useUsersStore();
      const user = useAuthStore((state) => state.user);
      const UserRole = user?.user?.role;

      const handleEdit = () => {
        setOpen("edit");
        setCurrentRow(operator);
      };

      const handleDelete = () => {
        setOpen("delete");
        setCurrentRow(operator);
      };

      const handleView = () => {
        setOpen("view");
        setCurrentRow(operator);
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
            <DropdownMenuItem onClick={handleView}>View User</DropdownMenuItem>
            {(UserRole === "admin" || UserRole === "project_manager") && (
              <>
                <DropdownMenuItem onClick={handleEdit}>
                  Edit User
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-red-600 focus:bg-red-50 focus:text-red-600"
                  onClick={handleDelete}
                >
                  Delete User
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
    enableSorting: false,
  },
];
