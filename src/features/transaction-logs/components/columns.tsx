/* eslint-disable @typescript-eslint/no-explicit-any */
import { ColumnDef } from "@tanstack/react-table";
import { ArrowDown, ArrowUp, ArrowUpDown, MoreHorizontal } from "lucide-react";
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
import { roles } from "@/utils/constant";
import { useAuthStore } from "@/stores/use-auth-store";

export const columns: ColumnDef<any>[] = [
  {
    accessorKey: "Created By",
    header: "User",
    cell: ({ row }) => {
      const createdBy = row.original.user?.name;
      return <span className="text-sm">{createdBy ? createdBy : "-"}</span>;
    },
  },
  {
    accessorKey: "currency",
    header: "Currency",
    cell: ({ row }) => {
      const currency = row.original.currency;
      return <span className="text-sm uppercase">{currency ? currency : "-"}</span>;
    },
  },
  {
    accessorKey: "amount",
    header: "Amount",
    cell: ({ row }) => {
      const amount = row.original.amount;

      if (amount === null || amount === undefined) {
        return <span className="text-sm">-</span>;
      }

      const formattedAmount =
        Number(amount) % 1 === 0
          ? Number(amount).toFixed(0)
          : Number(amount).toFixed(2);

      return <span className="text-sm">{formattedAmount}</span>;
    },
  },
  {
    accessorKey: "reason",
    header: "Reason",
    cell: ({ row }) => {
      const reason = row.original.reason;

      if (!reason) {
        return <span className="text-sm">-</span>;
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
    accessorKey: "transactionType",
    header: "Transaction Type",
    cell: ({ row }) => {
      const transactionType = row.original.transactionType;
      return (
        <span className="text-sm">
          {transactionType
            ? transactionType.charAt(0).toUpperCase() + transactionType.slice(1)
            : "-"}
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
            : "-"}
        </span>
      );
    },
  },
  {
    accessorKey: "cardLast4",
    header: "Card Last 4 Digits",
  },
  {
    accessorKey: "project.name",
    header: "Project",
    cell: ({ row }) => {
      const projectName = row.original.project?.name;
      return <span className="text-sm">{projectName ? projectName : "-"}</span>;
    },
  },
  {
    accessorKey: "transactionDate",
    header: ({ column }) => {
      const sorted = column.getIsSorted();

      return (
        <button
          type="button"
          onClick={() => column.toggleSorting(sorted === "asc")}
          className="flex items-center gap-1 text-left text-sm font-medium hover:text-primary"
        >
          Transaction Date
          {sorted === "asc" && <ArrowUp className="h-4 w-4" />}
          {sorted === "desc" && <ArrowDown className="h-4 w-4" />}
          {!sorted && <ArrowUpDown className="h-4 w-4 opacity-50" />}
        </button>
      );
    },

    cell: ({ row }) => {
      const transactionDate = row.original.transactionDate;
      if (!transactionDate) {
        return <span className="text-sm">-</span>;
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

    enableSorting: true,
    sortingFn: (rowA, rowB) => {
      const a = rowA.original.transactionDate
        ? new Date(rowA.original.transactionDate).getTime()
        : 0;

      const b = rowB.original.transactionDate
        ? new Date(rowB.original.transactionDate).getTime()
        : 0;

      return a - b;
    },
  },
  {
    id: "actions",
    header: "Actions",
    cell: function Cell({ row }) {
      const operator = row.original;
      const { setOpen, setCurrentRow } = useTransactionStore();

      const user = useAuthStore((state) => state.user);
      const userRole = user?.user?.role;

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
            {userRole === roles.ADMIN && (
              <DropdownMenuItem
                className="text-red-600 focus:bg-red-50 focus:text-red-600"
                onClick={handleDelete}
              >
                Delete Transaction
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
    enableSorting: false,
  },
];
