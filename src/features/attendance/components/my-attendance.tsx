import React, { useEffect, useState, useMemo } from "react";
import { AnalogClock } from "./analog-clock";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useAuthStore } from "@/stores/use-auth-store";
import { MewurkService, AttendanceData } from "../services/mewurk-service";
import {
  Clock,
  RotateCcw,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Download,
  Award,
  Phone,
  Mail,
  ArrowLeft,
  Network,
  Trophy,
  Building2,
  TrendingUp,
  // MoreVertical,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  OrgChart,
  extractOrgChartUsers,
} from "../../users/components/org-chart";
import { useGetUsersList } from "../../users/services";
import { Badge } from "@/components/ui/badge";

const tabTriggerClass =
  "flex items-center gap-2 rounded-[50px] !px-3 !py-2 transition-all h-[35px] " +
  "text-foreground/70 hover:text-foreground " +
  "data-[state=active]:bg-foreground data-[state=active]:text-background data-[state=active]:shadow-sm " +
  "dark:text-muted-foreground dark:hover:text-foreground " +
  "dark:data-[state=active]:bg-primary dark:data-[state=active]:text-white dark:data-[state=active]:shadow-[0_2px_8px_oklch(0_0_0/0.5)]";

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
}

export const MyAttendance: React.FC<MyAttendanceProps> = ({
  employee,
  onBack,
}) => {
  const user = useAuthStore((state) => state.user);

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

  const employeeName = employee
    ? employee.name
    : user?.user?.fullName || "Varun Saraswat";
  const employeeRole = employee
    ? employee.role
    : user?.role?.name || "Developer";
  const employeePhone = employee ? employee.phone : "7859916283";
  const employeeEmail = employee
    ? employee.email
    : user?.user?.email || "varun.s@devstree.in";
  const employeeCode = employee ? employee.code : "300";

  // Find matching user in database to get their profile image
  const resolvedDbUser = useMemo(() => {
    if (!(allUsersResponse as any)?.data) return null;
    const users = (allUsersResponse as any).data || [];
    
    if (employee) {
      // 1. Try matching by Mewurk Employee Code
      if (employee.code) {
        const match = users.find(
          (u: any) =>
            u.mewurkEmployeeCode &&
            String(u.mewurkEmployeeCode).trim() === String(employee.code).trim()
        );
        if (match) return match;
      }
      
      // 2. Try matching by Email
      if (employee.email) {
        const match = users.find(
          (u: any) =>
            u.email &&
            u.email.toLowerCase().trim() === employee.email.toLowerCase().trim()
        );
        if (match) return match;
      }
      
      // 3. Try matching by Name
      if (employee.name) {
        const match = users.find(
          (u: any) =>
            u.fullName &&
            u.fullName.toLowerCase().trim() === employee.name.toLowerCase().trim()
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
  }, [employee, allUsersResponse, user]);

  const resolvedProfilePic = useMemo(() => {
    if (resolvedDbUser?.profilePicUrl) {
      return resolvedDbUser.profilePicUrl;
    }
    return user?.user?.profilePicUrl || (user as any)?.profilePicUrl || "";
  }, [employee, resolvedDbUser, user]);

  const employeeAvatarFallback = useMemo(() => {
    const name = employee
      ? employee.name
      : user?.user?.fullName || "Varun Saraswat";
    const nameParts = name.trim().split(/\s+/);
    if (nameParts.length === 1) {
      return nameParts[0].charAt(0).toUpperCase() || "U";
    }
    return (nameParts[0].charAt(0) + nameParts[nameParts.length - 1].charAt(0)).toUpperCase() || "U";
  }, [employee, user]);

  // Sidebar navigation active state (only used in employee view mode)
  const [activeSidebarTab, _] = useState<
    "profile" | "attendance" | "leave" | "payroll"
  >("attendance");
  const [orgModalOpen, setOrgModalOpen] = useState(false);

  // Mewurk API states
  const [selectedMonth, setSelectedMonth] = useState(6); // default to June (6)
  const [selectedYear, setSelectedYear] = useState(2026); // default to 2026

  const [mewurkLogs, setMewurkLogs] = useState<AttendanceData[]>([]);
  const [monthlyData, setMonthlyData] = useState<any | null>(null);
  const [isLoadingLogs, setIsLoadingLogs] = useState(false);
  const [mewurkEmployeeCode, setMewurkEmployeeCode] = useState<number | null>(
    null
  );
  const [todayDetails, setTodayDetails] = useState<any | null>(null);
  const [isLoadingTodayDetails, setIsLoadingTodayDetails] = useState(false);

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

  const formatTimeString = (timeStr: string | null | undefined) => {
    if (!timeStr) return "0h 0m";
    const parts = timeStr.split(":");
    if (parts.length < 2) return timeStr;
    return `${parseInt(parts[0])}h ${parseInt(parts[1])}m`;
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
    if (employee && employee.code) {
      const codeNum = parseInt(employee.code);
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
  }, [employee, user]);

  // Fetch logs
  useEffect(() => {
    if (!mewurkEmployeeCode) return;

    const loadLogs = async () => {
      setIsLoadingLogs(true);
      try {
        if (employee) {
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
  }, [mewurkEmployeeCode, selectedMonth, selectedYear, employee]);

  // Fetch today's detailed clock-in/out details
  useEffect(() => {
    if (!mewurkEmployeeCode) return;
    const fetchTodayPunches = async () => {
      setIsLoadingTodayDetails(true);
      const todayStr = new Date().toISOString().split("T")[0];
      try {
        const data = await MewurkService.fetchClockInDetails(
          mewurkEmployeeCode,
          todayStr
        );
        setTodayDetails(data);
      } catch (err) {
        console.error("Error fetching today's punches:", err);
      } finally {
        setIsLoadingTodayDetails(false);
      }
    };
    fetchTodayPunches();
  }, [mewurkEmployeeCode]);

  // Stats computation for selected employee
  const daysInMonth = useMemo(() => {
    return new Date(selectedYear, selectedMonth, 0).getDate();
  }, [selectedYear, selectedMonth]);

  // Resolve or generate daily status mapping
  const dailyStatusMap = useMemo(() => {
    if (employee?.dailyStatus) return employee.dailyStatus;
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
  }, [employee]);

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

    if (employee && monthlyData) {
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
      return {
        presentCount: p,
        absentCount: a,
        leaveCount: l,
        woCount: wo,
        totalWorkHours: 0,
        avgWorkHours: 0,
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
  }, [mewurkLogs, dailyStatusMap, employee, monthlyData]);

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
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const todayStats = useMemo(() => {
    if (!todayDetails) {
      return {
        startTime: "-",
        punchedIn: false,
        onBreak: false,
        workedSeconds: 0,
        breakSeconds: 0,
        requiredSeconds: 29700, // 8h 15m default
        logs: [],
      };
    }

    const details = [...(todayDetails.clockInDetails || [])];

    // Sort details chronologically using parsed UTC times
    details.sort((a: any, b: any) => {
      const daStr = a.clockTime.endsWith("Z") ? a.clockTime : `${a.clockTime}Z`;
      const dbStr = b.clockTime.endsWith("Z") ? b.clockTime : `${b.clockTime}Z`;
      return new Date(daStr).getTime() - new Date(dbStr).getTime();
    });

    const logs = details.map((d: any) => {
      const timeStr = formatMewurkTime(d.clockTime);
      return {
        time: timeStr,
        type: d.inOutType === "IN" ? "Punch In" : "Punch Out",
        status: d.inOutType === "IN" ? "success" : "warning",
      };
    });

    const firstIn = details.find((d: any) => d.inOutType === "IN");
    const startTimeStr = firstIn ? formatMewurkTime(firstIn.clockTime) : "-";

    const lastPunch = details[details.length - 1];
    const isCurrentlyIn = lastPunch ? lastPunch.inOutType === "IN" : false;
    const isCurrentlyOut = lastPunch ? lastPunch.inOutType === "OUT" : false;

    let reqSecs = 29700;
    if (todayDetails.shiftStartTime && todayDetails.shiftEndTime) {
      const sStart = new Date(todayDetails.shiftStartTime);
      const sEnd = new Date(todayDetails.shiftEndTime);
      if (!isNaN(sStart.getTime()) && !isNaN(sEnd.getTime())) {
        reqSecs = Math.max(
          Math.floor((sEnd.getTime() - sStart.getTime()) / 1000),
          0
        );
      }
    }

    let staticWorkedMs = 0;
    let staticBreakMs = 0;

    for (let i = 0; i < details.length; i++) {
      const current = details[i];
      const next = details[i + 1];

      const currentIso = current.clockTime.endsWith("Z")
        ? current.clockTime
        : `${current.clockTime}Z`;
      const currentMs = new Date(currentIso).getTime();

      if (current.inOutType === "IN") {
        if (next) {
          const nextIso = next.clockTime.endsWith("Z")
            ? next.clockTime
            : `${next.clockTime}Z`;
          const nextMs = new Date(nextIso).getTime();
          staticWorkedMs += Math.max(nextMs - currentMs, 0);
        } else {
          const currentLocalMs = currentTime.getTime();
          staticWorkedMs += Math.max(currentLocalMs - currentMs, 0);
        }
      } else if (current.inOutType === "OUT") {
        if (next) {
          const nextIso = next.clockTime.endsWith("Z")
            ? next.clockTime
            : `${next.clockTime}Z`;
          const nextMs = new Date(nextIso).getTime();
          staticBreakMs += Math.max(nextMs - currentMs, 0);
        } else {
          const currentLocalMs = currentTime.getTime();
          staticBreakMs += Math.max(currentLocalMs - currentMs, 0);
        }
      }
    }

    return {
      startTime: startTimeStr,
      punchedIn: isCurrentlyIn,
      onBreak: isCurrentlyOut,
      workedSeconds: Math.floor(staticWorkedMs / 1000),
      breakSeconds: Math.floor(staticBreakMs / 1000),
      requiredSeconds: reqSecs,
      logs,
    };
  }, [todayDetails, currentTime]);

  const startTime = todayStats.startTime;
  const punchedIn = todayStats.punchedIn;
  // const onBreak = todayStats.onBreak;
  const workedSeconds = todayStats.workedSeconds;
  const breakSeconds = todayStats.breakSeconds;
  const requiredSeconds = todayStats.requiredSeconds;
  const logs = todayStats.logs;

  const formatDuration = (totalSecs: number) => {
    const hrs = Math.floor(totalSecs / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    return `${hrs}h ${mins}m`;
  };

  const formatHMS = (totalSecs: number) => {
    const hrs = String(Math.floor(totalSecs / 3600)).padStart(2, "0");
    const mins = String(Math.floor((totalSecs % 3600) / 60)).padStart(2, "0");
    const secs = String(totalSecs % 60).padStart(2, "0");
    return `${hrs}:${mins}:${secs}`;
  };

  const formatClockTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });
  };

  const formatDateString = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "2-digit",
    });
  };

  const getCompletesAtTime = () => {
    if (!startTime || startTime === "-") return "--:-- --";
    const parts = startTime.split(" ");
    if (parts.length < 2) return "--:-- --";
    const [timeStr, modifier] = parts;
    const timeParts = timeStr.split(":");
    if (timeParts.length < 2) return "--:-- --";
    let [hrsStr, minsStr] = timeParts;
    let startHrs = parseInt(hrsStr);
    const startMins = parseInt(minsStr);

    if (isNaN(startHrs) || isNaN(startMins)) return "--:-- --";

    if (modifier === "PM" && startHrs < 12) startHrs += 12;
    if (modifier === "AM" && startHrs === 12) startHrs = 0;

    const compDate = new Date();
    compDate.setHours(startHrs);
    compDate.setMinutes(startMins);
    compDate.setSeconds(0);
    compDate.setSeconds(compDate.getSeconds() + requiredSeconds + breakSeconds);

    return compDate.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  // Helper weekday converter for June 2026
  const getWeekday = (day: number) => {
    const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const index = (day + 0) % 7; // June 1st is Mon (index 1)
    return weekdays[index];
  };

  // Helper status class for table badge
  const getStatusBadge: any = (
    status: "P" | "A" | "WO" | "AH" | "E" | "L" | ""
  ) => {
    switch (status) {
      case "P":
        return (
          <Badge className="bg-emerald-500/15 text-emerald-500 border border-emerald-500/30 hover:bg-emerald-500/20 text-[10px] font-bold rounded-md px-2 py-0.5">
            PRESENT
          </Badge>
        );
      case "A":
        return (
          <Badge className="bg-rose-500/15 text-rose-500 border border-rose-500/30 hover:bg-rose-500/20 text-[10px] font-bold rounded-md px-2 py-0.5">
            ABSENT
          </Badge>
        );
      case "WO":
        return (
          <Badge className="bg-muted text-muted-foreground border border-border hover:bg-muted text-[10px] font-bold rounded-md px-2 py-0.5">
            WEEKLY OFF
          </Badge>
        );
      case "AH":
        return (
          <Badge className="bg-amber-500/15 text-amber-600 dark:text-amber-500 border border-amber-500/30 hover:bg-amber-500/20 text-[10px] font-bold rounded-md px-2 py-0.5">
            HALF DAY
          </Badge>
        );
      case "E":
        return (
          <Badge className="bg-yellow-500/15 text-yellow-600 dark:text-yellow-500 border border-yellow-500/30 hover:bg-yellow-500/20 text-[10px] font-bold rounded-md px-2 py-0.5">
            LATE/EXCUSED
          </Badge>
        );
      case "L":
        return (
          <Badge className="bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border border-indigo-500/30 hover:bg-indigo-500/20 text-[10px] font-bold rounded-md px-2 py-0.5">
            ON LEAVE
          </Badge>
        );
      default:
        return (
          <Badge className="bg-muted text-muted-foreground/60 text-[10px] rounded-md px-2 py-0.5">
            -
          </Badge>
        );
    }
  };

  // Generate dynamic rows based on employee's statuses
  const detailedLogs = useMemo(() => {
    if (employee) {
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
    employee,
    monthlyData,
  ]);

  const handleRowClick = async (dateStr: string) => {
    if (!dateStr || !mewurkEmployeeCode) return;
    setIsDetailModalOpen(true);
    setIsLoadingDayDetails(true);
    setSelectedDayDetails(null);
    try {
      const data = await MewurkService.fetchClockInDetails(
        mewurkEmployeeCode,
        dateStr
      );
      setSelectedDayDetails(data);
    } catch (err) {
      console.error("Error fetching day details:", err);
    } finally {
      setIsLoadingDayDetails(false);
    }
  };

  // Stats circle gauge parameters for standard view
  const progressPercent = Math.min(
    Math.round((workedSeconds / requiredSeconds) * 100),
    100
  );
  const remainingSeconds = Math.max(requiredSeconds - workedSeconds, 0);
  const strokeWidth = 8;
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset =
    circumference - (progressPercent / 100) * circumference;

  // ----------------------------------------------------
  // RENDER SELECTED EMPLOYEE DETAILS VIEW
  // ----------------------------------------------------
  if (employee) {
    return (
      <div className="flex flex-col gap-6">
        {/* Back navigation & header section */}
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={onBack}
            className="text-muted-foreground hover:text-foreground flex items-center gap-2 text-xs"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Employee Attendance
          </Button>

          <span className="text-xs text-muted-foreground">
            Viewing Attendance Details
          </span>
        </div>

        {/* Top Header Card */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 rounded-2xl bg-card p-6 border border-border shadow-lg relative overflow-hidden text-card-foreground">
          <div className="absolute right-0 top-0 w-32 h-32 bg-blue-600/5 rounded-full blur-3xl pointer-events-none" />
          <div className="flex items-center gap-4 z-10">
            <Avatar className="h-16 w-16 text-xl border-2 border-border">
              <AvatarImage src={resolvedProfilePic} alt={employeeName} />
              <AvatarFallback className="bg-emerald-500/10 text-emerald-500 font-extrabold text-lg">
                {employeeAvatarFallback}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-xl font-extrabold text-foreground flex items-center gap-2">
                {employeeName}
                <span className="text-[10px] px-2 py-0.5 bg-muted border border-border text-muted-foreground rounded font-semibold">
                  {employeeCode}
                </span>
              </h2>
              <p className="text-sm text-muted-foreground font-medium mt-0.5">
                {employeeRole}
              </p>
            </div>
          </div>

          {/* User Links / Contacts Info */}
          <div className="flex flex-col sm:flex-row items-center gap-6 z-10">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setOrgModalOpen(true)}
              className="border-border bg-background hover:bg-muted text-foreground text-xs gap-1.5 rounded-full"
            >
              <Network className="h-3.5 w-3.5 text-blue-500 dark:text-blue-400" />
              <span>Org Chart</span>
            </Button>

            <a
              href={`tel:${employeePhone}`}
              className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <Phone className="h-4 w-4 text-blue-500" />
              <span>{employeePhone}</span>
            </a>

            <a
              href={`mailto:${employeeEmail}`}
              className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <Mail className="h-4 w-4 text-purple-500 dark:text-purple-400" />
              <span>{employeeEmail}</span>
            </a>
          </div>
        </div>

        {/* 2-Column layout with Side Nav and Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Main Content Area */}
          <div className="lg:col-span-12 flex flex-col gap-6">
            {activeSidebarTab === "profile" && (
              <Card className="p-6 bg-card border-border shadow-xl space-y-6 text-card-foreground">
                <div>
                  <h3 className="text-base font-bold text-foreground">
                    Employee Profile Info
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    General system metadata and identity details
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-muted/45 p-4 border border-border rounded-xl space-y-1">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase">
                      Employee Code
                    </span>
                    <p className="text-sm font-semibold text-foreground">
                      {employeeCode}
                    </p>
                  </div>
                  <div className="bg-muted/45 p-4 border border-border rounded-xl space-y-1">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase">
                      Designation
                    </span>
                    <p className="text-sm font-semibold text-foreground">
                      {employeeRole}
                    </p>
                  </div>
                  <div className="bg-muted/45 p-4 border border-border rounded-xl space-y-1">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase">
                      Official Email
                    </span>
                    <p className="text-sm font-semibold text-foreground">
                      {employeeEmail}
                    </p>
                  </div>
                  <div className="bg-muted/45 p-4 border border-border rounded-xl space-y-1">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase">
                      Phone Contact
                    </span>
                    <p className="text-sm font-semibold text-foreground">
                      {employeePhone}
                    </p>
                  </div>
                  <div className="bg-muted/45 p-4 border border-border rounded-xl space-y-1">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase">
                      Department
                    </span>
                    <p className="text-sm font-semibold text-foreground">
                      Engineering & Development
                    </p>
                  </div>
                  <div className="bg-muted/45 p-4 border border-border rounded-xl space-y-1">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase">
                      Employment Status
                    </span>
                    <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-500 flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                      Active
                    </p>
                  </div>
                </div>
              </Card>
            )}

            {/* LEAVE TAB */}
            {activeSidebarTab === "leave" && (
              <Card className="p-6 bg-card border-border shadow-xl space-y-6 text-card-foreground">
                <div>
                  <h3 className="text-base font-bold text-foreground">
                    Leave Balance Summary
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    Leave counts, allocations, and requests
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="bg-muted/45 p-4 border border-border rounded-xl">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase block">
                      Total Leave Count
                    </span>
                    <span className="text-2xl font-black text-foreground mt-1.5 block">
                      18.0
                    </span>
                  </div>
                  <div className="bg-muted/45 p-4 border border-border rounded-xl">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase block">
                      Used Leaves
                    </span>
                    <span className="text-2xl font-black text-rose-500 mt-1.5 block">
                      {leaveCount}.0
                    </span>
                  </div>
                  <div className="bg-muted/45 p-4 border border-border rounded-xl">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase block">
                      Remaining Leaves
                    </span>
                    <span className="text-2xl font-black text-emerald-600 dark:text-emerald-500 mt-1.5 block">
                      {18 - leaveCount}.0
                    </span>
                  </div>
                  <div className="bg-muted/45 p-4 border border-border rounded-xl">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase block">
                      Leave Accuracy
                    </span>
                    <span className="text-2xl font-black text-blue-500 mt-1.5 block">
                      100%
                    </span>
                  </div>
                </div>
              </Card>
            )}

            {/* PAYROLL TAB */}
            {activeSidebarTab === "payroll" && (
              <Card className="p-6 bg-card border-border shadow-xl space-y-6 text-card-foreground">
                <div>
                  <h3 className="text-base font-bold text-foreground">
                    Payroll & Payslips
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    Monthly payslips and financial statements
                  </p>
                </div>
                <div className="border border-border rounded-xl divide-y divide-border overflow-hidden">
                  <div className="p-4 bg-muted/20 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-foreground">
                        June 2026 Salary Statement
                      </p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        Disbursed on 05 Jul 2026
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-border text-xs gap-1.5 h-8 bg-background hover:bg-muted text-foreground"
                    >
                      <Download className="h-3.5 w-3.5" /> Payslip
                    </Button>
                  </div>
                  <div className="p-4 bg-muted/20 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-foreground">
                        May 2026 Salary Statement
                      </p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        Disbursed on 04 Jun 2026
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-border text-xs gap-1.5 h-8 bg-background hover:bg-muted text-foreground"
                    >
                      <Download className="h-3.5 w-3.5" /> Payslip
                    </Button>
                  </div>
                </div>
              </Card>
            )}

            {/* ATTENDANCE LOGS TAB */}
            {activeSidebarTab === "attendance" && (
              <Card className="p-6 bg-card border-border shadow-xl space-y-6 text-card-foreground">
                {/* Panel Header */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-border">
                  <div>
                    <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                      Attendance Logs
                    </h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Daily time logs, punches and working hours breakdown.
                    </p>
                  </div>
                </div>

                {/* Subheader Toolbar */}
                <div className="flex justify-center items-center w-full">
                  {/* Date navigation */}
                  <div className="flex items-center gap-1 bg-background border border-border rounded-lg p-0.5">
                    <button
                      onClick={() => {
                        setSelectedMonth((prev) => {
                          if (prev === 1) {
                            setSelectedYear((y) => y - 1);
                            return 12;
                          }
                          return prev - 1;
                        });
                      }}
                      className="p-1.5 hover:bg-muted rounded text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <ChevronLeft className="h-3.5 w-3.5" />
                    </button>
                    <span className="text-xs font-bold text-foreground px-3 min-w-[80px] text-center">
                      {
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
                      }{" "}
                      {selectedYear}
                    </span>
                    <button
                      onClick={() => {
                        setSelectedMonth((prev) => {
                          if (prev === 12) {
                            setSelectedYear((y) => y + 1);
                            return 1;
                          }
                          return prev + 1;
                        });
                      }}
                      className="p-1.5 hover:bg-muted rounded text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <ChevronRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                {isLoadingLogs ? (
                  <div className="space-y-6">
                    {/* Stats Section Cards Skeleton */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Left Box Skeleton */}
                      <div className="bg-[#f2f6fc]/5 dark:bg-zinc-900/20 p-5 rounded-xl border border-border flex flex-col md:flex-row items-center justify-around gap-6 h-[178px]">
                        <div className="flex items-center gap-6 w-full justify-around">
                          <Skeleton className="w-24 h-24 rounded-full shrink-0" />
                          <div className="space-y-3 flex-1 max-w-[120px]">
                            <Skeleton className="h-4 w-20 rounded" />
                            <Skeleton className="h-3 w-16 rounded" />
                            <Skeleton className="h-3 w-24 rounded" />
                          </div>
                          <Skeleton className="h-24 w-32 rounded-lg border border-border bg-card/50 hidden sm:block" />
                        </div>
                      </div>

                      {/* Right Box Skeleton */}
                      <div className="bg-gradient-to-br from-amber-500/5 to-yellow-600/5 border border-border p-5 rounded-xl flex flex-col md:flex-row items-center justify-between gap-6 h-[178px] w-full">
                        <div className="flex items-center text-center space-y-2 flex-col max-w-[100px] w-full">
                          <Skeleton className="h-10 w-10 rounded-full" />
                          <Skeleton className="h-3 w-16 rounded" />
                        </div>
                        <div className="bg-card p-5 rounded-xl border border-border flex-1 w-full h-full flex flex-col justify-between">
                          <Skeleton className="h-4 w-28 rounded" />
                          <Skeleton className="h-10 w-full rounded-lg" />
                        </div>
                      </div>
                    </div>

                    {/* Table Skeleton */}
                    <div className="border border-border rounded-xl shadow-md bg-card overflow-hidden">
                      <div className="p-4 border-b border-border">
                        <Skeleton className="h-4 w-32 rounded" />
                      </div>
                      <div className="p-4 space-y-4">
                        {[...Array(6)].map((_, i) => (
                          <div
                            key={i}
                            className="flex items-center justify-between gap-4 py-2 border-b border-border last:border-0"
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
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Stats Section Cards */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Left Box: Attendance breakdown */}
                      <div className="bg-[#f2f6fc] dark:bg-zinc-900/20 p-5 rounded-xl border border-[#e2e8f0] dark:border-border/60 flex flex-col md:flex-row items-center justify-around gap-6">
                        {/* Donut Pie chart */}
                        <div className="relative flex items-center justify-center shrink-0">
                          <div
                            className="w-28 h-28 rounded-full flex items-center justify-center shadow-md transition-transform duration-500 hover:scale-105"
                            style={{
                              background: `conic-gradient(
                                #22c55e 0% ${presentPct}%, 
                                #ef4444 ${presentPct}% ${presentPct + absentPct}%, 
                                #3b82f6 ${presentPct + absentPct}% 100%
                              )`,
                            }}
                          >
                            <div className="w-[76px] h-[76px] rounded-full bg-card flex flex-col items-center justify-center shadow-inner">
                              <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">
                                Present
                              </span>
                              <span className="text-base font-extrabold text-emerald-600 dark:text-emerald-500 mt-0.5">
                                {presentPct}%
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Donut Legend */}
                        <div className="space-y-3 flex-1 min-w-[130px]">
                          <div className="flex items-center gap-2">
                            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 shrink-0" />
                            <div className="flex flex-col">
                              <span className="text-xs font-bold text-foreground">
                                {presentCount} Present
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="h-2.5 w-2.5 rounded-full bg-rose-500 shrink-0" />
                            <div className="flex flex-col">
                              <span className="text-xs font-bold text-foreground">
                                {absentCount} Absent / Error
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="h-2.5 w-2.5 rounded-full bg-blue-500 shrink-0" />
                            <div className="flex flex-col">
                              <span className="text-xs font-bold text-foreground">
                                {woCount + leaveCount} Wo / Holiday / Leave
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Regularizations Widget */}
                        <div className="bg-card p-4 rounded-xl border border-[#e2e8f0] dark:border-border/60 w-full max-w-[160px] space-y-3 shadow-sm shrink-0">
                          <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                            Regularizations
                          </h4>
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <span className="h-2 w-2 rounded-full bg-emerald-500 shrink-0" />
                              <span className="text-xs font-semibold text-foreground">
                                0 Approved
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="h-2 w-2 rounded-full bg-amber-500 shrink-0" />
                              <span className="text-xs font-semibold text-foreground">
                                0 Pending
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Right Box: Productivity statistics */}
                      <div className="bg-[#fff8ea] dark:bg-zinc-900/20 border border-[#ffe0b2] dark:border-border/60 p-5 rounded-xl flex flex-col md:flex-row items-center justify-between gap-6">
                        {/* Trophy & Total hrs */}
                        <div className="flex flex-col items-center text-center space-y-2 shrink-0">
                          <Avatar className="h-12 w-12 border-2 border-amber-500 shadow-sm">
                            <AvatarImage src={resolvedProfilePic} alt={employeeName} />
                            <AvatarFallback className="bg-amber-500/20 text-amber-600 dark:text-amber-500 font-extrabold text-sm flex items-center justify-center">
                              {employeeAvatarFallback}
                            </AvatarFallback>
                          </Avatar>

                          <div className="flex items-center justify-center p-1 bg-amber-500/10 rounded-full border border-amber-500/20 text-amber-500">
                            <Award className="h-4.5 w-4.5" />
                          </div>

                          <div>
                            <span className="text-xl font-black text-amber-600 dark:text-amber-500 tracking-tight block">
                              {employee
                                ? monthlyData?.totalWorkingHours
                                  ? formatTimeString(
                                      monthlyData.totalWorkingHours
                                    )
                                  : "0h 0m"
                                : `${presentCount * 8}h 15m`}
                            </span>
                            <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">
                              Working Hours
                            </span>
                          </div>
                        </div>

                        {/* Productivity widget */}
                        <div className="bg-card p-5 rounded-xl border border-[#e2e8f0] dark:border-border/60 flex-1 w-full flex flex-col justify-between h-full min-h-[136px]">
                          <h4 className="text-xs font-extrabold text-foreground flex items-center gap-2 pb-2 border-b border-border/60">
                            <TrendingUp className="h-4 w-4 text-emerald-500" />
                            Productivity
                          </h4>

                          <div className="pt-3">
                            <span className="text-2xl font-black text-foreground font-mono block">
                              {employee
                                ? monthlyData?.avgWorkingHours
                                  ? formatTimeString(
                                      monthlyData.avgWorkingHours
                                    )
                                  : "0h 0m"
                                : "8h 49m"}
                            </span>
                            <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider mt-0.5 block">
                              Avg. Wrk Hrs
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Attendance Logs Table */}
                    <div className="border border-border rounded-xl shadow-md bg-card overflow-hidden">
                      <div className="overflow-auto max-h-[400px]">
                        <table className="w-full border-collapse text-left">
                          <thead>
                            <tr className="bg-muted border-b border-border text-muted-foreground text-xs font-bold">
                              <th className="px-4 py-3 sticky top-0 bg-muted z-10">
                                Date
                              </th>
                              <th className="px-4 py-3 sticky top-0 bg-muted z-10">
                                Status
                              </th>
                              <th className="px-4 py-3 sticky top-0 bg-muted z-10">
                                Shift
                              </th>
                              <th className="px-4 py-3 sticky top-0 bg-muted z-10">
                                First In
                              </th>
                              <th className="px-4 py-3 sticky top-0 bg-muted z-10">
                                Last Out
                              </th>
                              <th className="px-4 py-3 sticky top-0 bg-muted z-10">
                                Working Hours
                              </th>
                              <th className="px-4 py-3 sticky top-0 bg-muted z-10">
                                Overtime Hours
                              </th>
                              <th className="px-4 py-3 w-10 sticky top-0 bg-muted z-10"></th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-border text-xs text-foreground">
                            {detailedLogs.map((log: any) => (
                              <tr
                                key={log.day}
                                className="hover:bg-muted/10 transition-colors cursor-pointer"
                                onClick={() => handleRowClick(log.rawDateStr)}
                              >
                                <td className="px-4 py-2.5 font-semibold text-muted-foreground">
                                  {log.date}
                                </td>
                                <td className="px-4 py-2.5">
                                  {getStatusBadge(log.status)}
                                </td>
                                <td className="px-4 py-2.5 text-muted-foreground font-medium">
                                  {log.shift}
                                </td>
                                <td className="px-4 py-2.5 font-semibold text-foreground">
                                  {log.firstIn}
                                </td>
                                <td className="px-4 py-2.5 font-semibold text-foreground">
                                  {log.lastOut}
                                </td>
                                <td className="px-4 py-2.5 font-bold text-sky-600 dark:text-sky-400">
                                  {log.workingHrs}
                                </td>
                                <td className="px-4 py-2.5 text-muted-foreground font-medium">
                                  {log.overtimeHrs}
                                </td>
                                {/* <td className="px-4 py-2.5 text-right" onClick={(e) => e.stopPropagation()}>
                                  <MoreVertical className="h-4 w-4 text-muted-foreground/60 hover:text-foreground cursor-pointer transition-colors" />
                                </td> */}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </>
                )}
              </Card>
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
                activeUserId={employee.id}
              />
            </div>
          </DialogContent>
        </Dialog>

        {/* Day Detail Clock In/Out Modal */}
        <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
          <DialogContent className="max-w-xl bg-card border-border shadow-2xl p-6 rounded-2xl text-card-foreground">
            <DialogHeader className="pb-4 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-rose-500/10 text-rose-500 rounded-xl border border-rose-500/20">
                  <Building2 className="h-5 w-5" />
                </div>
                <div>
                  <DialogTitle className="text-base font-extrabold text-foreground">
                    Clock In/Out Details — {employee.name}
                  </DialogTitle>
                  <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                    {selectedDayDetails?.policyName || "Devstree Shift Policy"}
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            {isLoadingDayDetails ? (
              <div className="flex flex-col items-center justify-center py-12 gap-3">
                <RotateCcw className="h-8 w-8 text-rose-500 animate-spin" />
                <span className="text-xs text-muted-foreground font-semibold">
                  Loading clock details...
                </span>
              </div>
            ) : !selectedDayDetails ? (
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
                        if (!selectedDayDetails.attendanceDate) return "-";
                        try {
                          return new Date(
                            selectedDayDetails.attendanceDate
                          ).toLocaleDateString("en-US", {
                            weekday: "short",
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          });
                        } catch {
                          return selectedDayDetails.attendanceDate;
                        }
                      })()}
                    </span>
                  </div>
                  <div className="bg-rose-500/10 border border-rose-500/25 px-3 py-1.5 rounded-lg text-right">
                    <span className="text-[10px] font-bold text-rose-500 block uppercase">
                      {selectedDayDetails.shiftName || "GS01"} - General Shift
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
                        return `${fmt(selectedDayDetails.shiftStartTime)} to ${fmt(selectedDayDetails.shiftEndTime)}`;
                      })()}
                    </span>
                  </div>
                </div>

                {/* Punches with inline break gaps */}
                {(() => {
                  const sorted = [
                    ...(selectedDayDetails.clockInDetails || []),
                  ].sort((a: any, b: any) => {
                    const da = a.clockTime.endsWith("Z")
                      ? a.clockTime
                      : `${a.clockTime}Z`;
                    const db = b.clockTime.endsWith("Z")
                      ? b.clockTime
                      : `${b.clockTime}Z`;
                    return new Date(da).getTime() - new Date(db).getTime();
                  });
                  let totalBreakMs = 0;
                  for (let i = 0; i < sorted.length - 1; i++) {
                    if (
                      sorted[i].inOutType === "OUT" &&
                      sorted[i + 1]?.inOutType === "IN"
                    ) {
                      const oi = sorted[i].clockTime.endsWith("Z")
                        ? sorted[i].clockTime
                        : `${sorted[i].clockTime}Z`;
                      const ii = sorted[i + 1].clockTime.endsWith("Z")
                        ? sorted[i + 1].clockTime
                        : `${sorted[i + 1].clockTime}Z`;
                      const gap =
                        new Date(ii).getTime() - new Date(oi).getTime();
                      if (gap > 0) totalBreakMs += gap;
                    }
                  }
                  const fmtMs = (ms: number) => {
                    const mins = Math.floor(ms / 60000);
                    return `${String(Math.floor(mins / 60)).padStart(2, "0")}:${String(mins % 60).padStart(2, "0")} HRS`;
                  };
                  const totalBreakMins = Math.floor(totalBreakMs / 60000);

                  if (sorted.length === 0) {
                    return (
                      <div className="text-center py-8 text-xs text-muted-foreground border border-border rounded-xl">
                        No punch records for this date.
                      </div>
                    );
                  }

                  return (
                    <>
                      <div className="border border-border rounded-xl overflow-hidden shadow-sm bg-background">
                        <div className="overflow-y-auto max-h-[300px]">
                          <table className="w-full border-collapse text-left text-xs">
                            <thead>
                              <tr className="bg-muted border-b border-border text-muted-foreground font-bold sticky top-0 z-10">
                                <th className="px-3 py-2.5 w-8">#</th>
                                <th className="px-3 py-2.5">In/Out</th>
                                <th className="px-3 py-2.5">Time (IST)</th>
                                <th className="px-3 py-2.5">Source</th>
                                <th className="px-3 py-2.5">Device</th>
                              </tr>
                            </thead>
                            <tbody className="font-medium text-foreground">
                              {sorted.map((punch: any, index: number) => {
                                let breakGapMs = 0;
                                const next = sorted[index + 1];
                                if (
                                  punch.inOutType === "OUT" &&
                                  next?.inOutType === "IN"
                                ) {
                                  const oi = punch.clockTime.endsWith("Z")
                                    ? punch.clockTime
                                    : `${punch.clockTime}Z`;
                                  const ii = next.clockTime.endsWith("Z")
                                    ? next.clockTime
                                    : `${next.clockTime}Z`;
                                  const gap =
                                    new Date(ii).getTime() -
                                    new Date(oi).getTime();
                                  if (gap > 0) breakGapMs = gap;
                                }
                                return (
                                  <React.Fragment key={index}>
                                    <tr className="border-b border-border hover:bg-muted/10 transition-colors">
                                      <td className="px-3 py-2.5 text-muted-foreground font-semibold">
                                        {index + 1}
                                      </td>
                                      <td className="px-3 py-2.5">
                                        <span
                                          className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${punch.inOutType === "IN" ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-rose-500/10 text-rose-500 border-rose-500/20"}`}
                                        >
                                          {punch.inOutType}
                                        </span>
                                      </td>
                                      <td className="px-3 py-2.5 font-semibold text-foreground tabular-nums">
                                        {formatMewurkTime(punch.clockTime)}
                                      </td>
                                      <td className="px-3 py-2.5 text-muted-foreground">
                                        <div className="flex items-center gap-1.5">
                                          <span className="h-4 w-4 bg-muted border border-border rounded flex items-center justify-center text-[9px] font-bold shrink-0">
                                            {punch.sourceName
                                              ? punch.sourceName[0]
                                              : "K"}
                                          </span>
                                          {punch.sourceName || "Kiosk"}
                                        </div>
                                      </td>
                                      <td className="px-3 py-2.5 text-muted-foreground truncate max-w-[110px]">
                                        {punch.deviceName ||
                                          punch.officeName ||
                                          "-"}
                                      </td>
                                    </tr>
                                    {breakGapMs > 0 && (
                                      <tr className="bg-amber-500/5">
                                        <td colSpan={5} className="px-3 py-1.5">
                                          <div className="flex items-center gap-2">
                                            <div className="flex-1 h-px bg-amber-500/20" />
                                            <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 whitespace-nowrap flex items-center gap-1">
                                              <span className="h-1.5 w-1.5 rounded-full bg-amber-500 inline-block" />
                                              Break: {fmtMs(breakGapMs)}
                                            </span>
                                            <div className="flex-1 h-px bg-amber-500/20" />
                                          </div>
                                        </td>
                                      </tr>
                                    )}
                                  </React.Fragment>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      </div>
                      <div className="flex items-center justify-between bg-muted/40 border border-border rounded-xl px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="h-2.5 w-2.5 rounded-full bg-amber-500 shrink-0" />
                          <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                            Total Break Time
                          </span>
                        </div>
                        <span
                          className={`text-sm font-extrabold tabular-nums ${totalBreakMins > 0 ? "text-amber-600 dark:text-amber-400" : "text-muted-foreground"}`}
                        >
                          {fmtMs(totalBreakMs)}
                        </span>
                      </div>
                    </>
                  );
                })()}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  // ----------------------------------------------------
  // RENDER ORIGINAL LOGGED-IN USER VIEW
  // ----------------------------------------------------
  return (
    <div className="flex flex-col gap-6">
      {/* Top Header Card */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 rounded-2xl bg-card p-6 border border-border shadow-lg text-card-foreground">
        <div className="flex items-center gap-4">
          <AnalogClock />
          <div>
            <span className="text-[10px] tracking-widest text-muted-foreground uppercase font-bold">
              Welcome
            </span>
            <h2 className="text-xl font-bold text-foreground">
              {employeeName}
            </h2>
            <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
              <CalendarDays className="h-4 w-4 text-rose-500" />
              <span>
                {formatDateString(currentTime)} &nbsp;&bull;&nbsp;{" "}
                {formatClockTime(currentTime)}
              </span>
            </div>
          </div>
        </div>
      </div>

      <Tabs defaultValue="today" className="w-full">
        <TabsList className="bg-[#fdebef] rounded-full dark:bg-muted dark:border-white/10 border border-rose-100/50 h-9 w-fit shrink-0 mb-6">
          <TabsTrigger value="today" className={tabTriggerClass}>
            Today's Log
          </TabsTrigger>
          <TabsTrigger value="monthly" className={tabTriggerClass}>
            Monthly Logs
          </TabsTrigger>
        </TabsList>

        <TabsContent
          value="today"
          className="focus-visible:outline-none flex flex-col gap-6"
        >
          {/* Main Grid: Left is Circular Gauge, Right is Details & Timeline */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
            {/* Progress Gauge Card */}
            <Card className="lg:col-span-1 flex flex-col items-center justify-center p-8 bg-card border-border shadow-lg text-card-foreground lg:h-[480px]">
              <div className="relative flex items-center justify-center">
                {/* SVG Ring Gauge */}
                <svg className="w-44 h-44 transform -rotate-90">
                  <defs>
                    <linearGradient
                      id="attendanceGradient"
                      x1="0%"
                      y1="0%"
                      x2="100%"
                      y2="100%"
                    >
                      <stop offset="0%" stopColor="#f43f5e" />
                      <stop offset="100%" stopColor="#f97316" />
                    </linearGradient>
                  </defs>
                  <circle
                    className="text-muted/20 dark:text-zinc-900"
                    strokeWidth={strokeWidth}
                    stroke="currentColor"
                    fill="transparent"
                    r={radius}
                    cx="88"
                    cy="88"
                  />
                  <circle
                    stroke="url(#attendanceGradient)"
                    strokeWidth={strokeWidth}
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    fill="transparent"
                    r={radius}
                    cx="88"
                    cy="88"
                    className="transition-all duration-1000 ease-out"
                  />
                </svg>
                <div className="absolute flex flex-col items-center justify-center">
                  <span className="text-4xl font-extrabold tracking-tight text-foreground">
                    {progressPercent}%
                  </span>
                  <span className="text-[10px] tracking-wider text-muted-foreground font-bold uppercase mt-0.5">
                    Complete
                  </span>
                </div>
              </div>

              <div className="mt-6 text-center">
                <span className="text-[10px] font-bold text-muted-foreground tracking-wider uppercase block">
                  Completes At
                </span>
                <span className="text-xl font-bold text-foreground mt-1 block">
                  {punchedIn ? getCompletesAtTime() : "--:-- --"}
                </span>

                <span className="text-[10px] font-bold text-amber-500/80 tracking-wider uppercase block mt-4">
                  Time Remaining
                </span>
                <span className="text-2xl font-black text-rose-500 tracking-wider font-mono mt-1 block drop-shadow-[0_0_8px_rgba(239,68,68,0.2)]">
                  {punchedIn ? formatHMS(remainingSeconds) : "00:00:00"}
                </span>
              </div>
            </Card>

            {/* Info Grid & Timeline */}
            <div className="lg:col-span-2 flex flex-col gap-6 lg:h-[480px]">
              {/* Sub Stats Cards Grid */}
              <div className="grid grid-cols-2 gap-4">
                <Card className="p-4 bg-card border-border shadow-md hover:border-muted transition-colors text-card-foreground">
                  <span className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase block">
                    Started
                  </span>
                  <span className="text-lg font-bold text-foreground mt-1.5 block">
                    {startTime}
                  </span>
                </Card>

                <Card className="p-4 bg-card border-border shadow-md hover:border-muted transition-colors text-card-foreground">
                  <span className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase block">
                    Worked
                  </span>
                  <span className="text-lg font-bold text-sky-600 dark:text-sky-400 mt-1.5 block">
                    {formatDuration(workedSeconds)}
                  </span>
                </Card>

                <Card className="p-4 bg-card border-border shadow-md hover:border-muted transition-colors text-card-foreground">
                  <span className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase block">
                    Breaks
                  </span>
                  <span className="text-lg font-bold text-amber-500 mt-1.5 block">
                    {formatDuration(breakSeconds)}
                  </span>
                </Card>

                <Card className="p-4 bg-card border-border shadow-md hover:border-muted transition-colors text-card-foreground">
                  <span className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase block">
                    Required
                  </span>
                  <span className="text-lg font-bold text-muted-foreground mt-1.5 block">
                    {formatDuration(requiredSeconds)}
                  </span>
                </Card>
              </div>

              {/* Activity Logs Timeline */}
              <Card className="p-5 bg-card border-border flex-1 shadow-md text-card-foreground flex flex-col min-h-0">
                <h3 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2">
                  <Clock className="h-4 w-4 text-rose-500" />
                  Today's Punch Logs
                </h3>

                {logs.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-6 text-muted-foreground text-sm flex-1">
                    {isLoadingTodayDetails ? (
                      <RotateCcw className="h-8 w-8 mb-2 opacity-50 animate-spin text-rose-500" />
                    ) : (
                      <RotateCcw className="h-8 w-8 mb-2 opacity-50" />
                    )}
                    {isLoadingTodayDetails
                      ? "Loading today's punches..."
                      : "No punches logged for today."}
                  </div>
                ) : (
                  <div className="flex-1 overflow-y-auto pr-2 pl-5 relative space-y-4 min-h-0">
                    <div className="absolute top-2 bottom-4 left-[11px] w-0.5 bg-border pointer-events-none" />
                    {logs.map((log, index) => (
                      <div
                        key={index}
                        className="relative flex items-center justify-between gap-4"
                      >
                        <div
                          className={`absolute -left-[13px] top-1 h-2.5 w-2.5 rounded-full border-2 border-background z-10 ${
                            log.status === "success"
                              ? "bg-emerald-500"
                              : log.status === "warning"
                                ? "bg-amber-500"
                                : log.status === "error"
                                  ? "bg-rose-500"
                                  : "bg-sky-500"
                          }`}
                        />

                        <div className="flex flex-col">
                          <span className="text-xs font-semibold text-foreground">
                            {log.type}
                          </span>
                          <span className="text-[10px] text-muted-foreground">
                            System Logged
                          </span>
                        </div>

                        <span className="text-xs font-bold text-muted-foreground">
                          {log.time}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="monthly" className="focus-visible:outline-none">
          {/* Monthly Attendance Logs */}
          <Card className="p-6 bg-card border-border shadow-xl space-y-6 text-card-foreground">
            {/* Panel Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-border">
              <div>
                <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                  Attendance Logs
                  {isLoadingLogs && (
                    <RotateCcw className="h-3.5 w-3.5 text-rose-500 animate-spin" />
                  )}
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Daily time logs, punches and working hours breakdown.
                </p>
              </div>
            </div>

            {/* Subheader Toolbar */}
            <div className="flex flex-wrap items-center gap-4">
              {/* Date navigation */}
              <div className="flex justify-center items-center gap-3 bg-background border border-border rounded-lg px-3 py-1">
                <button
                  onClick={() => {
                    setSelectedMonth((prev) => {
                      if (prev === 1) {
                        setSelectedYear((y) => y - 1);
                        return 12;
                      }
                      return prev - 1;
                    });
                  }}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <span className="text-xs font-bold text-foreground min-w-[70px] text-center">
                  {
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
                  }{" "}
                  {selectedYear}
                </span>
                <button
                  onClick={() => {
                    setSelectedMonth((prev) => {
                      if (prev === 12) {
                        setSelectedYear((y) => y + 1);
                        return 1;
                      }
                      return prev + 1;
                    });
                  }}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Stats Section Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Box: Attendance breakdown */}
              <div className="bg-[#f2f6fc]/5 dark:bg-zinc-900/20 p-5 rounded-xl border border-border flex flex-col md:flex-row items-center justify-around gap-6">
                {/* Donut Pie chart */}
                <div className="relative flex items-center justify-center">
                  <div
                    className="w-32 h-32 rounded-full flex items-center justify-center shadow-lg transition-transform duration-500 hover:scale-105"
                    style={{
                      background: `conic-gradient(
                    #22c55e 0% ${presentPct}%, 
                    #ef4444 ${presentPct}% ${presentPct + absentPct}%, 
                    #3b82f6 ${presentPct + absentPct}% 100%
                  )`,
                    }}
                  >
                    <div className="w-[84px] h-[84px] rounded-full bg-card flex flex-col items-center justify-center shadow-inner">
                      <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">
                        Present
                      </span>
                      <span className="text-lg font-extrabold text-emerald-600 dark:text-emerald-500 mt-0.5">
                        {presentPct}%
                      </span>
                    </div>
                  </div>
                </div>

                {/* Donut Legend */}
                <div className="space-y-4 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full bg-emerald-500 shrink-0" />
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-foreground">
                        Present
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        {presentCount} Days
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full bg-rose-500 shrink-0" />
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-foreground">
                        Absent / Error
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        {absentCount} Days
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full bg-blue-500 shrink-0" />
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-foreground">
                        Wo / Holiday / Leave
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        {woCount + leaveCount} Days
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Box: Productivity statistics */}
              <div className="bg-gradient-to-br from-amber-500/10 to-yellow-600/5 dark:from-amber-950/20 dark:to-yellow-950/5 border border-amber-500/20 dark:border-amber-900/30 p-5 rounded-xl flex flex-col md:flex-row items-center justify-between gap-6 shadow-md">
                {/* Trophy & Total hrs */}
                <div className="flex flex-col items-center text-center space-y-2">
                  <Avatar className="h-12 w-12 border-2 border-amber-500 shadow-md">
                    <AvatarImage src={resolvedProfilePic} alt={employeeName} />
                    <AvatarFallback className="bg-amber-500/20 text-amber-600 dark:text-amber-500 font-extrabold text-sm flex items-center justify-center">
                      {employeeAvatarFallback}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex items-center justify-center p-1 bg-amber-500/10 rounded-full border border-amber-500/20 text-amber-500">
                    <Award className="h-5 w-5" />
                  </div>

                  <div>
                    <span className="text-2xl font-black text-amber-600 dark:text-amber-500 tracking-tight block">
                      {formatMinutesToHoursMinutes(totalWorkHours)}
                    </span>
                    <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">
                      Working Hours
                    </span>
                  </div>
                </div>

                {/* Productivity widget */}
                <div className="bg-card p-5 rounded-xl border border-border flex-1 w-full space-y-4">
                  <h4 className="text-xs font-bold text-foreground flex items-center gap-2">
                    <Trophy className="h-4 w-4 text-yellow-500" />
                    Productivity Ratio
                  </h4>

                  <div className="p-4 bg-muted/50 rounded-xl border border-border flex flex-col items-center justify-center">
                    <span className="text-2xl font-black text-foreground font-mono">
                      {formatMinutesToHoursMinutes(avgWorkHours)}
                    </span>
                    <span className="text-[10px] text-muted-foreground font-medium uppercase mt-1">
                      Avg. Wrk Hrs
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Attendance Logs Table */}
            <div className="border border-border rounded-xl shadow-lg bg-card overflow-hidden">
              <div className="overflow-auto max-h-[480px]">
                <table className="w-full border-collapse text-left">
                  <thead>
                    <tr className="bg-muted border-b border-border text-muted-foreground text-xs font-bold sticky top-0 z-10">
                      <th className="px-4 py-3 bg-muted sticky top-0">Date</th>
                      <th className="px-4 py-3 bg-muted sticky top-0">
                        Status
                      </th>
                      <th className="px-4 py-3 bg-muted sticky top-0">
                        First In
                      </th>
                      <th className="px-4 py-3 bg-muted sticky top-0">
                        Last Out
                      </th>
                      <th className="px-4 py-3 bg-muted sticky top-0">
                        Break Time
                      </th>
                      <th className="px-4 py-3 bg-muted sticky top-0">
                        Working Hours
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border text-xs text-foreground">
                    {detailedLogs.map((log: any) => (
                      <tr
                        key={log.day}
                        className="hover:bg-muted/10 transition-colors cursor-pointer"
                        onClick={() => handleRowClick(log.rawDateStr)}
                      >
                        <td className="px-4 py-3 font-semibold text-muted-foreground">
                          {log.date}
                        </td>
                        <td className="px-4 py-3">
                          {getStatusBadge(log.status)}
                        </td>
                        <td className="px-4 py-3 font-semibold text-foreground">
                          {log.firstIn}
                        </td>
                        <td className="px-4 py-3 font-semibold text-foreground">
                          {log.lastOut}
                        </td>
                        <td className="px-4 py-3 font-medium text-muted-foreground/85">
                          {log.breakHrs}
                        </td>
                        <td className="px-4 py-3 font-bold text-sky-600 dark:text-sky-400">
                          {log.workingHrs}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Day Details Modal */}
      <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
        <DialogContent className="max-w-xl bg-card border-border shadow-2xl p-6 rounded-2xl text-card-foreground">
          <DialogHeader className="pb-4 border-b border-border flex flex-row items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-rose-500/10 text-rose-500 rounded-xl border border-rose-500/20">
                <Building2 className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle className="text-base font-extrabold text-foreground">
                  Clock In/Out Details for {employeeName}
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                  {selectedDayDetails?.policyName || "Devstree Shift Policy"}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {isLoadingDayDetails ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <RotateCcw className="h-8 w-8 text-rose-500 animate-spin" />
              <span className="text-xs text-muted-foreground font-semibold">
                Loading clock details...
              </span>
            </div>
          ) : !selectedDayDetails ? (
            <div className="text-center py-12 text-xs text-muted-foreground font-medium">
              No clock details found for this date.
            </div>
          ) : (
            <div className="space-y-6 pt-4">
              {/* Date & Shift Panel */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-muted/45 p-4 border border-border rounded-xl">
                <div className="flex items-center gap-2">
                  <CalendarDays className="h-4 w-4 text-rose-500 shrink-0" />
                  <span className="text-xs font-bold text-foreground">
                    {(() => {
                      if (!selectedDayDetails.attendanceDate) return "-";
                      try {
                        const date = new Date(
                          selectedDayDetails.attendanceDate
                        );
                        return date.toLocaleDateString("en-US", {
                          weekday: "short",
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        });
                      } catch {
                        return selectedDayDetails.attendanceDate;
                      }
                    })()}
                  </span>
                </div>

                <div className="bg-rose-500/10 border border-rose-500/25 px-3 py-1.5 rounded-lg text-right">
                  <span className="text-[10px] font-bold text-rose-500 block uppercase">
                    {selectedDayDetails.shiftName || "GS01"} - General Shift
                  </span>
                  <span className="text-[10px] text-muted-foreground font-semibold mt-0.5 block">
                    {(() => {
                      const formatTimeOnly = (tStr: string | null) => {
                        if (!tStr) return "-";
                        try {
                          const date = new Date(tStr);
                          if (isNaN(date.getTime())) {
                            const timePart = tStr.split(" ")[1];
                            if (timePart) {
                              const parts = timePart.split(":");
                              return `${parts[0]}:${parts[1]}`;
                            }
                            return tStr;
                          }
                          return date.toLocaleTimeString("en-US", {
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: false,
                          });
                        } catch {
                          return tStr;
                        }
                      };
                      return `${formatTimeOnly(selectedDayDetails.shiftStartTime)} to ${formatTimeOnly(selectedDayDetails.shiftEndTime)}`;
                    })()}
                  </span>
                </div>
              </div>

              {/* Punches Table with inline break gaps */}
              {(() => {
                const sorted = [
                  ...(selectedDayDetails.clockInDetails || []),
                ].sort((a: any, b: any) => {
                  const da = a.clockTime.endsWith("Z")
                    ? a.clockTime
                    : `${a.clockTime}Z`;
                  const db = b.clockTime.endsWith("Z")
                    ? b.clockTime
                    : `${b.clockTime}Z`;
                  return new Date(da).getTime() - new Date(db).getTime();
                });

                // Sum all consecutive OUT→IN gaps for total break time
                let totalBreakMs = 0;
                for (let i = 0; i < sorted.length - 1; i++) {
                  if (
                    sorted[i].inOutType === "OUT" &&
                    sorted[i + 1]?.inOutType === "IN"
                  ) {
                    const outIso = sorted[i].clockTime.endsWith("Z")
                      ? sorted[i].clockTime
                      : `${sorted[i].clockTime}Z`;
                    const inIso = sorted[i + 1].clockTime.endsWith("Z")
                      ? sorted[i + 1].clockTime
                      : `${sorted[i + 1].clockTime}Z`;
                    const gap =
                      new Date(inIso).getTime() - new Date(outIso).getTime();
                    if (gap > 0) totalBreakMs += gap;
                  }
                }
                const fmtMs = (ms: number) => {
                  const mins = Math.floor(ms / 60000);
                  return `${String(Math.floor(mins / 60)).padStart(2, "0")}:${String(mins % 60).padStart(2, "0")} HRS`;
                };
                const totalBreakMins = Math.floor(totalBreakMs / 60000);

                if (sorted.length === 0) {
                  return (
                    <div className="text-center py-8 text-xs text-muted-foreground border border-border rounded-xl">
                      No punch records for this date.
                    </div>
                  );
                }

                return (
                  <>
                    <div className="border border-border rounded-xl overflow-hidden shadow-sm bg-background">
                      <div className="overflow-y-auto max-h-[300px]">
                        <table className="w-full border-collapse text-left text-xs">
                          <thead>
                            <tr className="bg-muted border-b border-border text-muted-foreground font-bold sticky top-0 z-10">
                              <th className="px-3 py-2.5 w-8">#</th>
                              <th className="px-3 py-2.5">In/Out</th>
                              <th className="px-3 py-2.5">Time (IST)</th>
                              <th className="px-3 py-2.5">Source</th>
                              <th className="px-3 py-2.5">Device</th>
                            </tr>
                          </thead>
                          <tbody className="font-medium text-foreground">
                            {sorted.map((punch: any, index: number) => {
                              let breakGapMs = 0;
                              const next = sorted[index + 1];
                              if (
                                punch.inOutType === "OUT" &&
                                next?.inOutType === "IN"
                              ) {
                                const outIso = punch.clockTime.endsWith("Z")
                                  ? punch.clockTime
                                  : `${punch.clockTime}Z`;
                                const inIso = next.clockTime.endsWith("Z")
                                  ? next.clockTime
                                  : `${next.clockTime}Z`;
                                const gap =
                                  new Date(inIso).getTime() -
                                  new Date(outIso).getTime();
                                if (gap > 0) breakGapMs = gap;
                              }
                              return (
                                <React.Fragment key={index}>
                                  <tr className="border-b border-border hover:bg-muted/10 transition-colors">
                                    <td className="px-3 py-2.5 text-muted-foreground font-semibold">
                                      {index + 1}
                                    </td>
                                    <td className="px-3 py-2.5">
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
                                    <td className="px-3 py-2.5 font-semibold text-foreground tabular-nums">
                                      {formatMewurkTime(punch.clockTime)}
                                    </td>
                                    <td className="px-3 py-2.5 text-muted-foreground">
                                      <div className="flex items-center gap-1.5">
                                        <span className="h-4 w-4 bg-muted border border-border rounded flex items-center justify-center text-[9px] font-bold shrink-0">
                                          {punch.sourceName
                                            ? punch.sourceName[0]
                                            : "K"}
                                        </span>
                                        {punch.sourceName || "Kiosk"}
                                      </div>
                                    </td>
                                    <td className="px-3 py-2.5 text-muted-foreground truncate max-w-[110px]">
                                      {punch.deviceName ||
                                        punch.officeName ||
                                        "-"}
                                    </td>
                                  </tr>
                                  {breakGapMs > 0 && (
                                    <tr className="bg-amber-500/5">
                                      <td colSpan={5} className="px-3 py-1.5">
                                        <div className="flex items-center gap-2">
                                          <div className="flex-1 h-px bg-amber-500/20" />
                                          <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 whitespace-nowrap flex items-center gap-1">
                                            <span className="h-1.5 w-1.5 rounded-full bg-amber-500 inline-block" />
                                            Break: {fmtMs(breakGapMs)}
                                          </span>
                                          <div className="flex-1 h-px bg-amber-500/20" />
                                        </div>
                                      </td>
                                    </tr>
                                  )}
                                </React.Fragment>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Total Break Summary */}
                    <div className="flex items-center justify-between bg-muted/40 border border-border rounded-xl px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="h-2.5 w-2.5 rounded-full bg-amber-500 shrink-0" />
                        <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                          Total Break Time
                        </span>
                      </div>
                      <span
                        className={`text-sm font-extrabold tabular-nums ${
                          totalBreakMins > 0
                            ? "text-amber-600 dark:text-amber-400"
                            : "text-muted-foreground"
                        }`}
                      >
                        {fmtMs(totalBreakMs)}
                      </span>
                    </div>
                  </>
                );
              })()}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
