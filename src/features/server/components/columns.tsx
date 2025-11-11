/* eslint-disable @typescript-eslint/no-explicit-any */
import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useServerStore } from "../stores/useServerStore";

export const columns: ColumnDef<any>[] = [
  {
    accessorKey: "ipOrUrl",
    header: "IP / URL",
  },
  {
    accessorKey: "type",
    header: "Type",
    cell: ({ row }) => (
      <span className="capitalize">{row.original.type}</span>
    ),
  },
  {
    accessorKey: "owner",
    header: "Owner",
    cell: ({ row }) => (
      <span className="capitalize">{row.original.owner}</span>
    ),
  },
  {
    accessorKey: "ssl",
    header: "SSL",
    cell: ({ row }) => (
      <span
        className={`${
          row.original.ssl ? "text-green-600" : "text-red-600"
        } font-medium`}
      >
        {row.original.ssl ? "SSL" : "NONSSL"}
      </span>
    ),
  },
  {
    accessorKey: "serverId",
    header: "Server ID",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.original.status;
      const color =
        status === "active"
          ? "text-green-600"
          : status === "inactive"
          ? "text-gray-600"
          : "text-yellow-600";

      return (
        <span className={`capitalize font-medium ${color}`}>{status}</span>
      );
    },
  },
  {
    id: "actions",
    header: "Actions",
    cell: function Cell({ row }) {
      const server = row.original;
      const { setOpen, setCurrentRow } = useServerStore();

      const handleEdit = () => {
        setOpen("edit");
        setCurrentRow(server);
      };

      const handleDelete = () => {
        setOpen("delete");
        setCurrentRow(server);
      };

      const handleView = () => {
        setOpen("view");
        setCurrentRow(server);
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
            <DropdownMenuItem onClick={handleView}>View</DropdownMenuItem>
            <DropdownMenuItem onClick={handleEdit}>Edit</DropdownMenuItem>
            <DropdownMenuItem
              className="text-red-600 focus:bg-red-50 focus:text-red-600"
              onClick={handleDelete}
            >
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
    enableSorting: false,
  },
];
