/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMemo, useState } from "react";
import PageLayout from "@/components/layout/layout-provider";
import { GlobalTable } from "@/components/table/global-table";
import GlobalFilterSection from "@/components/table/global-table-filter";
import TablePageHeader from "@/components/table/table-page-header";
import { FilterConfig } from "@/components/table/table-toolbar";
import { ActionFormModal } from "./components/action";
import {
  LeaveActionForm,
} from "./components/action-form";
import { columns } from "./components/columns";
import { useLeaveStore } from "./stores";
import {
  useGeEmployeeData,
  useGetAllLeaveBalances,
  useGetLeaveData,
  useCreateLeaveData,
  useUpdateLeaveData,
} from "./services";
import { parseAsInteger, parseAsString, useQueryStates } from "nuqs";
import { formatDate } from "@/utils/commonFunctions";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useAuthStore } from "@/stores/use-auth-store";
import { roles } from "@/utils/constant";
import { LayoutDashboard, FileText, Plus, Coins } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LeaveBalanceCards } from "./components/leave-balance-cards";
import { LeaveDashboardTab } from "./components/leave-dashboard-tab";
import { AdjustBalanceModal } from "./components/adjust-balance-modal";
import { SetAllocationsModal } from "./components/set-allocations-modal";


const tabTriggerClass =
  "flex items-center gap-2 rounded-[50px] !px-3 !py-2 transition-all h-[35px] " +
  "text-foreground/70 hover:text-foreground " +
  "data-[state=active]:bg-foreground data-[state=active]:text-background data-[state=active]:shadow-sm " +
  "dark:text-muted-foreground dark:hover:text-foreground " +
  "dark:data-[state=active]:bg-primary dark:data-[state=active]:text-white dark:data-[state=active]:shadow-[0_2px_8px_oklch(0_0_0/0.5)]";

