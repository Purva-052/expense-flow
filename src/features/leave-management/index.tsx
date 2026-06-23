/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useMemo, useRef, useState } from "react";
import PageLayout from "@/components/layout/layout-provider";
import TablePageHeader from "@/components/table/table-page-header";
import { ActionFormModal } from "./components/action";
import { LeaveActionForm } from "./components/action-form";
import { useLeaveStore } from "./stores";
import {
  useCreateLeaveData,
  useUpdateLeaveData,
  useGetLeaveData,
} from "./services";
import { parseAsString, useQueryStates } from "nuqs";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useAuthStore } from "@/stores/use-auth-store";
import { useLocation } from "@tanstack/react-router";
import { roles } from "@/utils/constant";
import { LayoutDashboard, FileText, History, Users } from "lucide-react";
import { LeaveDashboardTab } from "./components/leave-dashboard-tab";
import { AdjustBalanceModal } from "./components/adjust-balance-modal";
import { SetAllocationsModal } from "./components/set-allocations-modal";
import { useGetUserDropdownList } from "@/features/users/services";
import { LeaveStatusTab } from "./components/leave-status-tab";
import { BalanceLogsTab } from "./components/balance-logs-tab";
import { EmployeeBalanceTab } from "./components/employee-balance-tab";

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
  const [selectedEmployeeIdForAdjustment, setSelectedEmployeeIdForAdjustment] =
    useState<number | null>(null);

  const handleOpenAdjustBalance = (empId: number | null) => {
    setSelectedEmployeeIdForAdjustment(empId);
    setAdjustBalanceOpen(true);
  };

  const user = useAuthStore((state) => state.user);
  const rawRole = user?.role || user?.user?.role;
  const roleName = String(
    rawRole && typeof rawRole === "object" ? rawRole?.name : rawRole || ""
  ).toLowerCase();

  const isAdmin = roleName === roles.ADMIN;
  const isProjectManager = roleName === roles.PROJECT_MANAGER;
  const isTeamLead = roleName === roles.TEAM_LEAD;
  const canViewDashboard = isAdmin || isProjectManager || isTeamLead;

  const defaultSection = canViewDashboard ? "dashboard" : "leaves";

  const initialSection = useRef<string | null>(null);
  const [queryParams, setQueryParams] = useQueryStates({
    section: parseAsString.withDefault(defaultSection),
    tab: parseAsString,
  });

  const activeSection =
    queryParams.section === "leaves"
      ? "leaves"
      : queryParams.section === "balance-logs"
        ? "balance-logs"
        : queryParams.section === "employee-wise-leave"
          ? "employee-wise-leave"
          : canViewDashboard
            ? "dashboard"
            : "leaves";

  // Fetch employee dropdown list (needed for AdjustBalanceModal and stats)
  const { data: employeeList, isPending: usersListLoading } =
    useGetUserDropdownList({
      role: [
        roles.TEAM_LEAD,
        roles.ADMIN,
        roles.PROJECT_MANAGER,
        roles.DEVELOPER,
        roles.BDE,
      ],
      status: "active",
    }) as any;

  // Dashboard-only pending count
  const { data: allPendingLeavesData } = useGetLeaveData(
    { status: ["pending"], pagination: false },
    canViewDashboard
  );

  const pendingApprovalCount = useMemo(
    () => (allPendingLeavesData as any)?.data?.length ?? 0,
    [allPendingLeavesData]
  );

  const lowBalanceCount = useMemo(() => {
    const employees = employeeList?.data ?? [];
    return employees.filter((emp: any) => {
      const balances = emp.leaveBalances ?? emp.balances ?? [];
      if (!Array.isArray(balances) || balances.length === 0) return false;
      return balances.some(
        (b: any) =>
          (b.leaveType?.name === "Casual Leave" && Number(b.balance) < 2) ||
          (b.leaveType?.name === "Paid Leave" && Number(b.balance) < 2)
      );
    }).length;
  }, [employeeList]);

  const { mutateAsync: createMutate, isPending: isCreateLoading } =
    useCreateLeaveData();
  const { mutateAsync: updateMutate, isPending: isUpdateLoading } =
    useUpdateLeaveData();

  const handleCreate = (formData: FormData) => {
    createMutate(formData as any);
  };

  const handleEdit = (payload: { id: string | number; data: FormData }) => {
    updateMutate({ id: payload.id, data: payload.data });
  };

  const handleCloseForm = () => {
    setOpen(null);
    setTimeout(() => {
      setCurrentRow(null);
    }, 300);
  };

  const handleSectionChange = (val: string) => {
    // Remove shared child filter/query params so filters don't persist across sections
    try {
      const params = new URLSearchParams(window.location.search);
      [
        "pageSize",
        "currentPage",
        "search",
        "employeeId",
        "startDate",
        "endDate",
        "tab",
      ].forEach((k) => params.delete(k));

      params.set("section", val);

      const newSearch = params.toString() ? `?${params.toString()}` : "";
      window.history.replaceState(
        {},
        "",
        window.location.pathname + newSearch + window.location.hash
      );
    } catch {
      // ignore in non-browser environments
    }

    setQueryParams({
      section: val,
      tab: null,
    });
  };

  const handleAdd = () => {
    setOpen("add");
  };

  const location = useLocation({
    select: (location: any) => ({
      pathname: location.pathname,
      search: location.search,
    }),
  });

  useEffect(() => {
    if (initialSection.current === null) {
      initialSection.current = queryParams.section || defaultSection;
    }
  }, [queryParams.section, defaultSection]);

  const isFormActive = open === "add" || open === "edit" || open === "view";

  const isAnyModalOpen =
    isFormActive ||
    adjustBalanceOpen ||
    setAllocationsOpen ||
    open === "delete" ||
    open === "action";

  useEffect(() => {
    if (!isAnyModalOpen) return;

    window.history.pushState({ isModal: true }, "");

    let popstateTriggered = false;

    const handlePopState = () => {
      popstateTriggered = true;
      if (isFormActive || open === "delete" || open === "action") {
        setOpen(null);
        setCurrentRow(null);
      }
      if (adjustBalanceOpen) {
        setAdjustBalanceOpen(false);
        setSelectedEmployeeIdForAdjustment(null);
      }
      if (setAllocationsOpen) {
        setSetAllocationsOpen(false);
      }
    };

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
      if (!popstateTriggered && window.history.state?.isModal) {
        window.history.back();
      }
    };
  }, [
    isAnyModalOpen,
    isFormActive,
    adjustBalanceOpen,
    setAllocationsOpen,
    open,
    setOpen,
    setCurrentRow,
  ]);

  useEffect(() => {
    const path = location.pathname;
    const section = queryParams.section || defaultSection;

    // Only auto-close when navigating away from this page or a different section.
    // Do not interfere with the initial load from sidebar navigation.
    const isInitialLoad =
      initialSection.current === section && path === "/leave-management";

    if (
      !isInitialLoad &&
      (path !== "/leave-management" || section !== "leaves")
    ) {
      if (open !== null) {
        setOpen(null);
      }
      if (currentRow !== null) {
        setCurrentRow(null);
      }
    }
  }, [
    location,
    open,
    currentRow,
    queryParams.section,
    setOpen,
    setCurrentRow,
    defaultSection,
  ]);

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
              employeesList={employeeList}
              employeesListLoading={usersListLoading}
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
              employeesList={employeeList}
              employeesListLoading={usersListLoading}
            />
          )}

          {open === "view" && currentRow && (
            <LeaveActionForm
              key={`leave-view-${currentRow.id}`}
              open={open === "view"}
              onOpenChange={handleCloseForm}
              currentRow={currentRow}
              employeesList={employeeList}
              employeesListLoading={usersListLoading}
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
            >
              Manage employee leaves and track attendance.
            </TablePageHeader>

            <Tabs
              value={activeSection}
              onValueChange={handleSectionChange}
              className="w-full gap-4"
            >
              <TabsList className="bg-[#fdebef] rounded-full dark:bg-muted dark:border-white/10 border border-rose-100/50 h-9 w-fit shrink-0">
                {canViewDashboard && (
                  <TabsTrigger value="dashboard" className={tabTriggerClass}>
                    <LayoutDashboard className="h-4 w-4" />
                    Leave Dashboard
                  </TabsTrigger>
                )}
                <TabsTrigger value="leaves" className={tabTriggerClass}>
                  <FileText className="h-4 w-4" />
                  Leave Status
                </TabsTrigger>
                <TabsTrigger value="balance-logs" className={tabTriggerClass}>
                  <History className="h-4 w-4" />
                  Balance Logs
                </TabsTrigger>
                {isAdmin && (
                  <TabsTrigger
                    value="employee-wise-leave"
                    className={tabTriggerClass}
                  >
                    <Users className="h-4 w-4" />
                    Employee Balance
                  </TabsTrigger>
                )}
              </TabsList>

              {canViewDashboard && (
                <TabsContent
                  value="dashboard"
                  className="mt-0 focus-visible:outline-none"
                >
                  <LeaveDashboardTab
                    pendingCount={pendingApprovalCount}
                    lowBalanceCount={lowBalanceCount}
                    onPendingCardClick={() => {
                      setQueryParams({
                        section: "leaves",
                        tab: "pending",
                      });
                    }}
                  />
                </TabsContent>
              )}

              <TabsContent
                value="leaves"
                className="mt-0 focus-visible:outline-none"
              >
                <LeaveStatusTab />
              </TabsContent>

              <TabsContent
                value="balance-logs"
                className="mt-0 focus-visible:outline-none"
              >
                <BalanceLogsTab
                  onAdjustLeavesClick={() => setSetAllocationsOpen(true)}
                />
              </TabsContent>

              {isAdmin && (
                <TabsContent
                  value="employee-wise-leave"
                  className="mt-0 focus-visible:outline-none"
                >
                  <EmployeeBalanceTab onAdjustClick={handleOpenAdjustBalance} />
                </TabsContent>
              )}
            </Tabs>
          </div>
        </>
      )}

      <ActionFormModal />
      <AdjustBalanceModal
        open={adjustBalanceOpen}
        onOpenChange={(val) => {
          setAdjustBalanceOpen(val);
          if (!val) {
            setSelectedEmployeeIdForAdjustment(null);
          }
        }}
        employeesList={employeeList}
        employeesListLoading={usersListLoading}
        selectedEmployeeId={selectedEmployeeIdForAdjustment}
      />
      <SetAllocationsModal
        open={setAllocationsOpen}
        onOpenChange={setSetAllocationsOpen}
      />
    </PageLayout>
  );
};

export default LeaveManagementPage;
