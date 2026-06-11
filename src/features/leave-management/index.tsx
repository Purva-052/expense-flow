/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useMemo, useState } from "react";
import PageLayout from "@/components/layout/layout-provider";
import { GlobalTable } from "@/components/table/global-table";
import GlobalFilterSection from "@/components/table/global-table-filter";
import TablePageHeader from "@/components/table/table-page-header";
import { FilterConfig } from "@/components/table/table-toolbar";
import { ActionFormModal } from "./components/action";
import { LeaveActionForm } from "./components/action-form";
import { columns } from "./components/columns";
import { useLeaveStore } from "./stores";
import {
  useGetAllLeaveBalances,
  useGetLeaveData,
  useCreateLeaveData,
  useUpdateLeaveData,
  useGetLeaveCreditHistory,
} from "./services";
import { parseAsInteger, parseAsString, useQueryStates } from "nuqs";
import { formatDate } from "@/utils/commonFunctions";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useAuthStore } from "@/stores/use-auth-store";
import { roles } from "@/utils/constant";
import {
  LayoutDashboard,
  FileText,
  Plus,
  History,
  FileDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { LeaveBalanceCards } from "./components/leave-balance-cards";
import { LeaveDashboardTab } from "./components/leave-dashboard-tab";
import { AdjustBalanceModal } from "./components/adjust-balance-modal";
import { SetAllocationsModal } from "./components/set-allocations-modal";
import { useGetUserDropdownList } from "../users/services";
import { cn } from "@/lib/utils";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  ExcelImportPreview,
  ExcelPreviewData,
} from "@/features/kanban-board/components/project-view/excel-import-preview";
import { useImportUsers } from "@/features/users/services";
import * as ExcelJS from "exceljs";
import API from "@/config/api/api";

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

  const queryClient = useQueryClient();
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewData, setPreviewData] = useState<ExcelPreviewData | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isParsingFile, setIsParsingFile] = useState(false);

  const { isUploading: isImportUploading, uploadFile: importUploadFile } =
    useImportUsers();

  const handleImportFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const allowedTypes = [
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-excel",
      "text/csv",
    ];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Please upload a valid Excel or CSV file.");
      event.target.value = "";
      return;
    }
    setIsParsingFile(true);
    setSelectedFile(file);
    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const arrayBuffer = e.target?.result as ArrayBuffer;
          const workbook = new ExcelJS.Workbook();
          if (file.name.endsWith(".csv")) {
            await workbook.csv.read(new Response(arrayBuffer).body! as any);
          } else {
            await workbook.xlsx.load(arrayBuffer);
          }
          const worksheet = workbook.worksheets[0];
          if (!worksheet) throw new Error("No worksheet found");
          const jsonData: any[][] = [];
          worksheet.eachRow({ includeEmpty: true }, (row: ExcelJS.Row) => {
            const values = Array.isArray(row.values) ? row.values.slice(1) : [];
            const cleanValues = values.map((v: any) => {
              if (v && typeof v === "object" && "richText" in v)
                return v.richText.map((t: any) => t.text).join("");
              if (v && typeof v === "object" && "result" in v) return v.result;
              return v;
            });
            jsonData.push(cleanValues);
          });
          if (jsonData.length > 0) {
            const headers = jsonData[0].map((h) => String(h || ""));
            const rows = jsonData.slice(1);
            setPreviewData({ headers, rows });
            setPreviewOpen(true);
          } else {
            toast.error("No data found in the Excel file.");
          }
        } catch (error) {
          console.error("Error parsing Excel file:", error);
          toast.error("Please check the file format.");
        } finally {
          setIsParsingFile(false);
        }
      };
      reader.readAsArrayBuffer(file);
    } catch (error) {
      console.error("Error reading file:", error);
      setIsParsingFile(false);
    }
    event.target.value = "";
  };

  const handleImportPreviewConfirm = async () => {
    if (!selectedFile) return;
    const response = await importUploadFile(selectedFile);
    if (response?.statusCode === 200 || response?.statusCode === 201) {
      queryClient.invalidateQueries({
        queryKey: [API.leave_management.leave_balance],
      });
      queryClient.invalidateQueries({ queryKey: [API.leave_balance.get] });
      queryClient.invalidateQueries({ queryKey: [API.leave_management.list] });
    }
    setPreviewOpen(false);
    setPreviewData(null);
    setSelectedFile(null);
  };

  const user = useAuthStore((state) => state.user);
  const rawRole = user?.role || user?.user?.role;
  const roleName = String(
    rawRole && typeof rawRole === "object" ? rawRole?.name : rawRole || ""
  ).toLowerCase();

  const isAdmin = roleName === roles.ADMIN;
  const isDeveloper = roleName === roles.DEVELOPER;
  const isBDE = roleName === roles.BDE;
  // Dashboard tab is only visible to admin
  const canViewDashboard = isAdmin;
  // Manager-level features (employee filter, status tabs) remain for admin + PM
  const canViewManagerTabs = isAdmin || roleName === roles.PROJECT_MANAGER;
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
    queryParams.section === "leaves"
      ? "leaves"
      : queryParams.section === "balance-logs"
        ? "balance-logs"
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
  const { data: employeeList, isPending: usersListLoading }: any =
    useGetUserDropdownList({
      role: [
        roles.TEAM_LEAD,
        roles.ADMIN,
        roles.PROJECT_MANAGER,
        roles.DEVELOPER,
        roles.BDE,
      ],
      status: "active",
    });

  const balanceUserId =
    (canViewManagerTabs &&
      !(
        roleName === roles.PROJECT_MANAGER && activeSection === "balance-logs"
      ) &&
      listParams.employeeId) ||
    currentEmployeeId;

  const { data: allBalanceData, isPending: balanceLoading } =
    useGetAllLeaveBalances(balanceUserId) as any;

  const { isPending: pendingLeavesLoading } = useGetLeaveData({
    employeeId: balanceUserId,
    status: ["pending"],
    pagination: false,
  });

  // Dashboard-only API calls — only fire for admin
  const { data: allPendingLeavesData } = useGetLeaveData(
    { status: ["pending"], pagination: false },
    isAdmin
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
          parseFloat(b.availableDays ?? "0") <= 2 &&
          parseFloat(b.availableDays ?? "0") >= 0
      );
    }).length;
  }, [employeeList]);

  const creditHistoryApiParams = {
    page: queryParams.currentPage,
    limit: queryParams.pageSize,
    search: queryParams.search || undefined,
    employeeId: isAdmin ? queryParams.employeeId || undefined : undefined,
    pagination: true,
  };

  const { data: creditHistoryData, isPending: creditHistoryLoading } =
    useGetLeaveCreditHistory(
      creditHistoryApiParams,
      activeSection === "balance-logs"
    );

  const creditHistoryList = useMemo(
    () => (creditHistoryData as any)?.data ?? [],
    [creditHistoryData]
  );

  const creditHistoryTotalCount = useMemo(
    () => (creditHistoryData as any)?.metadata?.totalCount ?? 0,
    [creditHistoryData]
  );

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
    ...(canViewManagerTabs &&
    !(roleName === roles.PROJECT_MANAGER && activeSection === "balance-logs")
      ? [
          {
            type: "select" as const,
            key: "employeeId",
            placeholder: "Filter by employee",
            options: employeeList?.data?.map((emp: any) => ({
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
            isLoading: usersListLoading,
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

  const balanceLogColumns = useMemo(
    () => [
      {
        accessorKey: "employee",
        header: "Employee Name",
        cell: ({ row }: any) => {
          const emp = row.getValue("employee");
          return (
            <span className="font-semibold text-gray-900 dark:text-slate-100">
              {emp?.fullName ?? "-"}
            </span>
          );
        },
      },
      {
        accessorKey: "leaveType",
        header: "Leave Type",
        cell: ({ row }: any) => {
          const lt = row.getValue("leaveType");
          return <span>{lt?.name ?? "-"}</span>;
        },
      },
      {
        accessorKey: "adjustment",
        header: "Adjustment",
        cell: ({ row }: any) => {
          const val = row.getValue("adjustment");
          if (val === null || val === undefined) return <span>-</span>;
          const num = parseFloat(val);
          const isNegative = num < 0;
          const absNum = Math.abs(num);
          const formattedNum = Number(absNum.toFixed(2));
          const formatted =
            num === 0 ? "0" : isNegative ? `-${formattedNum}` : `+${formattedNum}`;
          return (
            <span
              className={cn(
                "font-bold px-2 py-0.5 rounded-full text-xs",
                isNegative
                  ? "bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400"
                  : "bg-green-50 text-green-700 dark:bg-green-950/30 dark:text-green-400"
              )}
            >
              {formatted} Days
            </span>
          );
        },
      },
      {
        accessorKey: "previousBalance",
        header: "Previous Balance",
        cell: ({ row }: any) => {
          const val = row.getValue("previousBalance");
          if (val === null || val === undefined) return <span>-</span>;
          const num = Number(parseFloat(val).toFixed(2));
          return <span>{num} Days</span>;
        },
      },
      {
        accessorKey: "newBalance",
        header: "New Balance",
        cell: ({ row }: any) => {
          const val = row.getValue("newBalance");
          if (val === null || val === undefined) return <span>-</span>;
          const num = Number(parseFloat(val).toFixed(2));
          return <span>{num} Days</span>;
        },
      },
      {
        accessorKey: "dateAdded",
        header: "Date Added",
        cell: ({ row }: any) => {
          const dateStr = row.getValue("dateAdded");
          if (!dateStr) return <span>-</span>;
          const date = new Date(dateStr);
          return (
            <span>
              {date.toLocaleDateString("en-IN", {
                year: "numeric",
                month: "short",
                day: "numeric",
              })}{" "}
              {date.toLocaleTimeString("en-IN", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          );
        },
      },
      {
        accessorKey: "adjustedBy",
        header: "Adjusted By",
        cell: ({ row }: any) => {
          const adjBy = row.getValue("adjustedBy");
          return <span>{adjBy?.fullName ?? "System / Auto"}</span>;
        },
      },
      {
        accessorKey: "reason",
        header: "Reason",
        cell: ({ row }: any) => {
          const reason = row.getValue("reason");
          const source = row.original.source;
          if (reason) return <span>{reason}</span>;
          if (source) {
            const formattedSource = source
              .split("_")
              .map(
                (word: string) => word.charAt(0).toUpperCase() + word.slice(1)
              )
              .join(" ");
            return (
              <span className="text-muted-foreground italic">
                {formattedSource}
              </span>
            );
          }
          return <span>-</span>;
        },
      },
    ],
    []
  );

  const balanceLogsTabContent = (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-xl border border-gray-100 dark:border-slate-800 shadow-xs">
        <div>
          <h3 className="font-semibold text-sm text-gray-900 dark:text-slate-100">
            Manual Balance Log History
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            {isAdmin
              ? `Logs of manual adjustments made to employee leave balances.`
              : `Logs of manual adjustments made to your leave balance.`}
          </p>
        </div>
        {isAdmin && (
          <div className="flex items-center gap-2 shrink-0">
            <input
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={handleImportFileChange}
              disabled={isImportUploading}
              className="hidden"
              id="leave-balance-import-file-input"
            />
            <Button
              onClick={() =>
                document
                  .getElementById("leave-balance-import-file-input")
                  ?.click()
              }
              disabled={isImportUploading || isParsingFile}
              // variant="outline"
            >
              <FileDown className="w-4 h-4 mr-2" />
              {isImportUploading || isParsingFile
                ? "Importing..."
                : "Import Leaves"}
            </Button>
            <Button
              onClick={() => setAdjustBalanceOpen(true)}
              className="shrink-0 w-fit"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Balance
            </Button>
          </div>
        )}
      </div>

      <GlobalFilterSection filters={filters ?? []} />

      <GlobalTable
        pageSize={listParams.pageSize}
        currentPage={listParams.currentPage}
        totalCount={creditHistoryTotalCount}
        data={creditHistoryList}
        columns={balanceLogColumns}
        loading={creditHistoryLoading}
        isPaginationEnabled
        onPaginationChange={handlePaginationChange}
      />
    </div>
  );

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
              actions={
                canViewDashboard &&
                activeSection === "leaves" && (
                  <div className="flex items-center gap-2">
                    {/* <Button onClick={() => setSetAllocationsOpen(true)} variant="outline">
                      <Coins className="mr-2 h-4 w-4" />
                      Set Allocations
                    </Button> */}
                    {/* <Button onClick={() => setAdjustBalanceOpen(true)}>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Balance
                    </Button> */}
                  </div>
                )
              }
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
              </TabsList>

              {canViewDashboard && (
                <TabsContent
                  value="dashboard"
                  className="mt-0 focus-visible:outline-none"
                >
                  <LeaveDashboardTab
                    pendingCount={pendingApprovalCount}
                    lowBalanceCount={lowBalanceCount}
                  />
                </TabsContent>
              )}

              <TabsContent
                value="leaves"
                className="mt-0 focus-visible:outline-none"
              >
                {leavesTabContent}
              </TabsContent>

              <TabsContent
                value="balance-logs"
                className="mt-0 focus-visible:outline-none"
              >
                {balanceLogsTabContent}
              </TabsContent>
            </Tabs>
          </div>
        </>
      )}

      <ActionFormModal />
      <AdjustBalanceModal
        open={adjustBalanceOpen}
        onOpenChange={setAdjustBalanceOpen}
        employeesList={employeeList}
        employeesListLoading={usersListLoading}
      />
      <SetAllocationsModal
        open={setAllocationsOpen}
        onOpenChange={setSetAllocationsOpen}
      />
      <ExcelImportPreview
        open={previewOpen}
        onOpenChange={setPreviewOpen}
        data={previewData}
        fileName={selectedFile?.name || ""}
        isLoading={isParsingFile}
        onConfirm={handleImportPreviewConfirm}
      />
    </PageLayout>
  );
};

export default LeaveManagementPage;
