/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMemo, useState } from "react";
import { parseAsInteger, parseAsString, useQueryStates } from "nuqs";
import { useGetUsersList } from "@/features/users/services";
import { SecurityPasswordDialog } from "@/components/shared/security-password-dialog";
import { useVerifyPrivacyPassword } from "@/features/profile/services";
import { Button } from "@/components/ui/button";
import { FilterConfig } from "@/components/table/table-toolbar";
import GlobalFilterSection from "@/components/table/global-table-filter";
import { GlobalTable } from "@/components/table/global-table";
import { Switch } from "@/components/ui/switch";
import { useUpdateExamLeaveEligibility } from "../services";
import { useAuthStore } from "@/stores/use-auth-store";
import { roles } from "@/utils/constant";

interface EmployeeBalanceTabProps {
  onAdjustClick: (empId: number) => void;
}

export function EmployeeBalanceTab({ onAdjustClick }: EmployeeBalanceTabProps) {
  const [securityDialogOpen, setSecurityDialogOpen] = useState(false);
  const [pendingEmpId, setPendingEmpId] = useState<number | null>(null);
  const { mutateAsync: verifyPassword, isPending: isVerifying } =
    useVerifyPrivacyPassword();

  const [queryParams, setQueryParams] = useQueryStates({
    pageSize: parseAsInteger.withDefault(10),
    currentPage: parseAsInteger.withDefault(1),
    search: parseAsString.withDefault(""),
  });

  const listParams = {
    pageSize: queryParams.pageSize,
    currentPage: queryParams.currentPage,
    search: queryParams.search,
  };

  const { data: employeeWiseLeaveData, isPending: employeeWiseLeaveLoading } =
    useGetUsersList({
      page: listParams.currentPage,
      limit: listParams.pageSize,
      search: listParams.search || undefined,
      pagination: true,
      status: "active",
    });

  const employeeWiseFilters: FilterConfig[] = [
    {
      type: "search",
      placeholder: "Search by name ...",
      key: "search",
      value: listParams.search || "",
      onChange: (search: string | undefined) => {
        setQueryParams({ ...listParams, search: search ?? "", currentPage: 1 });
      },
    },
  ];

  const employeeWiseLeaveColumns = useMemo(
    () => [
      {
        accessorKey: "fullName",
        header: "Name",
        cell: ({ row }: any) => {
          const name = row.getValue("fullName");
          return (
            <span className="font-semibold text-gray-900 dark:text-slate-100">
              {name || "-"}
            </span>
          );
        },
      },
      {
        accessorKey: "technology",
        header: "Technology",
        cell: ({ row }: any) => {
          const tech = row.original.technology;
          if (!tech) return <span>-</span>;
          return (
            <span
              className="px-2.5 py-0.5 rounded-full text-xs font-semibold"
              style={{
                backgroundColor: `${tech.color}15`,
                color: tech.color,
                border: `1px solid ${tech.color}30`,
              }}
            >
              {tech.name}
            </span>
          );
        },
      },
      {
        accessorKey: "role",
        header: "Role",
        cell: ({ row }: any) => {
          const role = row.getValue("role");
          if (!role) return <span>-</span>;
          const formattedRole = role
            .split("_")
            .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ");
          return <span>{formattedRole}</span>;
        },
      },
      {
        accessorKey: "casualLeaveBalance",
        header: "Casual Leave Balance",
        cell: ({ row }: any) => {
          const val = row.getValue("casualLeaveBalance");
          if (
            val === null ||
            val === undefined ||
            val === "null" ||
            val === "undefined"
          ) {
            return <span className="font-medium">0</span>;
          }
          const num = Number(parseFloat(val).toFixed(2));
          return <span className="font-medium">{num} Days</span>;
        },
      },
      {
        accessorKey: "paidLeaveBalance",
        header: "Paid Leave Balance",
        cell: ({ row }: any) => {
          const val = row.getValue("paidLeaveBalance");
          if (
            val === null ||
            val === undefined ||
            val === "null" ||
            val === "undefined"
          ) {
            return <span className="font-medium">0</span>;
          }
          const num = Number(parseFloat(val).toFixed(2));
          return <span className="font-medium">{num} Days</span>;
        },
      },
      {
        accessorKey: "isExamLeaveEligible",
        header: "Exam Leave Eligible",
        cell: function Cell({ row }: any) {
          const isExamLeaveEligible = row.original.isExamLeaveEligible;
          const employeeId = row.original.id;
          const { mutate: updateExamLeaveEligibility, isPending } =
            useUpdateExamLeaveEligibility(employeeId || "");

          const user = useAuthStore((state) => state.user);
          const rawRole = user?.role || user?.user?.role;
          const roleName = String(
            rawRole && typeof rawRole === "object"
              ? rawRole?.name
              : rawRole || ""
          ).toLowerCase();
          const isAdmin = roleName === roles.ADMIN;

          return (
            <div className="flex">
              <Switch
                checked={!!isExamLeaveEligible}
                disabled={!isAdmin || isPending}
                onCheckedChange={(checked) => {
                  if (employeeId != null) {
                    updateExamLeaveEligibility({
                      isExamLeaveEligible: checked,
                    } as any);
                  }
                }}
              />
            </div>
          );
        },
      },
      {
        id: "actions",
        header: "Action",
        cell: ({ row }: any) => {
          const empId = row.original.id;
          return (
            <Button
              onClick={() => {
                setPendingEmpId(empId);
                setSecurityDialogOpen(true);
              }}
              className="shrink-0 w-fit h-8 px-3 text-xs bg-rose-500 hover:bg-rose-600 text-white font-medium"
            >
              Adjust
            </Button>
          );
        },
      },
    ],
    [onAdjustClick]
  );

  const handlePaginationChange = (newPagination: {
    pageIndex: number;
    pageSize: number;
  }) => {
    setQueryParams({
      ...listParams,
      pageSize: newPagination.pageSize,
      currentPage: newPagination.pageIndex + 1,
    });
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-xl border border-gray-100 dark:border-slate-800 shadow-xs">
        <div>
          <h3 className="font-semibold text-sm text-gray-900 dark:text-slate-100">
            Employee Wise Leave Balances
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            View employee casual and paid leave balances and make adjustments.
          </p>
        </div>
      </div>

      <GlobalFilterSection filters={employeeWiseFilters} />

      <GlobalTable
        pageSize={listParams.pageSize}
        currentPage={listParams.currentPage}
        totalCount={(employeeWiseLeaveData as any)?.metadata?.totalCount ?? 0}
        data={(employeeWiseLeaveData as any)?.data ?? []}
        columns={employeeWiseLeaveColumns}
        loading={employeeWiseLeaveLoading}
        isPaginationEnabled
        onPaginationChange={handlePaginationChange}
      />

      <SecurityPasswordDialog
        open={securityDialogOpen}
        onOpenChange={setSecurityDialogOpen}
        title="Adjust Leave Balance Verification"
        description="Please enter the privacy password to adjust this employee's leave balance."
        isLoading={isVerifying}
        onConfirm={async (password) => {
          await verifyPassword({ privacyPassword: password });
          if (pendingEmpId !== null) {
            onAdjustClick(pendingEmpId);
          }
        }}
      />
    </div>
  );
}
