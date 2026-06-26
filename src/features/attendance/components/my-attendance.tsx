import React, { useEffect, useState, useMemo } from "react";
import { createPortal } from "react-dom";
// import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAuthStore } from "@/stores/use-auth-store";
import { MewurkService } from "../services/mewurk-service";
import { Network } from "lucide-react";
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
import { DayDetailModal } from "./day-detail-modal";
import { AttendanceStats } from "./attendance-stats";
import { AttendanceTable } from "./attendance-table";
import { EmployeeStats } from "./employee-stats";
import { EmployeeTable } from "./employee-table";
import { EmployeeHeader } from "./employee-header";

const applySandwichLeaveToAttendanceArray = (attendance: any[]): any[] => {
  if (!Array.isArray(attendance)) return [];
  const sorted = [...attendance].sort((a, b) => a.date.localeCompare(b.date));
  const n = sorted.length;

  const isWO = (statusStr: string) => {
    const s = (statusStr || "").toLowerCase().trim();
    return s === "holiday" || s === "weekend" || s === "weekly off" || s === "wo";
  };

  const isLeave = (statusStr: string) => {
    const s = (statusStr || "").toLowerCase().trim();
    return s === "leave" || s === "l" || s === "approved leave";
  };

  let i = 0;
  while (i < n) {
    const currentStatus = sorted[i].finalStatus || sorted[i].originalStatus || "";
    if (isWO(currentStatus)) {
      let j = i;
      while (j < n) {
        const jsStatus = sorted[j].finalStatus || sorted[j].originalStatus || "";
        if (!isWO(jsStatus)) break;
        j++;
      }
      const beforeIdx = i - 1;
      const afterIdx = j;

      if (beforeIdx >= 0 && afterIdx < n) {
        const beforeStatus = sorted[beforeIdx].finalStatus || sorted[beforeIdx].originalStatus || "";
        const afterStatus = sorted[afterIdx].finalStatus || sorted[afterIdx].originalStatus || "";
        if (isLeave(beforeStatus) && isLeave(afterStatus)) {
          for (let k = i; k < j; k++) {
            sorted[k].finalStatus = "Leave";
            sorted[k].originalStatus = "Leave";
          }
        }
      }
      i = j;
    } else {
      i++;
    }
  }
  return sorted;
};

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
  onEmployeeSelect?: (employeeId: number | null) => void;
}

