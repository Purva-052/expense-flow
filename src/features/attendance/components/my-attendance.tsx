import React, { useEffect, useState, useMemo } from "react";
import { AnalogClock } from "./analog-clock";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/stores/use-auth-store";
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
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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

interface PunchLog {
  time: string;
  type: "Punch In" | "Punch Out" | "Break Start" | "Break End";
  status: "success" | "warning" | "info" | "error";
}

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
  const employeeName = employee
    ? employee.name
    : user?.user?.fullName || "Varun Saraswat";
  const employeeRole = employee
    ? employee.role
    : user?.role?.name || "Developer";
  const employeeAvatar = employee ? employee.avatar : "VS";
  const employeePhone = employee ? employee.phone : "7859916283";
  const employeeEmail = employee
    ? employee.email
    : user?.user?.email || "varun.s@devstree.in";
  const employeeCode = employee ? employee.code : "300";

  // Sidebar navigation active state (only used in employee view mode)
  const [activeSidebarTab, _] = useState<
    "profile" | "attendance" | "leave" | "payroll"
  >("attendance");
  const [orgModalOpen, setOrgModalOpen] = useState(false);

  // Stats computation for selected employee
  const daysInMonth = 30;

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

  // Compute stats based on statuses
  const { presentCount, absentCount, leaveCount, woCount } = useMemo(() => {
    let p = 0,
      a = 0,
      l = 0,
      wo = 0;
    Object.values(dailyStatusMap).forEach((st) => {
      if (st === "P") p++;
      else if (st === "A" || st === "AH" || st === "E") a++;
      else if (st === "L") l++;
      else if (st === "WO") wo++;
    });
    return { presentCount: p, absentCount: a, leaveCount: l, woCount: wo };
  }, [dailyStatusMap]);

  // Donut chart percentages
  const presentPct = Math.round((presentCount / daysInMonth) * 100);
  const absentPct = Math.round((absentCount / daysInMonth) * 100);
  // const leavePct = 100 - presentPct - absentPct;

  // Org Chart users fetching
  const { data: allUsersResponse, isPending: allUsersLoading } =
    useGetUsersList({
      pagination: false,
      status: "active",
    });
  const allActiveUsers = useMemo(
    () => extractOrgChartUsers(allUsersResponse),
    [allUsersResponse]
  );

  // Time & log states for standard user view
  const [currentTime, setCurrentTime] = useState(new Date());
  const [punchedIn] = useState(true);
  const [onBreak] = useState(false);
  const [workedSeconds, setWorkedSeconds] = useState(18660); // 5h 11m
  const [breakSeconds, setBreakSeconds] = useState(2040); // 34m
  const requiredSeconds = 29700; // 8h 15m
  const startTime = "09:37 AM";
  const [logs] = useState<PunchLog[]>([
    { time: "09:37 AM", type: "Punch In", status: "success" },
    { time: "01:00 PM", type: "Break Start", status: "warning" },
    { time: "01:34 PM", type: "Break End", status: "success" },
  ]);

  useEffect(() => {
    if (employee) return;
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, [employee]);

  useEffect(() => {
    if (employee || !punchedIn) return;
    const interval = setInterval(() => {
      if (onBreak) {
        setBreakSeconds((prev) => prev + 1);
      } else {
        setWorkedSeconds((prev) => prev + 1);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [punchedIn, onBreak, employee]);

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
    const [timeStr, modifier] = startTime.split(" ");
    let [hrsStr, minsStr] = timeStr.split(":");
    let startHrs = parseInt(hrsStr);
    const startMins = parseInt(minsStr);

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
        // Create realistic spread of punch-in/out times
        const baseMin = 10 + (day % 15);
        firstIn = `10:${baseMin.toString().padStart(2, "0")} AM`;
        const outMin = 30 + (day % 29);
        lastOut = `07:${outMin.toString().padStart(2, "0")} PM`;

        // Calculate approx working hours
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
        status,
        shift: "GS01",
        firstIn,
        lastOut,
        workingHrs,
        overtimeHrs,
      });
    }
    // Return in reverse order like a real log (latest first)
    return rows.reverse();
  }, [dailyStatusMap]);

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
              <AvatarFallback className="bg-emerald-500/10 text-emerald-500 font-extrabold text-lg">
                {employeeAvatar}
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
                    <h3 className="text-base font-bold text-foreground">
                      Attendance Logs
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
                    <button className="text-muted-foreground hover:text-foreground">
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    <span className="text-xs font-bold text-foreground">
                      Jun 2026
                    </span>
                    <button className="text-muted-foreground hover:text-foreground">
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
                      <div className="flex items-center justify-center h-12 w-12 rounded-full bg-amber-500/25 border-2 border-amber-500 text-amber-500 font-extrabold text-sm shadow-md">
                        {employeeAvatar}
                      </div>

                      <div className="flex items-center justify-center p-1 bg-amber-500/10 rounded-full border border-amber-500/20 text-amber-500">
                        <Award className="h-5 w-5" />
                      </div>

                      <div>
                        <span className="text-2xl font-black text-amber-600 dark:text-amber-500 tracking-tight block">
                          {presentCount * 8}h 15m
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
                          8h 49m
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
                          <th className="px-4 py-3 bg-muted sticky top-0">Status</th>
                          <th className="px-4 py-3 bg-muted sticky top-0">First In</th>
                          <th className="px-4 py-3 bg-muted sticky top-0">Last Out</th>
                          <th className="px-4 py-3 bg-muted sticky top-0">Break Time</th>
                          <th className="px-4 py-3 bg-muted sticky top-0">Working Hours</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border text-xs text-foreground">
                        {detailedLogs.map((log) => (
                          <tr
                            key={log.day}
                            className="hover:bg-muted/10 transition-colors"
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
                              {"00:30 HRS"}
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
                <RotateCcw className="h-8 w-8 mb-2 opacity-50 animate-spin" />
                No punches logged for today.
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
    </div>
  );
};
