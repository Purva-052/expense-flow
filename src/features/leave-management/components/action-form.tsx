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
  isSaturday,
  isSunday,
  startOfDay,
  formatDate,
} from "date-fns";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import CustomButton from "@/components/shared/custom-button";
import { leaveSchema, TLeaveFormSchema } from "../schema";
import CustomDropDownSearchable from "@/components/shared/custome-searchable-dropdown";
import { Textarea } from "@/components/ui/textarea";
import { CustomDatePicker } from "@/components/shared/custome-datePicker";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useAuthStore } from "@/stores/use-auth-store";
import { roles } from "@/utils/constant";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useGetAllLeaveBalances, useGetLeaveDetails } from "../services";
import {
  Wallet,
  ArrowLeft,
  AlertCircle,
  Calendar,
  Briefcase,
  GraduationCap,
  Layers,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { FileUpload } from "@/components/shared/custome-file-upload";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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

// ─── helpers ───────────────────────────────────────────────────────────────────

function buildLeaveDays(from: Date, to: Date, isAccountsTech?: boolean) {
  const start = startOfDay(from);
  const end = startOfDay(to);
  return eachDayOfInterval({ start, end }).map((d) => {
    let isWeekend = isSaturday(d) || isSunday(d);
    if (isAccountsTech && isSaturday(d)) {
      const dayOfMonth = d.getDate();
      const satIndex = Math.ceil(dayOfMonth / 7);
      isWeekend = satIndex === 2 || satIndex === 4;
    }
    return {
      date: format(d, "yyyy-MM-dd"),
      dayName: format(d, "EEEE"),
      isWeekend,
      dayType: "full" as const,
      halfType: null as null | "first_half" | "second_half",
    };
  });
}

const CASUAL_LEAVE_TYPE_ID = "1";
const PAID_LEAVE_TYPE_ID = "2";
const LOSS_OF_PAY_LEAVE_TYPE_ID = "3";

const toNumber = (value: unknown) => {
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
};

const getBalanceArray = (data: any) => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.data?.data)) return data.data.data;
  return [];
};

const LEAVE_TYPE_OPTIONS = [
  { label: "Casual Leave", value: "1" },
  { label: "Paid Leave", value: "2" },
  { label: "Loss of Pay", value: "3" },
  { label: "Exam Leave", value: "4" },
];

const getLeaveTypeLabel = (leaveTypeId: string) =>
  LEAVE_TYPE_OPTIONS.find((type) => String(type.value) === String(leaveTypeId))
    ?.label ?? `Leave Type ${leaveTypeId}`;

const getLeaveTypeBalance = (balanceArray: any[], leaveTypeId: string) => {
  const record = balanceArray.find(
    (item: any) => String(item.leaveTypeId) === String(leaveTypeId)
  );

  return toNumber(record?.availableDays);
};

const getLeaveTypeAllocatedDays = (
  balanceArray: any[],
  leaveTypeId: string
) => {
  const record = balanceArray.find(
    (item: any) => String(item.leaveTypeId) === String(leaveTypeId)
  );

  return record?.allocatedDays !== null && record?.allocatedDays !== undefined
    ? toNumber(record.allocatedDays)
    : 0;
};

const formatDays = (days: number) =>
  Number.isInteger(days) ? String(days) : days.toFixed(1);

export const calculateRequestedDays = (
  leaveDays: any[] = [],
  holidayDatesSet: Set<string> = new Set()
) => {
  let total = 0;

  const getIsHoliday = (dateStr: string) => {
    if (!dateStr) return false;
    const match = dateStr.match(/^\d{4}-\d{2}-\d{2}/);
    const formatted = match ? match[0] : dateStr;
    return holidayDatesSet.has(formatted);
  };

  const isOffDay = (day: any) => {
    if (!day) return false;
    return day.isWeekend || getIsHoliday(day.date);
  };

  for (let i = 0; i < leaveDays.length; i++) {
    const day = leaveDays[i];

    if (!isOffDay(day)) {
      if (day?.dayType === "half") {
        total += 0.5;
      } else if (day?.dayType === "full") {
        total += 1;
      }
    } else {
      // It's a weekend or public holiday. Check if it's sandwiched between two full leaves.
      let prevDay = null;
      for (let j = i - 1; j >= 0; j--) {
        const d = leaveDays[j];
        if (!isOffDay(d)) {
          prevDay = d;
          break;
        }
      }

      let nextDay = null;
      for (let j = i + 1; j < leaveDays.length; j++) {
        const d = leaveDays[j];
        if (!isOffDay(d)) {
          nextDay = d;
          break;
        }
      }

      if (
        prevDay &&
        nextDay &&
        prevDay.dayType === "full" &&
        nextDay.dayType === "full"
      ) {
        total += 1;
      }
    }
  }

  return total;
};

