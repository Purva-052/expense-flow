/* eslint-disable @typescript-eslint/no-explicit-any */
import { ColumnDef } from "@tanstack/react-table";
import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useDeviceStore } from "../stores/useDeviceStore";

export const columns: ColumnDef<any>[] = [
  {
    accessorKey: "modelName",
    header: "Device Name",
  },
  {
    accessorKey: "osType",
    header: "Operating System",
    cell: ({ row }) => {
      const os = row.original.osType;
      if (!os) return "-";
      const isIos = String(os).toLowerCase() === "ios";
      return (
        <Badge variant={isIos ? "secondary" : "outline"} className="capitalize uppercase font-medium text-xs px-2 py-0.5">
          {os}
        </Badge>
      );
    },
  },
  {
    accessorKey: "brand.name",
    header: "Brand",
    cell: ({ row }) => {
      const brandName = row.original.brand?.name;
      if (!brandName) return "-";
      return (
        <Badge
          variant="default"
          className="bg-slate-100 text-slate-800 border-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700 capitalize font-medium text-xs px-2 py-0.5 uppercase"
        >
          {brandName}
        </Badge>
      );
    },
  },
  {
    accessorKey: "serialNumber",
    header: "Serial Number",
  },
  {
    id: "actions",
    header: "Actions",
    cell: function Cell({ row }) {
      const operator = row.original;
      const { setOpen, setCurrentRow } = useDeviceStore();

      const handleEdit = () => {
        setOpen("edit");
        setCurrentRow(operator);
      };

      const handleDelete = () => {
        setOpen("delete");
        setCurrentRow(operator);
      };

      // const handleView = () => {
      //   setOpen("view");
      //   setCurrentRow(operator);
      // };

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
