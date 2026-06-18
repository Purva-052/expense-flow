import React, { useState, useMemo, useEffect } from "react";
import { Card } from "@/components/ui/card";
// import { Input } from "@/components/ui/input";
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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Check,
  X,
  CheckCircle2,
  Loader2,
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
import { toast } from "sonner";
import { MyAttendance } from "./my-attendance";
import { MewurkService } from "../services/mewurk-service";
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
  dailyStatus: Record<number, "P" | "A" | "WO" | "AH" | "E" | "L" | "">;
  phone?: string;
  email?: string;
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

export const EmployeeAttendance: React.FC = () => {
  const [activeTab] = useState<
    "summary" | "regularization" | "overtime" | "onduty"
  >("summary");
  const [searchQuery] = useState("");
  const [statusFilter] = useState("all");
  const [selectedEmployee, setSelectedEmployee] =
    useState<EmployeeAttendanceRow | null>(null);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Selected Month/Year for the grid (defaults to June 2026)
  const [selectedMonth] = useState(6);
  const selectedYear = 2026;

  // Mewurk API states
  const [mewurkEmployees, setMewurkEmployees] = useState<any[]>([]);
  const [isLoadingDirectory, setIsLoadingDirectory] = useState(false);

  // Day Detail Modal states
  const [isDayModalOpen, setIsDayModalOpen] = useState(false);
  const [dayModalLoading, setDayModalLoading] = useState(false);
  const [dayModalData, setDayModalData] = useState<any | null>(null);
  const [dayModalEmployee, setDayModalEmployee] = useState<{ name: string; code: string } | null>(null);

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
  const handleDayClick = async (emp: EmployeeAttendanceRow, day: number) => {
    const empCode = parseInt(emp.code);
    if (!empCode) return;
    const dateStr = `${selectedYear}-${String(selectedMonth).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    setDayModalEmployee({ name: emp.name, code: emp.code });
    setIsDayModalOpen(true);
    setDayModalLoading(true);
    setDayModalData(null);
    try {
      const data = await MewurkService.fetchClockInDetails(empCode, dateStr);
      setDayModalData(data);
    } catch (err) {
      console.error("Error fetching day clock details:", err);
    } finally {
      setDayModalLoading(false);
    }
  };

  // Dynamic number of days in selected month
  const daysInMonth = useMemo(() => {
    const daysCount = new Date(selectedYear, selectedMonth, 0).getDate();
    return Array.from({ length: daysCount }, (_, i) => i + 1);
  }, [selectedMonth, selectedYear]);

  // Map day number to weekday abbreviation dynamically
  const getWeekday = (day: number) => {
    const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const tempDate = new Date(selectedYear, selectedMonth - 1, day);
    return weekdays[tempDate.getDay()];
  };

  // Load monthly summary on mount and on month/year change
  useEffect(() => {
    const loadMonthlySummary = async () => {
      setIsLoadingDirectory(true);
      try {
        const summary = await MewurkService.fetchMonthlySummary(
          selectedYear,
          selectedMonth,
          1,
          250
        );
        setMewurkEmployees(summary.data || []);
      } catch (err) {
        console.error("Error loading Mewurk monthly summary:", err);
      } finally {
        setIsLoadingDirectory(false);
      }
    };
    loadMonthlySummary();
  }, [selectedMonth, selectedYear]);

  // Map directory employees list
  const employeesList = useMemo<EmployeeAttendanceRow[]>(() => {
    if (mewurkEmployees.length === 0) {
      return [];
    }

    return mewurkEmployees.map((emp: any) => {
      const code = String(emp.EmployeeCode || "");
      let present = 0;
      let absent = 0;
      let leaves = 0;
      const dailyStatus: Record<
        number,
        "P" | "A" | "WO" | "AH" | "E" | "L" | ""
      > = {};

      const daysCount = new Date(selectedYear, selectedMonth, 0).getDate();
      for (let d = 1; d <= daysCount; d++) {
        const dateStr = `${selectedYear}-${String(selectedMonth).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
        const dayData = emp[dateStr];

        let status: "P" | "A" | "WO" | "AH" | "E" | "L" | "" = "";
        if (dayData && dayData.clientStatusCode) {
          const cCode = dayData.clientStatusCode;
          if (cCode === "P") status = "P";
          else if (cCode === "A") status = "A";
          else if (cCode === "WO") status = "WO";
          else if (cCode === "AH") status = "AH";
          else if (cCode === "E" || cCode === "LATE") status = "E";
          else if (cCode === "L") status = "L";
        }

        if (!status) {
          const tempDate = new Date(selectedYear, selectedMonth - 1, d);
          const isWeekend = tempDate.getDay() === 0 || tempDate.getDay() === 6;
          status = isWeekend ? "WO" : "";
        }

        dailyStatus[d] = status;
      }

      Object.values(dailyStatus).forEach((st) => {
        if (st === "P") present++;
        else if (st === "A" || st === "AH" || st === "E") absent++;
        else if (st === "L") leaves++;
      });

      const name = (emp.EmployeeName || "").trim();
      const nameParts = name.split(" ");
      const firstName = nameParts[0] || "";
      const lastName = nameParts[nameParts.length - 1] || "";
      const initials = (firstName.charAt(0) + lastName.charAt(0)).toUpperCase();

      return {
        id: code,
        name: name || "Unknown Employee",
        code,
        role: "Developer",
        avatar: initials || "EE",
        present,
        absent,
        leaves,
        isActive: true,
        dailyStatus,
        phone: "",
        email: emp.EmailId || "",
      };
    });
  }, [mewurkEmployees, selectedMonth, selectedYear]);

  // Mock Regularizations
  const [regularizations, setRegularizations] = useState<RequestItem[]>([]);

  // Mock Overtime Requests
  const [overtimes, setOvertimes] = useState<RequestItem[]>([]);

  // Mock On Duty Requests
  const [onDuties, setOnDuties] = useState<RequestItem[]>([]);

  // Filtered employees listing using employeesList
  const filteredEmployees = useMemo(() => {
    return employeesList.filter((emp) => {
      const matchesSearch =
        emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emp.code.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && emp.isActive) ||
        (statusFilter === "inactive" && !emp.isActive);
      return matchesSearch && matchesStatus;
    });
  }, [employeesList, searchQuery, statusFilter]);

  // Reset pagination on search or status filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter]);

  // Paginated employees listing for current page view
  const paginatedEmployees = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredEmployees.slice(start, start + itemsPerPage);
  }, [filteredEmployees, currentPage]);

  // Quick Action Handlers for approvals
  const handleApprove = (id: string, type: "reg" | "ot" | "od") => {
    toast.success("Request Approved successfully!");
    if (type === "reg") {
      setRegularizations((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, status: "approved" } : item
        )
      );
    } else if (type === "ot") {
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

  const handleReject = (id: string, type: "reg" | "ot" | "od") => {
    toast.error("Request Rejected!");
    if (type === "reg") {
      setRegularizations((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, status: "rejected" } : item
        )
      );
    } else if (type === "ot") {
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
  const getCellClassName = (status: string, dayNum: number) => {
    const isWeekend =
      getWeekday(dayNum) === "Sat" || getWeekday(dayNum) === "Sun";
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
      {/* Sub Tabs Navigation */}
      {/* <div className="flex border-b border-border">
        <button
          onClick={() => setActiveTab("summary")}
          className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-all ${
            activeTab === "summary"
              ? "border-rose-500 text-rose-500 bg-rose-500/5"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          Summary
        </button>
        <button
          onClick={() => setActiveTab("regularization")}
          className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 ${
            activeTab === "regularization"
              ? "border-rose-500 text-rose-500 bg-rose-500/5"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          Regularization Approvals
          {regularizations.filter(r => r.status === "pending").length > 0 && (
            <Badge className="bg-rose-600 hover:bg-rose-700 text-[10px] px-1 py-0.2 ml-1">
              {regularizations.filter(r => r.status === "pending").length}
            </Badge>
          )}
        </button>
        <button
          onClick={() => setActiveTab("overtime")}
          className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 ${
            activeTab === "overtime"
              ? "border-rose-500 text-rose-500 bg-rose-500/5"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          Overtime Approvals
          {overtimes.filter(o => o.status === "pending").length > 0 && (
            <Badge className="bg-rose-600 hover:bg-rose-700 text-[10px] px-1 py-0.2 ml-1">
              {overtimes.filter(o => o.status === "pending").length}
            </Badge>
          )}
        </button>
        <button
          onClick={() => setActiveTab("onduty")}
          className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 ${
            activeTab === "onduty"
              ? "border-rose-500 text-rose-500 bg-rose-500/5"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          On Duty Approvals
          {onDuties.filter(d => d.status === "pending").length > 0 && (
            <Badge className="bg-rose-600 hover:bg-rose-700 text-[10px] px-1 py-0.2 ml-1">
              {onDuties.filter(d => d.status === "pending").length}
            </Badge>
          )}
        </button>
      </div> */}

      {activeTab === "summary" && (
        <>
          {/* Filters Bar */}
          {/* <div className="flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-4 bg-card text-card-foreground p-4 border border-border rounded-xl shadow-sm"> */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 flex-1">
              {/* Date Filter */}
              {/* <div className="flex items-center gap-2 bg-background border border-border rounded-lg px-3 py-1.5">
                <Calendar className="h-4 w-4 text-rose-500 shrink-0" />
                <Select
                  value={String(selectedMonth)}
                  onValueChange={(val:any) => {
                    setSelectedMonth(parseInt(val));
                  }}
                >
                  <SelectTrigger className="border-0 bg-transparent text-xs p-0 focus:ring-0 focus:ring-offset-0 h-6 text-foreground">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border text-popover-foreground text-xs">
                    {Array.from({ length: 12 }, (_, i) => {
                      const m = i + 1;
                      const mName = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"][i];
                      return (
                        <SelectItem key={m} value={String(m)}>
                          {mName} {selectedYear}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div> */}

              {/* Search input */}
              {/* <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search Employee(s)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 bg-background border-border text-xs focus-visible:ring-rose-500 h-9 text-foreground"
                />
              </div> */}

              {/* Status Selector */}
              {/* <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="bg-background border-border text-xs text-foreground h-9 focus:ring-rose-500">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border text-popover-foreground text-xs">
                  <SelectItem value="all">All Employees</SelectItem>
                  <SelectItem value="active">Active Employees</SelectItem>
                  <SelectItem value="inactive">Inactive Employees</SelectItem>
                </SelectContent>
              </Select> */}
            </div>

            {/* Action Buttons */}
            {/* <div className="flex items-center gap-2 self-end xl:self-auto">
              <Button
                variant="outline"
                size="sm"
                className="bg-background border-border text-foreground text-xs hover:bg-muted h-9"
                onClick={handleImport}
              >
                <Upload className="mr-1.5 h-3.5 w-3.5" />
                Import
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="bg-background border-border text-foreground text-xs hover:bg-muted h-9"
                onClick={handleExport}
              >
                <Download className="mr-1.5 h-3.5 w-3.5" />
                Export
              </Button>
              <Button
                size="sm"
                className="bg-rose-600 hover:bg-rose-700 text-white text-xs h-9 px-4 animate-pulse-subtle"
                onClick={() => toast.success("Filters applied!")}
              >
                Apply Filters
              </Button>
            </div> */}
          {/* </div> */}

          {/* Row count info */}
          <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
            <span className="flex items-center gap-2">
              Showing{" "}
              {filteredEmployees.length === 0
                ? 0
                : (currentPage - 1) * itemsPerPage + 1}
              -{Math.min(filteredEmployees.length, currentPage * itemsPerPage)}{" "}
              of {filteredEmployees.length} rows
              {isLoadingDirectory && (
                <Loader2 className="h-3.5 w-3.5 text-rose-500 animate-spin" />
              )}
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
                    {daysInMonth.map((day) => {
                      const isWeekend =
                        getWeekday(day) === "Sat" || getWeekday(day) === "Sun";
                      return (
                        <th
                          key={day}
                          className={`px-1.5 py-2 text-center text-[10px] font-semibold border-r border-border min-w-[42px] ${
                            isWeekend
                              ? "text-muted-foreground/60 bg-muted/20"
                              : "text-muted-foreground"
                          }`}
                        >
                          <div className="font-bold">{day}</div>
                          <div className="text-[8px] uppercase tracking-tighter opacity-80 mt-0.5">
                            {getWeekday(day)}
                          </div>
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody>
                  {isLoadingDirectory ? (
                    Array.from({ length: itemsPerPage }).map((_, rowIndex) => (
                      <tr key={rowIndex} className="border-b border-border">
                        {/* Sticky Employee Identity Skeleton */}
                        <td className="sticky left-0 z-10 bg-card px-4 py-3 border-r border-border shadow-[2px_0_5px_rgba(0,0,0,0.05)] dark:shadow-[2px_0_5px_rgba(0,0,0,0.4)]">
                          <div className="flex items-center gap-3">
                            <Skeleton className="h-8 w-8 rounded-full shrink-0" />
                            <div className="flex flex-col gap-1.5 w-24">
                              <Skeleton className="h-3 w-20 rounded" />
                              <Skeleton className="h-2 w-16 rounded" />
                            </div>
                          </div>
                        </td>
                        {/* Stats Columns Skeletons */}
                        <td className="px-3 py-3 border-r border-border bg-emerald-500/5 text-center">
                          <Skeleton className="h-4 w-6 mx-auto rounded" />
                        </td>
                        <td className="px-3 py-3 border-r border-border bg-rose-500/5 text-center">
                          <Skeleton className="h-4 w-6 mx-auto rounded" />
                        </td>
                        <td className="px-3 py-3 border-r border-border bg-indigo-500/5 text-center">
                          <Skeleton className="h-4 w-6 mx-auto rounded" />
                        </td>
                        {/* Day Cells Skeletons */}
                        {daysInMonth.map((day) => (
                          <td key={day} className="p-1 border-r border-border text-center align-middle min-w-[42px]">
                            <div className="flex justify-center">
                              <Skeleton className="h-4 w-4 rounded-full" />
                            </div>
                          </td>
                        ))}
                      </tr>
                    ))
                  ) : paginatedEmployees.length === 0 ? (
                    <tr>
                      <td colSpan={daysInMonth.length + 4} className="text-center py-10 text-xs text-muted-foreground">
                        No employees found
                      </td>
                    </tr>
                  ) : (
                    paginatedEmployees.map((emp) => {
                      const isLogsLoading = isLoadingDirectory;
                      return (
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
                                <span className="text-[10px] text-muted-foreground truncate mt-0.5">
                                  {emp.code} | {emp.role}
                                </span>
                              </div>
                            </div>
                          </td>

                          {/* Stat summary cells */}
                          <td className="px-3 py-3 text-center text-xs font-bold text-emerald-600 dark:text-emerald-500 border-r border-border bg-emerald-500/5">
                            {isLogsLoading ? (
                              <span className="animate-pulse">...</span>
                            ) : (
                              emp.present
                            )}
                          </td>
                          <td className="px-3 py-3 text-center text-xs font-bold text-rose-600 dark:text-rose-500 border-r border-border bg-rose-500/5">
                            {isLogsLoading ? (
                              <span className="animate-pulse">...</span>
                            ) : (
                              emp.absent
                            )}
                          </td>
                          <td className="px-3 py-3 text-center text-xs font-bold text-indigo-600 dark:text-indigo-400 border-r border-border bg-indigo-500/5">
                            {isLogsLoading ? (
                              <span className="animate-pulse">...</span>
                            ) : (
                              emp.leaves
                            )}
                          </td>

                          {/* Individual Day statuses */}
                          {daysInMonth.map((day) => {
                            const status = emp.dailyStatus[day] || "";
                            return (
                              <td
                                key={day}
                                className="p-1 text-center border-r border-border align-middle min-w-[42px]"
                                title={`${emp.name} - ${selectedMonth}/${day}: ${
                                  status === "P"
                                    ? "Present"
                                    : status === "A"
                                      ? "Absent"
                                      : status === "WO"
                                        ? "Weekly Off"
                                        : status === "AH"
                                          ? "Half Day Absent"
                                          : status === "E"
                                            ? "Late/Excused"
                                            : status === "L"
                                              ? "Approved Leave"
                                              : "No Log"
                                } — Click for details`}
                              >
                                <div className="flex justify-center">
                                  {isLogsLoading ? (
                                    <span className="h-4 w-4 bg-muted animate-pulse rounded-full" />
                                  ) : (
                                    <span
                                      className={`${getCellClassName(status, day)} cursor-pointer hover:scale-110 hover:shadow-md transition-transform`}
                                      onClick={() => handleDayClick(emp, day)}
                                    >
                                      {status}
                                    </span>
                                  )}
                                </div>
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Pagination Controls */}
          {filteredEmployees.length > 0 && (
            <div className="flex flex-wrap flex-col gap-y-2 sm:flex-row sm:items-center sm:justify-between w-full mt-4 px-1 text-xs text-muted-foreground">
              <div>
                Total{" "}
                <span className="font-medium text-foreground">
                  {filteredEmployees.length}
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
                    onValueChange={(value:any) => {
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
                    {Math.ceil(filteredEmployees.length / itemsPerPage) || 1}
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
                      setCurrentPage((p) =>
                        Math.min(
                          Math.ceil(filteredEmployees.length / itemsPerPage),
                          p + 1
                        )
                      )
                    }
                    disabled={
                      currentPage >=
                      Math.ceil(filteredEmployees.length / itemsPerPage)
                    }
                  >
                    <ChevronsRightIcon className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    className="h-8 w-8 p-0 border-border hover:bg-muted bg-background text-foreground"
                    onClick={() =>
                      setCurrentPage(
                        Math.ceil(filteredEmployees.length / itemsPerPage) || 1
                      )
                    }
                    disabled={
                      currentPage >=
                      Math.ceil(filteredEmployees.length / itemsPerPage)
                    }
                  >
                    <DoubleArrowRightIcon className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* Approvals tab implementations */}
      {(activeTab === "regularization" ||
        activeTab === "overtime" ||
        activeTab === "onduty") && (
        <Card className="p-5 bg-card border-border shadow-lg text-card-foreground">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">
              {activeTab === "regularization" &&
                "Pending Regularization Approvals"}
              {activeTab === "overtime" && "Pending Overtime Approvals"}
              {activeTab === "onduty" && "Pending On Duty Approvals"}
            </h3>
            <span className="text-xs text-muted-foreground">
              Requires manager review
            </span>
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
                    Details
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
                {activeTab === "regularization" &&
                  regularizations.map((req) => (
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
                              onClick={() => handleApprove(req.id, "reg")}
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="outline"
                              className="h-7 w-7 rounded-full bg-rose-500/10 text-rose-500 border-rose-500/20 hover:bg-rose-500/20 hover:text-rose-400"
                              onClick={() => handleReject(req.id, "reg")}
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

                {((activeTab === "regularization" &&
                  regularizations.length === 0) ||
                  (activeTab === "overtime" && overtimes.length === 0) ||
                  (activeTab === "onduty" && onDuties.length === 0)) && (
                  <TableRow>
                    <TableCell
                      colSpan={6}
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
                        return new Date(dayModalData.attendanceDate).toLocaleDateString("en-US", {
                          weekday: "short",
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        });
                      } catch { return dayModalData.attendanceDate; }
                    })()}
                  </span>
                </div>

                <div className="bg-rose-500/10 border border-rose-500/25 px-3 py-1.5 rounded-lg text-right">
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
                            if (part) { const p = part.split(":"); return `${p[0]}:${p[1]}`; }
                            return t;
                          }
                          return d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false });
                        } catch { return t; }
                      };
                      return `${fmt(dayModalData.shiftStartTime)} to ${fmt(dayModalData.shiftEndTime)}`;
                    })()}
                  </span>
                </div>
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
                        {([...(dayModalData.clockInDetails || [])])
                          .sort((a: any, b: any) => {
                            const da = a.clockTime.endsWith("Z") ? a.clockTime : `${a.clockTime}Z`;
                            const db = b.clockTime.endsWith("Z") ? b.clockTime : `${b.clockTime}Z`;
                            return new Date(da).getTime() - new Date(db).getTime();
                          })
                          .map((punch: any, idx: number) => (
                            <tr key={idx} className="hover:bg-muted/10 transition-colors">
                              <td className="px-4 py-3 text-muted-foreground font-semibold">{idx + 1}</td>
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
