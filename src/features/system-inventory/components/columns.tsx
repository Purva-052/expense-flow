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
import { useSystemInventoryStore } from "../stores/useSystemInventoryStore";

// const formatOwnership = (row: any) => {
//   const rawOwnership =
//     row?.systemOwnership ??
//     row?.system_ownership ??
//     row?.ownershipType ??
//     row?.ownership_type;

//   const formatted = String(rawOwnership ?? "").toLowerCase();

//   return formatted.includes("personal") ? "Personal" : "Company Owned";
// };

const getUserName = (row: any) => {
  return row?.employee?.name || row?.user?.name || "-";
};

// const formatDateValue = (value: unknown) => {
//   if (!value) {
//     return "-";
//   }

//   const date = new Date(String(value));

//   if (Number.isNaN(date.getTime())) {
//     return "-";
//   }

//   return date.toLocaleDateString("en-IN", {
//     year: "numeric",
//     month: "short",
//     day: "numeric",
//   });
// };

export const columns: ColumnDef<any>[] = [
  {
    id: "employee",
    header: "Employee",
    cell: ({ row }) => {
      const userName = getUserName(row.original);

      return <span className="text-sm">{userName}</span>;
    },
  },
  // {
  //   id: "systemOwnership",
  //   header: "System Ownership",
  //   cell: ({ row }) => {
  //     const ownershipLabel = formatOwnership(row.original);

  //     return <span className="text-sm">{ownershipLabel}</span>;
  //   },
  // },
  {
    id: "cpuProcessor.name",
    header: "Processor",
    cell: ({ row }) => {
      const processorLabel = (
        (row.original.cpuProcessor?.name ||
          row.original.laptopProcessor?.name) ??
        "-"
      ).trim();

      return <span className="text-sm">{processorLabel}</span>;
    },
  },
  {
    id: "cpuRam.name",
    header: "Ram Size",
    cell: ({ row }) => {
      const ramLabel = (
        (row.original.cpuRam?.name || row.original.laptopRam?.name) ??
        "-"
      ).trim();

      return <span className="text-sm">{ramLabel}</span>;
    },
  },
  {
    id: "cpuStorage.name",
    header: "Storage",
    cell: ({ row }) => {
      const storageLabel = (
        (row.original.cpuStorage?.name || row.original.laptopStorage?.name) ??
        "-"
      ).trim();

      return <span className="text-sm">{storageLabel}</span>;
    },
  },

  // {
  //   id: "updatedAt",
  //   header: "Last Updated",
  //   cell: ({ row }) => {
  //     return (
  //       <span className="text-sm">
  //         {formatDateValue(row.original.updatedAt ?? row.original.createdAt)}
  //       </span>
  //     );
  //   },
  // },
  {
    id: "actions",
    header: "Actions",
    cell: function Cell({ row }) {
      const inventory = row.original;
      const { setOpen, setCurrentRow } = useSystemInventoryStore();

      const handleView = () => {
        setOpen("view");
        setCurrentRow(inventory);
      };

      const handleEdit = () => {
        setOpen("edit");
        setCurrentRow(inventory);
      };

      return (
        <div className="flex items-center gap-2">
          {/* <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-blue-600 hover:text-blue-800 hover:bg-blue-50"
            onClick={handleView}
            title="View Inventory"
          >
            <Eye className="h-4 w-4" />
          </Button> */}
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
                View Inventory
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleEdit}>
                Edit Inventory
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );
    },
    enableSorting: false,
  },
];
