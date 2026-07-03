import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { CronJob } from "../schema";
import { Clock } from "lucide-react";

const renderDateCell = (dateString: string | null) => {
  if (!dateString) return <span className="text-muted-foreground">-</span>;
  try {
    const d = new Date(dateString);
    const datePart = format(d, "dd/MM/yyyy");
    const timePart = format(d, "hh:mm:ss a");
    return (
      <div className="flex flex-col">
        <span className="text-sm font-medium text-foreground">{datePart}</span>
        <span className="text-xs text-muted-foreground">{timePart}</span>
      </div>
    );
  } catch (error) {
    return <span className="text-muted-foreground">-</span>;
  }
};

export const columns: ColumnDef<CronJob>[] = [
  {
    accessorKey: "key",
    header: "Job",
    cell: ({ row }) => {
      const formattedKey = row.original.key?.replace(/-/g, " ") || "-";
      return (
        <span className="font-medium text-foreground capitalize">
          {formattedKey}
        </span>
      );
    },
  },
  {
    accessorKey: "scheduleDescription",
    header: "Schedule Description",
    cell: ({ row }) => (
      <span className="text-sm text-foreground">{row.original.scheduleDescription}</span>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.original.status?.toLowerCase();

      if (!status) {
        return (
          <div className="flex items-center pl-2 text-muted-foreground">
            <Clock className="h-4 w-4" />
          </div>
        );
      }

      return (
        <div className="flex items-center">
          <span
            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium capitalize ${status === "success"
                ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                : status === "failed"
                  ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                  : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
              }`}
          >
            {status}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "triggeredAt",
    header: "Triggered At",
    cell: ({ row }) => renderDateCell(row.original.triggeredAt),
  },
  {
    accessorKey: "completedAt",
    header: "Completed At",
    cell: ({ row }) => renderDateCell(row.original.completedAt),
  },
];
