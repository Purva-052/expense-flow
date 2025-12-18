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
import { useTransactionStore } from "../stores";

export const columns: ColumnDef<any>[] = [
  {
    accessorKey: "project.name",
    header: "Project",
    cell: ({ row }) => {
      const projectName = row.original.project?.name;
      return (
        <span className="text-sm">{projectName ? projectName : "N/A"}</span>
      );
    },
  },
  {
    accessorKey: "amount",
    header: "Amount",
    cell: ({ row }) => {
      const amount = row.original.amount;

      if (amount === null || amount === undefined) {
        return <span className="text-sm">N/A</span>;
      }

      const formattedAmount =
        Number(amount) % 1 === 0
          ? Number(amount).toFixed(0)
          : Number(amount).toFixed(2);

      return <span className="text-sm">{formattedAmount}</span>;
    },
  },
  {
    accessorKey: "transactionType",
    header: "Transaction Type",
    cell: ({ row }) => {
      const transactionType = row.original.transactionType;
      return (
        <span className="text-sm">
          {transactionType
            ? transactionType.charAt(0).toUpperCase() + transactionType.slice(1)
            : "N/A"}
        </span>
      );
    },
  },
  {
    accessorKey: "subscriptionCycle",
    header: "Subscription Cycle",
    cell: ({ row }) => {
      const subscriptionCycle = row.original.subscriptionCycle;
      return (
        <span className="text-sm">
          {subscriptionCycle
            ? subscriptionCycle.charAt(0).toUpperCase() +
              subscriptionCycle.slice(1)
            : "N/A"}
        </span>
      );
    },
  },
  {
    accessorKey: "cardLast4",
    header: "Card Last 4 Digits",
  },
  {
    accessorKey: "reason",
    header: "Reason",
    cell: ({ row }) => {
      const reason = row.original.reason;

      if (!reason) {
        return <span className="text-sm">N/A</span>;
      }

      const truncated =
        reason.length > 30 ? `${reason.slice(0, 30)}...` : reason;

      return (
        <span className="text-sm" title={reason}>
          {truncated}
        </span>
      );
    },
  },

  {
    accessorKey: "transactionDate",
    header: "Transaction Date",
    cell: ({ row }) => {
      const transactionDate = row.original.transactionDate;
      if (!transactionDate) {
        return <span className="text-sm">N/A</span>;
      }
      const date = new Date(transactionDate);
      return (
        <span className="text-sm">
          {date.toLocaleDateString("en-IN", {
            year: "numeric",
            month: "short",
            day: "numeric",
          })}
        </span>
      );
    },
  },
  {
    id: "actions",
    header: "Actions",
    cell: function Cell({ row }) {
      const operator = row.original;
      const { setOpen, setCurrentRow } = useTransactionStore();

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
              View Transaction
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleEdit}>
              Edit Transaction
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-red-600 focus:bg-red-50 focus:text-red-600"
              onClick={handleDelete}
            >
              Delete Transaction
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
    enableSorting: false,
  },
];
