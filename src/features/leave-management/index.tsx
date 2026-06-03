/* eslint-disable @typescript-eslint/no-explicit-any */
import PageLayout from "@/components/layout/layout-provider";
import { GlobalTable } from "@/components/table/global-table";
import GlobalFilterSection from "@/components/table/global-table-filter";
import TablePageHeader from "@/components/table/table-page-header";
import { FilterConfig } from "@/components/table/table-toolbar";
import { ActionFormModal } from "./components/action";
import { columns } from "./components/columns";
import { useLeaveStore } from "./stores";
import { useGeEmployeeData, useGetLeaveData } from "./services";
import { parseAsInteger, parseAsString, useQueryStates } from "nuqs";
import { formatDate } from "@/utils/commonFunctions";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuthStore } from "@/stores/use-auth-store";
import { roles } from "@/utils/constant";

const LeaveManagementPage = () => {
  const { open, setOpen } = useLeaveStore();

  const user = useAuthStore((state) => state.user);
  const rawRole = user?.role || user?.user?.role;
  const roleName = String(
    rawRole && typeof rawRole === "object" ? rawRole?.name : rawRole || ""
  ).toLowerCase();

  const isDeveloper = roleName === roles.DEVELOPER;

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
    // For developers, don't filter by employeeId from query (backend handles it via auth)
    employeeId: isDeveloper ? undefined : listParams.employeeId,
    fromDate: listParams.startDate,
    toDate: listParams.endDate,
    // Developers see all their own leaves without status filter (no tabs)
    status: isDeveloper ? undefined : getStatusFromTab(queryParams.tab),
  };

  const { data: listData, isPending: loading } = useGetLeaveData(apiParams);

  // Only fetch employee list for approver roles (Admin / PM / TL) — not for developers
  const { data: employeesList, isPending: employeesListLoading }: any =
    useGeEmployeeData(undefined, !isDeveloper);

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
    // Employee filter only shown to approver roles
    ...(!isDeveloper
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
        buttonText={isDeveloper ? "Apply Leave" : "Add Leave"}
        onButtonClick={handleAdd}
      >
        Manage employee leaves and track attendance.
      </TablePageHeader>

      <div className="flex flex-col gap-4 py-2">
        {/* Tabs are only shown to approver roles (Admin / PM / TL), not developers */}
        {!isDeveloper && (
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
          columns={columns}
          loading={loading}
          isPaginationEnabled
        />
      </div>

      {open && <ActionFormModal />}
    </PageLayout>
  );
};

export default LeaveManagementPage;
