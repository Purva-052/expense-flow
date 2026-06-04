/* eslint-disable @typescript-eslint/no-explicit-any */
import { ColumnDef } from "@tanstack/react-table";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  MoreHorizontal,
  Info,
} from "lucide-react";
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
import { useAuthStore } from "@/stores/use-auth-store";
import { Badge } from "@/components/ui/badge";
import { roles, TransactionTypeStatus } from "@/utils/constant";
import { useGetUserDetails } from "@/features/users/services";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "@/components/ui/tooltip";

// Status to badge variant mapping
const statusVariantMap: Record<
  string,
  "default" | "secondary" | "destructive" | "outline" | "success" | "warning"
> = {
  pending: "warning",
  approved: "success",
  rejected: "destructive",
  completed: "default",
};

// Status value to label mapping
const statusLabelMap = TransactionTypeStatus.reduce(
  (acc, status) => {
    acc[status.value] = status.label;
    return acc;
  },
  {} as Record<string, string>
);

// Transaction type styling maps
const transactionTypeStyleMap: Record<string, string> = {
  onetime:
    "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800/30",
  subscription:
    "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/20 dark:text-purple-300 dark:border-purple-800/30",
};

const transactionTypeLabelMap: Record<string, string> = {
  onetime: "One Time",
  subscription: "Subscription",
};

// Subscription cycle styling maps
const subscriptionCycleStyleMap: Record<string, string> = {
  monthly:
    "bg-cyan-50 text-cyan-700 border-cyan-200 dark:bg-cyan-900/20 dark:text-cyan-300 dark:border-cyan-800/30",
  yearly:
    "bg-pink-50 text-pink-700 border-pink-200 dark:bg-pink-900/20 dark:text-pink-300 dark:border-pink-800/30",
};

const subscriptionCycleLabelMap: Record<string, string> = {
  monthly: "Monthly",
  yearly: "Yearly",
};

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
    accessorKey: "currency",
    header: "Currency",
    cell: ({ row }) => {
      const currency = row.original.currency;
      return (
        <span className="text-sm uppercase">{currency ? currency : "-"}</span>
      );
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
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.original.status;
      if (!status) {
        return <span className="text-sm">-</span>;
      }
      const variant = statusVariantMap[status] || "default";
      const label = statusLabelMap[status] || status;

      if (status === "approved") {
        return (
          <div className="flex items-center gap-1.5">
            <Badge variant={variant}>{label}</Badge>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="cursor-pointer text-muted-foreground hover:text-amber-500 transition-colors">
                    <Info className="h-4 w-4" />
                  </span>
                </TooltipTrigger>
                <TooltipContent side="top">
                  Please edit transaction to enter transaction date and card
                  details.
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        );
      }

      return <Badge variant={variant}>{label}</Badge>;
    },
  },
  {
    accessorKey: "transactionType",
    header: "Transaction Type",
    cell: ({ row }) => {
      const transactionType = row.original.transactionType;
      if (!transactionType) return <span className="text-sm">-</span>;

      const label =
        transactionTypeLabelMap[transactionType] ||
        transactionType.charAt(0).toUpperCase() + transactionType.slice(1);
      const customClass =
        transactionTypeStyleMap[transactionType] ||
        "bg-muted text-muted-foreground";

      return (
        <Badge variant="outline" className={customClass}>
          {label}
        </Badge>
      );
    },
  },
  {
    accessorKey: "subscriptionCycle",
    header: "Subscription Cycle",
    cell: ({ row }) => {
      const subscriptionCycle = row.original.subscriptionCycle;
      if (!subscriptionCycle) return <span className="text-sm">-</span>;

      const label =
        subscriptionCycleLabelMap[subscriptionCycle] ||
        subscriptionCycle.charAt(0).toUpperCase() + subscriptionCycle.slice(1);
      const customClass =
        subscriptionCycleStyleMap[subscriptionCycle] ||
        "bg-muted text-muted-foreground";

      return (
        <Badge variant="outline" className={customClass}>
          {label}
        </Badge>
      );
    },
  },
  // {
  //   accessorKey: "cardLast4",
  //   header: "Card Last 4 Digits",
  // },
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
      const rawRole = user?.role || user?.user?.role;
      const roleName = String(
        rawRole && typeof rawRole === "object" ? rawRole?.name : rawRole || ""
      ).toLowerCase();
      const currentUserId = user?.user?.id || user?.user_id;
      const isAdmin = roleName === roles.ADMIN;
      const creatorId = row.original.userId;
      const isCreator = String(creatorId) === String(currentUserId);
      const isPMorTL =
        roleName === roles.PROJECT_MANAGER ||
        roleName === roles.TEAM_LEAD ||
        roleName === roles.BDE ||
        roleName === roles.DEVELOPER;

      const { data: userDetails }: any = useGetUserDetails(
        user?.user?.id || user?.user_id
      );
      const technologyId = userDetails?.data?.technology?.id;

      const isAccountPerson = technologyId === 35 || technologyId === 37;

      const canEditDelete =
        isAdmin ||
        roleName === roles.PROJECT_MANAGER ||
        isAccountPerson ||
        (isPMorTL && isCreator);

      const canAcceptReject =
        [2, 126].includes(Number(user?.user?.id || user?.user_id)) &&
        row.original.status === "pending";

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

      const handleAcceptReject = () => {
        setOpen("action");
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
            {canAcceptReject && (
              <DropdownMenuItem onClick={handleAcceptReject}>
                Review Request
              </DropdownMenuItem>
            )}
            {canEditDelete && (
              <DropdownMenuItem onClick={handleEdit}>
                Edit Transaction
              </DropdownMenuItem>
            )}
            {canEditDelete && (
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
