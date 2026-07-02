/* eslint-disable @typescript-eslint/no-explicit-any */
import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, ArrowUpDown } from "lucide-react";
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
import { formatRole } from "@/utils/commonFunctions";
import { roles } from "@/utils/constant";
import { Switch } from "@/components/ui/switch";
import { useUpdateSingleCheckInAllowed } from "../services";

// 🎯 Columns
export const columns: ColumnDef<any>[] = [
  {
    accessorKey: "fullName",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          className="p-0 hover:bg-transparent"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Full Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const { setOpen, setCurrentRow } = useUsersStore();

      return (
        <div
          className="cursor-pointer font-medium text-blue-600 hover:underline"
          onClick={() => {
            setCurrentRow(row.original);
            // CHANGE THIS: Use a unique key for the profile card modal
            setOpen("view_profile");
          }}
        >
          {row.original.fullName}
        </div>
      );
    },
  },
  {
    accessorKey: "email",
    header: "Email",
    enableSorting: false,
  },
  // {
  //   accessorKey: "mewurkEmployeeCode",
  //   header: "Employee Code",
  //   cell: ({ row }) => row.original.mewurkEmployeeCode || "-",
  // },
  {
    accessorKey: "role",
    header: "Role",
    cell: ({ row }) => (
      <Badge
        variant="outline"
        className="capitalize font-medium text-xs px-2 py-1"
      >
        {formatRole(row.original.role)}
      </Badge>
    ),
    enableSorting: false,
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
            style={{ backgroundColor: tech?.color || "#ccc" }}
          />
          <span>{tech?.name ?? "-"}</span>
        </div>
      );
    },
    enableSorting: false,
  },
  {
    accessorKey: "dateOfBirth",
    header: "Date of Birth",
    cell: ({ row }) => {
      if (!row.original.dateOfBirth) return "-";
      const date = new Date(row.original.dateOfBirth);
      return date.toLocaleDateString("en-IN", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    },
    enableSorting: false,
  },
  {
    accessorKey: "joiningDate",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          className="p-0 hover:bg-transparent"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Joining Date
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      if (!row.original.joiningDate) return "-";
      const date = new Date(row.original.joiningDate);
      return date.toLocaleDateString("en-IN", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    },
  },
  {
    accessorKey: "careerStartDate",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          className="p-0 hover:bg-transparent"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Career Start Date
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      if (!row.original.careerStartDate) return "-";
      const date = new Date(row.original.careerStartDate);
      return date.toLocaleDateString("en-IN", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    },
  },
  // {
  //   accessorKey: "experience",
  //   header: "CL/PL Balance",
  //   cell: ({ row }) => {
  //     const exp = row.original.experience;
  //     return exp !== undefined && exp !== null ? exp : "-";
  //   },
  // },
  {
    accessorKey: "isSingleCheckInAllowed",
    header: "Single Check-In Allowed",
    cell: function Cell({ row }: any) {
      const isSingleCheckInAllowed = row.original.isSingleCheckInAllowed;
      const userId = row.original.id;
      const { mutate: updateSingleCheckIn, isPending } = useUpdateSingleCheckInAllowed();

      const user = useAuthStore((state) => state.user);
      const rawRole = user?.role || user?.user?.role;
      const roleName = String(
        rawRole && typeof rawRole === "object" ? rawRole?.name : rawRole || ""
      ).toLowerCase();
      const isAdmin = roleName === roles.ADMIN;

      return (
        <div className="flex justify-center">
          <Switch
            checked={!!isSingleCheckInAllowed}
            disabled={!isAdmin || isPending}
            onCheckedChange={(checked) => {
              if (userId != null) {
                updateSingleCheckIn({
                  id: userId,
                  isSingleCheckInAllowed: checked,
                });
              }
            }}
          />
        </div>
      );
    },
    enableSorting: false,
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
    enableSorting: false,
  },
  {
    id: "actions",
    header: "Actions",
    cell: function Cell({ row }) {
      const operator = row.original;
      // Hook usage here was already correct, just ensure imports match
      const { setOpen, setCurrentRow } = useUsersStore();
      const user = useAuthStore((state) => state.user);
      const UserRole = user?.user?.role;

      const handleEdit = () => {
        setCurrentRow(operator);
        setOpen("edit"); // Order changed slightly for safety (set data then open)
      };

      const handleDelete = () => {
        setCurrentRow(operator);
        setOpen("delete");
      };

      const handleView = () => {
        setCurrentRow(operator);
        setOpen("view");
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
            {(UserRole === roles.ADMIN ||
              UserRole === roles.PROJECT_MANAGER ||
              UserRole === roles.TEAM_LEAD) && (
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
