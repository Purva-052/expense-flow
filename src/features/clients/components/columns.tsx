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
import { useClientsStore } from "../stores/useClientsStore";
import { useEffect, useState } from "react";
import { formatInTimeZone } from "date-fns-tz";

export const columns: ColumnDef<any>[] = [
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "company",
    header: "Company",
  },
  {
    accessorKey: "country.name",
    header: "Country",
    cell: function Cell({ row }) {
      return row.original.country?.name || "N/A";
    },
  },
  {
    accessorKey: "timezone",
    header: "Timezone (Local Time)",
    cell: function Cell({ row }) {
      const timezone = row.original.timezone;
      const [currentTime, setCurrentTime] = useState(
        formatInTimeZone(new Date(), timezone, "hh:mm a")
      );

      // ⏱️ Update every 60 seconds
      useEffect(() => {
        const interval = setInterval(() => {
          setCurrentTime(formatInTimeZone(new Date(), timezone, "hh:mm a"));
        }, 60000);

        return () => clearInterval(interval);
      }, [timezone]);

      return timezone ? (
        <div className="flex flex-col ">
          <span className="text-md ">{currentTime}</span>
          <span className="text-xs text-muted-foreground">{timezone}</span>
        </div>
      ) : null;
    },
  },
  {
    id: "actions",
    header: "Actions",
    cell: function Cell({ row }) {
      const operator = row.original;
      const { setOpen, setCurrentRow } = useClientsStore();

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
            <DropdownMenuItem onClick={handleView}>
              View Client
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleEdit}>
              Edit Client
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-red-600 focus:bg-red-50 focus:text-red-600"
              onClick={handleDelete}
            >
              Delete Client
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
    enableSorting: false,
  },
];
