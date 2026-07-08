import React, { useState, useMemo, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Check,
  X,
  CheckCircle2,
  ChevronsLeftIcon,
  ChevronsRightIcon,
  Building2,
  CalendarDays,
  RotateCcw,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { format } from "date-fns";
import type { DateRange } from "react-day-picker";
import { MonthYearPicker } from "./month-year-picker";
import SimpleDropDownSearchable from "@/components/shared/custome-simple-dropdown";
import { toast } from "sonner";
import { MyAttendance } from "./my-attendance";
import { MewurkService } from "../services/mewurk-service";
import {
  useGetAttendanceSummary,
  useGetAttendanceEmployees,
} from "../services";
import {
  DoubleArrowLeftIcon,
  DoubleArrowRightIcon,
} from "@radix-ui/react-icons";

// Define mock data interfaces
interface EmployeeAttendanceRow {
  id: string;
  name: string;
  code: string;
  role: string;
  avatar: string;
  present: number;
  absent: number;
  leaves: number;
  isActive: boolean;
  dailyStatus: Record<string, "P" | "A" | "WO" | "AH" | "E" | "L" | "HL" | "">;
  dailyIsCorrected?: Record<string, boolean>;
  phone?: string;
  email?: string;
  profilePicUrl?: string | null;
  employeeId?: number;
}

interface RequestItem {
  id: string;
  employeeName: string;
  employeeCode: string;
  role: string;
  avatar: string;
  date: string;
  detail: string;
  reason: string;
  status: "pending" | "approved" | "rejected";
}

const formatDisplayDate = (dateStr: string) => {
  if (!dateStr) return "-";
  try {
    const parts = dateStr.split("-");
    if (parts.length < 3) return dateStr;
    return format(
      new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2])),
      "dd MMM yyyy"
    );
  } catch {
    return dateStr;
  }
};

const getNameInitials = (name: string) => {
  const parts = (name || "").trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "??";
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
};

// const getDefaultSummaryDateRange = (): DateRange => {
//   const now = new Date();
//   return {
//     from: new Date(now.getFullYear(), now.getMonth(), 1),
//     to: now,
//   };
// };

const getWeekdayFromDate = (dateStr: string) => {
  const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const parts = dateStr.split("-");
  if (parts.length < 3) return "";
  const date = new Date(
    Number(parts[0]),
    Number(parts[1]) - 1,
    Number(parts[2])
  );
  return weekdays[date.getDay()];
};

const mapFinalStatusToCode = (
  finalStatus: string
): "P" | "A" | "WO" | "AH" | "E" | "L" | "HL" | "" => {
  const status = (finalStatus || "").toLowerCase().trim();
  if (status === "present" || status === "p") return "P";
  if (status === "absent" || status === "a") return "A";
  if (
    status === "holiday" ||
    status === "weekend" ||
    status === "weekly off" ||
    status === "wo"
  ) {
    return "WO";
  }
  if (status === "leave" || status === "l" || status === "approved leave") {
    return "L";
  }
  if (status === "half day leave" || status === "half leave") {
    return "HL";
  }
  if (
    status === "half day" ||
    status === "ah" ||
    status === "half day absent"
  ) {
    return "AH";
  }
  if (status === "late" || status === "excused" || status === "e") return "E";
  return "";
};

const getStatusLabel = (status: string) => {
  switch (status) {
    case "P":
      return "Present";
    case "A":
      return "Absent";
    case "WO":
      return "Weekly Off";
    case "AH":
      return "Half Day Absent";
    case "HL":
      return "Half Day Leave";
    case "E":
      return "Late/Excused";
    case "L":
      return "Approved Leave";
    default:
      return "No Log";
  }
};

