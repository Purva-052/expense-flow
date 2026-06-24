/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMemo, useState } from "react";
import { parseAsInteger, parseAsString, useQueryStates } from "nuqs";
import { formatDate } from "@/utils/commonFunctions";
import { useAuthStore } from "@/stores/use-auth-store";
import { roles } from "@/utils/constant";
import { useGetLeaveCreditHistory, useDeleteLeaveCreditHistory } from "../services";
import {
  useGetUserDropdownList,
  useImportUsers,
} from "@/features/users/services";
import { Button } from "@/components/ui/button";
import { FileDown, Settings, Trash2 } from "lucide-react";
import { DeleteModal } from "@/components/model/delete-model";
import { cn } from "@/lib/utils";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import * as ExcelJS from "exceljs";
import API from "@/config/api/api";
import {
  ExcelImportPreview,
  ExcelPreviewData,
} from "@/features/kanban-board/components/project-view/excel-import-preview";
import { FilterConfig } from "@/components/table/table-toolbar";
import GlobalFilterSection from "@/components/table/global-table-filter";
import { GlobalTable } from "@/components/table/global-table";

interface BalanceLogsTabProps {
  onAdjustLeavesClick: () => void;
}

export function BalanceLogsTab({ onAdjustLeavesClick }: BalanceLogsTabProps) {
  // export function BalanceLogsTab() {
  const user = useAuthStore((state) => state.user);
  const rawRole = user?.role || user?.user?.role;
  const roleName = String(
    rawRole && typeof rawRole === "object" ? rawRole?.name : rawRole || ""
  ).toLowerCase();

  const isAdmin = roleName === roles.ADMIN;
  const canViewManagerTabs = isAdmin || roleName === roles.PROJECT_MANAGER;

  const [deleteLogOpen, setDeleteLogOpen] = useState(false);
  const [selectedLogForDelete, setSelectedLogForDelete] = useState<any>(null);

  const [queryParams, setQueryParams] = useQueryStates({
    pageSize: parseAsInteger.withDefault(10),
    currentPage: parseAsInteger.withDefault(1),
    search: parseAsString.withDefault(""),
    employeeId: parseAsInteger,
    startDate: parseAsString,
    endDate: parseAsString,
    leaveTypeId: parseAsInteger,
  });

  const listParams = {
    pageSize: queryParams.pageSize,
    currentPage: queryParams.currentPage,
    search: queryParams.search,
    employeeId: queryParams.employeeId,
    startDate: queryParams.startDate,
    endDate: queryParams.endDate,
    leaveTypeId: queryParams.leaveTypeId,
  };

  const creditHistoryApiParams = {
    page: listParams.currentPage,
    limit: listParams.pageSize,
    search: listParams.search || undefined,
    employeeId: isAdmin ? listParams.employeeId || undefined : undefined,
    pagination: true,
    fromDate: listParams.startDate || undefined,
    toDate: listParams.endDate || undefined,
    leaveTypeId: listParams.leaveTypeId || undefined,
  };

  const { data: creditHistoryData, isPending: creditHistoryLoading } =
    useGetLeaveCreditHistory(creditHistoryApiParams);

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

  const creditHistoryList = useMemo(
    () => (creditHistoryData as any)?.data ?? [],
    [creditHistoryData]
  );

  const creditHistoryTotalCount = useMemo(
    () => (creditHistoryData as any)?.metadata?.totalCount ?? 0,
    [creditHistoryData]
  );

  // Excel importing
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
    {
      type: "select" as const,
      key: "leaveTypeId",
      placeholder: "Filter by leave type",
      options: [
        { value: "1", label: "Casual Leave" },
        { value: "2", label: "Paid Leave" },
      ],
      value: listParams.leaveTypeId?.toString(),
      onChange: (value: any) => {
        setQueryParams({
          ...listParams,
          leaveTypeId: value ? Number(value) : null,
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
  ];

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
            num === 0
              ? "0"
              : isNegative
                ? `-${formattedNum}`
                : `+${formattedNum}`;
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
      ...(isAdmin
        ? [
            {
              id: "actions",
              header: "Actions",
              cell: ({ row }: any) => {
                const log = row.original;
                return (
                  <div className="flex justify-end">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive shrink-0"
                      onClick={() => {
                        setSelectedLogForDelete(log);
                        setDeleteLogOpen(true);
                      }}
                      title="Delete Balance Log"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                );
              },
            },
          ]
        : []),
    ],
    [isAdmin]
  );

  return (
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
            >
              <FileDown className="w-4 h-4 mr-2" />
              {isImportUploading || isParsingFile
                ? "Importing..."
                : "Import Leaves"}
            </Button>
            <Button onClick={onAdjustLeavesClick} className="shrink-0 w-fit">
              <Settings className="mr-2 h-4 w-4" />
              Leave Settings
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

      <ExcelImportPreview
        open={previewOpen}
        onOpenChange={setPreviewOpen}
        data={previewData}
        fileName={selectedFile?.name || ""}
        isLoading={isParsingFile}
        onConfirm={handleImportPreviewConfirm}
      />

      {selectedLogForDelete && (
        <BalanceLogDeleteModal
          isOpen={deleteLogOpen}
          onClose={() => {
            setDeleteLogOpen(false);
            setSelectedLogForDelete(null);
          }}
          log={selectedLogForDelete}
        />
      )}
    </div>
  );
}

function BalanceLogDeleteModal({
  isOpen,
  onClose,
  log,
}: {
  isOpen: boolean;
  onClose: () => void;
  log: any;
}) {
  const { mutate: deleteLog, isPending } = useDeleteLeaveCreditHistory(log.id, onClose);

  return (
    <DeleteModal
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={deleteLog}
      itemName={`this balance log adjustment of ${log.adjustment} days for ${log.employee?.fullName}`}
      loading={isPending}
    />
  );
}
