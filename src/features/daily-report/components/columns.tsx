import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { DailyReport } from "../schema";
import { Eye, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

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
      const coordinatorId = row.original.coordinator?.id;
      const userId = user?.user?.id;
      const isCoordinator = userId === coordinatorId;

      const isAdminOrPm =
        userRole === roleConstants.ADMIN ||
        userRole === roleConstants.PROJECT_MANAGER;
      const isTeamLead = userRole === roleConstants.TEAM_LEAD;
      const isBdeOrDevToday =
        (userRole === roleConstants.BDE ||
          userRole === roleConstants.DEVELOPER) &&
        isToday;

      const canEditOrDelete =
        isAdminOrPm || isTeamLead || isCoordinator || isBdeOrDevToday;

      if (!canEditOrDelete) {
        return null;
      }
      // if (!canEditOrDelete || ) {
      //   return null;
      // }

      return (
        <TooltipProvider>
          <div className="flex items-center gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                  onClick={() => onEdit(row.original)}
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
                  onClick={() => onDelete(row.original)}
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
  },
];
