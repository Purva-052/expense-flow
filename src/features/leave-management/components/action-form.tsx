/* eslint-disable @typescript-eslint/no-explicit-any, no-console */
import { useEffect, useMemo, useState } from "react";
import {
  SubmitHandler,
  useForm,
  useFieldArray,
  useWatch,
} from "react-hook-form";
import { useGetReportDetails } from "../../daily-report/services";
import { useGetUserDetails } from "@/features/users/services";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  format,
  eachDayOfInterval,
  startOfDay,
  isSunday,
  isSaturday,
} from "date-fns";
import { Form } from "@/components/ui/form";
import CustomButton from "@/components/shared/custom-button";
import { leaveSchema, TLeaveFormSchema } from "../schema";
import { useAuthStore } from "@/stores/use-auth-store";
import { roles } from "@/utils/constant";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  useGetAllLeaveBalances,
  useGetLeaveData,
  useGetLeaveDetails,
} from "../services";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

// Sub-components
import { LeaveBalanceSummary } from "./leave-balance-summary";
import { LeaveDaysTable } from "./leave-days-table";
import { LeaveFormFields } from "./leave-form-fields";

// Helpers & Constants
import {
  buildLeaveDays,
  normalizeDateValue,
  isWeekendForDate,
  getListFromResponse,
  toNumber,
  getBalanceArray,
  getLeaveTypeLabel,
  getLeaveTypeBalance,
  getLeaveTypeAllocatedDays,
  formatDays,
  calculateRequestedDays,
  buildLeaveAllocation,
  CASUAL_LEAVE_TYPE_ID,
  PAID_LEAVE_TYPE_ID,
  LOSS_OF_PAY_LEAVE_TYPE_ID,
} from "../types/action-form-helpers";

interface Props {
  currentRow?: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employeesList: any;
  employeesListLoading: boolean;
  loading?: boolean;
  onSubmit: (values: any) => void;
  isViewOnly?: boolean;
}

// ─── Component ─────────────────────────────────────────────────────────────────

