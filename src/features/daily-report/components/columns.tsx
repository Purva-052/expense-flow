import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { DailyReport } from "../schema";
import { Eye, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { roles as roleConstants } from "@/utils/constant";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useAuthStore } from "@/stores/use-auth-store";

export const columns = (
  onEdit: (report: DailyReport) => void,
  onDelete: (report: DailyReport) => void,
  onView: (report: DailyReport) => void,
  userRole: string
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
    accessorKey: "taskName",
    header: "Task Name",
    cell: ({ row }) => {
      const taskName = row.original.task.taskName;

      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="truncate max-w-[250px] block cursor-pointer">
                {taskName}
              </span>
            </TooltipTrigger>

            <TooltipContent
              side="top"
              align="start"
              className="max-w-xs break-words"
            >
              {taskName}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    },
  },
  {
    accessorKey: "taskDescription",
    header: "Description",
    cell: ({ row }) => (
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 text-blue-600 hover:text-blue-800 hover:bg-blue-50"
        onClick={() => onView(row.original)}
        title="View Description"
      >
        <Eye className="h-4 w-4" />
      </Button>
    ),
  },
  {
    accessorKey: "timeSpent",
    header: "Hours",
    cell: ({ row }) => {
      const val = row.original.timeSpent;
      if (!val) return "0:00";
      return String(val).includes(":")
        ? val
        : parseFloat(String(val)).toFixed(2).replace(".", ":");
    },
  },
  {
    accessorKey: "weightageHours",
    header: "Weightage Hours",
    cell: ({ row }) => {
      const val = row.original.weightageHours;
      if (!val) return "0:00";
      return String(val).includes(":")
        ? val
        : parseFloat(String(val)).toFixed(2).replace(".", ":");
    },
  },
  // {
  //   accessorKey: "remark",
  //   header: "Remarks",
  //   cell: ({ row }) => (
  //     <div className="max-w-[200px] whitespace-normal break-words">
  //       {row.original.remark ?? "-"}
  //     </div>
  //   ),
  // },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const reportDate = format(
        new Date(row.original.reportingDate),
        "yyyy-MM-dd"
      );
      const { user } = useAuthStore();
      const today = format(new Date(), "yyyy-MM-dd");
      const isToday = reportDate === today;
      const isCoodinator = row.original.coordinator?.id;
      const userId = user?.user?.id;

      if (userId !== isCoodinator) {
        return null;
      }

      const canEditOrDelete =
        userRole === roleConstants.ADMIN ||
        userRole === roleConstants.PROJECT_MANAGER ||
        userRole === roleConstants.TEAM_LEAD ||
        userId === isCoodinator ||
        (userRole === roleConstants.BDE && isToday) ||
        (userRole === roleConstants.DEVELOPER && isToday);

      if (!canEditOrDelete) {
        return null;
      }

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
