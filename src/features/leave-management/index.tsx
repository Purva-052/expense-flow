/* eslint-disable @typescript-eslint/no-explicit-any */
import PageLayout from "@/components/layout/layout-provider";
import { GlobalTable } from "@/components/table/global-table";
import GlobalFilterSection from "@/components/table/global-table-filter";
import TablePageHeader from "@/components/table/table-page-header";
import { FilterConfig } from "@/components/table/table-toolbar";
import { ActionFormModal } from "./components/action";
import { columns } from "./components/columns";
import { useLeaveStore } from "./stores";
import {
  useGeEmployeeData,
  useGetAllLeaveBalances,
  useGetLeaveData,
} from "./services";
import { parseAsInteger, parseAsString, useQueryStates } from "nuqs";
import { formatDate } from "@/utils/commonFunctions";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuthStore } from "@/stores/use-auth-store";
import { LEAVE_TYPE, roles } from "@/utils/constant";
import { Skeleton } from "@/components/ui/skeleton";
import { CalendarDays, Clock, CheckCircle2 } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

// ─── Leave Balance Summary Card ────────────────────────────────────────────────
interface BalanceRecord {
  leaveTypeId: number;
  allocatedDays: string | null;
  usedDays: string | null;
  pendingDays: string | null;
  availableDays: string | null;
  leaveType: { id: number; name: string; isPaid: boolean };
}

