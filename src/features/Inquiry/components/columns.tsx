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
import { useInquiryStore } from "../stores/useInquiryStore";

export const columns: ColumnDef<any>[] = [
  {
    accessorKey: "clientName",
    header: "Client Name",
  },
  {
    accessorKey: "country",
    header: "Country",
  },
  {
    accessorKey: "type",
    header: "Inquiry Type",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.original.status;
      const color =
        status === "open"
          ? "text-green-600"
          : status === "in-progress"
          ? "text-yellow-600"
          : status === "closed"
          ? "text-gray-600"
          : "text-blue-600";

      return <span className={`capitalize font-medium ${color}`}>{status}</span>;
    },
  },
  {
    id: "actions",
    header: "Actions",
    cell: function Cell({ row }) {
      const inquiry = row.original;
      const { setOpen, setCurrentRow } = useInquiryStore();

      const handleEdit = () => {
        setOpen("edit");
        setCurrentRow(inquiry);
      };

      const handleDelete = () => {
        setOpen("delete");
        setCurrentRow(inquiry);
      };

      const handleView = () => {
        setOpen("view");
        setCurrentRow(inquiry);
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
              View Inquiry
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleEdit}>
              Edit Inquiry
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-red-600 focus:bg-red-50 focus:text-red-600"
              onClick={handleDelete}
            >
              Delete Inquiry
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
    enableSorting: false,
  },
];
