/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMemo } from "react";
import { parseAsInteger, parseAsString, useQueryStates } from "nuqs";
import { FilterConfig } from "@/components/table/table-toolbar";
import GlobalFilterSection from "@/components/table/global-table-filter";
import { GlobalTable } from "@/components/table/global-table";
import { useGetUserDropdownList } from "@/features/users/services";
import { useGetTechnologyDropdownList } from "@/features/technology/services";
import { useGetAbsentEmployees } from "../services";
import { roles } from "@/utils/constant";
// import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/utils/commonFunctions";

export function AbsentEmployeesTab() {
  const [queryParams, setQueryParams] = useQueryStates({
    pageSize: parseAsInteger.withDefault(10),
    currentPage: parseAsInteger.withDefault(1),
    search: parseAsString.withDefault(""),
    employeeId: parseAsInteger,
    technologyId: parseAsInteger,
    fromDate: parseAsString,
    toDate: parseAsString,
  });

  const listParams = {
    pageSize: queryParams.pageSize,
    currentPage: queryParams.currentPage,
    search: queryParams.search,
    employeeId: queryParams.employeeId,
    technologyId: queryParams.technologyId,
    fromDate: queryParams.fromDate,
    toDate: queryParams.toDate,
  };

  const apiParams = {
    page: listParams.currentPage,
    limit: listParams.pageSize,
    search: listParams.search || undefined,
    employeeId: listParams.employeeId || undefined,
    technologyId: listParams.technologyId || undefined,
    fromDate: listParams.fromDate || undefined,
    toDate: listParams.toDate || undefined,
    startDate: listParams.fromDate || undefined,
    endDate: listParams.toDate || undefined,
    pagination: true,
  };

  const { data: absentData, isPending: loading } =
    useGetAbsentEmployees(apiParams);

  // Fetch dropdowns
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

  const { data: technologyList, isPending: techListLoading } =
    useGetTechnologyDropdownList() as any;

  const filters: FilterConfig[] = [
    // {
    //   type: "search",
    //   placeholder: "Search name or code...",
    //   key: "search",
    //   value: listParams.search || "",
    //   onChange: (search: string | undefined) => {
    //     setQueryParams({ ...listParams, search: search ?? "", currentPage: 1 });
    //   },
    // },
    {
      type: "select" as const,
      key: "employeeId",
      placeholder: "Filter by Employee",
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
    {
      type: "dateRange",
      key: "dateRange",
      placeholder: "Filter by Date Range",
      value: {
        from: listParams.fromDate ? new Date(listParams.fromDate) : undefined,
        to: listParams.toDate ? new Date(listParams.toDate) : undefined,
      },
      onChange: (range: { from?: Date; to?: Date } | undefined) => {
        setQueryParams({
          ...listParams,
          fromDate: formatDate(range?.from) ?? null,
          toDate: formatDate(range?.to) ?? null,
          currentPage: 1,
        });
      },
    },

    {
      type: "select" as const,
      key: "technologyId",
      placeholder: "Filter by Technology",
      options: technologyList?.data?.map((tech: any) => ({
        value: tech.id,
        label: tech.name,
      })),
      value: listParams.technologyId?.toString(),
      onChange: (value: any) => {
        setQueryParams({
          ...listParams,
          technologyId: value ? Number(value) : null,
          currentPage: 1,
        });
      },
      isLoading: techListLoading,
    },
  ];

  const columns = useMemo(
    () => [
      {
        accessorKey: "date",
        header: "Date",
        cell: ({ row }: any) => {
          const dateVal = row.getValue("date");
          if (!dateVal) return <span>-</span>;
          const dateObj = new Date(dateVal);
          return (
            <span className="font-medium">
              {dateObj.toLocaleDateString("en-IN", {
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            </span>
          );
        },
      },
      {
        accessorKey: "employeeName",
        header: "Employee Name",
        cell: ({ row }: any) => {
          const name = row.getValue("employeeName");
          const code = row.original.employeeCode;
          return (
            <div className="flex flex-col">
              <span className="font-semibold text-gray-900 dark:text-slate-100">
                {name || "-"}
              </span>
              {code && (
                <span className="text-[11px] text-muted-foreground">
                  {code}
                </span>
              )}
            </div>
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
        accessorKey: "reportingManager",
        header: "Reporting Manager",
        cell: ({ row }: any) => {
          const manager = row.getValue("reportingManager");
          return <span>{manager || "-"}</span>;
        },
      },
      // {
      //   accessorKey: "status",
      //   header: "Status",
      //   cell: ({ row }: any) => {
      //     const status = row.getValue("status");
      //     return (
      //       <Badge variant="destructive" className="font-semibold px-2 py-0.5">
      //         {status || "Absent"}
      //       </Badge>
      //     );
      //   },
      // },
    ],
    []
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
            Absent Employees
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            View the listing of employees marked as absent with date,
            technology, and manager details.
          </p>
        </div>
      </div>

      <GlobalFilterSection filters={filters} />

      <GlobalTable
        pageSize={listParams.pageSize}
        currentPage={listParams.currentPage}
        totalCount={(absentData as any)?.metadata?.totalCount ?? 0}
        data={(absentData as any)?.data ?? []}
        columns={columns}
        loading={loading}
        isPaginationEnabled
        onPaginationChange={handlePaginationChange}
      />
    </div>
  );
}