export function LeaveActionForm({
  currentRow,
  open,
  onOpenChange,
  employeesList,
  employeesListLoading,
  onSubmit: onSubmitValues,
  loading,
  isViewOnly,
}: Readonly<Props>) {
  const isEdit = !!currentRow;

  const user = useAuthStore((state: any) => state.user);
  const rawRole = user?.role || user?.user?.role;
  const roleName = String(
    rawRole && typeof rawRole === "object" ? rawRole?.name : rawRole || ""
  ).toLowerCase();

  const isAdmin = roleName === roles.ADMIN;
  const canApplyForOthers = isAdmin;

  const currentUserId = user?.user?.id || user?.user_id;

  const [applyTab, setApplyTab] = useState<"self" | "others">("self");

  const form = useForm<TLeaveFormSchema>({
    resolver: zodResolver(leaveSchema) as any,
    mode: "onSubmit",
    defaultValues: {
      reason: "",
      description: "",
      isExamLeave: false,
      leaveTypeId: undefined,
      leaveDays: [],
      attachments: null,
      notifyUserIds: [],
    },
  });

  const { fields, replace } = useFieldArray({
    control: form.control,
    name: "leaveDays",
  });

  const watchFromDate = form.watch("fromDate");
  const watchToDate = form.watch("toDate");
  const watchEmployeeId = form.watch("employeeId");
  const watchIsExamLeave = form.watch("isExamLeave");
  const watchLeaveTypeId = form.watch("leaveTypeId");
  const watchLeaveDays = useWatch({
    control: form.control,
    name: "leaveDays",
  });

  useEffect(() => {
    if (!watchIsExamLeave) {
      form.clearErrors("isExamLeave");
    }
  }, [watchIsExamLeave, form]);

  const employeeOptions = useMemo(() => {
    const list = employeesList?.data || [];
    const optionsList = list.map((u: any) => ({
      value: u.id,
      label: u.fullName,
    }));

    if (currentRow?.employee) {
      const exists = optionsList.some(
        (o: any) => String(o.value) === String(currentRow.employee.id)
      );
      if (!exists) {
        optionsList.push({
          value: currentRow.employee.id,
          label: currentRow.employee.fullName,
        });
      }
    }
    return optionsList;
  }, [employeesList, currentRow]);

  const notifyUserOptions = useMemo(() => {
    const list = employeesList?.data || [];
    return list.map((u: any) => ({
      value: String(u.id),
      label: u.fullName,
    }));
  }, [employeesList]);

  const isSelfApplyMode = !canApplyForOthers || applyTab === "self";
  const editEmployeeId =
    isEdit || isViewOnly
      ? (currentRow?.employeeId ?? currentRow?.employee?.id)
      : undefined;
  const balanceUserId =
    isEdit || isViewOnly
      ? editEmployeeId
      : isSelfApplyMode
        ? currentUserId
        : watchEmployeeId;
  const isDetailsMode = isEdit || isViewOnly;

  // Fetch leave details
  const { data: leaveDetailsData, isPending: leaveDetailsLoading } =
    useGetLeaveDetails(currentRow?.id, open && isDetailsMode) as any;

  const displayRow = useMemo(() => {
    if (isDetailsMode) {
      const details = leaveDetailsData?.data?.id
        ? leaveDetailsData.data
        : leaveDetailsData?.id
          ? leaveDetailsData
          : leaveDetailsData?.data?.data?.id
            ? leaveDetailsData.data.data
            : null;
      if (details) {
        return { ...currentRow, ...details };
      }
    }
    return currentRow;
  }, [isDetailsMode, leaveDetailsData, currentRow]);

  const isDateRangeChanged = useMemo(() => {
    if (!isEdit || !displayRow) return false;
    const initialFrom = normalizeDateValue(displayRow.fromDate);
    const initialTo = normalizeDateValue(displayRow.toDate);
    const currentFrom = normalizeDateValue(watchFromDate);
    const currentTo = normalizeDateValue(watchToDate);
    return currentFrom !== initialFrom || currentTo !== initialTo;
  }, [isEdit, displayRow, watchFromDate, watchToDate]);

  const isLeaveDaysChanged = useMemo(() => {
    if (!isEdit || !displayRow?.leaveDays || !watchLeaveDays) return false;
    if (displayRow.leaveDays.length !== watchLeaveDays.length) return true;
    return watchLeaveDays.some((day, idx) => {
      const originalDay = displayRow.leaveDays[idx];
      if (!originalDay) return true;
      return (
        day.dayType !== (originalDay.dayType || "full") ||
        day.halfType !== (originalDay.halfType || null)
      );
    });
  }, [isEdit, displayRow, watchLeaveDays]);

  const { data: activeUserDetails } = useGetUserDetails(
    balanceUserId ? String(balanceUserId) : ""
  ) as any;

  const { data: employeeLeaveData } = useGetLeaveData(
    {
      employeeId: balanceUserId,
      status: ["pending", "approved"],
      pagination: false,
    },
    open && !isViewOnly && !!balanceUserId
  );

  const selectedEmployee = useMemo(() => {
    const fromList = employeesList?.data?.find(
      (u: any) => u.id === balanceUserId
    );
    const detailedUser = activeUserDetails?.data;
    const fallbackUser =
      fromList || (isEdit || isViewOnly ? currentRow?.employee : null);

    return {
      ...fallbackUser,
      ...detailedUser,
    };
  }, [
    balanceUserId,
    employeesList,
    isEdit,
    isViewOnly,
    currentRow,
    activeUserDetails,
  ]);

  const targetTechnologyId = useMemo(() => {
    return selectedEmployee?.technology?.id ?? selectedEmployee?.technologyId;
  }, [selectedEmployee]);

  const isExamLeaveEligible = useMemo(() => {
    return !!(
      user?.isExamLeaveEligible ||
      user?.user?.isExamLeaveEligible ||
      selectedEmployee?.isExamLeaveEligible
    );
  }, [user, selectedEmployee]);

  // Auto-regenerate or merge leaveDays table whenever date range changes
  useEffect(() => {
    if (isViewOnly) return;

    // In Edit mode, if the dates haven't changed from their initial values in the details API response,
    // do not regenerate the days. This preserves the full API response's leaveDays (including sandwich leaves).
    if (isEdit && !isDateRangeChanged) {
      return;
    }

    if (watchFromDate && watchToDate) {
      const from = startOfDay(new Date(watchFromDate));
      const to = startOfDay(new Date(watchToDate));
      if (from <= to) {
        const newDays = buildLeaveDays(from, to, targetTechnologyId === 35);
        if (isEdit) {
          // Merge with current form values to preserve selections
          const currentLeaveDays = (form.getValues("leaveDays") || []).filter(
            (d: any) => d && d.date
          );
          const mergedDays = newDays.map((newDay) => {
            const existing = currentLeaveDays.find(
              (d: any) => d.date === newDay.date
            );
            if (existing) {
              return {
                ...newDay,
                dayType: existing.dayType || "full",
                halfType: existing.halfType || null,
              };
            }
            return newDay;
          });

          // Only replace if there is a mismatch to avoid unnecessary state updates
          const isIdentical =
            currentLeaveDays.length === mergedDays.length &&
            currentLeaveDays.every((d: any, idx: number) => {
              const m = mergedDays[idx];
              return (
                d.date === m.date &&
                d.dayType === m.dayType &&
                d.halfType === m.halfType &&
                d.isWeekend === m.isWeekend
              );
            });

          if (!isIdentical) {
            replace(mergedDays);
          }
        } else {
          replace(newDays);
        }
      } else {
        replace([]);
      }
    } else {
      replace([]);
    }
  }, [
    watchFromDate,
    watchToDate,
    isEdit,
    isViewOnly,
    replace,
    form,
    targetTechnologyId,
    displayRow,
    isDateRangeChanged,
  ]);

  // Reset toDate if it is earlier than fromDate
  useEffect(() => {
    if (watchFromDate && watchToDate) {
      const from = startOfDay(new Date(watchFromDate));
      const to = startOfDay(new Date(watchToDate));
      if (from > to) {
        form.setValue("toDate", undefined as any);
      }
    }
  }, [watchFromDate, watchToDate, form]);

  // Fetch complete leave balance
  const { data: leaveBalanceData, isPending: leaveBalanceLoading } =
    useGetAllLeaveBalances(balanceUserId, open && !isDetailsMode) as any;

  const balanceLoading = isDetailsMode
    ? leaveDetailsLoading
    : leaveBalanceLoading;

  // Fetch public holidays
  const { data: holidayData } = useGetReportDetails({
    type: "holiday",
    pagination: false,
    limit: 100,
  });

  const holidayDatesSet = useMemo(() => {
    const list = getListFromResponse(holidayData);
    const set = new Set<string>();
    list.forEach((item: any) => {
      if (item.date) {
        try {
          const formatted = format(new Date(item.date), "yyyy-MM-dd");
          set.add(formatted);
        } catch (e) {
          console.error("Error parsing holiday date", item.date, e);
        }
      }
    });
    return set;
  }, [holidayData]);

  const getIsHoliday = (dateStr: string) => {
    if (!dateStr) return false;
    const match = dateStr.match(/^\d{4}-\d{2}-\d{2}/);
    const formatted = match ? match[0] : dateStr;
    return holidayDatesSet.has(formatted);
  };

  const contextSandwichDays = useMemo(() => {
    if (
      isViewOnly ||
      (isEdit && !isDateRangeChanged && !isLeaveDaysChanged) ||
      !watchFromDate ||
      !watchToDate
    )
      return [];

    const currentDays = watchLeaveDays || [];
    const currentDateSet = new Set(
      currentDays
        .map((day: any) => normalizeDateValue(day.date))
        .filter(Boolean)
    );
    if (currentDateSet.size === 0) return [];
    const currentDates = [...currentDateSet].sort();
    const currentStartDate = currentDates[0];
    const currentEndDate = currentDates[currentDates.length - 1];

    const isAccountsTech = targetTechnologyId === 35;
    const existingLeaves = getListFromResponse(employeeLeaveData).filter(
      (leave: any) => {
        if (currentRow?.id && String(leave?.id) === String(currentRow.id)) {
          return false;
        }
        const status = String(leave?.status || "").toLowerCase();
        return status === "pending" || status === "approved";
      }
    );

    if (existingLeaves.length === 0) return [];

    const dayMap = new Map<
      string,
      {
        date: string;
        dayType: string;
        halfType?: string | null;
        isWeekend: boolean;
        fromCurrent: boolean;
        fromExisting: boolean;
      }
    >();

    const upsertDay = (
      dateStr: string,
      dayType: string,
      source: "current" | "existing",
      halfType?: string | null
    ) => {
      if (!dateStr) return;
      const date = startOfDay(new Date(dateStr));
      if (isNaN(date.getTime())) return;
      const existing = dayMap.get(dateStr);
      // If this date is already in the map as a current-request day,
      // the current form's selection (half/full) must take precedence
      // over what any existing leave record says for the same date.
      // This prevents an existing full-day leave from overriding the
      // user's half-day selection and incorrectly sandwiching the weekend.
      const resolvedDayType =
        existing?.fromCurrent && source === "existing"
          ? existing.dayType // keep current form's selection
          : existing?.dayType === "full" || dayType === "full"
            ? "full"
            : "half";
      dayMap.set(dateStr, {
        date: dateStr,
        dayType: resolvedDayType,
        halfType: halfType ?? existing?.halfType ?? null,
        isWeekend: isWeekendForDate(date, isAccountsTech),
        fromCurrent: existing?.fromCurrent || source === "current",
        fromExisting: existing?.fromExisting || source === "existing",
      });
    };

    currentDays.forEach((day: any) => {
      upsertDay(
        normalizeDateValue(day.date),
        day.dayType || "full",
        "current",
        day.halfType
      );
    });

    existingLeaves.forEach((leave: any) => {
      if (Array.isArray(leave?.leaveDays) && leave.leaveDays.length > 0) {
        leave.leaveDays.forEach((day: any) => {
          upsertDay(
            normalizeDateValue(day.date || leave.fromDate),
            day.dayType || "full",
            "existing",
            day.halfType
          );
        });
        return;
      }

      if (!leave?.fromDate || !leave?.toDate) return;
      try {
        eachDayOfInterval({
          start: startOfDay(new Date(leave.fromDate)),
          end: startOfDay(new Date(leave.toDate)),
        }).forEach((date) => {
          upsertDay(format(date, "yyyy-MM-dd"), "full", "existing", null);
        });
      } catch {
        // Ignore malformed existing leave ranges.
      }
    });

    const existingDates = [...dayMap.values()]
      .filter((day) => day.fromExisting && day.dayType === "full")
      .map((day) => day.date)
      .sort();
    const _previousExistingDates = existingDates.filter(
      (date) => date < currentStartDate
    );
    const previousExistingDate =
      _previousExistingDates.length > 0
        ? _previousExistingDates[_previousExistingDates.length - 1]
        : undefined;
    const nextExistingDate = existingDates.find(
      (date) => date > currentEndDate
    );

    const rangeStart = previousExistingDate || currentStartDate;
    const rangeEnd = nextExistingDate || currentEndDate;
    if (!rangeStart || !rangeEnd) return [];

    const start = startOfDay(new Date(rangeStart));
    const end = startOfDay(new Date(rangeEnd));
    const calendarDays = eachDayOfInterval({ start, end }).map((date) => {
      const dateStr = format(date, "yyyy-MM-dd");
      const mapped = dayMap.get(dateStr);
      return {
        date: dateStr,
        dayName: format(date, "EEEE"),
        dayType: mapped?.dayType,
        isWeekend: mapped?.isWeekend ?? isWeekendForDate(date, isAccountsTech),
        isHoliday: holidayDatesSet.has(dateStr),
        fromCurrent: !!mapped?.fromCurrent,
        fromExisting: !!mapped?.fromExisting,
      };
    });

    const isOffDay = (day: (typeof calendarDays)[number]) =>
      day.isWeekend || day.isHoliday;

    return calendarDays.filter((day, idx) => {
      if (!isOffDay(day)) return false;

      // Stop at the FIRST non-off-day found (working day).
      // Only accept it as a leave boundary if it actually has a dayType
      // (i.e. it is a leave day from current or an existing record).
      // This prevents weekends months away from being treated as sandwiched.
      let prevDay: (typeof calendarDays)[number] | null = null;
      for (let j = idx - 1; j >= 0; j--) {
        if (!isOffDay(calendarDays[j])) {
          // We hit a working day — use it only if it is a mapped leave day
          if (calendarDays[j].dayType) {
            prevDay = calendarDays[j];
          }
          break; // Always stop here — don't skip past regular workdays
        }
      }

      let nextDay: (typeof calendarDays)[number] | null = null;
      for (let j = idx + 1; j < calendarDays.length; j++) {
        if (!isOffDay(calendarDays[j])) {
          // We hit a working day — use it only if it is a mapped leave day
          if (calendarDays[j].dayType) {
            nextDay = calendarDays[j];
          }
          break; // Always stop here — don't skip past regular workdays
        }
      }

      const isSelectedOffDay = currentDateSet.has(day.date);

      // ── Special case: public holidays within the selected leave range ──
      // A public holiday that falls inside the applied leave period (fromCurrent)
      // should be counted as a sandwich day when:
      //   1. It is a holiday (not just a weekend).
      //   2. There is at least one adjacent existing leave record (context exists).
      //   3. It has a full working leave day on at least one side.
      // This handles trailing/leading holidays such as Nov 10–11 in a range of
      // Nov 9–11 when Nov 6 already has an approved/pending leave.
      if (
        isSelectedOffDay &&
        day.isHoliday &&
        day.fromCurrent &&
        !!(previousExistingDate || nextExistingDate)
      ) {
        const hasPrevFullLeave = !!prevDay && prevDay.dayType === "full";
        const hasNextFullLeave = !!nextDay && nextDay.dayType === "full";
        if (hasPrevFullLeave || hasNextFullLeave) {
          return true;
        }
      }

      if (
        !prevDay ||
        !nextDay ||
        prevDay.dayType !== "full" ||
        nextDay.dayType !== "full"
      ) {
        return false;
      }

      if (isSelectedOffDay) {
        return (
          day.fromCurrent &&
          (prevDay.fromExisting || nextDay.fromExisting) &&
          (prevDay.fromCurrent ||
            nextDay.fromCurrent ||
            (prevDay.fromExisting && nextDay.fromExisting))
        );
      }

      return (
        (prevDay.fromCurrent && nextDay.fromExisting) ||
        (prevDay.fromExisting && nextDay.fromCurrent)
      );
    });
  }, [
    isDetailsMode,
    watchFromDate,
    watchToDate,
    watchLeaveDays,
    targetTechnologyId,
    employeeLeaveData,
    holidayDatesSet,
    currentRow?.id,
    isLeaveDaysChanged,
  ]);

  const balanceArray = useMemo(
    () => getBalanceArray(leaveBalanceData),
    [leaveBalanceData]
  );

  const detailData = useMemo(() => {
    if (!isDetailsMode) return null;
    return leaveDetailsData?.data?.allocationBreakdown ||
      leaveDetailsData?.data?.leaveBalance
      ? leaveDetailsData.data
      : leaveDetailsData?.allocationBreakdown || leaveDetailsData?.leaveBalance
        ? leaveDetailsData
        : leaveDetailsData?.data?.data?.allocationBreakdown ||
            leaveDetailsData?.data?.data?.leaveBalance
          ? leaveDetailsData.data.data
          : null;
  }, [isDetailsMode, leaveDetailsData]);

  const casualBalance = useMemo(() => {
    if (isDetailsMode) {
      const details = detailData?.leaveBalance;
      return toNumber(details?.casualLeaveBalance);
    }
    return getLeaveTypeBalance(balanceArray, CASUAL_LEAVE_TYPE_ID);
  }, [isDetailsMode, detailData, balanceArray]);

  const paidBalance = useMemo(() => {
    if (isDetailsMode) {
      const details = detailData?.leaveBalance;
      return toNumber(details?.paidLeaveBalance);
    }
    return getLeaveTypeBalance(balanceArray, PAID_LEAVE_TYPE_ID);
  }, [isDetailsMode, detailData, balanceArray]);

  const examBalance = useMemo(() => {
    if (isDetailsMode) {
      const details = detailData?.leaveBalance;
      return toNumber(details?.examLeaveBalance ?? 0);
    }
    return getLeaveTypeAllocatedDays(balanceArray, "4");
  }, [isDetailsMode, detailData, balanceArray]);

  // In edit mode the fetched balances are AFTER this leave was deducted.
  // Add back this leave's own allocation so live recompute (on leave-type
  // change) uses the balance as it was before this request.
  const allocCasualBalance = useMemo(() => {
    if (isEdit && detailData?.allocationBreakdown) {
      return (
        casualBalance + toNumber(detailData.allocationBreakdown.casualLeaveDays)
      );
    }
    return casualBalance;
  }, [isEdit, detailData, casualBalance]);

  const allocPaidBalance = useMemo(() => {
    if (isEdit && detailData?.allocationBreakdown) {
      return (
        paidBalance + toNumber(detailData.allocationBreakdown.paidLeaveDays)
      );
    }
    return paidBalance;
  }, [isEdit, detailData, paidBalance]);

  const leaveAllocation = useMemo(() => {
    if (isEdit && !isDateRangeChanged && !isLeaveDaysChanged && detailData) {
      const allocation = detailData.allocationBreakdown || {};
      const summaryObj = detailData.summary || {};

      const casualDays = toNumber(allocation.casualLeaveDays);
      const paidDays = toNumber(allocation.paidLeaveDays);
      const lossOfPayDays = toNumber(allocation.lossOfPayDays);
      const examDays = toNumber(
        allocation.examLeaveDays ?? allocation.examDays
      );
      const requestedDays = toNumber(summaryObj.totalRequestedDays);

      const items = [];
      if (examDays > 0 || watchIsExamLeave) {
        items.push({
          leaveTypeId: "4",
          leaveTypeName: "Exam Leave",
          days: examDays,
        });
      } else {
        items.push({
          leaveTypeId: CASUAL_LEAVE_TYPE_ID,
          leaveTypeName: getLeaveTypeLabel(CASUAL_LEAVE_TYPE_ID),
          days: casualDays,
        });
        items.push({
          leaveTypeId: PAID_LEAVE_TYPE_ID,
          leaveTypeName: getLeaveTypeLabel(PAID_LEAVE_TYPE_ID),
          days: paidDays,
        });
        items.push({
          leaveTypeId: LOSS_OF_PAY_LEAVE_TYPE_ID,
          leaveTypeName: "Loss of Pay",
          days: lossOfPayDays,
          isLossOfPay: true,
        });
      }

      return {
        casualDays,
        paidDays,
        lossOfPayDays,
        examDays,
        requestedDays,
        totalAvailableDays:
          toNumber(detailData.leaveBalance?.casualLeaveBalance) +
          toNumber(detailData.leaveBalance?.paidLeaveBalance),
        items,
      };
    }

    const requestedDays = calculateRequestedDays(
      watchLeaveDays,
      holidayDatesSet,
      contextSandwichDays
    );
    return buildLeaveAllocation({
      requestedDays,
      casualBalance: allocCasualBalance,
      paidBalance: allocPaidBalance,
      isExamLeave: watchIsExamLeave,
      selectedLeaveTypeId: watchLeaveTypeId,
    });
  }, [
    isEdit,
    isDateRangeChanged,
    isLeaveDaysChanged,
    detailData,
    watchLeaveDays,
    holidayDatesSet,
    contextSandwichDays,
    allocCasualBalance,
    allocPaidBalance,
    watchIsExamLeave,
    watchLeaveTypeId,
  ]);

  const totalBalance = useMemo(() => {
    if (isDetailsMode) {
      const details = detailData?.leaveBalance;
      return toNumber(details?.totalBalance);
    }
    return leaveAllocation.totalAvailableDays;
  }, [isDetailsMode, detailData, leaveAllocation.totalAvailableDays]);

  const allocationItems = useMemo(() => {
    if (isViewOnly && detailData?.allocationBreakdown) {
      const isExam = !!detailData.isExamLeave;
      return isExam
        ? [
            {
              label: "Exam Leave",
              value:
                detailData.allocationBreakdown.examLeaveDays ??
                detailData.allocationBreakdown.examDays ??
                detailData.summary?.totalRequestedDays ??
                0,
              className: "text-amber-700 dark:text-amber-400 font-semibold",
            },
          ]
        : [
            {
              label: "Casual Leave",
              value: detailData.allocationBreakdown.casualLeaveDays ?? 0,
              className: "text-emerald-700 dark:text-emerald-400 font-semibold",
            },
            {
              label: "Paid Leave",
              value: detailData.allocationBreakdown.paidLeaveDays ?? 0,
              className: "text-blue-700 dark:text-blue-400 font-semibold",
            },
            {
              label: "Loss of Pay",
              value: detailData.allocationBreakdown.lossOfPayDays ?? 0,
              className: "text-rose-700 dark:text-rose-400 font-semibold",
            },
          ];
    }

    return watchIsExamLeave
      ? [
          {
            label: "Exam Leave",
            value: leaveAllocation.examDays || 0,
            className: "text-amber-700 dark:text-amber-400 font-semibold",
          },
        ]
      : [
          {
            label: "Casual Leave",
            value: leaveAllocation.casualDays,
            className: "text-emerald-700 dark:text-emerald-400 font-semibold",
          },
          {
            label: "Paid Leave",
            value: leaveAllocation.paidDays,
            className: "text-blue-700 dark:text-blue-400 font-semibold",
          },
          {
            label: "Loss of Pay",
            value: leaveAllocation.lossOfPayDays,
            className: "text-rose-700 dark:text-rose-400 font-semibold",
          },
        ];
  }, [watchIsExamLeave, leaveAllocation, isViewOnly, detailData]);

  const hasDatesSelected = !!(watchFromDate && watchToDate);

  const emptyDefaults = {
    employeeId: undefined as number | undefined,
    isExamLeave: false,
    leaveTypeId: undefined as string | undefined,
    fromDate: undefined as Date | undefined,
    toDate: undefined as Date | undefined,
    reason: "",
    description: "",
    leaveDays: [] as any[],
    attachments: null,
    notifyUserIds: [] as string[],
  };

  // Reset form on open/close
  useEffect(() => {
    if (displayRow && open) {
      const fromD = displayRow.fromDate ? new Date(displayRow.fromDate) : null;
      const toD = displayRow.toDate ? new Date(displayRow.toDate) : null;
      let dayList: Date[] = [];
      if (fromD && toD && !isNaN(fromD.getTime()) && !isNaN(toD.getTime())) {
        try {
          dayList = eachDayOfInterval({
            start: startOfDay(fromD),
            end: startOfDay(toD),
          });
        } catch (e) {
          console.error("Invalid interval dates", e);
        }
      }

      const isAccountsTech = targetTechnologyId === 35;

      const days =
        displayRow.leaveDays?.map((d: any, idx: number) => {
          // Prefer the date stored in d.date; positional dayList is a fallback
          // for legacy records that lack a date field.
          const normalised = normalizeDateValue(d.date);
          const actualDate = normalised
            ? startOfDay(new Date(normalised))
            : (dayList[idx] ?? null);

          const dateStr =
            actualDate && !isNaN(actualDate.getTime())
              ? format(actualDate, "yyyy-MM-dd")
              : "";

          // Always recompute dayName from the real date so stale DB values
          // never cause wrong labels in the breakdown table.
          const dayName =
            actualDate && !isNaN(actualDate.getTime())
              ? format(actualDate, "EEEE")
              : d.dayName || "Weekday";

          // Always recompute isWeekend — don't trust the stored DB value.
          let isWeekend = false;
          if (actualDate && !isNaN(actualDate.getTime())) {
            if (isAccountsTech && isSaturday(actualDate)) {
              const dayOfMonth = actualDate.getDate();
              const satIndex = Math.ceil(dayOfMonth / 7);
              isWeekend = satIndex === 2 || satIndex === 4;
            } else {
              isWeekend = isSaturday(actualDate) || isSunday(actualDate);
            }
          }

          return {
            date: dateStr,
            dayName,
            isWeekend,
            dayType: d.dayType || "full",
            halfType: d.halfType || null,
            isSandwichLeave: !!d.isSandwichLeave,
          };
        }) ?? [];

      form.reset({
        employeeId: displayRow.employeeId ?? displayRow.employee?.id,
        isExamLeave: !!displayRow.isExamLeave,
        leaveTypeId: (() => {
          const typeIds = Array.isArray(displayRow.leaveTypeId)
            ? displayRow.leaveTypeId.map(String)
            : displayRow.leaveTypeId
              ? [String(displayRow.leaveTypeId)]
              : [];
          if (typeIds.length > 0 && typeIds[0]) return typeIds[0];

          // Fallback from allocationBreakdown
          const breakdown = displayRow.allocationBreakdown;
          if (breakdown) {
            if (toNumber(breakdown.casualLeaveDays) > 0)
              return CASUAL_LEAVE_TYPE_ID;
            if (toNumber(breakdown.paidLeaveDays) > 0)
              return PAID_LEAVE_TYPE_ID;
            if (toNumber(breakdown.lossOfPayDays) > 0)
              return LOSS_OF_PAY_LEAVE_TYPE_ID;
            if (toNumber(breakdown.examLeaveDays ?? breakdown.examDays) > 0)
              return "4";
          }
          return CASUAL_LEAVE_TYPE_ID;
        })(),
        fromDate: displayRow.fromDate
          ? new Date(displayRow.fromDate)
          : undefined,
        toDate: displayRow.toDate ? new Date(displayRow.toDate) : undefined,
        reason: displayRow.reason,
        description: displayRow.description || "",
        leaveDays: days,
        attachments:
          displayRow.attachments ||
          displayRow.attachmentUrl ||
          displayRow.attachment ||
          null,
        notifyUserIds: (() => {
          if (Array.isArray(displayRow.notifyUserIds)) {
            return displayRow.notifyUserIds.map((id: any) => String(id));
          }
          if (Array.isArray(displayRow.notifyUsers)) {
            return displayRow.notifyUsers.map((u: any) => String(u.id || u));
          }
          return [];
        })(),
      });
      replace(days);
    } else if (!open) {
      form.reset(emptyDefaults);
      replace([]);
      setApplyTab("self");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [displayRow, open, targetTechnologyId]);

  const onSubmit: SubmitHandler<TLeaveFormSchema> = async (values) => {
    const isExamLeave = !!values.isExamLeave;
    const formData = new FormData();
    formData.append("isExamLeave", String(isExamLeave));
    const allocationItems = leaveAllocation.items.filter(
      (item) => item.days > 0
    );

    if (isExamLeave) {
      formData.append("leaveTypeId", JSON.stringify(["4"]));
    } else {
      formData.append("leaveTypeId", values.leaveTypeId || "");
    }
    formData.append("fromDate", format(values.fromDate, "yyyy-MM-dd"));
    formData.append("toDate", format(values.toDate, "yyyy-MM-dd"));
    formData.append("reason", values.reason);
    formData.append("description", values.description || "");
    formData.append(
      "leaveDays",
      JSON.stringify(
        values.leaveDays
          .filter((d: any) => d && d.date)
          .map((d) => ({
            date: d.date,
            dayType: d.dayType,
            ...(d.dayType === "half" && d.halfType
              ? { halfType: d.halfType }
              : {}),
          }))
      )
    );

    const attachmentVal = values.attachments;
    if (attachmentVal instanceof File) {
      formData.append("attachments", attachmentVal);
    } else if (!attachmentVal) {
      // User explicitly removed the attachment — signal removal to backend
      formData.append("attachments", "");
    }
    // If it's an array (existing API attachment objects), don't append anything
    // so the backend leaves existing attachments untouched

    formData.append("totalLeaveDays", String(leaveAllocation.requestedDays));
    formData.append("lossOfPayDays", String(leaveAllocation.lossOfPayDays));
    formData.append("leaveAllocations", JSON.stringify(allocationItems));

    if (values.notifyUserIds && values.notifyUserIds.length > 0) {
      formData.append(
        "notifyUserIds",
        JSON.stringify(values.notifyUserIds.map(Number))
      );
    } else {
      formData.append("notifyUserIds", JSON.stringify([]));
    }

    if (isEdit) {
      onSubmitValues({ id: currentRow.id, data: formData });
    } else {
      if (!isSelfApplyMode && values.employeeId) {
        formData.append("employeeId", String(values.employeeId));
      }
      onSubmitValues(formData);
    }
  };

  const showEmployeeDropdown =
    (canApplyForOthers && applyTab === "others" && !isEdit) ||
    (isEdit && canApplyForOthers);

  const tabTriggerClass =
    "flex items-center gap-2 rounded-[50px] !px-4 !py-2 transition-all h-[35px] " +
    "text-foreground/70 hover:text-foreground " +
    "data-[state=active]:bg-foreground data-[state=active]:text-background data-[state=active]:shadow-sm " +
    "dark:text-muted-foreground dark:hover:text-foreground " +
    "dark:data-[state=active]:bg-primary dark:data-[state=active]:text-white dark:data-[state=active]:shadow-[0_2px_8px_oklch(0_0_0/0.5)]";

  // LeaveBalanceSummary is now imported from "./leave-balance-summary"

  // ── Per-day table ──────────────────────────────────────────────────────────
  // Build a merged, chronologically-sorted list of rows:
  //   - All user-selected leave days (from `fields`)
  //   - All contextSandwichDays that are NOT already in `fields`
  // Sandwich days outside the selected range are shown as read-only rows.
  const mergedTableRows = useMemo(() => {
    if (isViewOnly || (isEdit && !isDateRangeChanged && !isLeaveDaysChanged)) return [];

    const fieldDateSet = new Set(fields.map((f) => f.date));

    const sandwichRows = contextSandwichDays
      .filter((sd) => !fieldDateSet.has(sd.date))
      .map((sd) => ({
        id: `sandwich-${sd.date}`,
        date: sd.date,
        dayName: sd.dayName,
        isWeekend: sd.isWeekend,
        isHoliday: sd.isHoliday,
        isSandwichOnly: true, // marker: not in leaveDays array
        fieldIdx: -1,
      }));

    const fieldRows = fields.map((f, idx) => ({
      id: f.id,
      date: f.date,
      dayName: f.dayName,
      isWeekend: f.isWeekend,
      isHoliday: getIsHoliday(f.date),
      isSandwichOnly: false,
      fieldIdx: idx,
    }));

    return [...fieldRows, ...sandwichRows].sort((a, b) =>
      a.date < b.date ? -1 : a.date > b.date ? 1 : 0
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fields, contextSandwichDays, isEdit, isDateRangeChanged, isLeaveDaysChanged, isViewOnly]);

  const targetUserId =
    isEdit || isViewOnly
      ? editEmployeeId
      : isSelfApplyMode
        ? currentUserId
        : watchEmployeeId;

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6 px-4 md:px-0">
      {/* Header section with back button */}
      <div className="flex items-center justify-between border-b pb-4 border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <button
            onClick={() => onOpenChange(false)}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-background text-foreground transition-all hover:bg-muted dark:border-slate-800"
            type="button"
            title="Go back"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              {isViewOnly
                ? "View Leave Request"
                : isEdit
                  ? "Edit Leave Request"
                  : "Apply Leave"}
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              {isViewOnly
                ? "Detailed information about this leave request."
                : isEdit
                  ? "Update the details of your leave request below."
                  : "Submit your request for time off."}
            </p>
          </div>
        </div>
      </div>

      <Form {...form}>
        <form
          id="leave-form"
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-6"
        >
          {/* Complete Leave Balance Summary at the top */}
          {targetUserId && (
            <div>
              <LeaveBalanceSummary
                casualBalance={casualBalance}
                paidBalance={paidBalance}
                isExamLeaveEligible={isExamLeaveEligible}
                examBalance={examBalance}
                totalBalance={totalBalance}
                balanceLoading={balanceLoading}
              />
            </div>
          )}

          {/* Columns Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            {/* Left Column - Main Form Fields */}
            <div className="lg:col-span-7 space-y-6 flex flex-col">
              <div className="rounded-xl border border-slate-200 bg-card p-6 shadow-sm dark:border-slate-800">
                {canApplyForOthers && !isEdit && !isViewOnly ? (
                  <Tabs
                    value={applyTab}
                    onValueChange={(val) => {
                      setApplyTab(val as "self" | "others");
                      form.reset(emptyDefaults);
                      replace([]);
                    }}
                  >
                    <TabsList className="bg-[#fdebef] rounded-full dark:bg-muted dark:border-white/10 border border-rose-100/50 h-9 w-fit mb-6 p-1">
                      <TabsTrigger value="self" className={tabTriggerClass}>
                        Apply for Myself
                      </TabsTrigger>
                      <TabsTrigger value="others" className={tabTriggerClass}>
                        Apply for Employee
                      </TabsTrigger>
                    </TabsList>
                    <TabsContent value="self" className="mt-0 space-y-6">
                      <LeaveFormFields
                        form={form}
                        isEdit={isEdit}
                        isViewOnly={isViewOnly}
                        isAdmin={isAdmin}
                        showEmployeeDropdown={showEmployeeDropdown}
                        employeeOptions={employeeOptions}
                        employeesListLoading={employeesListLoading}
                        watchIsExamLeave={watchIsExamLeave}
                        watchFromDate={watchFromDate}
                        isExamLeaveEligible={isExamLeaveEligible}
                        notifyUserOptions={notifyUserOptions}
                      />
                    </TabsContent>
                    <TabsContent value="others" className="mt-0 space-y-4">
                      <LeaveFormFields
                        form={form}
                        isEdit={isEdit}
                        isViewOnly={isViewOnly}
                        isAdmin={isAdmin}
                        showEmployeeDropdown={showEmployeeDropdown}
                        employeeOptions={employeeOptions}
                        employeesListLoading={employeesListLoading}
                        watchIsExamLeave={watchIsExamLeave}
                        watchFromDate={watchFromDate}
                        isExamLeaveEligible={isExamLeaveEligible}
                        notifyUserOptions={notifyUserOptions}
                      />
                    </TabsContent>
                  </Tabs>
                ) : (
                  <div className="space-y-4">
                    <LeaveFormFields
                      form={form}
                      isEdit={isEdit}
                      isViewOnly={isViewOnly}
                      isAdmin={isAdmin}
                      showEmployeeDropdown={showEmployeeDropdown}
                      employeeOptions={employeeOptions}
                      employeesListLoading={employeesListLoading}
                      watchIsExamLeave={watchIsExamLeave}
                      watchFromDate={watchFromDate}
                      isExamLeaveEligible={isExamLeaveEligible}
                      notifyUserOptions={notifyUserOptions}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Right Column - Daily Breakdown */}
            {(fields.length > 0 || mergedTableRows.length > 0) && (
              <div className="lg:col-span-5 flex flex-col h-full">
                <div className="rounded-xl border border-slate-200 bg-card p-6 shadow-sm dark:border-slate-800 space-y-4 flex flex-col flex-1 h-full">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                      Daily Breakdown
                    </h3>
                    {!isViewOnly && (
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Configure half/full day settings for each leave date.
                      </p>
                    )}
                  </div>

                  {/* Auto Allocation Breakdown */}
                  {hasDatesSelected && (
                    <div className="rounded-lg border border-slate-200 bg-white px-3 py-3 shadow-sm dark:border-slate-800 dark:bg-slate-950">
                      <div className="mb-2 flex items-center justify-between text-xs font-semibold text-slate-600 dark:text-slate-400">
                        <span>Auto Allocation Breakdown</span>
                        <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-900 tabular-nums">
                          {formatDays(
                            isViewOnly
                              ? (leaveDetailsData?.data?.summary
                                  ?.totalRequestedDays ??
                                  leaveDetailsData?.summary
                                    ?.totalRequestedDays ??
                                  leaveDetailsData?.data?.data?.summary
                                    ?.totalRequestedDays ??
                                  leaveAllocation.requestedDays)
                              : leaveAllocation.requestedDays
                          )}{" "}
                          day(s) requested
                        </span>
                      </div>
                      <div
                        className={cn(
                          "grid gap-2 text-center py-1",
                          (
                            isViewOnly
                              ? !!(
                                  leaveDetailsData?.data?.isExamLeave ??
                                  leaveDetailsData?.isExamLeave ??
                                  leaveDetailsData?.data?.data?.isExamLeave
                                )
                              : watchIsExamLeave
                          )
                            ? "grid-cols-1"
                            : "grid-cols-3"
                        )}
                      >
                        {allocationItems.map((item) => (
                          <div
                            key={item.label}
                            className="flex flex-col items-center justify-center p-1.5 rounded bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800"
                          >
                            <span className="text-[10px] text-muted-foreground uppercase">
                              {item.label.split(" ")[0]}
                            </span>
                            <span
                              className={cn(
                                "text-xs font-bold mt-0.5 tabular-nums",
                                item.className
                              )}
                            >
                              {formatDays(item.value)}
                            </span>
                          </div>
                        ))}
                      </div>
                      {!isViewOnly && contextSandwichDays.length > 0 && (
                        <div className="mt-2 rounded-md border border-rose-200 bg-rose-50 px-2 py-1.5 text-[10px] font-semibold text-rose-700 dark:border-rose-900/40 dark:bg-rose-950/20 dark:text-rose-300">
                          Includes {formatDays(contextSandwichDays.length)}{" "}
                          sandwich day(s) from adjacent leave record(s).
                        </div>
                      )}
                      {!(isViewOnly
                        ? !!(
                            leaveDetailsData?.data?.isExamLeave ??
                            leaveDetailsData?.isExamLeave ??
                            leaveDetailsData?.data?.data?.isExamLeave
                          )
                        : watchIsExamLeave) && (
                        <p className="mt-2 text-[10px] text-muted-foreground text-center font-bold">
                          Priority: Casual leaves are allocated first, followed
                          by Paid leaves, and then Loss of Pay.
                        </p>
                      )}
                    </div>
                  )}

                  <LeaveDaysTable
                    form={form}
                    fields={fields}
                    isViewOnly={isViewOnly}
                    isEdit={isEdit}
                    isDateRangeChanged={isDateRangeChanged}
                    isLeaveDaysChanged={isLeaveDaysChanged}
                    mergedTableRows={mergedTableRows}
                    holidayDatesSet={holidayDatesSet}
                    watchLeaveDays={watchLeaveDays}
                    contextSandwichDays={contextSandwichDays}
                    watchFromDate={watchFromDate}
                    watchToDate={watchToDate}
                    className="flex-1"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Footer / Action buttons */}
          <div className="flex items-center justify-end gap-3 border-t border-slate-200 dark:border-slate-800 pt-4 mt-6">
            <CustomButton
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              {isViewOnly ? "Close" : "Cancel"}
            </CustomButton>
            {!isViewOnly && (
              <CustomButton type="submit" form="leave-form" loading={loading}>
                {isEdit ? "Update Request" : "Submit Request"}
              </CustomButton>
            )}
          </div>
        </form>
      </Form>
    </div>
  );
}
