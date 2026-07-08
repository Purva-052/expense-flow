/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import useFetchData from "@/hooks/use-fetch-data";
import API from "@/config/api/api";
import instance from "@/config/instance/instance";
import { toast } from "sonner";
import { Loader2, CheckCircle, XCircle, ClockAlert } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import SimpleDropDownSearchable from "@/components/shared/custome-simple-dropdown";
import { useGetUserDropdownList } from "../../users/services";

interface LateInDeductionRow {
  employeeId: number;
  employeeName: string;
  weekStartDate: string;
  weekEndDate: string;
  weekNumber: number;
  lateInCount: number;
  leaveDeductionStatus: string;
}

const formatDateRange = (startStr: string, endStr: string) => {
  if (!startStr || !endStr) return "-";
  try {
    const partsStart = startStr.split("-");
    const partsEnd = endStr.split("-");
    if (partsStart.length < 3 || partsEnd.length < 3)
      return `${startStr} - ${endStr}`;
    const startFormatted = `${partsStart[2]}/${partsStart[1]}/${partsStart[0]}`;
    const endFormatted = `${partsEnd[2]}/${partsEnd[1]}/${partsEnd[0]}`;
    return `${startFormatted} - ${endFormatted}`;
  } catch {
    return `${startStr} - ${endStr}`;
  }
};

