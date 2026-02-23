/* eslint-disable @typescript-eslint/no-explicit-any */
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToolsStore } from "../stores";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export const columns: ColumnDef<any>[] = [
  {
    accessorKey: "toolName",
    header: "Tool Name",
    cell: ({ row }) => (
      <span className="text-sm font-medium">{row.original.toolName}</span>
    ),
  },
  {
    accessorKey: "description",
    header: "Description",
    cell: ({ row }) => {
      const desc = row.original.description;
      const truncated =
        desc && desc.length > 50 ? `${desc.slice(0, 50)}...` : desc;

      if (!desc) {
        return <span className="text-sm">-</span>;
      }

      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="text-sm cursor-pointer">{truncated}</span>
            </TooltipTrigger>
            <TooltipContent className="max-w-xs break-words">
              {desc}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    },
  },
  {
    accessorKey: "purchasedBy.name",
    header: "Purchased By",
    cell: ({ row }) => {
      const name = row.original.purchasedBy?.name;
      return <span className="text-sm">{name || "-"}</span>;
    },
  },
  {
    accessorKey: "purchaseDate",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Purchase Date
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const dateStr = row.original.purchaseDate;
      if (!dateStr) return <span className="text-sm">-</span>;
      return (
        <span className="text-sm">
          {new Date(dateStr).toLocaleDateString("en-IN", {
            year: "numeric",
            month: "short",
            day: "numeric",
          })}
        </span>
      );
    },
  },
  {
    accessorKey: "expiryDate",
    header: "Expiry Date",
    cell: ({ row }) => {
      const dateStr = row.original.expiryDate;
      if (!dateStr) return <span className="text-sm">-</span>;
      return (
        <span className="text-sm">
          {new Date(dateStr).toLocaleDateString("en-IN", {
            year: "numeric",
            month: "short",
            day: "numeric",
          })}
        </span>
      );
    },
  },
  {
    id: "actions",
    header: "Actions",
    cell: function Cell({ row }) {
      const data = row.original;
      const { setOpen, setCurrentRow } = useToolsStore();

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
            <DropdownMenuItem onClick={handleEdit}>
              Edit Details
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-red-600 focus:bg-red-50 focus:text-red-600"
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
