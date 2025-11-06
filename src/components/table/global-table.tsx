/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  DoubleArrowLeftIcon,
  DoubleArrowRightIcon,
} from "@radix-ui/react-icons";
import {
  ColumnDef,
  ColumnFiltersState,
  PaginationState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { SearchX } from "lucide-react";
import { useState } from "react";

interface GlobalTableProps<TData> {
  data: TData[];
  columns: ColumnDef<TData>[];
  totalCount: number;
  currentPage: number;
  pageSize: number;
  onPaginationChange: (pagination: PaginationState) => void;
  isPaginationEnabled?: boolean;
  loading?: boolean;
  scrollY?: string;
}

export function GlobalTable<TData>({
  data,
  columns,
  totalCount,
  currentPage,
  pageSize,
  onPaginationChange,
  isPaginationEnabled = true,
  loading = false,
  scrollY = "55dvh",
}: Readonly<GlobalTableProps<TData>>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  const pagination: PaginationState = {
    pageIndex: currentPage > 0 ? currentPage - 1 : 0,
    pageSize,
  };

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnVisibility,
      columnFilters,
      pagination,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: (updater) => {
      const newPagination =
        typeof updater === "function" ? updater(pagination) : updater;
      onPaginationChange(newPagination);
    },
    manualPagination: true,
    pageCount: Math.ceil((totalCount ?? 0) / (pageSize ?? 10)),
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <div
          className="relative overflow-auto"
          style={{
            maxHeight: scrollY ? scrollY : undefined,
          }}
        >
          <table className="w-full caption-bottom text-sm">
            <thead className="[&_tr]:border-b">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr
                  key={headerGroup.id}
                  className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
                >
                  {headerGroup.headers.map((header: any) => {
                    return (
                      <th
                        key={header.id}
                        className={`h-12 !bg-gray-100 text-black z-50 border-b   px-4 text-left align-middle font-medium  sticky top-0`}
                        style={{ width: header.getSize?.() }}
                      >
                        <div className="flex items-center gap-1.5  whitespace-nowrap">
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                        </div>
                      </th>
                    );
                  })}
                </tr>
              ))}
            </thead>

            <tbody className="[&_tr:last-child]:border-0">
              {loading ? (
                Array.from({ length: pageSize }).map((_, idx) => (
                  <tr
                    key={`skeleton-${idx}`}
                    className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
                  >
                    {table
                      .getAllColumns()
                      .filter((c) => c.getIsVisible())
                      .map((col) => (
                        <td
                          key={`${idx}-${col.id}`}
                          className="p-4 align-middle whitespace-nowrap"
                        >
                          <Skeleton className="h-4 w-full" />
                        </td>
                      ))}
                  </tr>
                ))
              ) : table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
                  >
                    {row.getVisibleCells().map((cell: any) => (
                      <td
                        key={cell.id}
                        className="p-4 align-middle whitespace-nowrap"
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="h-40 px-4 text-center align-middle"
                  >
                    <div className="flex flex-col items-center justify-center space-y-2 text-muted-foreground">
                      <SearchX className="h-8 w-8 text-muted-foreground/70" />
                      <span className="text-lg font-medium">
                        No results found
                      </span>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {isPaginationEnabled && (totalCount ?? 0) > 0 && (
        <div className="flex flex-wrap flex-col gap-y-2 sm:flex-row sm:items-center sm:justify-between w-full">
          <div className="text-sm text-muted-foreground">
            Total <span className="font-medium">{totalCount}</span> records
          </div>

          <div className="flex flex-wrap gap-2 items-center">
            <div className="flex items-center gap-2">
              <p className="hidden text-sm font-medium sm:block">
                Rows per page
              </p>
              <Select
                value={`${table.getState().pagination.pageSize}`}
                onValueChange={(value) => {
                  table.setPageSize(Number(value));
                }}
              >
                <SelectTrigger className="h-8 w-[70px]">
                  <SelectValue
                    placeholder={table.getState().pagination.pageSize}
                  />
                </SelectTrigger>
                <SelectContent side="top">
                  {[10, 20, 30, 40, 50].map((pageSizeOption) => (
                    <SelectItem
                      key={pageSizeOption}
                      value={`${pageSizeOption}`}
                    >
                      {pageSizeOption}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="hidden sm:flex items-center text-sm text-muted-foreground">
              Page{" "}
              <span className="ml-1 font-medium">
                {table.getState().pagination.pageIndex + 1}
              </span>{" "}
              of{" "}
              <span className="ml-1 font-medium">{table.getPageCount()}</span>
            </div>

            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                className="h-8 w-8 p-0"
                onClick={() => table.setPageIndex(0)}
                disabled={!table.getCanPreviousPage()}
              >
                <DoubleArrowLeftIcon className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                className="h-8 w-8 p-0"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                <ChevronLeftIcon className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                className="h-8 w-8 p-0"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                <ChevronRightIcon className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                className="h-8 w-8 p-0"
                onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                disabled={!table.getCanNextPage()}
              >
                <DoubleArrowRightIcon className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
