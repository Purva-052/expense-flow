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
import { useClientInventoryStore } from "../stores/useClientInventory";

export const columns: ColumnDef<any>[] = [
  {
    accessorKey: "client.name",
    header: "Client",
    cell: ({ row }) => {
      return row.original?.client?.name ?? row.original?.clientName ?? "-";
    },
  },
  {
    accessorKey: "project.name",
    header: "Project",
    cell: ({ row }) => {
      return row.original?.project?.name ?? row.original?.projectName ?? "-";
    },
  },
  {
    accessorKey: "inventoryType.name",
    header: "Type",
    cell: ({ row }) => {
      return row.original?.inventoryType?.name ?? row.original?.inventoryTypeName ?? "-";
    },
  },
  // {
  //   accessorKey: "quantity",
  //   header: "Quantity",
  // },
  {
    accessorKey: "brand.name",
    header: "Brand",
    cell: ({ row }) => {
      return row.original?.brand?.name ?? row.original?.brandName ?? "-";
    },
  },
  // {
  //   header: "Specifications",
  //   cell: ({ row }) => {
  //     const parts = [];
  //     const data = row.original;
  //     if (data?.processor?.name || data?.processorName) parts.push(data?.processor?.name ?? data?.processorName);
  //     if (data?.ram?.name || data?.ramName) parts.push(data?.ram?.name ?? data?.ramName);
  //     if (data?.storage?.name || data?.storageName) parts.push(data?.storage?.name ?? data?.storageName);
  //     if (data?.monitorSize?.name || data?.monitorSizeName) parts.push(`Monitor: ${data?.monitorSize?.name ?? data?.monitorSizeName}`);
  //     if (data?.printerType?.name || data?.printerTypeName) parts.push(`Printer: ${data?.printerType?.name ?? data?.printerTypeName}`);
  //     if (data?.device?.name || data?.deviceName) parts.push(`Device: ${data?.device?.name ?? data?.deviceName}`);
  //     return parts.length > 0 ? parts.join(", ") : "-";
  //   },
  // },
  // {
  //   accessorKey: "notes",
  //   header: "Notes",
  // },
  {
    id: "actions",
    header: "Actions",
    cell: function Cell({ row }) {
      const item = row.original;
      const { setOpen, setCurrentRow } = useClientInventoryStore();

      const handleEdit = () => {
        setOpen("edit");
        setCurrentRow(item);
      };

      const handleDelete = () => {
        setOpen("delete");
        setCurrentRow(item);
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
            <DropdownMenuItem onClick={handleEdit}>Edit Item</DropdownMenuItem>
            <DropdownMenuItem
              className="text-red-600 focus:bg-red-50 focus:text-red-600"
              onClick={handleDelete}
            >
              Delete Item
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
    enableSorting: false,
  },
];
