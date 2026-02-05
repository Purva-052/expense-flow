import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { GlobalTable } from "@/components/table/global-table";
import { useGetReportDetails } from "../services";
import { useState } from "react";
import { format } from "date-fns";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface ReportsStatsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: "pending" | "incomplete" | null;
  reportingDate?: string;
}

export function ReportsStatsDialog({
  open,
  onOpenChange,
  type,
  reportingDate,
}: ReportsStatsDialogProps) {
  const [listParams, setListParams] = useState({
    pageSize: 10,
    currentPage: 1,
    search: "",
  });

  const { data: listData, isPending: loading } = useGetReportDetails({
    type: type!,
    reportingDate,
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

  const columns =
    type === "pending"
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
      <DialogContent className="w-[45vw] max-w-none max-h-[90vh] flex flex-col sm:max-w-none">
        <DialogHeader>
          <DialogTitle className="capitalize">{type} Reports</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-4">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search..."
              className="pl-8"
              value={listParams.search}
              onChange={(e) =>
                setListParams({
                  ...listParams,
                  search: e.target.value,
                  currentPage: 1,
                })
              }
            />
          </div>
          <GlobalTable<any>
            pageSize={listParams.pageSize}
            currentPage={listParams.currentPage}
            totalCount={totalCount ?? 0}
            data={(listData as any)?.data ?? []}
            onPaginationChange={handlePaginationChange}
            columns={columns}
            loading={loading}
            isPaginationEnabled
            scrollY="40dvh"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
