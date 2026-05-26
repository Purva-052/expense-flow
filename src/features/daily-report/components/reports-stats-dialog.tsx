import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { GlobalTable } from "@/components/table/global-table";
import { useGetReportDetails, useExportPendingReports } from "../services";
import { useEffect, useState, type UIEvent } from "react";
import { ArrowUp, ArrowDown, Download } from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import GlobalFilterSection from "@/components/table/global-table-filter";
import { FilterConfig } from "@/components/table/table-toolbar";
import { formatDate } from "@/utils/commonFunctions";
import { useGetUserDropdownList } from "@/features/users/services";
import { roles } from "@/utils/constant";
import { useAuthStore } from "@/stores/use-auth-store";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

type ReportType = "pending" | "incomplete" | "holiday" | null;

interface ListParams {
  pageSize: number;
  currentPage: number;
  search: string;
  fromDate?: string;
  toDate?: string;
  userId?: string;
}

interface ReportsStatsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: ReportType;
  reportingDate?: string;
  userId?: string;
}

export function ReportsStatsDialog({
  open,
  onOpenChange,
  type,
  reportingDate,
  userId,
}: ReportsStatsDialogProps) {
  const { user } = useAuthStore();
  const userRole = String(user?.user?.role ?? user?.role ?? "");
  // Temporary check for account manager role until backend provides a proper role
  // user?.user_id can be string | undefined, compare numerically to avoid type mismatch
  const isAccountManager = Number(user?.user.id) === 170;
  const canFilterByEmployee =
    [roles.TEAM_LEAD, roles.PROJECT_MANAGER, roles.ADMIN].includes(userRole) ||
    isAccountManager;

  const exportPendingReports =
    isAccountManager || [roles.PROJECT_MANAGER, roles.ADMIN].includes(userRole);

  const [currentType, setCurrentType] = useState<ReportType>(type);
  const { mutate: exportPending, isPending: exportPendingLoading } =
    useExportPendingReports();

  const handleExportPending = () => {
    const payload: Record<string, any> = {};
    if (listParams.userId) {
      payload.employeeId = Number(listParams.userId);
    }
    if (listParams.fromDate) {
      payload.fromDate = listParams.fromDate;
    }
    if (listParams.toDate) {
      payload.toDate = listParams.toDate;
    }

    exportPending(payload, {
      onSuccess: (response: any) => {
        const fileBlob = response?.blob;
        let filename =
          response?.filename ||
          `pending_reports_export_${format(new Date(), "yyyy-MM-dd")}.xlsx`;

        if (listParams.fromDate && listParams.toDate) {
          const extension = filename.split(".").pop() || "xlsx";
          filename = `pending_reports_export_${listParams.fromDate}_to_${listParams.toDate}.${extension}`;
        }

        if (fileBlob) {
          const fileUrl = URL.createObjectURL(fileBlob);
          const link = document.createElement("a");
          link.href = fileUrl;
          link.download = filename;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(fileUrl);
          toast.success("Pending reports export generated successfully");
        } else {
          console.error("No file URL found in response:", response);
          toast.error("Failed to generate export file");
        }
      },
      onError: (error: Error) => {
        console.error("Pending reports export failed:", error);
      },
    });
  };
  const [listParams, setListParams] = useState<ListParams>(() => {
    const isHoliday = type === "holiday";
    return {
      pageSize: isHoliday ? 100 : 10,
      currentPage: 1,
      search: "",
      fromDate: isHoliday ? undefined : reportingDate || undefined,
      toDate: isHoliday ? undefined : reportingDate || undefined,
      userId: userId || undefined,
    };
  });
  const [sortField, setSortField] = useState<
    "fullName" | "reportingDate" | null
  >(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  const [accumulatedData, setAccumulatedData] = useState<any[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const { data: usersList, isPending: usersListLoading }: any =
    useGetUserDropdownList({
      role: [
        roles.TEAM_LEAD,
        // roles.ADMIN,
        // roles.PROJECT_MANAGER,
        roles.DEVELOPER,
      ],
      status: "active",
    });

  useEffect(() => {
    if (type) {
      setCurrentType(type);
      const isHoliday = type === "holiday";
      // Reset filter params and accumulated data when type changes
      setListParams({
        pageSize: isHoliday ? 100 : 10,
        currentPage: 1,
        search: "",
        fromDate: isHoliday ? undefined : reportingDate || undefined,
        toDate: isHoliday ? undefined : reportingDate || undefined,
        userId: userId || undefined,
      });
      setAccumulatedData([]);
      setHasMore(true);
      // Reset sorting when type changes
      setSortField(null);
      setSortOrder("asc");
    }
  }, [type, reportingDate, userId]);

  const sortByParam =
    sortField === "fullName"
      ? "name"
      : sortField === "reportingDate"
        ? "date"
        : undefined;

  const {
    data: listData,
    isPending: loading,
    isFetching,
  } = useGetReportDetails({
    type: currentType ?? "",
    fromDate: listParams.fromDate,
    toDate: listParams.toDate,
    search: listParams.search,
    userId: listParams.userId,
    page: listParams.currentPage,
    limit: listParams.pageSize,
    sortBy: sortByParam,
    sortOrder: sortByParam ? sortOrder : undefined,
  });

  useEffect(() => {
    if (listData) {
      const fetchedData = (listData as any)?.data ?? [];
      const metadata = (listData as any)?.metadata;

      setAccumulatedData((prev) => {
        if (listParams.currentPage === 1) return fetchedData;
        const combined = [...prev, ...fetchedData];
        // Ensure no duplicates by ID if data has it, otherwise just append
        return combined.filter(
          (item, index, self) =>
            index === self.findIndex((t) => (t.id ? t.id === item.id : true))
        );
      });

      if (metadata) {
        setHasMore(listParams.currentPage < metadata.totalPages);
      } else {
        setHasMore(fetchedData.length === listParams.pageSize);
      }
    }
  }, [listData, listParams.currentPage, listParams.pageSize]);

  const handleSort = (field: "fullName" | "reportingDate") => {
    const nextSortOrder =
      sortField === field ? (sortOrder === "asc" ? "desc" : "asc") : "asc";

    setSortField(field);
    setSortOrder(nextSortOrder);
    setAccumulatedData([]);
    setHasMore(true);
    setListParams((prev) => ({
      ...prev,
      currentPage: 1,
    }));
  };

  const getSortedData = (data: any[]) => {
    if (!sortField) return data;

    const sorted = [...data].sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];

      if (sortField === "reportingDate") {
        aVal = new Date(aVal).getTime();
        bVal = new Date(bVal).getTime();
      } else if (sortField === "fullName") {
        aVal = String(aVal).toLowerCase();
        bVal = String(bVal).toLowerCase();
      }

      if (aVal < bVal) return sortOrder === "asc" ? -1 : 1;
      if (aVal > bVal) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

    return sorted;
  };

  const sortedAccumulatedData = getSortedData(accumulatedData);

  const handlePaginationChange = (newPagination: {
    pageIndex: number;
    pageSize: number;
  }) => {
    setListParams({
      ...listParams,
      pageSize: newPagination.pageSize,
      currentPage: newPagination.pageIndex + 1,
    });
  };

  const handleListScroll = (event: UIEvent<HTMLDivElement>) => {
    const target = event.currentTarget;
    const reachedBottom =
      target.scrollTop + target.clientHeight >= target.scrollHeight - 50;

    if (reachedBottom && hasMore && !loading && !isFetching) {
      setListParams((prev) => ({
        ...prev,
        currentPage: prev.currentPage + 1,
      }));
    }
  };

  const filters: FilterConfig[] =
    currentType !== "holiday"
      ? [
          {
            type: "search",
            placeholder: "Search...",
            key: "search",
            value: listParams.search,
            onChange: (value: any) => {
              setListParams({
                ...listParams,
                search: value ?? "",
                currentPage: 1,
              });
              setAccumulatedData([]);
            },
          },
          {
            type: "dateRange",
            key: "dateRange",
            placeholder: "Filter by Date",
            disable: { after: new Date() },
            value: {
              from: listParams.fromDate
                ? new Date(listParams.fromDate)
                : undefined,
              to: listParams.toDate ? new Date(listParams.toDate) : undefined,
            },
            onChange: (range?: { from?: Date; to?: Date }) => {
              setListParams({
                ...listParams,
                fromDate: formatDate(range?.from),
                toDate: formatDate(range?.to),
                currentPage: 1,
              });
              setAccumulatedData([]);
            },
          },
          ...(canFilterByEmployee
            ? [
                {
                  type: "select",
                  key: "userId",
                  placeholder: "Filter by Employee",
                  options: usersList?.data?.map((user: any) => ({
                    value: user.id,
                    label: user.fullName,
                  })),
                  value: listParams.userId,
                  onChange: (value: any) => {
                    setListParams({
                      ...listParams,
                      userId: value ?? undefined,
                      currentPage: 1,
                    });
                    setAccumulatedData([]);
                  },
                  isLoading: usersListLoading,
                },
              ]
            : []),
        ]
      : [];

  const columns: ColumnDef<any>[] =
    currentType === "pending"
      ? [
          {
            accessorKey: "fullName",
            header: () => (
              <div className="flex items-center gap-2">
                <span>Employee Name</span>
                <div
                  className="flex flex-col gap-0 cursor-pointer"
                  onClick={() => handleSort("fullName")}
                >
                  <ArrowUp
                    size={12}
                    className={`${
                      sortField === "fullName" && sortOrder === "asc"
                        ? "text-blue-600"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  />
                  <ArrowDown
                    size={12}
                    className={`-mt-1 ${
                      sortField === "fullName" && sortOrder === "desc"
                        ? "text-blue-600"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  />
                </div>
              </div>
            ),
          },
          {
            accessorKey: "reportingDate",
            header: () => (
              <div className="flex items-center gap-2">
                <span>Reporting Date</span>
                <div
                  className="flex flex-col gap-0 cursor-pointer"
                  onClick={() => handleSort("reportingDate")}
                >
                  <ArrowUp
                    size={12}
                    className={`${
                      sortField === "reportingDate" && sortOrder === "asc"
                        ? "text-blue-600"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  />
                  <ArrowDown
                    size={12}
                    className={`-mt-1 ${
                      sortField === "reportingDate" && sortOrder === "desc"
                        ? "text-blue-600"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  />
                </div>
              </div>
            ),
            cell: ({ row }: any) =>
              format(new Date(row.original.reportingDate), "dd/MM/yyyy"),
          },
        ]
      : currentType === "holiday"
        ? [
            {
              accessorKey: "description",
              header: "Holiday Name",
              cell: ({ row }: any) => {
                const holidayDate = new Date(row.original.date);
                const today = new Date();
                const isPast = holidayDate < new Date(today.toDateString());

                return (
                  <span
                    className={`${isPast ? "text-gray-400 line-through" : ""}`}
                  >
                    {row.original.description}
                  </span>
                );
              },
            },
            {
              accessorKey: "date",
              header: "Holiday Date",
              cell: ({ row }: any) => {
                const holidayDate = new Date(row.original.date);
                const today = new Date();
                const isPast = holidayDate < new Date(today.toDateString());

                return (
                  <span
                    className={`${isPast ? "text-gray-400 line-through" : ""}`}
                  >
                    {format(holidayDate, "dd/MM/yyyy")}
                  </span>
                );
              },
            },
            {
              accessorKey: "day",
              header: "Day",
              cell: ({ row }: any) => {
                const holidayDate = new Date(row.original.date);
                const today = new Date();
                const isPast = holidayDate < new Date(today.toDateString());

                return (
                  <span
                    className={`${isPast ? "text-gray-400 line-through" : ""}`}
                  >
                    {row.original.day}
                  </span>
                );
              },
            },
          ]
        : [
            {
              accessorKey: "fullName",
              header: () => (
                <div className="flex items-center gap-2">
                  <span>Employee Name</span>
                  <div
                    className="flex flex-col gap-0 cursor-pointer"
                    onClick={() => handleSort("fullName")}
                  >
                    <ArrowUp
                      size={12}
                      className={`${
                        sortField === "fullName" && sortOrder === "asc"
                          ? "text-blue-600"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    />
                    <ArrowDown
                      size={12}
                      className={`-mt-1 ${
                        sortField === "fullName" && sortOrder === "desc"
                          ? "text-blue-600"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    />
                  </div>
                </div>
              ),
            },
            {
              accessorKey: "reportingDate",
              header: () => (
                <div className="flex items-center gap-2">
                  <span>Reporting Date</span>
                  <div
                    className="flex flex-col gap-0 cursor-pointer"
                    onClick={() => handleSort("reportingDate")}
                  >
                    <ArrowUp
                      size={12}
                      className={`${
                        sortField === "reportingDate" && sortOrder === "asc"
                          ? "text-blue-600"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    />
                    <ArrowDown
                      size={12}
                      className={`-mt-1 ${
                        sortField === "reportingDate" && sortOrder === "desc"
                          ? "text-blue-600"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    />
                  </div>
                </div>
              ),
              cell: ({ row }: any) =>
                format(new Date(row.original.reportingDate), "dd/MM/yyyy"),
            },
            {
              accessorKey: "workingHours",
              header: "Working Hours",
              cell: ({ row }: any) => {
                const val = row.original.workingHours;
                if (!val) return "0:00";
                return String(val).includes(":")
                  ? val
                  : parseFloat(String(val)).toFixed(2).replace(".", ":");
              },
            },
          ];

  // Each row is ~53px tall, header ~45px, pagination ~52px
  const ROW_HEIGHT = 53;
  const HEADER_HEIGHT = 45;
  const PAGINATION_HEIGHT = 52;
  const tableMinHeight =
    HEADER_HEIGHT + ROW_HEIGHT * listParams.pageSize + PAGINATION_HEIGHT;
  const totalCount = (listData as any)?.metadata?.totalCount;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[60vw] max-w-none max-h-[90vh] flex flex-col sm:max-w-none">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle className="capitalize">
            {currentType === "holiday"
              ? "Holiday List 2026"
              : `${currentType} Reports`}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-4 flex-1 overflow-hidden flex flex-col">
          {filters.length > 0 && (
            <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
              <div className="flex-1">
                <GlobalFilterSection filters={filters} className="my-0" />
              </div>
              {currentType === "pending" && exportPendingReports && (
                <Button
                  onClick={handleExportPending}
                  disabled={exportPendingLoading}
                  className="whitespace-nowrap h-10 px-5"
                >
                  {exportPendingLoading ? (
                    "Exporting..."
                  ) : (
                    <>
                      <Download className="w-4 h-4 mr-2" />
                      Export Pending Reports
                    </>
                  )}
                </Button>
              )}
            </div>
          )}

          {currentType === "holiday" ? (
            <div
              onScroll={handleListScroll}
              className="flex-1 overflow-auto border rounded-md"
              style={{ maxHeight: "calc(90vh - 150px)" }}
            >
              <table className="w-full caption-bottom text-sm">
                <thead className="[&_tr]:border-b">
                  <tr className="border-b transition-colors hover:bg-muted/50">
                    {columns.map((col: any) => (
                      <th
                        key={col.accessorKey}
                        className="h-12 bg-muted text-foreground z-50 border-b px-4 text-left align-middle font-medium sticky top-0 whitespace-nowrap"
                      >
                        {col.header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="[&_tr:last-child]:border-0">
                  {loading && accumulatedData.length === 0 ? (
                    Array.from({ length: 10 }).map((_, idx) => (
                      <tr
                        key={`skeleton-${idx}`}
                        className="border-b transition-colors hover:bg-muted/50"
                      >
                        {columns.map((col: any) => (
                          <td
                            key={col.accessorKey}
                            className="p-4 align-middle whitespace-nowrap"
                          >
                            <Skeleton className="h-4 w-full" />
                          </td>
                        ))}
                      </tr>
                    ))
                  ) : (
                    <>
                      {sortedAccumulatedData.map((item, idx) => (
                        <tr
                          key={item.id ?? idx}
                          className="border-b transition-colors hover:bg-muted/50"
                        >
                          {columns.map((col: any) => (
                            <td
                              key={col.accessorKey}
                              className="p-4 align-middle whitespace-nowrap"
                            >
                              {col.cell
                                ? col.cell({
                                    row: { original: item },
                                  } as any)
                                : item[col.accessorKey]}
                            </td>
                          ))}
                        </tr>
                      ))}
                      {accumulatedData.length === 0 && !loading && (
                        <tr>
                          <td
                            colSpan={columns.length}
                            className="h-24 text-center align-middle"
                          >
                            No holidays found.
                          </td>
                        </tr>
                      )}
                    </>
                  )}
                </tbody>
              </table>
              {(loading || isFetching) && (
                <div className="flex justify-center py-4">
                  <span className="text-muted-foreground animate-pulse">
                    Loading...
                  </span>
                </div>
              )}
            </div>
          ) : (
            <div style={{ minHeight: tableMinHeight }}>
              <GlobalTable<any>
                pageSize={listParams.pageSize}
                currentPage={listParams.currentPage}
                totalCount={totalCount ?? 0}
                data={getSortedData((listData as any)?.data ?? [])}
                onPaginationChange={handlePaginationChange}
                columns={columns}
                loading={loading}
                isPaginationEnabled
              />
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
