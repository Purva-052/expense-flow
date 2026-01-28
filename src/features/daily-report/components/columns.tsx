import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { DailyReport } from "../schema";
import { MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const columns = (
  onEdit: (report: DailyReport) => void,
  onDelete: (report: DailyReport) => void
): ColumnDef<DailyReport>[] => [
  {
    accessorKey: "reportingDate",
    header: "Report Date",
    cell: ({ row }) =>
      format(new Date(row.original.reportingDate), "dd/MM/yyyy"),
  },
  {
    accessorKey: "employee.fullName",
    header: "Employee Name",
  },
  {
    accessorKey: "project.name",
    header: "Project Name",
  },
  {
    accessorKey: "milestone.name",
    header: "Milestone Name",
    cell: ({ row }) => row.original.milestone?.name ?? "-",
  },
  {
    accessorKey: "task.taskName",
    header: "Task Name",
  },
  {
    accessorKey: "taskDescription",
    header: "Description",
    cell: ({ row }) => (
      <div className="max-w-[300px] whitespace-normal break-words">
        {row.original.taskDescription}
      </div>
    ),
  },
  {
    accessorKey: "timeSpent",
    header: "Hours",
  },
  {
    accessorKey: "remark",
    header: "Remarks",
    cell: ({ row }) => (
      <div className="max-w-[200px] whitespace-normal break-words">
        {row.original.remark ?? "-"}
      </div>
    ),
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEdit(row.original)}>
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onDelete(row.original)}
              className="text-red-600"
            >
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
