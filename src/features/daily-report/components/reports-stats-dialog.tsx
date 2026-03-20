import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { GlobalTable } from "@/components/table/global-table";
import { useGetReportDetails } from "../services";
import { useEffect, useState } from "react";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import GlobalFilterSection from "@/components/table/global-table-filter";
import { FilterConfig } from "@/components/table/table-toolbar";
import { formatDate } from "@/utils/commonFunctions";

interface ReportsStatsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: "pending" | "incomplete" | "holiday" | null;
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
  const [currentType, setCurrentType] = useState<any>(type);
  const [listParams, setListParams] = useState(() => {
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

  const [accumulatedData, setAccumulatedData] = useState<any[]>([]);
  const [hasMore, setHasMore] = useState(true);

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
    }
  }, [type, reportingDate, userId]);

  const {
    data: listData,
    isPending: loading,
    isFetching,
  } = useGetReportDetails({
    type: currentType!,
    fromDate: listParams.fromDate,
    toDate: listParams.toDate,
    search: listParams.search,
    userId: listParams.userId,
    page: listParams.currentPage,
    limit: listParams.pageSize,
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

  const totalCount = (listData as any)?.metadata?.totalCount;

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

  const handleListScroll = (event: React.UIEvent<HTMLDivElement>) => {
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
        ]
      : [];

  const columns =
    currentType === "pending"
      ? [
          {
            accessorKey: "fullName",
            header: "Employee Name",
          },
          {
            accessorKey: "reportingDate",
            header: "Reporting Date",
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
              header: "Employee Name",
            },
            {
              accessorKey: "reportingDate",
              header: "Reporting Date",
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
            <GlobalFilterSection filters={filters} className="mb-4" />
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
                        className="h-12 bg-gray-100 text-black z-50 border-b px-4 text-left align-middle font-medium sticky top-0 whitespace-nowrap"
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
                      {accumulatedData.map((item, idx) => (
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
                data={(listData as any)?.data ?? []}
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
