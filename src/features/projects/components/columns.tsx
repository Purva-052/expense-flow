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
import { useProjectsStore } from "../stores/useProjectsStore";

export const columns: ColumnDef<any>[] = [
  {
    accessorKey: "name",
    header: "Project Name",
  },
  {
    accessorKey: "description",
    header: "Description",
    cell: ({ row }) => {
      const description = row.original.description;

      if (!description) return "-";

      return (
        <div
          className=" whitespace-pre-wrap break-words"
          style={{
            maxWidth: "300px", // fixed width for consistency
            whiteSpace: "pre-wrap", // respects new lines
            wordBreak: "break-word", // wrap long words
          }}
        >
          {description}
        </div>
      );
    },
  },
  {
    accessorKey: "client.name",
    header: "Client",
  },
  {
    accessorKey: "manager.fullName",
    header: "Manager",
  },
  {
    accessorKey: "teamLead.fullName",
    header: "Team Lead",
  },
  {
    accessorKey: "percentageComplete",
    header: "Progress (%)",
  },
  {
    accessorKey: "expectedCompletionDate",
    header: "Expected Completion",
    cell: ({ row }) => {
      const date = row.original.expectedCompletionDate;

      if (!date) return "-";

      const formattedDate = new Date(date).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });

      return formattedDate;
    },
  },
  {
    accessorKey: "priority",
    header: "Priority",
  },
  {
    id: "actions",
    header: "Actions",
    cell: function Cell({ row }) {
      const operator = row.original;
      const { setOpen, setCurrentRow } = useProjectsStore();

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
              View project
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleEdit}>
              Edit project
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-red-600 focus:bg-red-50 focus:text-red-600"
              onClick={handleDelete}
            >
              Delete project
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
    enableSorting: false,
  },
];