export const MyAttendance: React.FC<MyAttendanceProps> = ({
  employee,
  onBack,
  filtersPortalId,
  onEmployeeSelect,
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

  const activeEmployee: any = employee || selectedFilterEmployee;

  useEffect(() => {
    if (onEmployeeSelect) {
      onEmployeeSelect(activeEmployee ? Number(activeEmployee.id) : null);
    }
  }, [activeEmployee, onEmployeeSelect]);

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
        empName =
          match.employeeName ||
          match.fullName ||
          `${match.firstName || ""} ${match.lastName || ""}`.trim() ||
          String(match.employeeCode);
      } else {
        const localMatch = allEmployees.find(
          (e) => String(e.employeeCode) === String(code)
        );
        if (localMatch) {
          empName =
            localMatch.employeeName ||
            (localMatch as any).fullName ||
            `${(localMatch as any).firstName || ""} ${(localMatch as any).lastName || ""}`.trim() ||
            String(localMatch.employeeCode);
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

  // const formatWorkingHours = (hours: number | null) => {
  //   if (hours === null || hours === undefined) return "-";
  //   const wholeHours = Math.floor(hours);
  //   const minutes = Math.round((hours - wholeHours) * 60);
  //   return `${String(wholeHours).padStart(2, "0")}:${String(minutes).padStart(2, "0")} HRS`;
  // };

  // const calculateBreakTime = (
  //   firstInStr: string | null,
  //   lastOutStr: string | null,
  //   totalWorkMins: number
  // ) => {
  //   if (!firstInStr || !lastOutStr || totalWorkMins <= 0) return "-";
  //   try {
  //     const firstInIso = firstInStr.endsWith("Z")
  //       ? firstInStr
  //       : `${firstInStr}Z`;
  //     const lastOutIso = lastOutStr.endsWith("Z")
  //       ? lastOutStr
  //       : `${lastOutStr}Z`;
  //     const inMs = new Date(firstInIso).getTime();
  //     const outMs = new Date(lastOutIso).getTime();
  //     if (isNaN(inMs) || isNaN(outMs)) return "-";

  //     const totalElapsedMins = Math.max(Math.floor((outMs - inMs) / 60000), 0);
  //     const breakMins = Math.max(totalElapsedMins - totalWorkMins, 0);
  //     if (breakMins === 0) return "00:00 HRS";

  //     const hrs = Math.floor(breakMins / 60);
  //     const mins = Math.round(breakMins % 60);
  //     return `${String(hrs).padStart(2, "0")}:${String(mins).padStart(2, "0")} HRS`;
  //   } catch {
  //     return "-";
  //   }
  // };

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

        const response = await MewurkService.fetchAttendanceEmployees();
        const dir = Array.isArray(response?.data)
          ? response.data
          : Array.isArray(response)
            ? response
            : [];

        let match = dir.find(
          (e: any) =>
            (e.emailId &&
              e.emailId.toLowerCase() === targetEmail.toLowerCase()) ||
            (e.email && e.email.toLowerCase() === targetEmail.toLowerCase()) ||
            (e.employeeName &&
              e.employeeName.toLowerCase().trim() ===
                targetName.toLowerCase().trim())
        );

        if (!match) {
          match = dir.find(
            (e: any) =>
              e.employeeName &&
              (e.employeeName
                .toLowerCase()
                .includes(targetName.toLowerCase()) ||
                targetName.toLowerCase().includes(e.employeeName.toLowerCase()))
          );
        }

        if (match?.employeeCode) {
          const codeNum = Number(match.employeeCode);
          setMewurkEmployeeCode(
            !Number.isNaN(codeNum) && codeNum > 0 ? codeNum : null
          );
        } else {
          console.warn("Could not match employee to attendance directory.");
        }
      } catch (err) {
        console.error("Resolve Mewurk employee error:", err);
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
        const res = await MewurkService.fetchEmployeeMonthlyAttendance(
          mewurkEmployeeCode,
          selectedMonth,
          selectedYear
        );
        if (res && Array.isArray(res.attendance)) {
          res.attendance = applySandwichLeaveToAttendanceArray(res.attendance);
        }
        setMonthlyData(res);
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
  // const dailyStatusMap = useMemo(() => {
  //   if (activeEmployee?.dailyStatus) return activeEmployee.dailyStatus;
  //   // Generate fallback mock statuses for June 2026
  //   const mapping: Record<number, "P" | "A" | "WO" | "AH" | "E" | "L" | ""> =
  //     {};
  //   for (let d = 1; d <= 30; d++) {
  //     const weekdayIndex = (d + 0) % 7; // June 1st, 2026 is Mon
  //     if (weekdayIndex === 0 || weekdayIndex === 6) {
  //       mapping[d] = "WO";
  //     } else {
  //       // Mostly present, maybe 1 leave or 1 half day
  //       if (d === 9) mapping[d] = "AH";
  //       else if (d === 15) mapping[d] = "L";
  //       else mapping[d] = "P";
  //     }
  //   }
  //   return mapping;
  // }, [activeEmployee]);

  // Compute stats based on statuses and working hours
  const {
    presentCount,
    absentCount,
    leaveCount,
    lateCount,
    woCount,
    totalWorkHours,
    avgWorkHours,
  } = useMemo(() => {
    let p = 0,
      a = 0,
      l = 0,
      wo = 0,
      late = 0;

    if (monthlyData) {
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
          if (status.includes("late") || (item.lateInMinutes && Number(item.lateInMinutes) > 0)) {
            late++;
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
        lateCount: late,
        woCount: wo,
        totalWorkHours: parseTimeToMins(monthlyData.totalWorkingHours),
        avgWorkHours: parseTimeToMins(monthlyData.avgWorkingHours),
      };
    }

    return {
      presentCount: 0,
      absentCount: 0,
      leaveCount: 0,
      lateCount: 0,
      woCount: 0,
      totalWorkHours: 0,
      avgWorkHours: 0,
    };
  }, [monthlyData]);

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

  // Generate dynamic rows based on employee's statuses
  const detailedLogs = useMemo(() => {
    if (monthlyData && Array.isArray(monthlyData.attendance)) {
      return monthlyData.attendance.map((log: any) => {
        const dateObj = new Date(log.date);
        const day = dateObj.getDate();
        const weekday =
          log.day || dateObj.toLocaleDateString("en-US", { weekday: "short" });
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

        const resolveStatusAbbr = (rawStatus: string | null | undefined): "P" | "A" | "WO" | "AH" | "E" | "L" | "" => {
          if (!rawStatus) return "";
          let statusVal: "P" | "A" | "WO" | "AH" | "E" | "L" | "" = statusMap[rawStatus] || "";
          if (!statusVal) {
            const statusName = rawStatus.toLowerCase();
            if (statusName.includes("present")) statusVal = "P";
            else if (statusName.includes("leave")) statusVal = "L";
            else if (
              statusName.includes("off") ||
              statusName.includes("holiday") ||
              statusName.includes("weekly")
            )
              statusVal = "WO";
            else if (statusName.includes("absent")) statusVal = "A";
            else if (statusName.includes("half")) statusVal = "AH";
            else if (statusName.includes("late")) statusVal = "E";
          }
          return statusVal;
        };

        const originalStatus = resolveStatusAbbr(log.originalStatus);
        const finalStatus = resolveStatusAbbr(log.finalStatus);

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
            statusName.includes("holiday") ||
            statusName.includes("weekly")
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
        const lateInTime = log.lateInTime || "00:00";
        const lastOut = log.lastOut ? formatMewurkTime(log.lastOut) : "-";
        const workingHrs = log.workingTime ? `${log.workingTime} HRS` : "-";
        const breakHrs = log.breakTime ? `${log.breakTime} HRS` : "-";

        return {
          day,
          date: dayStr,
          rawDateStr: log.date,
          status,
          originalStatus,
          finalStatus,
          shift: "GS01",
          firstIn,
          lateInTime,
          lastOut,
          breakHrs,
          workingHrs,
          overtimeHrs: "-",
          isRegularization: log.isRegularization,
          isCorrected: !!log.isCorrected,
        };
      });
    }
    return [];
  }, [monthlyData]);

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
      {/* <Select
        value={regStatusFilter || "all"}
        onValueChange={(value) =>
          _setRegStatusFilter(
            value === "all"
              ? ""
              : (value as "pending" | "approved" | "rejected")
          )
        }
      >
        <SelectTrigger className="h-9 w-[160px] rounded-full border-border bg-background text-xs">
          <SelectValue placeholder="Request status" />
        </SelectTrigger>
        <SelectContent className="bg-popover border-border text-popover-foreground text-xs">
          <SelectItem value="all">All</SelectItem>
          <SelectItem value="pending">Pending</SelectItem>
          <SelectItem value="approved">Approved</SelectItem>
          <SelectItem value="rejected">Rejected</SelectItem>
        </SelectContent>
      </Select> */}

      {canFilterEmployees && (
        <SimpleDropDownSearchable
          options={allEmployees.map((emp) => ({
            label:
              emp.employeeName ||
              (emp as any).fullName ||
              `${(emp as any).firstName || ""} ${(emp as any).lastName || ""}`.trim() ||
              String(emp.employeeCode),
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
  };

  const goToNextMonth = () => {
    const d = new Date(selectedYear, selectedMonth, 1);
    setCurrentCalendarMonth(d);
  };

  const monthNavigatorProps = {
    label: monthNavLabel,
    month: selectedMonth,
    year: selectedYear,
    onChange: (m: number, y: number) => {
      setCurrentCalendarMonth(new Date(y, m - 1, 1));
    },
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
                    lateCount={lateCount}
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
                      employeeId={activeEmployee ? Number(activeEmployee.id) : undefined}
                      lateInDays={monthlyData ? (monthlyData.lateInDays ?? 0) : undefined}
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
          lateCount={lateCount}
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
          <div>
            {/* Month navigator skeleton */}
            <div className="flex justify-center py-3 px-4 border-b border-border bg-card">
              <div className="flex items-center gap-3">
                <Skeleton className="h-7 w-7 rounded-full" />
                <Skeleton className="h-4 w-24 rounded" />
                <Skeleton className="h-7 w-7 rounded-full" />
              </div>
            </div>
            {/* Header row skeleton */}
            <div className="flex items-center gap-4 px-4 py-3 border-b border-border bg-muted/60">
              <Skeleton className="h-3 w-16 rounded flex-none" />
              <Skeleton className="h-3 w-12 rounded flex-none" />
              <Skeleton className="h-3 w-14 rounded flex-none" />
              <Skeleton className="h-3 w-14 rounded flex-none" />
              <Skeleton className="h-3 w-16 rounded flex-none" />
              <Skeleton className="h-3 w-20 rounded flex-none ml-auto" />
            </div>
            {/* Body rows skeleton — 10 rows matching actual table rows */}
            {[
              ["w-28", "w-16", "w-14", "w-14", "w-16", "w-20"],
              ["w-24", "w-20", "w-16", "w-16", "w-16", "w-20"],
              ["w-32", "w-16", "w-12", "w-14", "w-16", "w-20"],
              ["w-28", "w-20", "w-14", "w-16", "w-16", "w-20"],
              ["w-24", "w-16", "w-16", "w-14", "w-16", "w-20"],
              ["w-28", "w-20", "w-14", "w-12", "w-16", "w-20"],
              ["w-32", "w-16", "w-16", "w-16", "w-16", "w-20"],
              ["w-24", "w-20", "w-12", "w-14", "w-16", "w-20"],
              ["w-28", "w-16", "w-14", "w-16", "w-16", "w-20"],
              ["w-24", "w-20", "w-16", "w-14", "w-16", "w-20"],
            ].map(([dw, sw, fiw, low, brw, whw], i) => (
              <div
                key={i}
                className="flex items-center gap-4 px-4 py-3 border-b border-border last:border-b-0"
              >
                {/* Date */}
                <Skeleton className={`h-3.5 ${dw} rounded flex-none`} />
                {/* Status badge */}
                <Skeleton className={`h-5 ${sw} rounded-full flex-none`} />
                {/* First In */}
                <Skeleton className={`h-3.5 ${fiw} rounded flex-none`} />
                {/* Last Out */}
                <Skeleton className={`h-3.5 ${low} rounded flex-none`} />
                {/* Break Hours */}
                <Skeleton className={`h-3.5 ${brw} rounded flex-none`} />
                {/* Working Hours */}
                <Skeleton
                  className={`h-3.5 ${whw} rounded flex-none ml-auto`}
                />
              </div>
            ))}
          </div>
        ) : (
          <AttendanceTable
            embedded
            detailedLogs={detailedLogs}
            onRowClick={handleRowClick}
            monthNavigator={monthNavigatorProps}
            employeeId={
              activeEmployee
                ? Number(activeEmployee.id)
                : Number(user?.user?.id)
            }
            lateInDays={monthlyData ? (monthlyData.lateInDays ?? 0) : undefined}
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