const buildLeaveAllocation = ({
  requestedDays,
  casualBalance,
  paidBalance,
  isExamLeave,
  selectedLeaveTypeId,
}: {
  requestedDays: number;
  casualBalance: number;
  paidBalance: number;
  isExamLeave?: boolean;
  selectedLeaveTypeId?: string;
}) => {
  if (isExamLeave || selectedLeaveTypeId === "4") {
    return {
      casualDays: 0,
      paidDays: 0,
      lossOfPayDays: 0,
      examDays: requestedDays,
      totalAvailableDays: casualBalance + paidBalance,
      requestedDays,
      items: [
        {
          leaveTypeId: "4",
          leaveTypeName: "Exam Leave",
          days: requestedDays,
        },
      ],
    };
  }

  if (selectedLeaveTypeId === LOSS_OF_PAY_LEAVE_TYPE_ID) {
    return {
      casualDays: 0,
      paidDays: 0,
      lossOfPayDays: requestedDays,
      examDays: 0,
      totalAvailableDays: 0,
      requestedDays,
      items: [
        {
          leaveTypeId: LOSS_OF_PAY_LEAVE_TYPE_ID,
          leaveTypeName: "Loss of Pay",
          days: requestedDays,
          isLossOfPay: true,
        },
      ],
    };
  }

  if (selectedLeaveTypeId === CASUAL_LEAVE_TYPE_ID) {
    const casualDays = Math.min(requestedDays, casualBalance);
    const lossOfPayDays = Math.max(requestedDays - casualDays, 0);
    return {
      casualDays,
      paidDays: 0,
      lossOfPayDays,
      examDays: 0,
      totalAvailableDays: casualBalance,
      requestedDays,
      items: [
        {
          leaveTypeId: CASUAL_LEAVE_TYPE_ID,
          leaveTypeName: getLeaveTypeLabel(CASUAL_LEAVE_TYPE_ID),
          days: casualDays,
        },
        {
          leaveTypeId: LOSS_OF_PAY_LEAVE_TYPE_ID,
          leaveTypeName: "Loss of Pay",
          days: lossOfPayDays,
          isLossOfPay: true,
        },
      ],
    };
  }

  if (selectedLeaveTypeId === PAID_LEAVE_TYPE_ID) {
    const paidDays = Math.min(requestedDays, paidBalance);
    const lossOfPayDays = Math.max(requestedDays - paidDays, 0);
    return {
      casualDays: 0,
      paidDays,
      lossOfPayDays,
      examDays: 0,
      totalAvailableDays: paidBalance,
      requestedDays,
      items: [
        {
          leaveTypeId: PAID_LEAVE_TYPE_ID,
          leaveTypeName: getLeaveTypeLabel(PAID_LEAVE_TYPE_ID),
          days: paidDays,
        },
        {
          leaveTypeId: LOSS_OF_PAY_LEAVE_TYPE_ID,
          leaveTypeName: "Loss of Pay",
          days: lossOfPayDays,
          isLossOfPay: true,
        },
      ],
    };
  }

  const casualDays = Math.min(requestedDays, casualBalance);
  const paidDays = Math.min(
    Math.max(requestedDays - casualDays, 0),
    paidBalance
  );
  const lossOfPayDays = Math.max(requestedDays - casualDays - paidDays, 0);

  return {
    casualDays,
    paidDays,
    lossOfPayDays,
    examDays: 0,
    totalAvailableDays: casualBalance + paidBalance,
    requestedDays,
    items: [
      {
        leaveTypeId: CASUAL_LEAVE_TYPE_ID,
        leaveTypeName: getLeaveTypeLabel(CASUAL_LEAVE_TYPE_ID),
        days: casualDays,
      },
      {
        leaveTypeId: PAID_LEAVE_TYPE_ID,
        leaveTypeName: getLeaveTypeLabel(PAID_LEAVE_TYPE_ID),
        days: paidDays,
      },
      {
        leaveTypeId: LOSS_OF_PAY_LEAVE_TYPE_ID,
        leaveTypeName: "Loss of Pay",
        days: lossOfPayDays,
        isLossOfPay: true,
      },
    ],
  };
};

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
    mode: "onTouched",
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

  const { data: activeUserDetails } = useGetUserDetails(
    balanceUserId ? String(balanceUserId) : ""
  ) as any;

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
    if (watchFromDate && watchToDate) {
      const from = startOfDay(new Date(watchFromDate));
      const to = startOfDay(new Date(watchToDate));
      if (from <= to) {
        const newDays = buildLeaveDays(from, to, targetTechnologyId === 35);
        if (isEdit) {
          // Merge with current form values to preserve selections
          const currentLeaveDays = form.getValues("leaveDays") || [];
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

  const isDetailsMode = isEdit || isViewOnly;

  // Fetch complete leave balance
  const { data: leaveBalanceData, isPending: leaveBalanceLoading } =
    useGetAllLeaveBalances(balanceUserId, open && !isDetailsMode) as any;

  // Fetch leave details
  const { data: leaveDetailsData, isPending: leaveDetailsLoading } =
    useGetLeaveDetails(currentRow?.id, open && isDetailsMode) as any;

  const balanceLoading = isDetailsMode
    ? leaveDetailsLoading
    : leaveBalanceLoading;

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

  // Fetch public holidays
  const { data: holidayData } = useGetReportDetails({
    type: "holiday",
    limit: 100,
  });

  const holidayDatesSet = useMemo(() => {
    const list = (holidayData as any)?.data || [];
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

  const isDaySandwiched = (leaveDays: any[], idx: number) => {
    const day = leaveDays[idx];
    const isDayOff = day?.isWeekend || getIsHoliday(day?.date);
    if (!isDayOff) return false;

    let prevDay = null;
    for (let j = idx - 1; j >= 0; j--) {
      const d = leaveDays[j];
      const isDOff = d?.isWeekend || getIsHoliday(d?.date);
      if (!isDOff) {
        prevDay = d;
        break;
      }
    }

    let nextDay = null;
    for (let j = idx + 1; j < leaveDays.length; j++) {
      const d = leaveDays[j];
      const isDOff = d?.isWeekend || getIsHoliday(d?.date);
      if (!isDOff) {
        nextDay = d;
        break;
      }
    }

    return !!(
      prevDay &&
      nextDay &&
      prevDay.dayType === "full" &&
      nextDay.dayType === "full"
    );
  };

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

  const leaveAllocation = useMemo(() => {
    const requestedDays = calculateRequestedDays(
      watchLeaveDays,
      holidayDatesSet
    );
    return buildLeaveAllocation({
      requestedDays,
      casualBalance,
      paidBalance,
      isExamLeave: watchIsExamLeave,
      selectedLeaveTypeId: watchLeaveTypeId,
    });
  }, [
    watchLeaveDays,
    holidayDatesSet,
    casualBalance,
    paidBalance,
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

      const days =
        displayRow.leaveDays?.map((d: any, idx: number) => {
          const actualDate = dayList[idx] || (d.date ? new Date(d.date) : null);
          const dateStr =
            actualDate && !isNaN(actualDate.getTime())
              ? format(actualDate, "yyyy-MM-dd")
              : d.date || "";

          let dayName = d.dayName || "";
          if (!dayName && actualDate && !isNaN(actualDate.getTime())) {
            dayName = format(actualDate, "EEEE");
          }

          let isWeekend = d.isWeekend;
          if (
            isWeekend === undefined &&
            actualDate &&
            !isNaN(actualDate.getTime())
          ) {
            const isAccountsTech = targetTechnologyId === 35;
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
            dayName: dayName || "Weekday",
            isWeekend: !!isWeekend,
            dayType: d.dayType || "full",
            halfType: d.halfType || null,
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
        values.leaveDays.map((d) => ({
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

  // ── Leave Balance Summary ──────────────────────────────────────────────────
  const LeaveBalanceSummary = () => {
    const targetUserId =
      isEdit || isViewOnly
        ? editEmployeeId
        : isSelfApplyMode
          ? currentUserId
          : watchEmployeeId;
    if (!targetUserId) return null;

    const summaryItems = [
      {
        label: "Casual Leave",
        value: casualBalance,
        icon: Calendar,
        className:
          "border-emerald-100/85 bg-emerald-50/40 text-emerald-800 dark:border-emerald-900/30 dark:bg-emerald-950/10 dark:text-emerald-300",
        iconColor: "text-emerald-500 dark:text-emerald-400",
      },
      {
        label: "Paid Leave",
        value: paidBalance,
        icon: Briefcase,
        className:
          "border-blue-100/85 bg-blue-50/40 text-blue-800 dark:border-blue-900/30 dark:bg-blue-950/10 dark:text-blue-300",
        iconColor: "text-blue-500 dark:text-blue-400",
      },
      ...(isExamLeaveEligible
        ? [
            {
              label: "Exam Leave",
              value: examBalance,
              icon: GraduationCap,
              className:
                "border-amber-100/85 bg-amber-50/40 text-amber-800 dark:border-amber-900/30 dark:bg-amber-950/10 dark:text-amber-300",
              iconColor: "text-amber-500 dark:text-amber-400",
            },
          ]
        : []),
      {
        label: "Total Balance",
        value: totalBalance,
        icon: Layers,
        className:
          "border-violet-100/85 bg-violet-50/40 text-violet-800 dark:border-violet-900/30 dark:bg-violet-950/10 dark:text-violet-300",
        iconColor: "text-violet-500 dark:text-violet-400",
      },
    ];

    return (
      <div
        className={cn(
          "space-y-3 rounded-xl border border-slate-200 bg-card p-4 shadow-sm dark:border-slate-800 w-full"
        )}
      >
        <div className="flex items-center gap-2 font-semibold text-slate-800 dark:text-slate-200">
          <Wallet className="h-4 w-4 text-rose-500 shrink-0" />
          <span className="text-xs uppercase tracking-wider font-bold opacity-80">
            Complete Leave Balance
          </span>
          {balanceLoading && (
            <span className="text-xs font-normal text-muted-foreground italic animate-pulse">
              (Updating...)
            </span>
          )}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {summaryItems.map((item) => (
            <div
              key={item.label}
              className={cn(
                "rounded-xl border p-3 transition-all flex items-center justify-between h-[88px] shadow-sm relative overflow-hidden",
                item.className
              )}
            >
              <div className="flex flex-col justify-between h-full">
                <span className="text-[10px] font-bold uppercase tracking-wider opacity-80 select-none">
                  {item.label}
                </span>
                <div
                  className={cn(
                    "font-extrabold tracking-tight mt-0.5",
                    item.label === "Exam Leave" && item.value === 0
                      ? "text-xs sm:text-sm uppercase opacity-90"
                      : "text-xl sm:text-2xl tabular-nums"
                  )}
                >
                  {balanceLoading ? (
                    <span className="inline-block h-4 w-8 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
                  ) : item.label === "Exam Leave" && item.value === 0 ? (
                    "Unlimited"
                  ) : (
                    formatDays(item.value)
                  )}
                </div>
              </div>
              <item.icon
                className={cn("h-5 w-5 shrink-0 opacity-80", item.iconColor)}
              />
            </div>
          ))}
        </div>
      </div>
    );
  };

  // ── Per-day table ──────────────────────────────────────────────────────────
  const LeaveDaysTable = ({ className }: { className?: string }) => {
    if (fields.length === 0) return null;

    return (
      <div
        className={cn(
          "rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden text-sm shadow-sm bg-white dark:bg-slate-950 flex flex-col flex-1 min-h-0",
          className
        )}
      >
        {/* Header */}
        <div className="grid grid-cols-[1.1fr_1fr_1.4fr_1.1fr] gap-1.5 bg-slate-50 dark:bg-slate-900/50 px-3 py-2 font-semibold text-slate-500 dark:text-slate-400 text-[10px] uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
          <span>Date</span>
          <span>Day</span>
          <span>Half / Full</span>
          <span>1st / 2nd</span>
        </div>

        {/* Rows */}
        <div className="overflow-y-auto divide-y divide-slate-100 dark:divide-slate-900 flex-1 min-h-[200px]">
          {fields.map((field, idx) => {
            const isWeekend = field.isWeekend;
            const isDayHoliday = getIsHoliday(field.date);
            const isDayOff = isWeekend || isDayHoliday;
            const dayType = form.watch(`leaveDays.${idx}.dayType`);
            const sandwiched = isDaySandwiched(watchLeaveDays || [], idx);
            const hasHalfTypeError =
              !!form.formState.errors.leaveDays?.[idx]?.halfType;

            return (
              <div
                key={field.id}
                className={cn(
                  "grid grid-cols-[1.1fr_1fr_1.4fr_1.1fr] gap-1.5 items-center px-3 py-3 transition-colors hover:bg-slate-50/50 dark:hover:bg-slate-900/20 relative",
                  isDayOff && "bg-slate-50 dark:bg-slate-900/40 opacity-60",
                  sandwiched &&
                    "bg-rose-50/50 dark:bg-rose-950/20 border-l-2 border-l-rose-500 opacity-100",
                  hasHalfTypeError &&
                    "pb-6 pt-2.5 bg-rose-50/10 dark:bg-rose-950/20 border-l-2 border-l-rose-500"
                )}
              >
                {/* Date */}
                <span className="font-semibold text-slate-800 dark:text-slate-200 tabular-nums text-xs">
                  {formatDate(new Date(field.date), "dd MMM yyyy")}
                </span>

                {/* Day name */}
                <span
                  className={cn(
                    isDayOff || sandwiched
                      ? "text-amber-600 dark:text-amber-400 font-semibold flex flex-col"
                      : "text-muted-foreground"
                  )}
                >
                  <span className="text-[11px]">{field.dayName}</span>
                  {sandwiched && (
                    <span className="text-[8px] text-rose-500 font-bold leading-none mt-0.5 animate-pulse">
                      Sandwich Leave
                    </span>
                  )}
                  {!sandwiched && isWeekend && (
                    <span className="text-[8px] text-amber-500 opacity-80 leading-none mt-0.5">
                      Weekly Off
                    </span>
                  )}
                  {!sandwiched && isDayHoliday && (
                    <span className="text-[8px] text-indigo-500 opacity-80 leading-none mt-0.5 font-semibold">
                      Public Holiday
                    </span>
                  )}
                </span>

                {/* Half / Full selector */}
                <FormField
                  control={form.control}
                  name={`leaveDays.${idx}.dayType`}
                  render={({ field: f }) => (
                    <FormItem className="m-0 p-0 space-y-0">
                      <FormControl>
                        <RadioGroup
                          onValueChange={(val) => {
                            f.onChange(val);
                            if (val === "full") {
                              form.setValue(`leaveDays.${idx}.halfType`, null);
                            }
                          }}
                          value={f.value}
                          disabled={isViewOnly || isDayOff}
                          className="flex items-center gap-1.5"
                        >
                          <div className="flex items-center gap-1 cursor-pointer">
                            <RadioGroupItem
                              value="half"
                              id={`half-${idx}`}
                              className="h-3.5 w-3.5"
                            />
                            <Label
                              htmlFor={`half-${idx}`}
                              className={cn(
                                "text-[11px] font-medium cursor-pointer",
                                (isViewOnly || isDayOff) &&
                                  "text-muted-foreground/40 cursor-not-allowed"
                              )}
                            >
                              Half
                            </Label>
                          </div>
                          <div className="flex items-center gap-1 cursor-pointer">
                            <RadioGroupItem
                              value="full"
                              id={`full-${idx}`}
                              className="h-3.5 w-3.5"
                            />
                            <Label
                              htmlFor={`full-${idx}`}
                              className={cn(
                                "text-[11px] font-medium cursor-pointer",
                                (isViewOnly || isDayOff) &&
                                  "text-muted-foreground/40 cursor-not-allowed"
                              )}
                            >
                              Full
                            </Label>
                          </div>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage className="text-[10px]" />
                    </FormItem>
                  )}
                />

                {/* 1st / 2nd half selector */}
                <FormField
                  control={form.control}
                  name={`leaveDays.${idx}.halfType`}
                  render={({ field: f }) => (
                    <FormItem className="m-0 p-0 space-y-0 relative">
                      <FormControl>
                        <RadioGroup
                          onValueChange={f.onChange}
                          value={f.value || ""}
                          disabled={
                            isViewOnly || isDayOff || dayType !== "half"
                          }
                          className="flex items-center gap-1.5"
                        >
                          <div className="flex items-center gap-1 cursor-pointer">
                            <RadioGroupItem
                              value="first_half"
                              id={`1st-${idx}`}
                              className="h-3.5 w-3.5"
                              disabled={isDayOff || dayType !== "half"}
                            />
                            <Label
                              htmlFor={`1st-${idx}`}
                              className={cn(
                                "text-[11px] font-medium cursor-pointer",
                                (isViewOnly ||
                                  isDayOff ||
                                  dayType !== "half") &&
                                  "text-muted-foreground/40 cursor-not-allowed"
                              )}
                            >
                              1st
                            </Label>
                          </div>
                          <div className="flex items-center gap-1 cursor-pointer">
                            <RadioGroupItem
                              value="second_half"
                              id={`2nd-${idx}`}
                              className="h-3.5 w-3.5"
                              disabled={isDayOff || dayType !== "half"}
                            />
                            <Label
                              htmlFor={`2nd-${idx}`}
                              className={cn(
                                "text-[11px] font-medium cursor-pointer",
                                (isViewOnly ||
                                  isDayOff ||
                                  dayType !== "half") &&
                                  "text-muted-foreground/40 cursor-not-allowed"
                              )}
                            >
                              2nd
                            </Label>
                          </div>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage className="text-[9px] text-rose-500 font-semibold absolute -bottom-3.5 left-0 whitespace-nowrap leading-none" />
                    </FormItem>
                  )}
                />
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderMainFormFields = () => (
    <>
      {/* Employee & Leave Type */}
      {(showEmployeeDropdown || !watchIsExamLeave) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {showEmployeeDropdown && (
            <CustomDropDownSearchable
              form={form}
              name="employeeId"
              label="Employee"
              options={employeeOptions}
              placeholder="Select employee"
              isLoading={employeesListLoading}
              disabled={isEdit || isViewOnly}
              showClearButton={!isEdit && !isViewOnly}
            />
          )}

          {!watchIsExamLeave && (
            <FormField
              control={form.control}
              name="leaveTypeId"
              render={({ field }) => (
                <FormItem className="full">
                  <FormLabel>
                    Leave Type <span className="text-red-500">*</span>
                  </FormLabel>
                  <Select
                    onValueChange={(val) => {
                      field.onChange(val);
                      form.setValue("leaveTypeId", val, {
                        shouldValidate: true,
                        shouldDirty: true,
                        shouldTouch: true,
                      });
                    }}
                    value={field.value}
                    disabled={isViewOnly}
                  >
                    <FormControl>
                      <SelectTrigger className="h-9 w-full">
                        <SelectValue placeholder="Select leave type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value={CASUAL_LEAVE_TYPE_ID}>
                        Casual Leave
                      </SelectItem>
                      <SelectItem value={PAID_LEAVE_TYPE_ID}>
                        Paid Leave
                      </SelectItem>
                      <SelectItem value={LOSS_OF_PAY_LEAVE_TYPE_ID}>
                        Loss of Pay
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
        </div>
      )}

      {/* Date Range */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <CustomDatePicker
          control={form.control}
          name="fromDate"
          label={
            <>
              From Date <span className="text-red-500">*</span>
            </>
          }
          disabled={isViewOnly}
        />
        <CustomDatePicker
          control={form.control}
          name="toDate"
          label={
            <>
              To Date <span className="text-red-500">*</span>
            </>
          }
          disabled={isViewOnly || !watchFromDate}
          minDate={watchFromDate}
        />
      </div>

      {!isEdit && !isViewOnly && isExamLeaveEligible && (
        <FormField
          control={form.control}
          name="isExamLeave"
          render={({ field }) => (
            <FormItem className="rounded-lg border border-slate-200 p-4 shadow-sm dark:border-slate-800">
              <div className="flex flex-row items-center justify-between">
                <div className="space-y-0.5">
                  <FormLabel className="text-sm font-semibold">
                    Exam Leave
                  </FormLabel>
                  <div className="text-[12px] text-muted-foreground">
                    Enable this option if the leave request is for an
                    examination.
                  </div>
                </div>
                <FormControl>
                  <Switch
                    checked={!!field.value}
                    onCheckedChange={(val) => {
                      field.onChange(val);
                      form.setValue("isExamLeave", val, {
                        shouldValidate: true,
                        shouldDirty: true,
                        shouldTouch: true,
                      });
                      if (!isAdmin) {
                        // For non-admin users, sync leaveTypeId with exam leave state
                        if (val) {
                          form.setValue("leaveTypeId", "4", {
                            shouldValidate: true,
                            shouldDirty: true,
                            shouldTouch: true,
                          });
                        } else {
                          form.setValue("leaveTypeId", undefined, {
                            shouldValidate: true,
                            shouldDirty: true,
                            shouldTouch: true,
                          });
                        }
                      }
                    }}
                    disabled={isViewOnly}
                  />
                </FormControl>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
      )}

      {isViewOnly ? (
        <div className="space-y-1">
          <FormLabel>Attachment</FormLabel>
          <div className="pt-1">
            {(() => {
              const attachmentsVal = form.watch("attachments");
              if (Array.isArray(attachmentsVal) && attachmentsVal.length > 0) {
                return (
                  <div className="space-y-1.5">
                    {attachmentsVal.map((att: any, idx: number) => (
                      <div key={att.id || idx}>
                        <a
                          href={att.referenceFileLink || att.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-500 hover:underline font-medium inline-flex items-center gap-1.5"
                        >
                          View/Download {att.name || `Attachment ${idx + 1}`}
                        </a>
                      </div>
                    ))}
                  </div>
                );
              }
              if (typeof attachmentsVal === "string" && attachmentsVal) {
                return (
                  <a
                    href={attachmentsVal}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-500 hover:underline font-medium"
                  >
                    View/Download Attachment
                  </a>
                );
              }
              return <p className="text-sm text-muted-foreground">-</p>;
            })()}
          </div>
        </div>
      ) : (
        <FileUpload
          name="attachments"
          label="Attachment (Optional)"
          fileLabel="Only PDF and JPEG allowed (Max 5MB)"
          acceptedFormats={{
            "application/pdf": [".pdf"],
            "image/jpeg": [".jpg", ".jpeg"],
          }}
          disabled={isViewOnly}
          existingFileUrl={
            typeof form.watch("attachments") === "string"
              ? (form.watch("attachments") as string)
              : Array.isArray(form.watch("attachments")) &&
                  form.watch("attachments").length > 0
                ? form.watch("attachments")[0]?.referenceFileLink ||
                  form.watch("attachments")[0]?.url
                : undefined
          }
          existingFileName={
            typeof form.watch("attachments") === "string"
              ? (form.watch("attachments") as string).split("/").pop()
              : Array.isArray(form.watch("attachments")) &&
                  form.watch("attachments").length > 0
                ? form.watch("attachments")[0]?.name
                : undefined
          }
        />
      )}

      {/* General Reason */}
      <FormField
        control={form.control}
        name="reason"
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              Reason <span className="text-red-500">*</span>
            </FormLabel>
            <FormControl>
              <Textarea
                {...field}
                placeholder="Reason for leave..."
                className="min-h-[120px] resize-y"
                disabled={isViewOnly}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Notify Users Dropdown with Checkbox-style Multi-Select */}
      <CustomDropDownSearchable
        form={form}
        name="notifyUserIds"
        label="Notify Users"
        multiple
        options={notifyUserOptions}
        placeholder="Select users to notify"
        searchEnabled={true}
        isLoading={employeesListLoading}
        disabled={isViewOnly}
      />

      {/* leaveDays array-level error rendered as a warning banner */}
      {form.formState.errors.leaveDays &&
        !Array.isArray(form.formState.errors.leaveDays) && (
          <div className="mt-4 flex items-center gap-2 rounded-lg border border-destructive/20 bg-destructive/5 p-3 text-xs font-semibold text-destructive animate-in fade-in-50 duration-200">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{(form.formState.errors.leaveDays as any)?.message}</span>
          </div>
        )}
    </>
  );

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
          <div>
            <LeaveBalanceSummary />
          </div>

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
                      {renderMainFormFields()}
                    </TabsContent>
                    <TabsContent value="others" className="mt-0 space-y-4">
                      {renderMainFormFields()}
                    </TabsContent>
                  </Tabs>
                ) : (
                  <div className="space-y-4">{renderMainFormFields()}</div>
                )}
              </div>
            </div>

            {/* Right Column - Daily Breakdown */}
            {fields.length > 0 && (
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

                  <LeaveDaysTable className="flex-1" />
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
              <CustomButton type="submit" loading={loading}>
                {isEdit ? "Update Request" : "Submit Request"}
              </CustomButton>
            )}
          </div>
        </form>
      </Form>
    </div>
  );
}