const LeaveManagementPage = () => {
  const { open, setOpen, currentRow, setCurrentRow } = useLeaveStore();
  const [adjustBalanceOpen, setAdjustBalanceOpen] = useState(false);
  const [setAllocationsOpen, setSetAllocationsOpen] = useState(false);

  const user = useAuthStore((state) => state.user);
  const rawRole = user?.role || user?.user?.role;
  const roleName = String(
    rawRole && typeof rawRole === "object" ? rawRole?.name : rawRole || ""
  ).toLowerCase();

  const isAdmin = roleName === roles.ADMIN;
  const isPM = roleName === roles.PROJECT_MANAGER;
  const isDeveloper = roleName === roles.DEVELOPER;
  const isBDE = roleName === roles.BDE;
  // Dashboard tab is only visible to admin
  const canViewDashboard = isAdmin;
  // Manager-level features (employee filter, status tabs) remain for admin + PM
  const canViewManagerTabs = isAdmin || isPM;
  const showStatusTabs = !isDeveloper && !isBDE;

  const currentEmployeeId = user?.user?.id || user?.user_id;

  const defaultSection = canViewDashboard ? "dashboard" : "leaves";

  const [queryParams, setQueryParams] = useQueryStates({
    pageSize: parseAsInteger.withDefault(10),
    currentPage: parseAsInteger.withDefault(1),
    search: parseAsString.withDefault(""),
    employeeId: parseAsInteger,
    startDate: parseAsString,
    endDate: parseAsString,
    tab: parseAsString.withDefault("pending"),
    section: parseAsString.withDefault(defaultSection),
  });

  const activeSection =
    canViewDashboard && queryParams.section === "leaves"
      ? "leaves"
      : canViewDashboard
        ? "dashboard"
        : "leaves";

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
    employeeId: canViewManagerTabs ? listParams.employeeId : undefined,
    fromDate: listParams.startDate,
    toDate: listParams.endDate,
    status: getStatusFromTab(queryParams.tab),
  };

  const { data: listData, isPending: loading } = useGetLeaveData(apiParams);

  // Employee list only fetched for admin (dashboard features)
  const { data: employeesList, isPending: employeesListLoading }: any =
    useGeEmployeeData(undefined, isAdmin);

  const balanceUserId =
    (canViewManagerTabs && listParams.employeeId) || currentEmployeeId;

  const { data: allBalanceData, isPending: balanceLoading } =
    useGetAllLeaveBalances(balanceUserId) as any;

  const { isPending: pendingLeavesLoading } =
    useGetLeaveData({
      employeeId: balanceUserId,
      status: ["pending"],
      pagination: false,
    });

  // Dashboard-only API calls — only fire for admin
  const { data: approvedLeavesData, isPending: approvedLeavesLoading } =
    useGetLeaveData(
      { status: ["approved"], pagination: false },
      isAdmin
    );

  const { data: allPendingLeavesData } = useGetLeaveData(
      { status: ["pending"], pagination: false },
      isAdmin
    );



  const approvedLeaves = useMemo(
    () => (approvedLeavesData as any)?.data ?? [],
    [approvedLeavesData]
  );

  const pendingApprovalCount = useMemo(
    () => (allPendingLeavesData as any)?.data?.length ?? 0,
    [allPendingLeavesData]
  );

  const lowBalanceCount = useMemo(() => {
    const employees = employeesList?.data ?? [];
    return employees.filter((emp: any) => {
      const balances = emp.leaveBalances ?? emp.balances ?? [];
      if (!Array.isArray(balances) || balances.length === 0) return false;
      return balances.some(
        (b: any) => parseFloat(b.availableDays ?? "0") <= 2 && parseFloat(b.availableDays ?? "0") >= 0
      );
    }).length;
  }, [employeesList]);

  const dashboardChartLoading = approvedLeavesLoading;

  const { mutateAsync: createMutate, isPending: isCreateLoading } =
    useCreateLeaveData();
  const { mutateAsync: updateMutate, isPending: isUpdateLoading } =
    useUpdateLeaveData(currentRow?.id || "");

  const handleCreate = (formData: FormData) => {
    createMutate(formData as any);
  };

  const handleEdit = (payload: { id: string | number; data: FormData }) => {
    updateMutate(payload.data as any);
  };

  const handleCloseForm = () => {
    setOpen(null);
    setTimeout(() => {
      setCurrentRow(null);
    }, 300);
  };

  const balanceArray = Array.isArray(allBalanceData)
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

  const handleStatusTabChange = (val: string) => {
    setQueryParams({
      ...listParams,
      tab: val,
      currentPage: 1,
    });
  };

  const handleSectionChange = (val: string) => {
    setQueryParams({
      ...listParams,
      section: val,
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
    ...(canViewManagerTabs
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

  const tableColumns = useMemo(() => {
    const isDevOrBDE = isDeveloper || isBDE;
    return columns.filter((col: any) => {
      if (col.accessorKey === "status") {
        return isDevOrBDE;
      }
      if (col.accessorKey === "rejectionReason") {
        return isDevOrBDE || queryParams.tab === "rejected";
      }
      return true;
    });
  }, [isDeveloper, isBDE, queryParams.tab]);

  const isFormActive = open === "add" || open === "edit" || open === "view";

  const leavesTabContent = (
    <div className="flex flex-col gap-4">
      <LeaveBalanceCards
        balanceData={balanceArray}
        loading={balanceLoading || pendingLeavesLoading}
      />

      {showStatusTabs && (
        <Tabs
          value={queryParams.tab}
          onValueChange={handleStatusTabChange}
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
        columns={tableColumns}
        loading={loading}
        isPaginationEnabled
      />
    </div>
  );

  return (
    <PageLayout>
      {isFormActive ? (
        <div className="py-2">
          {open === "add" && (
            <LeaveActionForm
              key="add-leave"
              open={open === "add"}
              loading={isCreateLoading}
              onOpenChange={(value) => setOpen(value ? "add" : null)}
              onSubmit={handleCreate}
              employeesList={employeesList}
              employeesListLoading={employeesListLoading}
            />
          )}

          {open === "edit" && currentRow && (
            <LeaveActionForm
              key={`leave-edit-${currentRow.id}`}
              open={open === "edit"}
              onSubmit={handleEdit}
              loading={isUpdateLoading}
              onOpenChange={handleCloseForm}
              currentRow={currentRow}
              employeesList={employeesList}
              employeesListLoading={employeesListLoading}
            />
          )}

          {open === "view" && currentRow && (
            <LeaveActionForm
              key={`leave-view-${currentRow.id}`}
              open={open === "view"}
              onOpenChange={handleCloseForm}
              currentRow={currentRow}
              employeesList={employeesList}
              employeesListLoading={employeesListLoading}
              onSubmit={() => {}}
              isViewOnly
            />
          )}
        </div>
      ) : (
        <>
          <div className="flex flex-col gap-4">
            <TablePageHeader
              title="Leave Management"
              buttonText="Apply Leave"
              onButtonClick={handleAdd}
              showActionButton={activeSection === "leaves"}
              actions={
                canViewDashboard && activeSection === "dashboard" && (
                  <div className="flex items-center gap-2">
                    <Button onClick={() => setSetAllocationsOpen(true)} variant="outline">
                      <Coins className="mr-2 h-4 w-4" />
                      Set Allocations
                    </Button>
                    <Button onClick={() => setAdjustBalanceOpen(true)}>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Balance
                    </Button>
                  </div>
                )
              }
            >
              Manage employee leaves and track attendance.
            </TablePageHeader>

            {canViewDashboard ? (
              <Tabs
                value={activeSection}
                onValueChange={handleSectionChange}
                className="w-full gap-4"
              >
                <TabsList className="bg-[#fdebef] rounded-full dark:bg-muted dark:border-white/10 border border-rose-100/50 h-9 w-fit shrink-0">
                  <TabsTrigger value="dashboard" className={tabTriggerClass}>
                    <LayoutDashboard className="h-4 w-4" />
                    Leave Dashboard
                  </TabsTrigger>
                  <TabsTrigger value="leaves" className={tabTriggerClass}>
                    <FileText className="h-4 w-4" />
                    Apply for Leave
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="dashboard" className="mt-0 focus-visible:outline-none">
                  <LeaveDashboardTab
                    approvedLeaves={approvedLeaves}
                    pendingCount={pendingApprovalCount}
                    lowBalanceCount={lowBalanceCount}
                    chartLoading={dashboardChartLoading}
                  />
                </TabsContent>

                <TabsContent value="leaves" className="mt-0 focus-visible:outline-none">
                  {leavesTabContent}
                </TabsContent>
              </Tabs>
            ) : (
              <div className="pb-2">{leavesTabContent}</div>
            )}
          </div>
        </>
      )}

      <ActionFormModal />
      <AdjustBalanceModal
        open={adjustBalanceOpen}
        onOpenChange={setAdjustBalanceOpen}
        employeesList={employeesList}
        employeesListLoading={employeesListLoading}
      />
      <SetAllocationsModal
        open={setAllocationsOpen}
        onOpenChange={setSetAllocationsOpen}
      />
    </PageLayout>
  );
};

export default LeaveManagementPage;
