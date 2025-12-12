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
import { ServerOwnerTypeLabel } from "@/utils/constant";

export const columns: ColumnDef<any>[] = [
  {
    accessorKey: "ip",
    header: "IP",
  },

  {
    accessorKey: "ownerName",
    header: "Owner",
    cell: ({ row }) => (
      <span className="capitalize">
        {ServerOwnerTypeLabel?.[row.original.ownerName]
          ? ServerOwnerTypeLabel?.[row.original.ownerName]
          : "-"}
      </span>
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
        {row.original.ssl ? "SSL" : "NON SSL"}
      </span>
    ),
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

      // const handleView = () => {
      //   setOpen("view");
      //   setCurrentRow(server);
      // };

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
            {/* <DropdownMenuItem onClick={handleView}>View</DropdownMenuItem> */}
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
