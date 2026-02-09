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
import GlobalFilterSection from "@/components/table/global-table-filter";
import { FilterConfig } from "@/components/table/table-toolbar";

interface ReportsStatsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: "pending" | "incomplete" | "holiday" | null;
  reportingDate?: string;
}

export function ReportsStatsDialog({
  open,
  onOpenChange,
  type,
  reportingDate,
}: ReportsStatsDialogProps) {
  const [currentType, setCurrentType] = useState<any>(type);
  const [listParams, setListParams] = useState({
    pageSize: 10,
    currentPage: 1,
    search: "",
    fromDate: reportingDate || undefined,
    toDate: reportingDate || undefined,
  });

  useEffect(() => {
    if (type) {
      setCurrentType(type);
    }
  }, [type]);

  const { data: listData, isPending: loading } = useGetReportDetails({
    type: currentType!,
    fromDate: listParams.fromDate,
    toDate: listParams.toDate,
    search: listParams.search,
    page: listParams.currentPage,
    limit: listParams.pageSize,
  });

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

  const formatDate = (date?: Date) => {
    if (!date) return undefined;
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
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
            },
            {
              accessorKey: "date",
              header: "Holiday Date",
              cell: ({ row }: any) =>
                format(new Date(row.original.date), "dd/MM/yyyy"),
            },
            {
              accessorKey: "day",
              header: "Day",
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
            },
          ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[60vw] max-w-none max-h-[90vh] flex flex-col sm:max-w-none">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle className="capitalize">
            {currentType === "holiday"
              ? "Holiday List"
              : `${currentType} Reports`}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-4">
          <GlobalFilterSection filters={filters} className="mb-4" />
          <GlobalTable<any>
            pageSize={listParams.pageSize}
            currentPage={listParams.currentPage}
            totalCount={totalCount ?? 0}
            data={(listData as any)?.data ?? []}
            onPaginationChange={handlePaginationChange}
            columns={columns}
            loading={loading}
            isPaginationEnabled
            scrollY="45dvh"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
