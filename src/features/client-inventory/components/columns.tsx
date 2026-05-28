/* eslint-disable @typescript-eslint/no-explicit-any */
import { ColumnDef } from "@tanstack/react-table";
import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
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
        <TooltipProvider>
          <div className="flex items-center gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                  onClick={handleEdit}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Edit</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-red-600 hover:text-red-800 hover:bg-red-50"
                  onClick={handleDelete}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Delete</TooltipContent>
            </Tooltip>
          </div>
        </TooltipProvider>
      );
    },
    enableSorting: false,
  },
];