export const LateInLeaveDeductions: React.FC = () => {
  const queryClient = useQueryClient();

  const [currentStatusFilter, setCurrentStatusFilter] = useState<string>("");
  const [currentEmployeeFilter, setCurrentEmployeeFilter] = useState<
    number | null
  >(null);

  // Fetch late-in deduction list
  const { data: fetchRes, isPending: isLoading } = useFetchData({
    url: API.attendance.late_deduction_list,
    params: {
      ...(currentStatusFilter ? { status: currentStatusFilter } : {}),
      ...(currentEmployeeFilter ? { employeeId: currentEmployeeFilter } : {}),
    },
  });

  const { data: employeeDropdownData, isPending: isLoadingEmployees } =
    useGetUserDropdownList({ status: "active" });

  const employeeOptions = useMemo(
    () =>
      ((employeeDropdownData as any)?.data || []).map((emp: any) => ({
        value: String(emp.employee?.id || emp.employeeId || emp.id),
        label: emp.fullName,
      })),
    [employeeDropdownData]
  );

  // Action mutation (deduct or ignore)
  const { mutate: performAction, variables } = useMutation({
    mutationFn: async ({
      employeeId,
      weekStartDate,
      action,
    }: {
      employeeId: number;
      weekStartDate: string;
      action: "deduct" | "ignore";
    }) => {
      const url = API.attendance.late_deduction_action(
        String(employeeId),
        weekStartDate
      );

      return await instance.post({
        url,
        data: { action },
      });
    },
    onSuccess: (res: any) => {
      toast.success(res?.message || "Action applied successfully", {
        position: "top-right",
      });
      queryClient.invalidateQueries({
        queryKey: [API.attendance.late_deduction_list],
      });
    },
    onError: (err: any) => {
      toast.error(err?.message || "Failed to apply action", {
        position: "top-right",
      });
    },
  });

  const listData: LateInDeductionRow[] = (fetchRes as any)?.data || [];
  const pendingCount = listData.filter(
    (r) =>
      !r.leaveDeductionStatus ||
      r.leaveDeductionStatus.toLowerCase() === "pending"
  ).length;

  return (
    <div className="w-full">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 px-4 py-3 border-b border-border bg-card">
        <div className="flex items-center gap-2">
          <ClockAlert className="h-4 w-4 text-amber-500" />
          <span className="text-sm font-semibold text-foreground">
            Late-In Leave Deductions
          </span>
          {pendingCount > 0 && (
            <span className="text-[10px] font-bold bg-amber-500 text-white rounded-full px-1.5 py-0.5">
              {pendingCount}
            </span>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Status Filter */}
          <SimpleDropDownSearchable
            options={[
              { value: "pending", label: "Pending" },
              { value: "deducted", label: "Deducted" },
              { value: "ignored", label: "Ignored" },
            ]}
            value={currentStatusFilter || undefined}
            placeholder="Filter by status"
            className="w-full sm:w-[160px]"
            onChange={(value) => setCurrentStatusFilter((value as any) || "")}
            allowClear
          />

          {/* Employee Filter */}
          <SimpleDropDownSearchable
            options={employeeOptions}
            value={
              currentEmployeeFilter ? String(currentEmployeeFilter) : undefined
            }
            placeholder="Filter by employee"
            className="w-full sm:w-[220px]"
            isLoading={isLoadingEmployees}
            onChange={(value) =>
              setCurrentEmployeeFilter(value ? Number(value) : null)
            }
            allowClear
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="bg-muted border-b border-border text-muted-foreground text-xs font-bold">
              <th className="px-4 py-2.5 bg-muted">Employee</th>
              <th className="px-4 py-2.5 bg-muted">Week Duration</th>
              <th className="px-4 py-2.5 bg-muted">Late In Count</th>
              <th className="px-4 py-2.5 bg-muted">Status</th>
              <th className="px-4 py-2.5 bg-muted text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border text-xs text-foreground">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, index) => (
                <tr key={index} className="border-b border-border">
                  <td className="px-4 py-3">
                    <div className="h-4 w-32 bg-muted animate-pulse rounded" />
                  </td>
                  <td className="px-4 py-3">
                    <div className="h-4 w-28 bg-muted animate-pulse rounded" />
                  </td>
                  <td className="px-4 py-3">
                    <div className="h-4 w-12 bg-muted animate-pulse rounded" />
                  </td>
                  <td className="px-4 py-3">
                    <div className="h-6 w-20 bg-muted animate-pulse rounded-md" />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-center gap-2">
                      <div className="h-7 w-16 bg-muted animate-pulse rounded-lg" />
                      <div className="h-7 w-16 bg-muted animate-pulse rounded-lg" />
                    </div>
                  </td>
                </tr>
              ))
            ) : listData.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="text-center py-10 text-muted-foreground text-xs font-medium"
                >
                  <CheckCircle className="h-8 w-8 mx-auto text-emerald-500 mb-2 opacity-60" />
                  No late-in records found.
                </td>
              </tr>
            ) : (
              listData.map((row) => {
                const {
                  employeeId,
                  employeeName,
                  weekStartDate,
                  weekEndDate,
                  leaveDeductionStatus,
                  lateInCount,
                } = row;

                const status = leaveDeductionStatus || "Pending";
                const isPending = status.toLowerCase() === "pending";
                const isDeducted = status.toLowerCase() === "deducted";
                const isIgnored = status.toLowerCase() === "ignored";

                let badgeStyle =
                  "text-yellow-600 dark:text-yellow-400 bg-yellow-500/10 border-yellow-500/30";
                if (isDeducted) {
                  badgeStyle =
                    "text-rose-600 dark:text-rose-400 bg-rose-500/10 border-rose-500/30";
                } else if (isIgnored) {
                  badgeStyle =
                    "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/30";
                }

                const isDeductionLoading =
                  variables?.employeeId === employeeId &&
                  variables?.weekStartDate === weekStartDate &&
                  variables?.action === "deduct";

                const isIgnoreLoading =
                  variables?.employeeId === employeeId &&
                  variables?.weekStartDate === weekStartDate &&
                  variables?.action === "ignore";

                return (
                  <tr
                    key={`${employeeId}-${weekStartDate}`}
                    className="hover:bg-muted/10 transition-colors"
                  >
                    <td className="px-4 py-2.5 font-bold text-foreground">
                      {employeeName}
                    </td>
                    <td className="px-4 py-2.5 font-semibold text-muted-foreground">
                      {formatDateRange(weekStartDate, weekEndDate)}
                    </td>
                    <td className="px-4 py-2.5 font-medium text-muted-foreground">
                      {lateInCount}
                    </td>
                    <td className="px-4 py-2.5">
                      <Badge
                        className={`flex items-center gap-1 w-fit text-[10px] font-semibold rounded-md px-2 py-0.5 border ${badgeStyle}`}
                      >
                        {status.charAt(0).toUpperCase() +
                          status.slice(1).toLowerCase()}
                      </Badge>
                    </td>
                    <td className="px-4 py-2.5 text-center">
                      {isPending ? (
                        <div className="flex items-center justify-center gap-1.5">
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 text-[11px] gap-1 border-rose-500/40 text-rose-600 hover:bg-rose-500/10 hover:text-rose-700"
                            disabled={isDeductionLoading || isIgnoreLoading}
                            onClick={() =>
                              performAction({
                                employeeId,
                                weekStartDate,
                                action: "deduct",
                              })
                            }
                          >
                            {isDeductionLoading ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              <CheckCircle className="h-3 w-3" />
                            )}
                            Deduct
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 text-[11px] gap-1 border-zinc-500/40 text-zinc-650 hover:bg-zinc-500/10"
                            disabled={isDeductionLoading || isIgnoreLoading}
                            onClick={() =>
                              performAction({
                                employeeId,
                                weekStartDate,
                                action: "ignore",
                              })
                            }
                          >
                            {isIgnoreLoading ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              <XCircle className="h-3 w-3" />
                            )}
                            Ignore
                          </Button>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