function LeaveBalanceCards({
  balanceData,
  loading,
}: {
  balanceData: BalanceRecord[];
  loading: boolean;
}) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-[110px] rounded-xl" />
        ))}
      </div>
    );
  }

  if (!balanceData || balanceData.length === 0) return null;

  // Compute totals across all leave types
  const totalUsed = balanceData.reduce(
    (sum, r) => sum + parseFloat(r.usedDays || "0"),
    0
  );
  const totalPending = balanceData.reduce(
    (sum, r) => sum + parseFloat(r.pendingDays || "0"),
    0
  );

  // Per-type cards
  const balanceCards = balanceData.map((record) => {
    const label =
      LEAVE_TYPE.find((t) => Number(t.value) === record.leaveTypeId)?.label ??
      record.leaveType?.name ??
      `Type ${record.leaveTypeId}`;
    const isCasual = label.toLowerCase().includes("casual");

    return {
      key: `balance-${record.leaveTypeId}`,
      label: `${label} Balance`,
      value: parseFloat(record.availableDays ?? "0").toFixed(0),
      icon: CalendarDays,
      activeColor: isCasual ? "blue" : "violet",
      // colors when inactive (default)
      labelClass: isCasual ? "text-blue-400" : "text-violet-400",
      iconBgClass: isCasual
        ? "bg-blue-50 text-blue-500 dark:bg-blue-900/30 dark:text-blue-400"
        : "bg-violet-50 text-violet-500 dark:bg-violet-900/30 dark:text-violet-400",
      valueClass: "text-slate-900 dark:text-slate-100",
    };
  });

  const summaryCards = [
    {
      key: "taken",
      label: "Taken (Used Days)",
      value: totalUsed.toFixed(0),
      icon: CheckCircle2,
      labelClass: "text-emerald-400",
      iconBgClass:
        "bg-emerald-50 text-emerald-500 dark:bg-emerald-900/30 dark:text-emerald-400",
      valueClass: "text-slate-900 dark:text-slate-100",
    },
    {
      key: "pending-count",
      label: "Pending Approval",
      value: totalPending.toFixed(0),
      icon: Clock,
      labelClass: "text-amber-400",
      iconBgClass:
        "bg-amber-50 text-amber-500 dark:bg-amber-900/30 dark:text-amber-400",
      valueClass: "text-slate-900 dark:text-slate-100",
    },
  ];

  const allCards = [...balanceCards, ...summaryCards];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      {allCards.map((card) => {
        const Icon = card.icon;
        return (
          <Card
            key={card.key}
            className="border border-slate-200 dark:border-slate-800 transition-all"
          >
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <span
                  className={`text-xs font-semibold uppercase tracking-wide ${card.labelClass}`}
                >
                  {card.label}
                </span>
                <div className={`p-2 rounded-xl ${card.iconBgClass}`}>
                  <Icon size={20} />
                </div>
              </div>
              <div
                className={`text-3xl font-bold tracking-tight ${card.valueClass}`}
              >
                {card.value}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

const LeaveManagementPage = () => {
  const { setOpen } = useLeaveStore();

  const user = useAuthStore((state) => state.user);
  const rawRole = user?.role || user?.user?.role;
  const roleName = String(
    rawRole && typeof rawRole === "object" ? rawRole?.name : rawRole || ""
  ).toLowerCase();

  const isAdmin = roleName === roles.ADMIN;
  const isPM = roleName === roles.PROJECT_MANAGER;
  const isDeveloper = roleName === roles.DEVELOPER;
  const isBDE = roleName === roles.BDE;
  // Only Admin & PM can see the employee filter (they can apply for others)
  const canApplyForOthers = isAdmin || isPM;
  // Developer & BDE only see their own leaves — no need for status tabs
  const showStatusTabs = !isDeveloper && !isBDE;

  // Current logged-in user's employee id
  const currentEmployeeId = user?.user?.id || user?.user_id;

  const [queryParams, setQueryParams] = useQueryStates({
    pageSize: parseAsInteger.withDefault(10),
    currentPage: parseAsInteger.withDefault(1),
    search: parseAsString.withDefault(""),
    employeeId: parseAsInteger,
    startDate: parseAsString,
    endDate: parseAsString,
    tab: parseAsString.withDefault("pending"),
  });

  const listParams = {
    pageSize: queryParams.pageSize,
    currentPage: queryParams.currentPage,
    search: queryParams.search,
    employeeId: queryParams.employeeId,
    startDate: queryParams.startDate,
    endDate: queryParams.endDate,
    tab: queryParams.tab,
  };

  const getStatusFromTab = (tab: string) => {
    if (tab === "approved") return ["approved"];
    if (tab === "rejected") return ["rejected"];
    return ["pending"];
  };

  const apiParams = {
    page: listParams.currentPage,
    limit: listParams.pageSize,
    search: listParams.search,
    pagination: true,
    // Employee filter only applicable for Admin/PM
    employeeId: canApplyForOthers ? listParams.employeeId : undefined,
    fromDate: listParams.startDate,
    toDate: listParams.endDate,
    // All roles now see tabs (pending/approved/rejected)
    status: getStatusFromTab(queryParams.tab),
  };

  const { data: listData, isPending: loading } = useGetLeaveData(apiParams);

  // Only fetch employee list for Admin & PM (to use in filter dropdown)
  const { data: employeesList, isPending: employeesListLoading }: any =
    useGeEmployeeData(undefined, canApplyForOthers);

  // Fetch all leave balances for current user (shown as summary cards for all roles)
  const { data: allBalanceData, isPending: balanceLoading } =
    useGetAllLeaveBalances(currentEmployeeId) as any;

  const balanceArray: BalanceRecord[] = Array.isArray(allBalanceData)
    ? allBalanceData
    : Array.isArray(allBalanceData?.data)
      ? allBalanceData.data
      : [];

  const totalCount = (listData as any)?.metadata?.totalCount;

  const handleSearch = (search: string | undefined) => {
    setQueryParams({ ...listParams, search: search ?? "", currentPage: 1 });
  };

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

  const handleTabChange = (val: string) => {
    setQueryParams({
      ...listParams,
      tab: val,
      currentPage: 1,
    });
  };

  const filters: FilterConfig[] = [
    {
      type: "search",
      placeholder: "Search by reason or description...",
      key: "search",
      value: listParams.search,
      onChange: handleSearch,
    },
    {
      type: "dateRange",
      key: "leaveDate",
      placeholder: "Filter by date...",
      value: {
        from: listParams.startDate ? new Date(listParams.startDate) : undefined,
        to: listParams.endDate ? new Date(listParams.endDate) : undefined,
      },
      onChange: (range: { from?: Date; to?: Date } | undefined) => {
        setQueryParams({
          ...listParams,
          startDate: formatDate(range?.from) ?? null,
          endDate: formatDate(range?.to) ?? null,
          currentPage: 1,
        });
      },
    },
    // Employee filter only shown to Admin & PM
    ...(canApplyForOthers
      ? [
          {
            type: "select" as const,
            key: "employeeId",
            placeholder: "Filter by employee",
            options: employeesList?.data?.map((emp: any) => ({
              value: emp.id,
              label: emp.fullName,
            })),
            value: listParams.employeeId?.toString(),
            onChange: (value: any) => {
              setQueryParams({
                ...listParams,
                employeeId: value ? Number(value) : null,
                currentPage: 1,
              });
            },
            isLoading: employeesListLoading,
          },
        ]
      : []),
  ];

  const handleAdd = () => {
    setOpen("add");
  };

  const tabTriggerClass =
    "flex items-center gap-2 rounded-[50px] !px-3 !py-2 transition-all h-[35px] " +
    "text-foreground/70 hover:text-foreground " +
    "data-[state=active]:bg-foreground data-[state=active]:text-background data-[state=active]:shadow-sm " +
    "dark:text-muted-foreground dark:hover:text-foreground " +
    "dark:data-[state=active]:bg-primary dark:data-[state=active]:text-white dark:data-[state=active]:shadow-[0_2px_8px_oklch(0_0_0/0.5)]";

  return (
    <PageLayout>
      <TablePageHeader
        title="Leave Management"
        buttonText="Apply Leave"
        onButtonClick={handleAdd}
      >
        Manage employee leaves and track attendance.
      </TablePageHeader>

      <div className="flex flex-col gap-4 py-2">
        {/* ── Leave Balance Summary Cards (all roles) ── */}
        <LeaveBalanceCards
          balanceData={balanceArray}
          loading={balanceLoading}
        />

        {/* Tabs — hidden for Developer & BDE */}
        {showStatusTabs && (
          <Tabs
            value={queryParams.tab}
            onValueChange={handleTabChange}
            className="w-full"
          >
            <TabsList className="bg-[#fdebef] rounded-full dark:bg-muted dark:border-white/10 border border-rose-100/50 h-9 w-fit">
              <TabsTrigger value="pending" className={tabTriggerClass}>
                Pending
              </TabsTrigger>
              <TabsTrigger value="approved" className={tabTriggerClass}>
                Approved
              </TabsTrigger>
              <TabsTrigger value="rejected" className={tabTriggerClass}>
                Rejected
              </TabsTrigger>
            </TabsList>
          </Tabs>
        )}

        <GlobalFilterSection filters={filters ?? []} />

        <GlobalTable
          pageSize={listParams.pageSize}
          currentPage={listParams.currentPage}
          totalCount={totalCount ?? 0}
          data={(listData as any)?.data ?? []}
          onPaginationChange={handlePaginationChange}
          columns={columns.filter((col: any) =>
            col.accessorKey === "rejectionReason"
              ? queryParams.tab === "rejected"
              : true
          )}
          loading={loading}
          isPaginationEnabled
        />
      </div>

      <ActionFormModal />
    </PageLayout>
  );
};

export default LeaveManagementPage;
