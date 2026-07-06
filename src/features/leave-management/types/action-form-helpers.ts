import {
  format,
  eachDayOfInterval,
  isSaturday,
  isSunday,
  startOfDay,
} from "date-fns";

export function buildLeaveDays(from: Date, to: Date, isAccountsTech?: boolean) {
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

export const normalizeDateValue = (value: any) => {
  if (!value) return "";
  if (typeof value === "string") {
    const match = value.match(/^\d{4}-\d{2}-\d{2}/);
    if (match) return match[0];
  }
  const date = new Date(value);
  return isNaN(date.getTime()) ? "" : format(startOfDay(date), "yyyy-MM-dd");
};

export const isWeekendForDate = (date: Date, isAccountsTech?: boolean) => {
  if (isAccountsTech && isSaturday(date)) {
    const dayOfMonth = date.getDate();
    const satIndex = Math.ceil(dayOfMonth / 7);
    return satIndex === 2 || satIndex === 4;
  }
  return isSaturday(date) || isSunday(date);
};

export const getListFromResponse = (data: any) => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.data?.data)) return data.data.data;
  return [];
};

export const CASUAL_LEAVE_TYPE_ID = "1";
export const PAID_LEAVE_TYPE_ID = "2";
export const LOSS_OF_PAY_LEAVE_TYPE_ID = "3";

export const toNumber = (value: unknown) => {
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
};

export const getBalanceArray = (data: any) => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.data?.data)) return data.data.data;
  return [];
};

export const LEAVE_TYPE_OPTIONS = [
  { label: "Casual Leave", value: "1" },
  { label: "Paid Leave", value: "2" },
  { label: "Loss of Pay", value: "3" },
  { label: "Exam Leave", value: "4" },
];

export const getLeaveTypeLabel = (leaveTypeId: string) =>
  LEAVE_TYPE_OPTIONS.find((type) => String(type.value) === String(leaveTypeId))
    ?.label ?? `Leave Type ${leaveTypeId}`;

export const getLeaveTypeBalance = (balanceArray: any[], leaveTypeId: string) => {
  const record = balanceArray.find(
    (item: any) => String(item.leaveTypeId) === String(leaveTypeId)
  );

  return toNumber(record?.availableDays);
};

export const getLeaveTypeAllocatedDays = (
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

export const formatDays = (days: number) =>
  Number.isInteger(days) ? String(days) : days.toFixed(1);

export const calculateRequestedDays = (
  leaveDays: any[] = [],
  holidayDatesSet: Set<string> = new Set(),
  contextSandwichDays: any[] = []
) => {
  const validLeaveDays = leaveDays.filter((d) => d && d.date);
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

  for (let i = 0; i < validLeaveDays.length; i++) {
    const day = validLeaveDays[i];

    if (!isOffDay(day)) {
      if (day?.dayType === "half") {
        total += 0.5;
      } else if (day?.dayType === "full") {
        total += 1;
      }
    } else {
      // It's a weekend or public holiday. Check if it's sandwiched.
      // A day is sandwiched if:
      // 1. It is in contextSandwichDays (which handles sandwich days across boundaries), OR
      // 2. It is sandwiched between two full leaves within the current request.
      const inContext = contextSandwichDays.some(
        (sd) => normalizeDateValue(sd.date) === normalizeDateValue(day.date)
      );

      if (inContext) {
        total += 1;
      } else {
        let prevDay = null;
        for (let j = i - 1; j >= 0; j--) {
          const d = validLeaveDays[j];
          if (!isOffDay(d)) {
            prevDay = d;
            break;
          }
        }

        let nextDay = null;
        for (let j = i + 1; j < validLeaveDays.length; j++) {
          const d = validLeaveDays[j];
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
  }

  // Add the sandwich days that are outside of leaveDays (i.e. not in leaveDays list)
  const leaveDaysDates = new Set(
    validLeaveDays.map((d) => normalizeDateValue(d.date)).filter(Boolean)
  );

  const outsideSandwichCount = contextSandwichDays.filter(
    (sd) => !leaveDaysDates.has(normalizeDateValue(sd.date))
  ).length;

  total += outsideSandwichCount;

  return total;
};

export const buildLeaveAllocation = ({
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
      totalAvailableDays: casualBalance + paidBalance,
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
  }

  if (selectedLeaveTypeId === PAID_LEAVE_TYPE_ID) {
    const paidDays = Math.min(requestedDays, paidBalance);
    const lossOfPayDays = Math.max(requestedDays - paidDays, 0);
    return {
      casualDays: 0,
      paidDays,
      lossOfPayDays,
      examDays: 0,
      totalAvailableDays: casualBalance + paidBalance,
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
