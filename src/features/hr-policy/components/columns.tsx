/* eslint-disable @typescript-eslint/no-explicit-any */
import { ColumnDef } from "@tanstack/react-table";
import { Pencil, Trash2, FileText, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useHRPolicyStore } from "../stores/useHRPolicyStore";

export const getColumns = (isAdmin: boolean): ColumnDef<any>[] => {
  const cols: ColumnDef<any>[] = [
    {
      accessorKey: "title",
      header: "Policy Title",
      cell: ({ row }) => {
        const title = row.original.title as string;
        const fileUrl = row.original.fileUrl as string;
        if (fileUrl) {
          return (
            <a
              href={fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-blue-600 hover:underline hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
            >
              {title}
            </a>
          );
        }
        return <span className="font-semibold text-gray-900 dark:text-slate-100">{title}</span>;
      },
    },
    {
      accessorKey: "fileUrl",
      header: "Attachment",
      cell: ({ row }) => {
        const fileUrl = row.original.fileUrl as string;
        if (!fileUrl) return <span className="text-muted-foreground">-</span>;
        return (
          <a
            href={fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-red-50 text-red-700 hover:bg-red-100 dark:bg-red-950/20 dark:text-red-400 dark:hover:bg-red-950/40 border border-red-200/40 dark:border-red-900/40 transition-colors"
          >
            <FileText className="h-3.5 w-3.5" />
            <span>View PDF</span>
            <ExternalLink className="h-3 w-3 opacity-60" />
          </a>
        );
      },
    },
  ];

  if (isAdmin) {
    cols.push({
      id: "actions",
      header: "Actions",
      cell: function Cell({ row }) {
        const policy = row.original;
        const { setOpen, setCurrentRow } = useHRPolicyStore();

        const handleEdit = () => {
          setOpen("edit");
          setCurrentRow(policy);
        };

        const handleDelete = () => {
          setOpen("delete");
          setCurrentRow(policy);
        };

        return (
          <TooltipProvider>
            <div className="flex items-center gap-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-blue-600 hover:text-blue-800 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-950/30"
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
                    className="h-8 w-8 text-red-600 hover:text-red-800 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30"
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
    });
  }

  return cols;
};
