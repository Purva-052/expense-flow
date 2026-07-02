/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMemo } from "react";
import { parseAsInteger, parseAsString, useQueryStates } from "nuqs";
import { formatDate } from "@/utils/commonFunctions";
import { useAuthStore } from "@/stores/use-auth-store";
import { roles, LEAVE_TYPE } from "@/utils/constant";
import { useGetAllLeaveBalances, useGetLeaveData } from "../services";
import {
  useGetUserDropdownList,
  useGetUserDetails,
} from "@/features/users/services";
import { LeaveBalanceCards } from "./leave-balance-cards";
import { getColumns } from "./columns";
import GlobalFilterSection from "@/components/table/global-table-filter";
import { GlobalTable } from "@/components/table/global-table";
import { FilterConfig } from "@/components/table/table-toolbar";
import { SortingState } from "@tanstack/react-table";

interface LeaveStatusTabProps {
  onEdit?: (row: any) => void;
  onView?: (row: any) => void;
  onDelete?: (row: any) => void;
}

export function LeaveStatusTab(_: LeaveStatusTabProps) {
  const user = useAuthStore((state) => state.user);
  const rawRole = user?.role || user?.user?.role;
  const roleName = String(
    rawRole && typeof rawRole === "object" ? rawRole?.name : rawRole || ""
  ).toLowerCase();

  const isAdmin = roleName === roles.ADMIN;
  const isDeveloper = roleName === roles.DEVELOPER;
  const isBDE = roleName === roles.BDE;
  const canViewManagerTabs = isAdmin || roleName === roles.PROJECT_MANAGER;
  const showStatusTabs = !isDeveloper && !isBDE;
  const currentEmployeeId = user?.user?.id || user?.user_id;

  const [queryParams, setQueryParams] = useQueryStates({
    pageSize: parseAsInteger.withDefault(10),
    currentPage: parseAsInteger.withDefault(1),
    search: parseAsString.withDefault(""),
    employeeId: parseAsInteger,
    approver: parseAsInteger,
    startDate: parseAsString,
    endDate: parseAsString,
    tab: parseAsString.withDefault("pending"),
    sortBy: parseAsString,
    sortOrder: parseAsString,
    leaveTypeId: parseAsInteger,
  });

  const listParams = {
    pageSize: queryParams.pageSize,
    currentPage: queryParams.currentPage,
    search: queryParams.search,
    employeeId: queryParams.employeeId,
    approver: queryParams.approver,
    startDate: queryParams.startDate,
    endDate: queryParams.endDate,
    tab: queryParams.tab,
    leaveTypeId: queryParams.leaveTypeId,
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
    approver: queryParams.tab === "pending" ? (listParams.approver || undefined) : undefined,
    actionedBy: queryParams.tab !== "pending" ? (listParams.approver || undefined) : undefined,
    fromDate: listParams.startDate,
    toDate: listParams.endDate,
    status: getStatusFromTab(queryParams.tab),
    sortBy: queryParams.sortBy ?? undefined,
    sortOrder: queryParams.sortOrder ?? undefined,
    leaveTypeId: listParams.leaveTypeId ?? undefined,
  };

  const { data: listData, isPending: loading } = useGetLeaveData(apiParams);

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

  const { data: approverList, isPending: approverListLoading } =
    useGetUserDropdownList({
      role: [
        roles.ADMIN,
        roles.TEAM_LEAD,
        roles.PROJECT_MANAGER,
      ],
      status: "active",
    }) as any;

  const getRoleName = (u: any) => {
    const raw = u?.role || u?.roleName;
    return String(
      raw && typeof raw === "object" ? raw?.name : raw || ""
    ).toLowerCase();
  };

  const approverOptions = useMemo(() => {
    const list = approverList?.data || [];
    return list
      .filter((emp: any) => {
        const roleLower = getRoleName(emp);
        return (
          roleLower === roles.ADMIN ||
          roleLower === roles.TEAM_LEAD ||
          roleLower === roles.PROJECT_MANAGER
        );
      })
      .map((emp: any) => ({
        value: emp.id,
        label: emp.fullName,
      }));
  }, [approverList]);

  const balanceUserId =
    (canViewManagerTabs && listParams.employeeId) || currentEmployeeId;

  const { data: allBalanceData, isPending: balanceLoading } =
    useGetAllLeaveBalances(balanceUserId) as any;

  const { isPending: pendingLeavesLoading } = useGetLeaveData({
    employeeId: balanceUserId,
    status: ["pending"],
    pagination: false,
  });

  const balanceArray = useMemo(() => {
    return Array.isArray(allBalanceData)
      ? allBalanceData
      : Array.isArray(allBalanceData?.data)
        ? allBalanceData.data
        : [];
  }, [allBalanceData]);

  const { data: activeUserDetails } = useGetUserDetails(
    balanceUserId ? String(balanceUserId) : ""
  ) as any;

  const isExamLeaveEligible = useMemo(() => {
    return !!(
      (balanceUserId === currentEmployeeId &&
        user?.user?.isExamLeaveEligible) ||
      activeUserDetails?.data?.isExamLeaveEligible
    );
  }, [balanceUserId, currentEmployeeId, user, activeUserDetails]);

  // const handleSearch = (search: string | undefined) => {
  //   setQueryParams({ ...listParams, search: search ?? "", currentPage: 1 });
  // };

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
      tab: val,
      currentPage: 1,
      pageSize: 10,
      search: "",
      employeeId: null,
      approver: null,
      startDate: null,
      endDate: null,
      sortBy: null,
      sortOrder: null,
      leaveTypeId: null,
    });
  };

  const filters: FilterConfig[] = [
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
    {
      type: "select" as const,
      key: "approver",
      placeholder:
        queryParams.tab === "pending"
          ? "Filter by approver"
          : queryParams.tab === "approved"
            ? "Filter by approved by"
            : "Filter by rejected by",
      options: approverOptions,
      value: listParams.approver?.toString(),
      onChange: (value: any) => {
        setQueryParams({
          ...listParams,
          approver: value ? Number(value) : null,
          currentPage: 1,
        });
      },
      isLoading: approverListLoading,
    },
    {
      type: "select" as const,
      key: "leaveTypeId",
      placeholder: "Filter by leave type",
      options: LEAVE_TYPE.map((type) => ({
        value: type.value,
        label: type.label,
      })),
      value: listParams.leaveTypeId?.toString(),
      onChange: (value: any) => {
        setQueryParams({
          ...listParams,
          leaveTypeId: value ? Number(value) : null,
          currentPage: 1,
        });
      },
    },
  ];

  const tableColumns = useMemo(() => {
    const isDevOrBDE = isDeveloper || isBDE;
    return getColumns(queryParams.tab).filter((col: any) => {
      if (col.accessorKey === "status") {
        return isDevOrBDE;
      }
      if (col.accessorKey === "rejectionReason") {
        return isDevOrBDE || queryParams.tab === "rejected";
      }
      return true;
    });
  }, [isDeveloper, isBDE, queryParams.tab]);

  const sortingState = useMemo<SortingState>(() => {
    if (!queryParams.sortBy) return [];
    return [
      {
        id: queryParams.sortBy,
        desc: queryParams.sortOrder === "desc",
      },
    ];
  }, [queryParams.sortBy, queryParams.sortOrder]);

  const handleSortingChange = (newSorting: SortingState) => {
    if (newSorting.length > 0) {
      const first = newSorting[0];
      setQueryParams({
        sortBy: first.id,
        sortOrder: first.desc ? "desc" : "asc",
        currentPage: 1,
      });
    } else {
      setQueryParams({
        sortBy: null,
        sortOrder: null,
      });
    }
  };

  const totalCount = (listData as any)?.metadata?.totalCount ?? 0;

  return (
    <div className="flex flex-col gap-6">
      <LeaveBalanceCards
        balanceData={balanceArray}
        loading={Boolean(balanceLoading || pendingLeavesLoading)}
        isExamLeaveEligible={isExamLeaveEligible}
      />

      {showStatusTabs && (
        <div className="flex border-b border-gray-150 dark:border-slate-800">
          {["pending", "approved", "rejected"].map((tab) => (
            <button
              key={tab}
              onClick={() => handleStatusTabChange(tab)}
              className={`px-4 py-2 text-sm font-semibold capitalize transition-all border-b-2 -mb-[1px] ${
                queryParams.tab === tab
                  ? "border-rose-500 text-rose-500"
                  : "border-transparent text-gray-500 hover:text-gray-700 dark:text-slate-400 dark:hover:text-slate-200"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      )}

      <GlobalFilterSection filters={filters ?? []} />

      <GlobalTable
        pageSize={listParams.pageSize}
        currentPage={listParams.currentPage}
        totalCount={totalCount}
        data={(listData as any)?.data ?? []}
        columns={tableColumns}
        loading={loading}
        isPaginationEnabled
        enableSorting
        sorting={sortingState}
        onSortingChange={handleSortingChange}
        manualSorting
        onPaginationChange={handlePaginationChange}
      />
    </div>
  );
}