export const EmployeeAttendance: React.FC = () => {
  const [activeTab] = useState<"summary" | "overtime" | "onduty">("summary");

  const [selectedEmployee, setSelectedEmployee] =
    useState<EmployeeAttendanceRow | null>(null);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Summary tab filters (Month & Year)
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const summaryDateRange = useMemo<DateRange>(() => {
    return {
      from: new Date(selectedYear, selectedMonth - 1, 1),
      to: new Date(selectedYear, selectedMonth, 0),
    };
  }, [selectedMonth, selectedYear]);
  const [summaryEmployeeCode, setSummaryEmployeeCode] = useState<string | null>(
    null
  );
  const [summaryStatus, setSummaryStatus] = useState<"active" | "inactive">(
    "active"
  );

  // Day Detail Modal states
  const [isDayModalOpen, setIsDayModalOpen] = useState(false);
  const [dayModalLoading, setDayModalLoading] = useState(false);
  const [dayModalData, setDayModalData] = useState<any | null>(null);
  const [dayModalEmployee, setDayModalEmployee] = useState<{
    name: string;
    code: string;
  } | null>(null);

  // Format a UTC ISO time string to IST 12h display
  const formatMewurkTime = (timeStr: string | null): string => {
    if (!timeStr) return "-";
    try {
      const isoStr = timeStr.endsWith("Z") ? timeStr : `${timeStr}Z`;
      const date = new Date(isoStr);
      if (isNaN(date.getTime())) return timeStr;
      return date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
    } catch {
      return timeStr;
    }
  };

  // Open the per-day clock detail modal
  const handleDayClick = async (
    emp: EmployeeAttendanceRow,
    dateStr: string
  ) => {
    if (!emp.code) return;
    setDayModalEmployee({ name: emp.name, code: emp.code });
    setIsDayModalOpen(true);
    setDayModalLoading(true);
    setDayModalData(null);
    try {
      const data = await MewurkService.fetchClockInDetails(emp.code, dateStr);
      setDayModalData(data);
    } catch (err) {
      console.error("Error fetching day clock details:", err);
    } finally {
      setDayModalLoading(false);
    }
  };

  const summaryDateColumns = useMemo(() => {
    if (!summaryDateRange?.from || !summaryDateRange?.to) return [];
    const columns: { dateStr: string; day: number; weekday: string }[] = [];
    const current = new Date(summaryDateRange.from);
    const end = new Date(summaryDateRange.to);
    current.setHours(12, 0, 0, 0);
    end.setHours(12, 0, 0, 0);

    while (current <= end) {
      const dateStr = format(current, "yyyy-MM-dd");
      columns.push({
        dateStr,
        day: current.getDate(),
        weekday: getWeekdayFromDate(dateStr),
      });
      current.setDate(current.getDate() + 1);
    }
    return columns;
  }, [summaryDateRange]);

  const summaryParams = useMemo(
    () => ({
      page: currentPage,
      limit: itemsPerPage,
      pagination: true,
      month: selectedMonth,
      year: selectedYear,
      employeeCodes: summaryEmployeeCode ? [summaryEmployeeCode] : undefined,
      status: summaryStatus,
    }),
    [
      currentPage,
      itemsPerPage,
      selectedMonth,
      selectedYear,
      summaryEmployeeCode,
      summaryStatus,
    ]
  );

  const { data: summaryData, isPending: isLoadingSummary } =
    useGetAttendanceSummary(summaryParams, activeTab === "summary");

  const {
    data: attendanceEmployeesData,
    isPending: isLoadingAttendanceEmployees,
  } = useGetAttendanceEmployees(activeTab === "summary");

  const summaryEmployeeOptions = useMemo(() => {
    const raw =
      (attendanceEmployeesData as any)?.data ?? attendanceEmployeesData;
    const list = Array.isArray(raw) ? raw : [];
    return list.map((emp: any) => ({
      value: String(emp.employeeCode),
      label: emp.employeeName || emp.fullName || String(emp.employeeCode),
    }));
  }, [attendanceEmployeesData]);

  const summaryTotalCount = (summaryData as any)?.metadata?.totalCount ?? 0;

  const employeesList = useMemo<EmployeeAttendanceRow[]>(() => {
    const rows = (summaryData as any)?.data || [];
    const todayStr = format(new Date(), "yyyy-MM-dd");

    return rows.map((emp: any) => {
      const dailyStatus: Record<
        string,
        "P" | "A" | "WO" | "AH" | "E" | "L" | "HL" | ""
      > = {};
      let present = 0;
      let absent = 0;
      let leaves = 0;
      const dailyIsCorrected: Record<string, boolean> = {};

      (emp.attendance || []).forEach((day: any) => {
        let code = mapFinalStatusToCode(day.finalStatus);

        // Hide temporary absent/present statuses for today and the future
        if (day.date >= todayStr) {
          if (code === "A" || code === "P" || code === "AH" || code === "E") {
            code = "";
          }
        }

        dailyStatus[day.date] = code;
        dailyIsCorrected[day.date] = !!day.isCorrected;
      });

      // Apply sandwich leave logic on intermediate weekly off (WO) days
      const sortedDates = Object.keys(dailyStatus).sort();
      const n = sortedDates.length;
      let idx = 0;
      while (idx < n) {
        if (dailyStatus[sortedDates[idx]] === "WO") {
          let j = idx;
          while (j < n && dailyStatus[sortedDates[j]] === "WO") {
            j++;
          }
          const beforeIdx = idx - 1;
          const afterIdx = j;

          if (beforeIdx >= 0 && afterIdx < n) {
            if (
              dailyStatus[sortedDates[beforeIdx]] === "L" &&
              dailyStatus[sortedDates[afterIdx]] === "L"
            ) {
              for (let k = idx; k < j; k++) {
                dailyStatus[sortedDates[k]] = "L";
              }
            }
          }
          idx = j;
        } else {
          idx++;
        }
      }

      // Calculate stats based on final dailyStatus values (after sandwich conversion!)
      Object.keys(dailyStatus).forEach((date) => {
        const code = dailyStatus[date];
        if (code === "P") present++;
        else if (code === "A" || code === "AH" || code === "E") absent++;
        else if (code === "L") leaves++;
      });

      return {
        id: String(emp.employeeId ?? emp.employeeCode),
        employeeId: emp.employeeId,
        name: emp.employeeName || "Unknown Employee",
        code: String(emp.employeeCode || ""),
        role: emp.role || "Developer",
        avatar: getNameInitials(emp.employeeName),
        present,
        absent,
        leaves,
        isActive: true,
        dailyStatus,
        dailyIsCorrected,
        profilePicUrl: emp.profilePicUrl,
      };
    });
  }, [summaryData]);

  useEffect(() => {
    setCurrentPage(1);
  }, [summaryDateRange, summaryEmployeeCode, summaryStatus]);

  // Mock Overtime Requests
  const [overtimes, setOvertimes] = useState<RequestItem[]>([]);

  // Mock On Duty Requests
  const [onDuties, setOnDuties] = useState<RequestItem[]>([]);

  const summaryStartRow =
    summaryTotalCount === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const summaryEndRow = Math.min(summaryTotalCount, currentPage * itemsPerPage);
  const summaryTotalPages = Math.ceil(summaryTotalCount / itemsPerPage) || 1;

  // Quick Action Handlers for approvals (overtime & on-duty only)
  const handleApprove = (id: string, type: "ot" | "od") => {
    toast.success("Request Approved successfully!");
    if (type === "ot") {
      setOvertimes((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, status: "approved" } : item
        )
      );
    } else {
      setOnDuties((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, status: "approved" } : item
        )
      );
    }
  };

  const handleReject = (id: string, type: "ot" | "od") => {
    toast.error("Request Rejected!");
    if (type === "ot") {
      setOvertimes((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, status: "rejected" } : item
        )
      );
    } else {
      setOnDuties((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, status: "rejected" } : item
        )
      );
    }
  };

  // CSV Export
  // const handleExport = () => {
  //   toast.success("Attendance report exported successfully!");
  // };

  // Excel Import
  // const handleImport = () => {
  //   toast.info("Import attendance template selected.");
  // };

  // Helper cell styler
  const getCellClassName = (status: string, dateStr: string) => {
    const weekday = getWeekdayFromDate(dateStr);
    const isWeekend = weekday === "Sat" || weekday === "Sun";
    let base =
      "h-8 w-8 text-[10px] font-bold rounded-md flex items-center justify-center transition-all ";

    if (status === "P") {
      return (
        base +
        "bg-emerald-500/10 text-emerald-600 dark:text-emerald-500 border border-emerald-500/20"
      );
    }
    if (status === "A") {
      return (
        base +
        "bg-rose-500/10 text-rose-600 dark:text-rose-500 border border-rose-500/20"
      );
    }
    if (status === "WO") {
      return (
        base +
        "bg-zinc-100 dark:bg-zinc-900 text-zinc-550 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800"
      );
    }
    if (status === "AH") {
      return (
        base +
        "bg-amber-500/10 text-amber-600 dark:text-amber-500 border border-amber-500/20"
      );
    }
    if (status === "E") {
      return (
        base +
        "bg-yellow-500/10 text-yellow-600 dark:text-yellow-500 border border-yellow-500/20"
      );
    }
    if (status === "L") {
      return (
        base +
        "bg-indigo-500/10 text-indigo-650 dark:text-indigo-400 border border-indigo-500/20"
      );
    }

    if (isWeekend) {
      return (
        base + "bg-zinc-100 dark:bg-zinc-900 text-zinc-400 dark:text-zinc-600"
      );
    }
    return base + "text-zinc-400 dark:text-zinc-600";
  };

  if (selectedEmployee) {
    return (
      <MyAttendance
        employee={{
          id: selectedEmployee.id,
          name: selectedEmployee.name,
          role: selectedEmployee.role,
          avatar: selectedEmployee.avatar,
          phone: selectedEmployee.phone || "7859916283",
          email:
            selectedEmployee.email ||
            `${selectedEmployee.name.toLowerCase().replace(/\s+/g, ".")}@devstree.in`,
          code: selectedEmployee.code,
          dailyStatus: selectedEmployee.dailyStatus,
        }}
        onBack={() => setSelectedEmployee(null)}
      />
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {
        <>
          <div className="flex flex-col lg:flex-row lg:items-center gap-3">
            <MonthYearPicker
              month={selectedMonth}
              year={selectedYear}
              onChange={(m, y) => {
                setSelectedMonth(m);
                setSelectedYear(y);
              }}
              isLoading={isLoadingSummary}
            />

            <SimpleDropDownSearchable
              options={summaryEmployeeOptions}
              value={summaryEmployeeCode ?? undefined}
              placeholder="Filter by employee"
              className="w-full lg:w-[220px] h-11"
              isLoading={isLoadingAttendanceEmployees}
              loadingText="Loading employees..."
              onChange={(val) =>
                setSummaryEmployeeCode(val ? String(val) : null)
              }
              allowClear
            />

            <Select
              value={summaryStatus}
              onValueChange={(val: "active" | "inactive") =>
                setSummaryStatus(val)
              }
            >
              <SelectTrigger className="w-full lg:w-[120px] h-9 bg-background border-border text-xs rounded-lg text-foreground">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border text-popover-foreground text-xs">
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Row count info */}
          <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
            <span className="flex items-center gap-2">
              Showing {summaryStartRow}-{summaryEndRow} of {summaryTotalCount}{" "}
              rows
            </span>
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <span className="h-2.5 w-2.5 bg-emerald-500/20 border border-emerald-500/40 rounded" />{" "}
                Present (P)
              </span>
              <span className="flex items-center gap-1">
                <span className="h-2.5 w-2.5 bg-rose-500/20 border border-rose-500/40 rounded" />{" "}
                Absent (A)
              </span>
              <span className="flex items-center gap-1">
                <span className="h-2.5 w-2.5 bg-indigo-500/20 border border-indigo-500/40 rounded" />{" "}
                Leave (L)
              </span>
              <span className="flex items-center gap-1">
                <span className="h-2.5 w-2.5 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded" />{" "}
                Weekend (WO)
              </span>
            </div>
          </div>

          {/* Calendar Grid Table */}
          <Card className="border-border bg-card overflow-hidden shadow-lg">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-border bg-muted/40">
                    {/* Sticky Employee Info Header */}
                    <th className="sticky left-0 z-20 min-w-[200px] max-w-[240px] bg-card px-4 py-3 text-left text-xs font-bold text-muted-foreground border-r border-border shadow-[2px_0_5px_rgba(0,0,0,0.05)] dark:shadow-[2px_0_5px_rgba(0,0,0,0.4)]">
                      Employees
                    </th>
                    <th className="px-3 py-3 text-center text-xs font-bold text-muted-foreground border-r border-border min-w-[40px]">
                      P
                    </th>
                    <th className="px-3 py-3 text-center text-xs font-bold text-muted-foreground border-r border-border min-w-[40px]">
                      A+E
                    </th>
                    <th className="px-3 py-3 text-center text-xs font-bold text-muted-foreground border-r border-border min-w-[40px]">
                      L
                    </th>

                    {/* Day Headers */}
                    {summaryDateColumns.map(({ dateStr, day, weekday }) => {
                      const isWeekend = weekday === "Sat" || weekday === "Sun";
                      return (
                        <th
                          key={dateStr}
                          className={`px-1.5 py-2 text-center text-[10px] font-semibold border-r border-border min-w-[42px] ${
                            isWeekend
                              ? "text-muted-foreground/60 bg-muted/20"
                              : "text-muted-foreground"
                          }`}
                        >
                          <div className="font-bold">{day}</div>
                          <div className="text-[8px] uppercase tracking-tighter opacity-80 mt-0.5">
                            {weekday}
                          </div>
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody>
                  {isLoadingSummary ? (
                    Array.from({ length: itemsPerPage }).map((_, rowIndex) => {
                      // Vary skeleton widths per row for a natural shimmer effect
                      const nameWidths = [
                        "w-24",
                        "w-20",
                        "w-28",
                        "w-16",
                        "w-22",
                        "w-26",
                        "w-20",
                        "w-24",
                        "w-18",
                        "w-28",
                      ];
                      const codeWidths = [
                        "w-14",
                        "w-16",
                        "w-12",
                        "w-18",
                        "w-14",
                        "w-16",
                        "w-12",
                        "w-16",
                        "w-14",
                        "w-18",
                      ];
                      const nw = nameWidths[rowIndex % nameWidths.length];
                      const cw = codeWidths[rowIndex % codeWidths.length];
                      return (
                        <tr key={rowIndex} className="border-b border-border">
                          {/* Sticky Employee Identity Skeleton */}
                          <td className="sticky left-0 z-10 bg-card px-4 py-3 border-r border-border shadow-[2px_0_5px_rgba(0,0,0,0.05)] dark:shadow-[2px_0_5px_rgba(0,0,0,0.4)]">
                            <div className="flex items-center gap-3">
                              <Skeleton className="h-8 w-8 rounded-full shrink-0" />
                              <div className="flex flex-col gap-1.5">
                                <Skeleton className={`h-3 ${nw} rounded`} />
                                <Skeleton className={`h-2 ${cw} rounded`} />
                              </div>
                            </div>
                          </td>
                          {/* Stats Columns Skeletons — matching actual cell size */}
                          <td className="px-3 py-3 border-r border-border bg-emerald-500/5 text-center">
                            <Skeleton className="h-5 w-7 mx-auto rounded" />
                          </td>
                          <td className="px-3 py-3 border-r border-border bg-rose-500/5 text-center">
                            <Skeleton className="h-5 w-7 mx-auto rounded" />
                          </td>
                          <td className="px-3 py-3 border-r border-border bg-indigo-500/5 text-center">
                            <Skeleton className="h-5 w-7 mx-auto rounded" />
                          </td>
                          {/* Day Cells Skeletons — h-8 w-8 rounded-md matching actual status badges */}
                          {summaryDateColumns.map(({ dateStr }) => (
                            <td
                              key={dateStr}
                              className="p-1 border-r border-border text-center align-middle min-w-[42px]"
                            >
                              <div className="flex justify-center">
                                <Skeleton className="h-8 w-8 rounded-md" />
                              </div>
                            </td>
                          ))}
                        </tr>
                      );
                    })
                  ) : employeesList.length === 0 ? (
                    <tr>
                      <td
                        colSpan={summaryDateColumns.length + 4}
                        className="text-center py-10 text-xs text-muted-foreground"
                      >
                        No employees found
                      </td>
                    </tr>
                  ) : (
                    employeesList.map((emp) => (
                      <tr
                        key={emp.id}
                        className="border-b border-border hover:bg-muted/10 transition-colors"
                      >
                        {/* Sticky Employee Identity Cell */}
                        <td
                          className="sticky left-0 z-10 bg-card px-4 py-3 border-r border-border shadow-[2px_0_5px_rgba(0,0,0,0.05)] dark:shadow-[2px_0_5px_rgba(0,0,0,0.4)] cursor-pointer hover:bg-muted/60 transition-colors"
                          onClick={() => setSelectedEmployee(emp)}
                        >
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8 border border-border">
                              {emp.profilePicUrl ? (
                                <AvatarImage
                                  src={emp.profilePicUrl}
                                  alt={emp.name}
                                />
                              ) : null}
                              <AvatarFallback className="bg-rose-500/10 text-rose-500 text-xs font-bold">
                                {emp.avatar}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col min-w-0">
                              <div className="flex items-center gap-1.5">
                                <span className="text-xs font-semibold text-foreground truncate hover:text-rose-500 transition-colors">
                                  {emp.name}
                                </span>
                                <span
                                  className={`h-1.5 w-1.5 rounded-full ${emp.isActive ? "bg-emerald-500" : "bg-zinc-400 dark:bg-zinc-600"}`}
                                />
                              </div>
                              <span className="text-[10px] text-muted-foreground truncate mt-0.5 capitalize">
                                {emp.code} | {emp.role}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Stat summary cells */}
                        <td className="px-3 py-3 text-center text-xs font-bold text-emerald-600 dark:text-emerald-500 border-r border-border bg-emerald-500/5">
                          {emp.present}
                        </td>
                        <td className="px-3 py-3 text-center text-xs font-bold text-rose-600 dark:text-rose-500 border-r border-border bg-rose-500/5">
                          {emp.absent}
                        </td>
                        <td className="px-3 py-3 text-center text-xs font-bold text-indigo-600 dark:text-indigo-400 border-r border-border bg-indigo-500/5">
                          {emp.leaves}
                        </td>

                        {/* Individual Day statuses */}
                        {summaryDateColumns.map(({ dateStr }) => {
                          const status = emp.dailyStatus[dateStr] || "";
                          const isCorrected =
                            emp.dailyIsCorrected?.[dateStr] ?? false;
                          return (
                            <td
                              key={dateStr}
                              className="p-1 text-center border-r border-border align-middle min-w-[42px]"
                              title={`${emp.name} - ${formatDisplayDate(dateStr)}: ${getStatusLabel(status)} — Click for details`}
                            >
                              <div className="flex justify-center">
                                <span
                                  className={`${getCellClassName(status, dateStr)} cursor-pointer hover:scale-110 hover:shadow-md transition-transform`}
                                  onClick={() => handleDayClick(emp, dateStr)}
                                >
                                  {status
                                    ? `${status}${isCorrected ? "*" : ""}`
                                    : ""}
                                </span>
                              </div>
                            </td>
                          );
                        })}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Pagination Controls */}
          {summaryTotalCount > 0 && (
            <div className="flex flex-wrap flex-col gap-y-2 sm:flex-row sm:items-center sm:justify-between w-full mt-4 px-1 text-xs text-muted-foreground">
              <div>
                Total{" "}
                <span className="font-medium text-foreground">
                  {summaryTotalCount}
                </span>{" "}
                records
              </div>

              <div className="flex flex-wrap gap-4 items-center">
                <div className="flex items-center gap-2">
                  <p className="hidden text-xs font-medium sm:block text-muted-foreground">
                    Rows per page
                  </p>
                  <Select
                    value={`${itemsPerPage}`}
                    onValueChange={(value: any) => {
                      setItemsPerPage(Number(value));
                      setCurrentPage(1);
                    }}
                  >
                    <SelectTrigger className="h-8 w-[70px] border-border text-foreground bg-background">
                      <SelectValue placeholder={itemsPerPage} />
                    </SelectTrigger>
                    <SelectContent
                      className="bg-popover border-border text-popover-foreground text-xs"
                      side="top"
                    >
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

                <div className="hidden sm:flex items-center text-xs text-muted-foreground">
                  Page{" "}
                  <span className="mx-1 font-medium text-foreground">
                    {currentPage}
                  </span>{" "}
                  of{" "}
                  <span className="ml-1 font-medium text-foreground">
                    {summaryTotalPages}
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    className="h-8 w-8 p-0 border-border hover:bg-muted bg-background text-foreground"
                    onClick={() => setCurrentPage(1)}
                    disabled={currentPage === 1}
                  >
                    <DoubleArrowLeftIcon className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    className="h-8 w-8 p-0 border-border hover:bg-muted bg-background text-foreground"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronsLeftIcon className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    className="h-8 w-8 p-0 border-border hover:bg-muted bg-background text-foreground"
                    onClick={() =>
                      setCurrentPage((p) => Math.min(summaryTotalPages, p + 1))
                    }
                    disabled={currentPage >= summaryTotalPages}
                  >
                    <ChevronsRightIcon className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    className="h-8 w-8 p-0 border-border hover:bg-muted bg-background text-foreground"
                    onClick={() => setCurrentPage(summaryTotalPages)}
                    disabled={currentPage >= summaryTotalPages}
                  >
                    <DoubleArrowRightIcon className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </>
      }

      {/* Approvals tab implementations */}
      {(activeTab === "overtime" || activeTab === "onduty") && (
        <Card className="p-5 bg-card border-border shadow-lg text-card-foreground">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">
              {activeTab === "overtime" && "Pending Overtime Approvals"}
              {activeTab === "onduty" && "Pending On Duty Approvals"}
            </h3>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="border-border hover:bg-transparent">
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="text-muted-foreground font-bold text-xs">
                    Employee
                  </TableHead>
                  <TableHead className="text-muted-foreground font-bold text-xs">
                    Date
                  </TableHead>
                  <TableHead className="text-muted-foreground font-bold text-xs">
                    Reason
                  </TableHead>
                  <TableHead className="text-muted-foreground font-bold text-xs text-center">
                    Status
                  </TableHead>
                  <TableHead className="text-muted-foreground font-bold text-xs text-right">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {activeTab === "overtime" &&
                  overtimes.map((req) => (
                    <TableRow
                      key={req.id}
                      className="border-border hover:bg-muted/20"
                    >
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8 border border-border">
                            <AvatarFallback className="bg-rose-500/10 text-rose-500 text-xs font-bold">
                              {req.avatar}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <span className="text-xs font-bold text-foreground block">
                              {req.employeeName}
                            </span>
                            <span className="text-[10px] text-muted-foreground">
                              {req.employeeCode} | {req.role}
                            </span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {req.date}
                      </TableCell>
                      <TableCell className="text-xs text-foreground/90 font-semibold">
                        {req.detail}
                      </TableCell>
                      <TableCell
                        className="text-xs text-muted-foreground max-w-[200px] truncate"
                        title={req.reason}
                      >
                        {req.reason}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge
                          variant={
                            req.status === "pending"
                              ? "warning"
                              : req.status === "approved"
                                ? "success"
                                : "destructive"
                          }
                        >
                          {req.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {req.status === "pending" ? (
                          <div className="flex items-center justify-end gap-1.5">
                            <Button
                              size="icon"
                              variant="outline"
                              className="h-7 w-7 rounded-full bg-emerald-500/10 text-emerald-500 border-emerald-500/20 hover:bg-emerald-500/20 hover:text-emerald-400"
                              onClick={() => handleApprove(req.id, "ot")}
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="outline"
                              className="h-7 w-7 rounded-full bg-rose-500/10 text-rose-500 border-rose-500/20 hover:bg-rose-500/20 hover:text-rose-400"
                              onClick={() => handleReject(req.id, "ot")}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground italic">
                            Actioned
                          </span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}

                {activeTab === "onduty" &&
                  onDuties.map((req) => (
                    <TableRow
                      key={req.id}
                      className="border-border hover:bg-muted/20"
                    >
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8 border border-border">
                            <AvatarFallback className="bg-rose-500/10 text-rose-500 text-xs font-bold">
                              {req.avatar}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <span className="text-xs font-bold text-foreground block">
                              {req.employeeName}
                            </span>
                            <span className="text-[10px] text-muted-foreground">
                              {req.employeeCode} | {req.role}
                            </span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {req.date}
                      </TableCell>
                      <TableCell className="text-xs text-foreground/90 font-semibold">
                        {req.detail}
                      </TableCell>
                      <TableCell
                        className="text-xs text-muted-foreground max-w-[200px] truncate"
                        title={req.reason}
                      >
                        {req.reason}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge
                          variant={
                            req.status === "pending"
                              ? "warning"
                              : req.status === "approved"
                                ? "success"
                                : "destructive"
                          }
                        >
                          {req.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {req.status === "pending" ? (
                          <div className="flex items-center justify-end gap-1.5">
                            <Button
                              size="icon"
                              variant="outline"
                              className="h-7 w-7 rounded-full bg-emerald-500/10 text-emerald-500 border-emerald-500/20 hover:bg-emerald-500/20 hover:text-emerald-400"
                              onClick={() => handleApprove(req.id, "od")}
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="outline"
                              className="h-7 w-7 rounded-full bg-rose-500/10 text-rose-500 border-rose-500/20 hover:bg-rose-500/20 hover:text-rose-400"
                              onClick={() => handleReject(req.id, "od")}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground italic">
                            Actioned
                          </span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}

                {((activeTab === "overtime" && overtimes.length === 0) ||
                  (activeTab === "onduty" && onDuties.length === 0)) && (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="text-center py-8 text-muted-foreground text-xs"
                    >
                      <CheckCircle2 className="h-8 w-8 mx-auto text-emerald-500 mb-2 opacity-60" />
                      All caught up! No pending requests.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </Card>
      )}

      {/* Day Detail Clock In/Out Modal */}
      <Dialog open={isDayModalOpen} onOpenChange={setIsDayModalOpen}>
        <DialogContent className="max-w-xl bg-card border-border shadow-2xl p-6 rounded-2xl text-card-foreground">
          <DialogHeader className="pb-4 border-b border-border">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-rose-500/10 text-rose-500 rounded-xl border border-rose-500/20">
                <Building2 className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle className="text-base font-extrabold text-foreground">
                  Clock In/Out Details for {dayModalEmployee?.name}
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                  {dayModalData?.policyName || "Devstree Shift Policy"}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {dayModalLoading ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <RotateCcw className="h-8 w-8 text-rose-500 animate-spin" />
              <span className="text-xs text-muted-foreground font-semibold">
                Loading clock details...
              </span>
            </div>
          ) : !dayModalData ? (
            <div className="text-center py-12 text-xs text-muted-foreground font-medium">
              No clock details found for this date.
            </div>
          ) : (
            <div className="space-y-5 pt-4">
              {/* Date & Shift strip */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-muted/45 p-4 border border-border rounded-xl">
                <div className="flex items-center gap-2">
                  <CalendarDays className="h-4 w-4 text-rose-500 shrink-0" />
                  <span className="text-xs font-bold text-foreground">
                    {(() => {
                      if (!dayModalData.attendanceDate) return "-";
                      try {
                        return new Date(
                          dayModalData.attendanceDate
                        ).toLocaleDateString("en-US", {
                          weekday: "short",
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        });
                      } catch {
                        return dayModalData.attendanceDate;
                      }
                    })()}
                  </span>
                </div>

                {/* <div className="bg-rose-500/10 border border-rose-500/25 px-3 py-1.5 rounded-lg text-right">
                  <span className="text-[10px] font-bold text-rose-500 block uppercase">
                    {dayModalData.shiftName || "GS01"} - General Shift
                  </span>
                  <span className="text-[10px] text-muted-foreground font-semibold mt-0.5 block">
                    {(() => {
                      const fmt = (t: string | null) => {
                        if (!t) return "-";
                        try {
                          const d = new Date(t);
                          if (isNaN(d.getTime())) {
                            const part = t.split(" ")[1];
                            if (part) {
                              const p = part.split(":");
                              return `${p[0]}:${p[1]}`;
                            }
                            return t;
                          }
                          return d.toLocaleTimeString("en-US", {
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: false,
                          });
                        } catch {
                          return t;
                        }
                      };
                      return `${fmt(dayModalData.shiftStartTime)} to ${fmt(dayModalData.shiftEndTime)}`;
                    })()}
                  </span>
                </div> */}
              </div>

              {/* Punches table */}
              {(dayModalData.clockInDetails || []).length === 0 ? (
                <div className="text-center py-8 text-xs text-muted-foreground">
                  No punch records for this date.
                </div>
              ) : (
                <div className="border border-border rounded-xl overflow-hidden shadow-sm bg-background">
                  <div className="overflow-y-auto max-h-[320px]">
                    <table className="w-full border-collapse text-left text-xs">
                      <thead>
                        <tr className="bg-muted border-b border-border text-muted-foreground font-bold">
                          <th className="px-4 py-2.5">#</th>
                          <th className="px-4 py-2.5">In/Out</th>
                          <th className="px-4 py-2.5">Time (IST)</th>
                          <th className="px-4 py-2.5">Source</th>
                          <th className="px-4 py-2.5">Device</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {[...(dayModalData.clockInDetails || [])]
                          .sort((a: any, b: any) => {
                            const da = a.clockTime.endsWith("Z")
                              ? a.clockTime
                              : `${a.clockTime}Z`;
                            const db = b.clockTime.endsWith("Z")
                              ? b.clockTime
                              : `${b.clockTime}Z`;
                            return (
                              new Date(da).getTime() - new Date(db).getTime()
                            );
                          })
                          .map((punch: any, idx: number) => (
                            <tr
                              key={idx}
                              className="hover:bg-muted/10 transition-colors"
                            >
                              <td className="px-4 py-3 text-muted-foreground font-semibold">
                                {idx + 1}
                              </td>
                              <td className="px-4 py-3">
                                <span
                                  className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                                    punch.inOutType === "IN"
                                      ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                                      : "bg-rose-500/10 text-rose-500 border-rose-500/20"
                                  }`}
                                >
                                  {punch.inOutType}
                                </span>
                              </td>
                              <td className="px-4 py-3 font-semibold text-foreground">
                                {formatMewurkTime(punch.clockTime)}
                              </td>
                              <td className="px-4 py-3 text-muted-foreground flex items-center gap-1.5">
                                <span className="h-4 w-4 bg-muted border border-border rounded-md flex items-center justify-center text-[9px] font-bold shrink-0">
                                  {punch.sourceName ? punch.sourceName[0] : "K"}
                                </span>
                                {punch.sourceName || "Kiosk"}
                              </td>
                              <td className="px-4 py-3 text-muted-foreground">
                                {punch.deviceName || punch.officeName || "-"}
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
