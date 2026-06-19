import React, { useEffect, useState, useMemo } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAuthStore } from "@/stores/use-auth-store";
import { MewurkService, AttendanceData } from "../services/mewurk-service";
import { CalendarDays, Network, X } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  OrgChart,
  extractOrgChartUsers,
} from "../../users/components/org-chart";
import { useGetUsersList, useGetUserDetails } from "../../users/services";
import instance from "@/config/instance/instance";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import SimpleDropDownSearchable from "@/components/shared/custome-simple-dropdown";
import { roles } from "@/utils/constant";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

import { DayDetailModal } from "./day-detail-modal";
import { AttendanceStats } from "./attendance-stats";
import { AttendanceTable } from "./attendance-table";
import { EmployeeStats } from "./employee-stats";
import { EmployeeTable } from "./employee-table";
import { EmployeeHeader } from "./employee-header";

interface SelectedEmployee {
  id: string;
  name: string;
  role: string;
  avatar: string;
  phone: string;
  email: string;
  code: string;
  dailyStatus?: Record<number, "P" | "A" | "WO" | "AH" | "E" | "L" | "">;
}

interface MyAttendanceProps {
  employee?: SelectedEmployee;
  onBack?: () => void;
  filtersPortalId?: string;
}

export const MyAttendance: React.FC<MyAttendanceProps> = ({
  employee,
  onBack,
  filtersPortalId,
}) => {
  const user = useAuthStore((state) => state.user);
  const loggedInId = user?.user?.id;
  const { data: loggedInUserDetails }: any = useGetUserDetails(
    loggedInId || ""
  );
  const [selectedFilterEmployee, setSelectedFilterEmployee] =
    useState<SelectedEmployee | null>(null);
  const [allEmployees, setAllEmployees] = useState<
    { employeeName: string; employeeCode: string }[]
  >([]);
  const [isLoadingEmployees, setIsLoadingEmployees] = useState(false);

  const activeEmployee = employee || selectedFilterEmployee;

  const rawRole = user?.role || user?.user?.role;
  const roleName = String(
    rawRole && typeof rawRole === "object" ? rawRole?.name : rawRole || ""
  ).toLowerCase();

  const isAdmin = roleName === roles.ADMIN;
  const isPM = roleName === roles.PROJECT_MANAGER;

  const canFilterEmployees = isAdmin || isPM;

  // Fetch all users list to look up correct profile pictures
  const { data: allUsersResponse, isPending: allUsersLoading } =
    useGetUsersList({
      pagination: false,
      status: "active",
    });
  const allActiveUsers = useMemo(
    () => extractOrgChartUsers(allUsersResponse),
    [allUsersResponse]
  );

  // Find matching user in database to get their profile image
  const resolvedDbUser = useMemo(() => {
    if (!(allUsersResponse as any)?.data) return null;
    const users = (allUsersResponse as any).data || [];

    if (activeEmployee) {
      // 1. Try matching by Mewurk Employee Code
      if (activeEmployee.code) {
        const match = users.find(
          (u: any) =>
            u.mewurkEmployeeCode &&
            String(u.mewurkEmployeeCode).trim() ===
              String(activeEmployee.code).trim()
        );
        if (match) return match;
      }

      // 2. Try matching by Email
      if (activeEmployee.email) {
        const match = users.find(
          (u: any) =>
            u.email &&
            u.email.toLowerCase().trim() ===
              activeEmployee.email.toLowerCase().trim()
        );
        if (match) return match;
      }

      // 3. Try matching by Name
      if (activeEmployee.name) {
        const match = users.find(
          (u: any) =>
            u.fullName &&
            u.fullName.toLowerCase().trim() ===
              activeEmployee.name.toLowerCase().trim()
        );
        if (match) return match;
      }
    } else {
      const loggedInId = user?.user?.id;
      if (loggedInId) {
        const match = users.find((u: any) => u.id === loggedInId);
        if (match) return match;
      }
    }

    return null;
  }, [activeEmployee, allUsersResponse, user]);

  const employeeName = activeEmployee
    ? activeEmployee.name
    : user?.user?.fullName || "Varun Saraswat";
  const employeeRole = activeEmployee
    ? resolvedDbUser?.role?.name || activeEmployee.role
    : user?.role?.name || "Developer";

  const employeeEmail = activeEmployee
    ? resolvedDbUser?.email || activeEmployee.email
    : user?.user?.email || "varun.s@devstree.in";
  const employeeCode = activeEmployee ? activeEmployee.code : "300";

  const resolvedProfilePic = useMemo(() => {
    if (resolvedDbUser?.profilePicUrl) {
      return resolvedDbUser.profilePicUrl;
    }
    return user?.user?.profilePicUrl || (user as any)?.profilePicUrl || "";
  }, [activeEmployee, resolvedDbUser, user]);

  const employeeAvatarFallback = useMemo(() => {
    const name = activeEmployee
      ? activeEmployee.name
      : user?.user?.fullName || "Varun Saraswat";
    const nameParts = name.trim().split(/\s+/);
    if (nameParts.length === 1) {
      return nameParts[0].charAt(0).toUpperCase() || "U";
    }
    return (
      (
        nameParts[0].charAt(0) + nameParts[nameParts.length - 1].charAt(0)
      ).toUpperCase() || "U"
    );
  }, [activeEmployee, user]);

  // Sidebar navigation active state (only used in employee view mode)
  const [activeSidebarTab, _] = useState<
    "profile" | "attendance" | "leave" | "payroll"
  >("attendance");
  const [orgModalOpen, setOrgModalOpen] = useState(false);

  // Mewurk API states
  const [selectedMonth, setSelectedMonth] = useState(6); // default to June (6)
  const [selectedYear, setSelectedYear] = useState(2026); // default to 2026

  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    new Date(2026, 5, 18)
  );
  const [datePopoverOpen, setDatePopoverOpen] = useState(false);
  const [currentCalendarMonth, setCurrentCalendarMonth] = useState<Date>(
    new Date(2026, 5)
  );

  // Sync selectedMonth and selectedYear to the viewed calendar month
  useEffect(() => {
    if (currentCalendarMonth) {
      setSelectedMonth(currentCalendarMonth.getMonth() + 1);
      setSelectedYear(currentCalendarMonth.getFullYear());
    }
  }, [currentCalendarMonth]);

  // Fetch employee list for filter dropdown
  useEffect(() => {
    if (!canFilterEmployees) return;
    const fetchEmployeesList = async () => {
      setIsLoadingEmployees(true);
      try {
        const response = await MewurkService.fetchAttendanceEmployees();
        if (response && Array.isArray(response.data)) {
          setAllEmployees(response.data);
        } else if (Array.isArray(response)) {
          setAllEmployees(response);
        }
      } catch (err) {
        console.error("Error fetching employees for dropdown:", err);
      } finally {
        setIsLoadingEmployees(false);
      }
    };
    fetchEmployeesList();
  }, [canFilterEmployees]);

  const handleEmployeeSelect = async (code: string) => {
    if (!code || code === "none") {
      setSelectedFilterEmployee(null);
      return;
    }
    try {
      const empResponse = await MewurkService.fetchAttendanceEmployees(code);
      const list = Array.isArray(empResponse)
        ? empResponse
        : empResponse?.data || [];
      const match = list.find(
        (e: any) => String(e.employeeCode) === String(code)
      );

      let empName = "";
      if (match) {
        empName = match.employeeName;
      } else {
        const localMatch = allEmployees.find(
          (e) => String(e.employeeCode) === String(code)
        );
        if (localMatch) {
          empName = localMatch.employeeName;
        }
      }

      setSelectedFilterEmployee({
        id: code,
        name: empName || "Unknown Employee",
        role: "Employee",
        avatar: "",
        phone: "-",
        email: "-",
        code: code,
      });
    } catch (err) {
      console.error("Error retrieving selected employee info:", err);
    }
  };

  const [mewurkLogs, setMewurkLogs] = useState<AttendanceData[]>([]);
  const [monthlyData, setMonthlyData] = useState<any | null>(null);
  const [isLoadingLogs, setIsLoadingLogs] = useState(false);
  const [mewurkEmployeeCode, setMewurkEmployeeCode] = useState<number | null>(
    null
  );
  // const [todayDetails, setTodayDetails] = useState<any | null>(null);
  // const [isLoadingTodayDetails, setIsLoadingTodayDetails] = useState(false);

  // States for Day Detail Modal
  const [selectedDayDetails, setSelectedDayDetails] = useState<any | null>(
    null
  );
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isLoadingDayDetails, setIsLoadingDayDetails] = useState(false);

  // Helpers for time formatting
  const formatMewurkTime = (timeStr: string | null) => {
    if (!timeStr) return "-";
    if (timeStr.includes("AM") || timeStr.includes("PM")) return timeStr;
    try {
      // Append 'Z' to treat as UTC if not already specified, converting to local IST
      const isoStr = timeStr.endsWith("Z") ? timeStr : `${timeStr}Z`;
      const date = new Date(isoStr);
      if (isNaN(date.getTime())) {
        const parts = timeStr.split(":");
        if (parts.length < 2) return timeStr;
        let hrs = parseInt(parts[0]);
        const mins = parseInt(parts[1]);
        if (isNaN(hrs) || isNaN(mins)) return timeStr;
        const ampm = hrs >= 12 ? "PM" : "AM";
        hrs = hrs % 12;
        if (hrs === 0) hrs = 12;
        return `${String(hrs).padStart(2, "0")}:${String(mins).padStart(2, "0")} ${ampm}`;
      }
      return date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
    } catch {
      return timeStr;
    }
  };

  const formatWorkingHours = (hours: number | null) => {
    if (hours === null || hours === undefined) return "-";
    const wholeHours = Math.floor(hours);
    const minutes = Math.round((hours - wholeHours) * 60);
    return `${String(wholeHours).padStart(2, "0")}:${String(minutes).padStart(2, "0")} HRS`;
  };

  const calculateBreakTime = (
    firstInStr: string | null,
    lastOutStr: string | null,
    totalWorkMins: number
  ) => {
    if (!firstInStr || !lastOutStr || totalWorkMins <= 0) return "-";
    try {
      const firstInIso = firstInStr.endsWith("Z")
        ? firstInStr
        : `${firstInStr}Z`;
      const lastOutIso = lastOutStr.endsWith("Z")
        ? lastOutStr
        : `${lastOutStr}Z`;
      const inMs = new Date(firstInIso).getTime();
      const outMs = new Date(lastOutIso).getTime();
      if (isNaN(inMs) || isNaN(outMs)) return "-";

      const totalElapsedMins = Math.max(Math.floor((outMs - inMs) / 60000), 0);
      const breakMins = Math.max(totalElapsedMins - totalWorkMins, 0);
      if (breakMins === 0) return "00:00 HRS";

      const hrs = Math.floor(breakMins / 60);
      const mins = Math.round(breakMins % 60);
      return `${String(hrs).padStart(2, "0")}:${String(mins).padStart(2, "0")} HRS`;
    } catch {
      return "-";
    }
  };

  // Resolve Mewurk employee code by matching email/name
  useEffect(() => {
    if (activeEmployee && activeEmployee.code) {
      const codeNum = parseInt(activeEmployee.code);
      if (!isNaN(codeNum) && codeNum > 0) {
        setMewurkEmployeeCode(codeNum);
        return;
      }
    }

    if (loggedInUserDetails?.data?.mewurkEmployeeCode) {
      const codeNum = parseInt(loggedInUserDetails.data.mewurkEmployeeCode);
      if (!isNaN(codeNum) && codeNum > 0) {
        setMewurkEmployeeCode(codeNum);
        return;
      }
    }

    const resolveEmployee = async () => {
      try {
        const targetEmail = user?.user?.email || "varun.s@devstree.in";
        const targetName = user?.user?.fullName || "Varun Saraswat";

        // Fetch directory
        const dir = await MewurkService.fetchDirectory();

        let match = dir.find(
          (e) =>
            (e.emailId &&
              e.emailId.toLowerCase() === targetEmail.toLowerCase()) ||
            (e.employeeName &&
              e.employeeName.toLowerCase().trim() ===
                targetName.toLowerCase().trim())
        );

        if (!match) {
          match = dir.find(
            (e) =>
              e.employeeName &&
              (e.employeeName
                .toLowerCase()
                .includes(targetName.toLowerCase()) ||
                targetName.toLowerCase().includes(e.employeeName.toLowerCase()))
          );
        }

        if (match) {
          setMewurkEmployeeCode(match.employeeCode);
        } else {
          console.warn(
            "Could not match employee to Mewurk directory. Falling back to default admin code."
          );
          setMewurkEmployeeCode(100000022777);
        }
      } catch (err) {
        console.error("Resolve Mewurk employee error:", err);
        setMewurkEmployeeCode(100000022777);
      }
    };
    resolveEmployee();
  }, [activeEmployee, user, loggedInUserDetails]);

  // Fetch logs
  useEffect(() => {
    if (!mewurkEmployeeCode) return;

    const loadLogs = async () => {
      setIsLoadingLogs(true);
      try {
        if (activeEmployee) {
          const res = await MewurkService.fetchEmployeeMonthlyAttendance(
            mewurkEmployeeCode,
            selectedMonth,
            selectedYear
          );
          setMonthlyData(res);
        } else {
          // Fetch logged-in user own monthly logs
          const currentLogs = await MewurkService.fetchMonthlyLogs(
            mewurkEmployeeCode,
            selectedYear,
            selectedMonth
          );

          let prevMonth = selectedMonth - 1;
          let prevYear = selectedYear;
          if (prevMonth === 0) {
            prevMonth = 12;
            prevYear -= 1;
          }
          const prevLogs = await MewurkService.fetchMonthlyLogs(
            mewurkEmployeeCode,
            prevYear,
            prevMonth
          );

          const allLogs = [...prevLogs, ...currentLogs];
          const seenDates = new Set<string>();
          const filtered = allLogs.filter((log) => {
            if (!log.attendanceDate) return false;
            const dateObj = new Date(log.attendanceDate);
            const isSameMonth =
              dateObj.getFullYear() === selectedYear &&
              dateObj.getMonth() + 1 === selectedMonth;
            if (!isSameMonth) return false;

            const dateStr = dateObj.toDateString();
            if (seenDates.has(dateStr)) return false;
            seenDates.add(dateStr);
            return true;
          });

          filtered.sort(
            (a, b) =>
              new Date(a.attendanceDate).getTime() -
              new Date(b.attendanceDate).getTime()
          );
          setMewurkLogs(filtered);
        }
      } catch (err) {
        console.error("Error loading Mewurk monthly logs:", err);
      } finally {
        setIsLoadingLogs(false);
      }
    };

    loadLogs();
  }, [mewurkEmployeeCode, selectedMonth, selectedYear, activeEmployee]);

  // Fetch today's detailed clock-in/out details
  // useEffect(() => {
  //   if (!mewurkEmployeeCode) return;
  //   const fetchTodayPunches = async () => {
  //     setIsLoadingTodayDetails(true);
  //     const todayStr = new Date().toISOString().split("T")[0];
  //     try {
  //       const data = await MewurkService.fetchClockInDetails(
  //         mewurkEmployeeCode,
  //         todayStr
  //       );
  //       setTodayDetails(data);
  //     } catch (err) {
  //       console.error("Error fetching today's punches:", err);
  //     } finally {
  //       setIsLoadingTodayDetails(false);
  //     }
  //   };
  //   fetchTodayPunches();
  // }, [mewurkEmployeeCode]);

  // Stats computation for selected employee
  const daysInMonth = useMemo(() => {
    return new Date(selectedYear, selectedMonth, 0).getDate();
  }, [selectedYear, selectedMonth]);

  // Resolve or generate daily status mapping
  const dailyStatusMap = useMemo(() => {
    if (activeEmployee?.dailyStatus) return activeEmployee.dailyStatus;
    // Generate fallback mock statuses for June 2026
    const mapping: Record<number, "P" | "A" | "WO" | "AH" | "E" | "L" | ""> =
      {};
    for (let d = 1; d <= 30; d++) {
      const weekdayIndex = (d + 0) % 7; // June 1st, 2026 is Mon
      if (weekdayIndex === 0 || weekdayIndex === 6) {
        mapping[d] = "WO";
      } else {
        // Mostly present, maybe 1 leave or 1 half day
        if (d === 9) mapping[d] = "AH";
        else if (d === 15) mapping[d] = "L";
        else mapping[d] = "P";
      }
    }
    return mapping;
  }, [activeEmployee]);

  // Compute stats based on statuses and working hours
  const {
    presentCount,
    absentCount,
    leaveCount,
    woCount,
    totalWorkHours,
    avgWorkHours,
  } = useMemo(() => {
    let p = 0,
      a = 0,
      l = 0,
      wo = 0,
      totalMins = 0,
      daysWithHrs = 0;

    if (activeEmployee && monthlyData) {
      p = monthlyData.workingDays || 0;
      a = monthlyData.absentDays || 0;
      if (Array.isArray(monthlyData.attendance)) {
        monthlyData.attendance.forEach((item: any) => {
          const status = (
            item.finalStatus ||
            item.originalStatus ||
            ""
          ).toLowerCase();
          if (status.includes("leave")) {
            l++;
          } else if (
            status.includes("off") ||
            status.includes("holiday") ||
            status.includes("weekly")
          ) {
            wo++;
          }
        });
      }

      const parseTimeToMins = (str: any) => {
        if (!str || typeof str !== "string") return 0;
        const parts = str.split(":");
        if (parts.length === 2) {
          const h = parseInt(parts[0], 10);
          const m = parseInt(parts[1], 10);
          if (!isNaN(h) && !isNaN(m)) return h * 60 + m;
        }
        return 0;
      };

      return {
        presentCount: p,
        absentCount: a,
        leaveCount: l,
        woCount: wo,
        totalWorkHours: parseTimeToMins(monthlyData.totalWorkingHours),
        avgWorkHours: parseTimeToMins(monthlyData.avgWorkingHours),
      };
    }

    if (mewurkLogs && mewurkLogs.length > 0) {
      mewurkLogs.forEach((log) => {
        const statusName = (log.clientStatusName || "").toLowerCase();
        if (statusName.includes("present") || log.firstClockIn) {
          p++;
          if (log.totalWorkingHour && log.totalWorkingHour > 0) {
            totalMins += log.totalWorkingHour;
            daysWithHrs++;
          }
        } else if (statusName.includes("leave")) {
          l++;
        } else if (
          statusName.includes("off") ||
          statusName.includes("holiday")
        ) {
          wo++;
        } else if (statusName.includes("absent")) {
          a++;
        } else {
          const dateObj = new Date(log.attendanceDate);
          const isWeekend = dateObj.getDay() === 0 || dateObj.getDay() === 6;
          if (isWeekend) wo++;
          else a++;
        }
      });
    } else {
      Object.values(dailyStatusMap).forEach((st) => {
        if (st === "P") p++;
        else if (st === "A" || st === "AH" || st === "E") a++;
        else if (st === "L") l++;
        else if (st === "WO") wo++;
      });
    }

    const avgMins = daysWithHrs > 0 ? totalMins / daysWithHrs : 0;

    return {
      presentCount: p,
      absentCount: a,
      leaveCount: l,
      woCount: wo,
      totalWorkHours: totalMins,
      avgWorkHours: avgMins,
    };
  }, [mewurkLogs, dailyStatusMap, activeEmployee, monthlyData]);

  // Helper formatter for dynamic working hours
  const formatMinutesToHoursMinutes = (totalMins: number) => {
    const hrs = Math.floor(totalMins / 60);
    const mins = Math.round(totalMins % 60);
    return `${hrs}h ${mins}m`;
  };

  // Donut chart percentages
  const presentPct =
    daysInMonth > 0 ? Math.round((presentCount / daysInMonth) * 100) : 0;
  const absentPct =
    daysInMonth > 0 ? Math.round((absentCount / daysInMonth) * 100) : 0;
  // const leavePct = 100 - presentPct - absentPct;

  // Time & log states for standard user view
  // const [currentTime, setCurrentTime] = useState(new Date());

  // useEffect(() => {
  //   const timer = setInterval(() => {
  //     setCurrentTime(new Date());
  //   }, 1000);
  //   return () => clearInterval(timer);
  // }, []);

  // const todayStats = useMemo(() => {
  //   if (!todayDetails) {
  //     return {
  //       startTime: "-",
  //       punchedIn: false,
  //       onBreak: false,
  //       workedSeconds: 0,
  //       breakSeconds: 0,
  //       requiredSeconds: 29700, // 8h 15m default
  //       logs: [],
  //     };
  //   }

  //   const details = [...(todayDetails.clockInDetails || [])];

  //   // Sort details chronologically using parsed UTC times
  //   details.sort((a: any, b: any) => {
  //     const daStr = a.clockTime.endsWith("Z") ? a.clockTime : `${a.clockTime}Z`;
  //     const dbStr = b.clockTime.endsWith("Z") ? b.clockTime : `${b.clockTime}Z`;
  //     return new Date(daStr).getTime() - new Date(dbStr).getTime();
  //   });

  //   const logs = details.map((d: any) => {
  //     const timeStr = formatMewurkTime(d.clockTime);
  //     return {
  //       time: timeStr,
  //       type: d.inOutType === "IN" ? "Punch In" : "Punch Out",
  //       status: d.inOutType === "IN" ? "success" : "warning",
  //     };
  //   });

  //   const firstIn = details.find((d: any) => d.inOutType === "IN");
  //   const startTimeStr = firstIn ? formatMewurkTime(firstIn.clockTime) : "-";

  //   const lastPunch = details[details.length - 1];
  //   const isCurrentlyIn = lastPunch ? lastPunch.inOutType === "IN" : false;
  //   const isCurrentlyOut = lastPunch ? lastPunch.inOutType === "OUT" : false;

  //   let reqSecs = 29700;
  //   if (todayDetails.shiftStartTime && todayDetails.shiftEndTime) {
  //     const sStart = new Date(todayDetails.shiftStartTime);
  //     const sEnd = new Date(todayDetails.shiftEndTime);
  //     if (!isNaN(sStart.getTime()) && !isNaN(sEnd.getTime())) {
  //       reqSecs = Math.max(
  //         Math.floor((sEnd.getTime() - sStart.getTime()) / 1000),
  //         0
  //       );
  //     }
  //   }

  //   let staticWorkedMs = 0;
  //   let staticBreakMs = 0;

  //   for (let i = 0; i < details.length; i++) {
  //     const current = details[i];
  //     const next = details[i + 1];

  //     const currentIso = current.clockTime.endsWith("Z")
  //       ? current.clockTime
  //       : `${current.clockTime}Z`;
  //     const currentMs = new Date(currentIso).getTime();

  //     if (current.inOutType === "IN") {
  //       if (next) {
  //         const nextIso = next.clockTime.endsWith("Z")
  //           ? next.clockTime
  //           : `${next.clockTime}Z`;
  //         const nextMs = new Date(nextIso).getTime();
  //         staticWorkedMs += Math.max(nextMs - currentMs, 0);
  //       } else {
  //         const currentLocalMs = currentTime.getTime();
  //         staticWorkedMs += Math.max(currentLocalMs - currentMs, 0);
  //       }
  //     } else if (current.inOutType === "OUT") {
  //       if (next) {
  //         const nextIso = next.clockTime.endsWith("Z")
  //           ? next.clockTime
  //           : `${next.clockTime}Z`;
  //         const nextMs = new Date(nextIso).getTime();
  //         staticBreakMs += Math.max(nextMs - currentMs, 0);
  //       } else {
  //         const currentLocalMs = currentTime.getTime();
  //         staticBreakMs += Math.max(currentLocalMs - currentMs, 0);
  //       }
  //     }
  //   }

  //   return {
  //     startTime: startTimeStr,
  //     punchedIn: isCurrentlyIn,
  //     onBreak: isCurrentlyOut,
  //     workedSeconds: Math.floor(staticWorkedMs / 1000),
  //     breakSeconds: Math.floor(staticBreakMs / 1000),
  //     requiredSeconds: reqSecs,
  //     logs,
  //   };
  // }, [todayDetails, currentTime]);

  // const startTime = todayStats.startTime;
  // const punchedIn = todayStats.punchedIn;
  // const onBreak = todayStats.onBreak;
  // const workedSeconds = todayStats.workedSeconds;
  // const breakSeconds = todayStats.breakSeconds;
  // const requiredSeconds = todayStats.requiredSeconds;
  // const logs = todayStats.logs;

  // const formatDuration = (totalSecs: number) => {
  //   const hrs = Math.floor(totalSecs / 3600);
  //   const mins = Math.floor((totalSecs % 3600) / 60);
  //   return `${hrs}h ${mins}m`;
  // };

  // const formatHMS = (totalSecs: number) => {
  //   const hrs = String(Math.floor(totalSecs / 3600)).padStart(2, "0");
  //   const mins = String(Math.floor((totalSecs % 3600) / 60)).padStart(2, "0");
  //   const secs = String(totalSecs % 60).padStart(2, "0");
  //   return `${hrs}:${mins}:${secs}`;
  // };

  // const getCompletesAtTime = () => {
  //   if (!startTime || startTime === "-") return "--:-- --";
  //   const parts = startTime.split(" ");
  //   if (parts.length < 2) return "--:-- --";
  //   const [timeStr, modifier] = parts;
  //   const timeParts = timeStr.split(":");
  //   if (timeParts.length < 2) return "--:-- --";
  //   let [hrsStr, minsStr] = timeParts;
  //   let startHrs = parseInt(hrsStr);
  //   const startMins = parseInt(minsStr);

  //   if (isNaN(startHrs) || isNaN(startMins)) return "--:-- --";

  //   if (modifier === "PM" && startHrs < 12) startHrs += 12;
  //   if (modifier === "AM" && startHrs === 12) startHrs = 0;

  //   const compDate = new Date();
  //   compDate.setHours(startHrs);
  //   compDate.setMinutes(startMins);
  //   compDate.setSeconds(0);
  //   compDate.setSeconds(compDate.getSeconds() + requiredSeconds + breakSeconds);

  //   return compDate.toLocaleTimeString("en-US", {
  //     hour: "2-digit",
  //     minute: "2-digit",
  //     hour12: true,
  //   });
  // };

  // Helper weekday converter for June 2026
  const getWeekday = (day: number) => {
    const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const index = (day + 0) % 7; // June 1st is Mon (index 1)
    return weekdays[index];
  };

  // Generate dynamic rows based on employee's statuses
  const detailedLogs = useMemo(() => {
    if (activeEmployee) {
      if (monthlyData && Array.isArray(monthlyData.attendance)) {
        return monthlyData.attendance.map((log: any) => {
          const dateObj = new Date(log.date);
          const day = dateObj.getDate();
          const weekday =
            log.day ||
            dateObj.toLocaleDateString("en-US", { weekday: "short" });
          const monthStr = dateObj.toLocaleDateString("en-US", {
            month: "short",
          });
          const dayStr = `${weekday}, ${day} ${monthStr}`;

          const statusMap: Record<
            string,
            "P" | "A" | "WO" | "AH" | "E" | "L" | ""
          > = {
            Present: "P",
            Absent: "A",
            "Weekly off": "WO",
            "Weekly Off": "WO",
            "Half Day": "AH",
            Late: "E",
            Leave: "L",
          };

          let status =
            statusMap[log.finalStatus || log.originalStatus || ""] || "";
          if (!status) {
            const statusName = (
              log.finalStatus ||
              log.originalStatus ||
              ""
            ).toLowerCase();
            if (statusName.includes("present")) status = "P";
            else if (statusName.includes("leave")) status = "L";
            else if (
              statusName.includes("off") ||
              statusName.includes("holiday")
            )
              status = "WO";
            else if (statusName.includes("absent")) status = "A";
            else if (statusName.includes("half")) status = "AH";
            else if (statusName.includes("late")) status = "E";
          }

          if (!status) {
            const isWeekend = dateObj.getDay() === 0 || dateObj.getDay() === 6;
            status = isWeekend ? "WO" : "A";
          }

          const firstIn = log.firstIn ? formatMewurkTime(log.firstIn) : "-";
          const lastOut = log.lastOut ? formatMewurkTime(log.lastOut) : "-";
          const workingHrs = log.workingTime ? `${log.workingTime} HRS` : "-";
          const breakHrs = log.breakTime ? `${log.breakTime} HRS` : "-";

          return {
            day,
            date: dayStr,
            rawDateStr: log.date,
            status,
            shift: "GS01",
            firstIn,
            lastOut,
            breakHrs,
            workingHrs,
            overtimeHrs: "-",
          };
        });
      }
      return [];
    }

    if (mewurkLogs && mewurkLogs.length > 0) {
      return mewurkLogs.map((log) => {
        const dateObj = new Date(log.attendanceDate);
        const day = dateObj.getDate();
        const weekday = dateObj.toLocaleDateString("en-US", {
          weekday: "short",
        });
        const monthStr = dateObj.toLocaleDateString("en-US", {
          month: "short",
        });
        const dayStr = `${weekday}, ${day} ${monthStr}`;

        const statusMap: Record<
          string,
          "P" | "A" | "WO" | "AH" | "E" | "L" | ""
        > = {
          Present: "P",
          Absent: "A",
          "Weekly off": "WO",
          "Weekly Off": "WO",
          "Half Day": "AH",
          Late: "E",
          Leave: "L",
        };

        let status = statusMap[log.clientStatusName || ""] || "";
        if (!status) {
          const statusName = (log.clientStatusName || "").toLowerCase();
          if (statusName.includes("present")) status = "P";
          else if (statusName.includes("leave")) status = "L";
          else if (statusName.includes("off") || statusName.includes("holiday"))
            status = "WO";
          else if (statusName.includes("absent")) status = "A";
          else if (statusName.includes("half")) status = "AH";
          else if (statusName.includes("late")) status = "E";
        }

        if (!status) {
          const isWeekend = dateObj.getDay() === 0 || dateObj.getDay() === 6;
          status = isWeekend ? "WO" : "A";
        }

        const firstIn = log.firstClockIn
          ? formatMewurkTime(log.firstClockIn)
          : "-";
        const lastOut = log.lastClockOut
          ? formatMewurkTime(log.lastClockOut)
          : "-";
        const workingHrs =
          log.totalWorkingHour > 0
            ? formatWorkingHours(log.totalWorkingHour / 60)
            : "-";
        const overtimeHrs = log.overtime > 0 ? `${log.overtime} HRS` : "-";
        const breakHrs = calculateBreakTime(
          log.firstClockIn,
          log.lastClockOut,
          log.totalWorkingHour
        );

        return {
          day,
          date: dayStr,
          rawDateStr: log.attendanceDate
            ? log.attendanceDate.split("T")[0]
            : "",
          status,
          shift: log.shiftName || "GS01",
          firstIn,
          lastOut,
          breakHrs,
          workingHrs,
          overtimeHrs,
        };
      });
    }

    const rows = [];
    for (let day = 1; day <= 30; day++) {
      const status = dailyStatusMap[day] || "";
      const weekday = getWeekday(day);
      const dayStr = `${weekday}, ${day} Jun`;

      let firstIn = "-";
      let lastOut = "-";
      let workingHrs = "-";
      let overtimeHrs = "-";

      if (status === "P") {
        const baseMin = 10 + (day % 15);
        firstIn = `10:${baseMin.toString().padStart(2, "0")} AM`;
        const outMin = 30 + (day % 29);
        lastOut = `07:${outMin.toString().padStart(2, "0")} PM`;

        const hrs = 8 + (day % 2 === 0 ? 1 : 0);
        const mins = 10 + (day % 45);
        workingHrs = `${hrs.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")} HRS`;
      } else if (status === "AH") {
        firstIn = "10:00 AM";
        lastOut = "02:15 PM";
        workingHrs = "04:15 HRS";
      } else if (status === "E") {
        firstIn = "11:35 AM";
        lastOut = "07:50 PM";
        workingHrs = "08:15 HRS";
      }

      rows.push({
        day,
        date: dayStr,
        rawDateStr: `${selectedYear}-${String(selectedMonth).padStart(2, "0")}-${String(day).padStart(2, "0")}`,
        status,
        shift: "GS01",
        firstIn,
        lastOut,
        breakHrs: "00:30 HRS",
        workingHrs,
        overtimeHrs,
      });
    }
    return rows;
  }, [
    mewurkLogs,
    dailyStatusMap,
    selectedMonth,
    selectedYear,
    activeEmployee,
    monthlyData,
  ]);

  const handleRowClick = async (dateStr: string) => {
    if (!dateStr) return;
    setIsDetailModalOpen(true);
    setIsLoadingDayDetails(true);
    setSelectedDayDetails(null);
    try {
      let codeToUse = mewurkEmployeeCode;

      if (!activeEmployee) {
        const loggedInId = user?.user?.id;
        if (loggedInId) {
          try {
            const currentCode = loggedInUserDetails?.data?.mewurkEmployeeCode;
            if (currentCode) {
              const codeNum = parseInt(currentCode);
              if (!isNaN(codeNum) && codeNum > 0) {
                codeToUse = codeNum;
              }
            } else {
              const userResponse = await instance.get<any>({
                url: `/users/${loggedInId}`,
              });
              const userData = userResponse?.data?.data || userResponse?.data;
              if (userData?.mewurkEmployeeCode) {
                const codeNum = parseInt(userData.mewurkEmployeeCode);
                if (!isNaN(codeNum) && codeNum > 0) {
                  codeToUse = codeNum;
                  setMewurkEmployeeCode(codeNum);
                }
              }
            }
          } catch (e) {
            console.error(
              "Error ensuring logged in user mewurkEmployeeCode by id:",
              e
            );
          }
        }
      }

      if (!codeToUse) {
        throw new Error("No mewurkEmployeeCode available");
      }

      const data = await MewurkService.fetchClockInDetails(codeToUse, dateStr);
      setSelectedDayDetails(data);
    } catch (err) {
      console.error("Error fetching day details:", err);
    } finally {
      setIsLoadingDayDetails(false);
    }
  };

  // Stats circle gauge parameters for standard view
  // const progressPercent = Math.min(
  //   Math.round((workedSeconds / requiredSeconds) * 100),
  //   100
  // );
  // const remainingSeconds = Math.max(requiredSeconds - workedSeconds, 0);
  // const strokeWidth = 8;
  // const radius = 70;
  // const circumference = 2 * Math.PI * radius;
  // const strokeDashoffset =
  //   circumference - (progressPercent / 100) * circumference;

  const filtersUI = (
    <div className="flex flex-wrap items-center gap-2">
      {canFilterEmployees && (
        <SimpleDropDownSearchable
          options={allEmployees.map((emp) => ({
            label: emp.employeeName,
            value: emp.employeeCode,
          }))}
          value={(selectedFilterEmployee as any)?.code || undefined}
          placeholder="Filter by employee"
          className="w-[200px] h-9"
          isLoading={isLoadingEmployees}
          loadingText="Loading employees..."
          onChange={(val) => handleEmployeeSelect(val || "")}
          allowClear={true}
        />
      )}

      <Popover open={datePopoverOpen} onOpenChange={setDatePopoverOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className={cn(
              "h-9 gap-2 rounded-full border-border bg-background px-3 font-normal hover:bg-muted/50",
              !selectedDate && "text-muted-foreground"
            )}
          >
            <CalendarDays className="h-4 w-4 text-rose-500 shrink-0" />
            <span className="truncate max-w-[140px]">
              {selectedDate
                ? format(selectedDate, "MMM d, yyyy")
                : "Select date"}
            </span>
            {selectedDate && (
              <button
                type="button"
                aria-label="Clear date"
                className="hover:bg-muted -mr-1 flex h-5 w-5 items-center justify-center rounded-full transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  setSelectedDate(undefined);
                  const today = new Date();
                  setCurrentCalendarMonth(today);
                }}
              >
                <X className="text-muted-foreground h-3 w-3" />
              </button>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-auto p-0 rounded-2xl border border-border shadow-2xl"
          align="end"
        >
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={(date) => {
              setSelectedDate(date);
              if (date) {
                setCurrentCalendarMonth(date);
              }
              setDatePopoverOpen(false);
            }}
            month={currentCalendarMonth}
            onMonthChange={setCurrentCalendarMonth}
            numberOfMonths={1}
            captionLayout="dropdown"
            fromYear={2020}
            toYear={2030}
            className="rounded-2xl"
          />
        </PopoverContent>
      </Popover>
    </div>
  );

  const monthNavLabel = `${
    [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ][selectedMonth - 1]
  } ${selectedYear}`;

  const goToPreviousMonth = () => {
    const d = new Date(selectedYear, selectedMonth - 2, 1);
    setCurrentCalendarMonth(d);
    setSelectedDate(d);
  };

  const goToNextMonth = () => {
    const d = new Date(selectedYear, selectedMonth, 1);
    setCurrentCalendarMonth(d);
    setSelectedDate(d);
  };

  const monthNavigatorProps = {
    label: monthNavLabel,
    onPrev: goToPreviousMonth,
    onNext: goToNextMonth,
    isLoading: isLoadingLogs,
  };

  const filtersPortal =
    filtersPortalId && typeof document !== "undefined"
      ? document.getElementById(filtersPortalId)
      : null;

  // ----------------------------------------------------
  // RENDER SELECTED EMPLOYEE DETAILS VIEW
  // ----------------------------------------------------
  if (activeEmployee) {
    return (
      <div className="flex flex-col gap-6">
        <EmployeeHeader
          onBackClick={() => {
            if (onBack) {
              onBack();
            } else {
              setSelectedFilterEmployee(null);
            }
          }}
          allEmployees={allEmployees}
          activeEmployeeCode={activeEmployee?.code || undefined}
          isLoadingEmployees={isLoadingEmployees}
          onEmployeeSelect={(val) => handleEmployeeSelect(val || "")}
          resolvedProfilePic={resolvedProfilePic}
          employeeName={employeeName}
          employeeAvatarFallback={employeeAvatarFallback}
          employeeCode={employeeCode}
          employeeRole={employeeRole}
          employeeEmail={employeeEmail}
          onOrgChartClick={() => setOrgModalOpen(true)}
        />

        {/* 2-Column layout with Side Nav and Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Main Content Area */}
          <div className="lg:col-span-12 flex flex-col gap-6">
            {activeSidebarTab === "attendance" && (
              <div className="flex flex-col gap-3">
                {/* Stats strip */}
                {isLoadingLogs ? (
                  <Card className="w-full overflow-hidden border-border shadow-sm">
                    <div className="flex divide-x divide-border">
                      {[...Array(5)].map((_, i) => (
                        <div
                          key={i}
                          className="flex-1 p-4 min-w-[150px] flex items-center gap-3"
                        >
                          <Skeleton className="h-9 w-9 rounded-lg shrink-0" />
                          <div className="space-y-2 flex-1">
                            <Skeleton className="h-2.5 w-16 rounded" />
                            <Skeleton className="h-4 w-12 rounded" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>
                ) : (
                  <EmployeeStats
                    variant="compact"
                    presentPct={presentPct}
                    absentPct={absentPct}
                    presentCount={presentCount}
                    absentCount={absentCount}
                    woCount={woCount}
                    leaveCount={leaveCount}
                    resolvedProfilePic={resolvedProfilePic}
                    employeeName={employeeName}
                    employeeAvatarFallback={employeeAvatarFallback}
                    employee={activeEmployee}
                    monthlyData={monthlyData}
                  />
                )}

                {/* Attendance Table */}
                <div className="rounded-xl border border-border bg-card shadow-lg overflow-hidden">
                  {isLoadingLogs ? (
                    <div className="p-4 space-y-3">
                      {[...Array(6)].map((_, i) => (
                        <div
                          key={i}
                          className="flex items-center justify-between gap-4 py-2"
                        >
                          <Skeleton className="h-4 w-24 rounded" />
                          <Skeleton className="h-5 w-16 rounded-full" />
                          <Skeleton className="h-4 w-12 rounded" />
                          <Skeleton className="h-4 w-16 rounded" />
                          <Skeleton className="h-4 w-16 rounded" />
                          <Skeleton className="h-4 w-20 rounded" />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <EmployeeTable
                      embedded
                      detailedLogs={detailedLogs}
                      onRowClick={handleRowClick}
                      monthNavigator={monthNavigatorProps}
                    />
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Org Chart Dialog */}
        <Dialog open={orgModalOpen} onOpenChange={setOrgModalOpen}>
          <DialogContent className="w-[96vw] sm:max-w-[96vw] md:max-w-[94vw] lg:max-w-[92vw] xl:max-w-[90vw] h-[92vh] flex flex-col p-6 overflow-hidden bg-card border-border text-card-foreground">
            <DialogHeader className="pb-4 border-b border-border">
              <DialogTitle className="text-xl font-bold flex items-center gap-2 text-foreground">
                <Network className="h-5 w-5 text-blue-500" />
                Organization Chart
              </DialogTitle>
              <DialogDescription className="text-muted-foreground">
                View the hierarchy and structure of devstree team members.
              </DialogDescription>
            </DialogHeader>
            <div className="flex-1 min-h-0 mt-4 overflow-hidden">
              <OrgChart
                users={allActiveUsers}
                loading={allUsersLoading}
                activeUserId={activeEmployee.id}
              />
            </div>
          </DialogContent>
        </Dialog>

        {/* Day Detail Clock In/Out Modal */}
        <DayDetailModal
          isOpen={isDetailModalOpen}
          onOpenChange={setIsDetailModalOpen}
          employeeName={activeEmployee.name}
          selectedDayDetails={selectedDayDetails}
          isLoadingDayDetails={isLoadingDayDetails}
        />
      </div>
    );
  }

  // ----------------------------------------------------
  // RENDER ORIGINAL LOGGED-IN USER VIEW
  // ----------------------------------------------------
  return (
    <div className="flex flex-col gap-3">
      {filtersPortal && createPortal(filtersUI, filtersPortal)}

      {/* Stats strip — server dashboard style */}
      {isLoadingLogs ? (
        <Card className="w-full overflow-hidden border-border shadow-sm">
          <div className="flex divide-x divide-border">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="flex-1 p-4 min-w-[150px] flex items-center gap-3"
              >
                <Skeleton className="h-9 w-9 rounded-lg shrink-0" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-2.5 w-16 rounded" />
                  <Skeleton className="h-4 w-12 rounded" />
                </div>
              </div>
            ))}
          </div>
        </Card>
      ) : (
        <AttendanceStats
          variant="compact"
          presentPct={presentPct}
          absentPct={absentPct}
          presentCount={presentCount}
          absentCount={absentCount}
          woCount={woCount}
          leaveCount={leaveCount}
          resolvedProfilePic={resolvedProfilePic}
          employeeName={employeeName}
          employeeAvatarFallback={employeeAvatarFallback}
          totalWorkHours={totalWorkHours}
          avgWorkHours={avgWorkHours}
          formatMinutesToHoursMinutes={formatMinutesToHoursMinutes}
        />
      )}

      {/* Attendance table */}
      <div className="rounded-xl border border-border bg-card shadow-lg overflow-hidden">
        {isLoadingLogs ? (
          <div className="p-4 space-y-3">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="flex items-center justify-between gap-4 py-2"
              >
                <Skeleton className="h-4 w-24 rounded" />
                <Skeleton className="h-5 w-16 rounded-full" />
                <Skeleton className="h-4 w-12 rounded" />
                <Skeleton className="h-4 w-16 rounded" />
                <Skeleton className="h-4 w-16 rounded" />
                <Skeleton className="h-4 w-20 rounded" />
              </div>
            ))}
          </div>
        ) : (
          <AttendanceTable
            embedded
            detailedLogs={detailedLogs}
            onRowClick={handleRowClick}
            monthNavigator={monthNavigatorProps}
          />
        )}
      </div>

      {/* Day Details Modal */}
      <DayDetailModal
        isOpen={isDetailModalOpen}
        onOpenChange={setIsDetailModalOpen}
        employeeName={employeeName}
        selectedDayDetails={selectedDayDetails}
        isLoadingDayDetails={isLoadingDayDetails}
      />
    </div>
  );
};
