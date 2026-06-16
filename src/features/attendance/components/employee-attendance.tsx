import React, { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
import { 
  Search, 
  Download, 
  Upload, 
  Check, 
  X,
  Calendar,
  CheckCircle2
} from "lucide-react";
import { toast } from "sonner";
import { MyAttendance } from "./my-attendance";

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
  const [activeTab, setActiveTab] = useState<"summary" | "regularization" | "overtime" | "onduty">("summary");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedEmployee, setSelectedEmployee] = useState<EmployeeAttendanceRow | null>(null);

  // Number of days in June (30)
  const daysInMonth = Array.from({ length: 30 }, (_, i) => i + 1);

  // Map day number to weekday abbreviation for June 2026 (June 1st, 2026 is a Monday)
  const getWeekday = (day: number) => {
    const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    // June 1st is Mon (index 1)
    const index = (day + 0) % 7; 
    return weekdays[index];
  };

  // Mock employee list matching the second screenshot
  const [employees] = useState<EmployeeAttendanceRow[]>([
    {
      id: "1",
      name: "Alpesh Nakrani",
      code: "405",
      role: "Senior Developer",
      avatar: "AN",
      present: 8.5,
      absent: 0.5,
      leaves: 0,
      isActive: true,
      phone: "9876543210",
      email: "alpesh.n@devstree.in",
      dailyStatus: {
        1: "P", 2: "P", 3: "P", 4: "P", 5: "P", 6: "WO", 7: "WO",
        8: "P", 9: "AH", 10: "P", 11: "P", 12: "P", 13: "WO", 14: "WO",
        15: "P", 16: "P", 17: "P", 18: "P", 19: "P", 20: "WO", 21: "WO",
        22: "P", 23: "P", 24: "P", 25: "P", 26: "P", 27: "WO", 28: "WO",
        29: "P", 30: "P"
      }
    },
    {
      id: "2",
      name: "Ashfaq Patel",
      code: "400",
      role: "Head of QA",
      avatar: "AP",
      present: 1.0,
      absent: 7.0,
      leaves: 0,
      isActive: true,
      phone: "9876543211",
      email: "ashfaq.p@devstree.in",
      dailyStatus: {
        1: "A", 2: "A", 3: "A", 4: "A", 5: "A", 6: "WO", 7: "WO",
        8: "A", 9: "A", 10: "P", 11: "A", 12: "A", 13: "WO", 14: "WO",
        15: "A", 16: "A", 17: "A", 18: "A", 19: "A", 20: "WO", 21: "WO",
        22: "A", 23: "A", 24: "A", 25: "A", 26: "A", 27: "WO", 28: "WO",
        29: "A", 30: "A"
      }
    },
    {
      id: "3",
      name: "Bimal Raval",
      code: "401",
      role: "UI/UX Designer",
      avatar: "BR",
      present: 2.5,
      absent: 5.5,
      leaves: 0,
      isActive: true,
      phone: "9876543212",
      email: "bimal.r@devstree.in",
      dailyStatus: {
        1: "AH", 2: "AH", 3: "E", 4: "AH", 5: "AH", 6: "WO", 7: "WO",
        8: "AH", 9: "E", 10: "E", 11: "E", 12: "P", 13: "WO", 14: "WO",
        15: "P", 16: "AH", 17: "AH", 18: "AH", 19: "AH", 20: "WO", 21: "WO",
        22: "AH", 23: "AH", 24: "AH", 25: "AH", 26: "AH", 27: "WO", 28: "WO",
        29: "AH", 30: "AH"
      }
    },
    {
      id: "4",
      name: "Darshan Suthar",
      code: "444",
      role: "Intern Developer",
      avatar: "DS",
      present: 8.0,
      absent: 0.0,
      leaves: 0,
      isActive: true,
      phone: "9876543213",
      email: "darshan.s@devstree.in",
      dailyStatus: {
        1: "P", 2: "P", 3: "P", 4: "P", 5: "P", 6: "WO", 7: "WO",
        8: "P", 9: "P", 10: "P", 11: "P", 12: "P", 13: "WO", 14: "WO",
        15: "P", 16: "P", 17: "P", 18: "P", 19: "P", 20: "WO", 21: "WO",
        22: "P", 23: "P", 24: "P", 25: "P", 26: "P", 27: "WO", 28: "WO",
        29: "P", 30: "P"
      }
    },
    {
      id: "5",
      name: "Darshil Panchal",
      code: "376",
      role: "Full Stack Dev",
      avatar: "DP",
      present: 8.0,
      absent: 0.0,
      leaves: 0,
      isActive: true,
      phone: "9876543214",
      email: "darshil.p@devstree.in",
      dailyStatus: {
        1: "P", 2: "P", 3: "P", 4: "P", 5: "P", 6: "WO", 7: "WO",
        8: "P", 9: "P", 10: "P", 11: "P", 12: "P", 13: "WO", 14: "WO",
        15: "P", 16: "P", 17: "P", 18: "P", 19: "P", 20: "WO", 21: "WO",
        22: "P", 23: "P", 24: "P", 25: "P", 26: "P", 27: "WO", 28: "WO",
        29: "P", 30: "P"
      }
    },
    {
      id: "6",
      name: "Diksha Sharma",
      code: "397",
      role: "Business Analyst",
      avatar: "DS",
      present: 7.0,
      absent: 1.0,
      leaves: 0,
      isActive: true,
      phone: "9876543215",
      email: "diksha.s@devstree.in",
      dailyStatus: {
        1: "P", 2: "P", 3: "P", 4: "P", 5: "P", 6: "WO", 7: "WO",
        8: "P", 9: "A", 10: "P", 11: "P", 12: "P", 13: "WO", 14: "WO",
        15: "P", 16: "P", 17: "P", 18: "P", 19: "P", 20: "WO", 21: "WO",
        22: "P", 23: "P", 24: "P", 25: "P", 26: "P", 27: "WO", 28: "WO",
        29: "P", 30: "P"
      }
    },
    {
      id: "7",
      name: "Harsh Joshi",
      code: "EP-01",
      role: "Android Developer",
      avatar: "HJ",
      present: 0.0,
      absent: 8.0,
      leaves: 0,
      isActive: false,
      phone: "9876543216",
      email: "harsh.j@devstree.in",
      dailyStatus: {
        1: "A", 2: "A", 3: "A", 4: "A", 5: "A", 6: "WO", 7: "WO",
        8: "A", 9: "A", 10: "A", 11: "A", 12: "A", 13: "WO", 14: "WO",
        15: "A", 16: "A", 17: "A", 18: "A", 19: "A", 20: "WO", 21: "WO",
        22: "A", 23: "A", 24: "A", 25: "A", 26: "A", 27: "WO", 28: "WO",
        29: "A", 30: "A"
      }
    },
    {
      id: "8",
      name: "Himanshu Darji",
      code: "IT-01",
      role: "Support Engineer",
      avatar: "HD",
      present: 5.0,
      absent: 3.0,
      leaves: 0,
      isActive: true,
      phone: "9876543217",
      email: "himanshu.d@devstree.in",
      dailyStatus: {
        1: "P", 2: "P", 3: "P", 4: "A", 5: "P", 6: "WO", 7: "WO",
        8: "P", 9: "A", 10: "P", 11: "P", 12: "A", 13: "WO", 14: "WO",
        15: "P", 16: "P", 17: "P", 18: "P", 19: "P", 20: "WO", 21: "WO",
        22: "P", 23: "P", 24: "P", 25: "P", 26: "P", 27: "WO", 28: "WO",
        29: "P", 30: "P"
      }
    },
    {
      id: "9",
      name: "Keyur Darji",
      code: "EP-05",
      role: "Sales Executive",
      avatar: "KD",
      present: 0.0,
      absent: 0.0,
      leaves: 8.0,
      isActive: true,
      phone: "9876543218",
      email: "keyur.d@devstree.in",
      dailyStatus: {
        1: "L", 2: "L", 3: "L", 4: "L", 5: "L", 6: "WO", 7: "WO",
        8: "L", 9: "L", 10: "L", 11: "L", 12: "L", 13: "WO", 14: "WO",
        15: "L", 16: "L", 17: "L", 18: "L", 19: "L", 20: "WO", 21: "WO",
        22: "L", 23: "L", 24: "L", 25: "L", 26: "L", 27: "WO", 28: "WO",
        29: "L", 30: "L"
      }
    }
  ]);

  // Mock Regularizations
  const [regularizations, setRegularizations] = useState<RequestItem[]>([
    {
      id: "reg-1",
      employeeName: "Alpesh Nakrani",
      employeeCode: "405",
      role: "Senior Developer",
      avatar: "AN",
      date: "09 Jun 2026",
      detail: "Punch In: 09:30 AM | Punch Out: 06:30 PM",
      reason: "Forgot to punch in during client call",
      status: "pending",
    },
    {
      id: "reg-2",
      employeeName: "Bimal Raval",
      employeeCode: "401",
      role: "UI/UX Designer",
      avatar: "BR",
      date: "03 Jun 2026",
      detail: "Punch In: 09:45 AM | Punch Out: 07:00 PM",
      reason: "Power outage at home office",
      status: "pending",
    }
  ]);

  // Mock Overtime Requests
  const [overtimes, setOvertimes] = useState<RequestItem[]>([
    {
      id: "ot-1",
      employeeName: "Darshil Panchal",
      employeeCode: "376",
      role: "Full Stack Dev",
      avatar: "DP",
      date: "05 Jun 2026",
      detail: "3.5 Hours Overtime",
      reason: "Critical production bug deployment fixing",
      status: "pending",
    }
  ]);

  // Mock On Duty Requests
  const [onDuties, setOnDuties] = useState<RequestItem[]>([
    {
      id: "od-1",
      employeeName: "Diksha Sharma",
      employeeCode: "397",
      role: "Business Analyst",
      avatar: "DS",
      date: "08 Jun 2026",
      detail: "Full Day (09:00 AM - 06:00 PM)",
      reason: "Onsite client requirement gathering workshops",
      status: "pending",
    }
  ]);

  // Filtered employees listing
  const filteredEmployees = useMemo(() => {
    return employees.filter((emp) => {
      const matchesSearch = emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            emp.code.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === "all" || 
                            (statusFilter === "active" && emp.isActive) ||
                            (statusFilter === "inactive" && !emp.isActive);
      return matchesSearch && matchesStatus;
    });
  }, [employees, searchQuery, statusFilter]);

  // Quick Action Handlers for approvals
  const handleApprove = (id: string, type: "reg" | "ot" | "od") => {
    toast.success("Request Approved successfully!");
    if (type === "reg") {
      setRegularizations((prev) => prev.map((item) => item.id === id ? { ...item, status: "approved" } : item));
    } else if (type === "ot") {
      setOvertimes((prev) => prev.map((item) => item.id === id ? { ...item, status: "approved" } : item));
    } else {
      setOnDuties((prev) => prev.map((item) => item.id === id ? { ...item, status: "approved" } : item));
    }
  };

  const handleReject = (id: string, type: "reg" | "ot" | "od") => {
    toast.error("Request Rejected!");
    if (type === "reg") {
      setRegularizations((prev) => prev.map((item) => item.id === id ? { ...item, status: "rejected" } : item));
    } else if (type === "ot") {
      setOvertimes((prev) => prev.map((item) => item.id === id ? { ...item, status: "rejected" } : item));
    } else {
      setOnDuties((prev) => prev.map((item) => item.id === id ? { ...item, status: "rejected" } : item));
    }
  };

  // CSV Export
  const handleExport = () => {
    toast.success("Attendance report exported successfully!");
  };

  // Excel Import
  const handleImport = () => {
    toast.info("Import attendance template selected.");
  };

  // Helper cell styler
  const getCellClassName = (status: string, dayNum: number) => {
    const isWeekend = getWeekday(dayNum) === "Sat" || getWeekday(dayNum) === "Sun";
    let base = "h-8 w-8 text-[10px] font-bold rounded-md flex items-center justify-center transition-all ";
    
    if (status === "P") {
      return base + "bg-emerald-500/10 text-emerald-600 dark:text-emerald-500 border border-emerald-500/20";
    }
    if (status === "A") {
      return base + "bg-rose-500/10 text-rose-600 dark:text-rose-500 border border-rose-500/20";
    }
    if (status === "WO") {
      return base + "bg-zinc-100 dark:bg-zinc-900 text-zinc-550 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800";
    }
    if (status === "AH") {
      return base + "bg-amber-500/10 text-amber-600 dark:text-amber-500 border border-amber-500/20";
    }
    if (status === "E") {
      return base + "bg-yellow-500/10 text-yellow-600 dark:text-yellow-500 border border-yellow-500/20";
    }
    if (status === "L") {
      return base + "bg-indigo-500/10 text-indigo-650 dark:text-indigo-400 border border-indigo-500/20";
    }
    
    if (isWeekend) {
      return base + "bg-zinc-100 dark:bg-zinc-900 text-zinc-400 dark:text-zinc-600";
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
          email: selectedEmployee.email || `${selectedEmployee.name.toLowerCase().replace(/\s+/g, ".")}@devstree.in`,
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
      <div className="flex border-b border-border">
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
      </div>

      {activeTab === "summary" && (
        <>
          {/* Filters Bar */}
          <div className="flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-4 bg-card text-card-foreground p-4 border border-border rounded-xl shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 flex-1">
              
              {/* Date Filter */}
              <div className="flex items-center gap-2 bg-background border border-border rounded-lg px-3 py-1.5">
                <Calendar className="h-4 w-4 text-rose-500 shrink-0" />
                <span className="text-xs text-foreground/80">01 Jun 2026 - 30 Jun 2026</span>
              </div>

              {/* Search input */}
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search Employee(s)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 bg-background border-border text-xs focus-visible:ring-rose-500 h-9 text-foreground"
                />
              </div>

              {/* Status Selector */}
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="bg-background border-border text-xs text-foreground h-9 focus:ring-rose-500">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border text-popover-foreground text-xs">
                  <SelectItem value="all">All Employees</SelectItem>
                  <SelectItem value="active">Active Employees</SelectItem>
                  <SelectItem value="inactive">Inactive Employees</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 self-end xl:self-auto">
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
            </div>
          </div>

          {/* Row count info */}
          <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
            <span>Showing {filteredEmployees.length} rows</span>
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 bg-emerald-500/20 border border-emerald-500/40 rounded" /> Present (P)</span>
              <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 bg-rose-500/20 border border-rose-500/40 rounded" /> Absent (A)</span>
              <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 bg-indigo-500/20 border border-indigo-500/40 rounded" /> Leave (L)</span>
              <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded" /> Weekend (WO)</span>
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
                      const isWeekend = getWeekday(day) === "Sat" || getWeekday(day) === "Sun";
                      return (
                        <th
                          key={day}
                          className={`px-1.5 py-2 text-center text-[10px] font-semibold border-r border-border min-w-[42px] ${
                            isWeekend ? "text-muted-foreground/60 bg-muted/20" : "text-muted-foreground"
                          }`}
                        >
                          <div className="font-bold">{day}</div>
                          <div className="text-[8px] uppercase tracking-tighter opacity-80 mt-0.5">{getWeekday(day)}</div>
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody>
                  {filteredEmployees.map((emp) => (
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
                              <span className="text-xs font-semibold text-foreground truncate hover:text-rose-500 transition-colors">{emp.name}</span>
                              <span className={`h-1.5 w-1.5 rounded-full ${emp.isActive ? "bg-emerald-500" : "bg-zinc-400 dark:bg-zinc-600"}`} />
                            </div>
                            <span className="text-[10px] text-muted-foreground truncate mt-0.5">
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
                      {daysInMonth.map((day) => {
                        const status = emp.dailyStatus[day] || "";
                        return (
                          <td
                            key={day}
                            className="p-1 text-center border-r border-border align-middle min-w-[42px]"
                            title={`${emp.name} - Jun ${day}: ${
                              status === "P" ? "Present" :
                              status === "A" ? "Absent" :
                              status === "WO" ? "Weekly Off" :
                              status === "AH" ? "Half Day Absent" :
                              status === "E" ? "Late/Excused" :
                              status === "L" ? "Approved Leave" : "No Log"
                            }`}
                          >
                            <div className="flex justify-center">
                              <span className={getCellClassName(status, day)}>
                                {status}
                              </span>
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      )}

      {/* Approvals tab implementations */}
      {(activeTab === "regularization" || activeTab === "overtime" || activeTab === "onduty") && (
        <Card className="p-5 bg-card border-border shadow-lg text-card-foreground">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">
              {activeTab === "regularization" && "Pending Regularization Approvals"}
              {activeTab === "overtime" && "Pending Overtime Approvals"}
              {activeTab === "onduty" && "Pending On Duty Approvals"}
            </h3>
            <span className="text-xs text-muted-foreground">Requires manager review</span>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="border-border hover:bg-transparent">
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="text-muted-foreground font-bold text-xs">Employee</TableHead>
                  <TableHead className="text-muted-foreground font-bold text-xs">Date</TableHead>
                  <TableHead className="text-muted-foreground font-bold text-xs">Details</TableHead>
                  <TableHead className="text-muted-foreground font-bold text-xs">Reason</TableHead>
                  <TableHead className="text-muted-foreground font-bold text-xs text-center">Status</TableHead>
                  <TableHead className="text-muted-foreground font-bold text-xs text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {activeTab === "regularization" && regularizations.map((req) => (
                  <TableRow key={req.id} className="border-border hover:bg-muted/20">
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8 border border-border">
                          <AvatarFallback className="bg-rose-500/10 text-rose-500 text-xs font-bold">{req.avatar}</AvatarFallback>
                        </Avatar>
                        <div>
                          <span className="text-xs font-bold text-foreground block">{req.employeeName}</span>
                          <span className="text-[10px] text-muted-foreground">{req.employeeCode} | {req.role}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">{req.date}</TableCell>
                    <TableCell className="text-xs text-foreground/90 font-semibold">{req.detail}</TableCell>
                    <TableCell className="text-xs text-muted-foreground max-w-[200px] truncate" title={req.reason}>{req.reason}</TableCell>
                    <TableCell className="text-center">
                      <Badge variant={req.status === "pending" ? "warning" : req.status === "approved" ? "success" : "destructive"}>
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
                        <span className="text-xs text-muted-foreground italic">Actioned</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}

                {activeTab === "overtime" && overtimes.map((req) => (
                  <TableRow key={req.id} className="border-border hover:bg-muted/20">
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8 border border-border">
                          <AvatarFallback className="bg-rose-500/10 text-rose-500 text-xs font-bold">{req.avatar}</AvatarFallback>
                        </Avatar>
                        <div>
                          <span className="text-xs font-bold text-foreground block">{req.employeeName}</span>
                          <span className="text-[10px] text-muted-foreground">{req.employeeCode} | {req.role}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">{req.date}</TableCell>
                    <TableCell className="text-xs text-foreground/90 font-semibold">{req.detail}</TableCell>
                    <TableCell className="text-xs text-muted-foreground max-w-[200px] truncate" title={req.reason}>{req.reason}</TableCell>
                    <TableCell className="text-center">
                      <Badge variant={req.status === "pending" ? "warning" : req.status === "approved" ? "success" : "destructive"}>
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
                        <span className="text-xs text-muted-foreground italic">Actioned</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}

                {activeTab === "onduty" && onDuties.map((req) => (
                  <TableRow key={req.id} className="border-border hover:bg-muted/20">
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8 border border-border">
                          <AvatarFallback className="bg-rose-500/10 text-rose-500 text-xs font-bold">{req.avatar}</AvatarFallback>
                        </Avatar>
                        <div>
                          <span className="text-xs font-bold text-foreground block">{req.employeeName}</span>
                          <span className="text-[10px] text-muted-foreground">{req.employeeCode} | {req.role}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">{req.date}</TableCell>
                    <TableCell className="text-xs text-foreground/90 font-semibold">{req.detail}</TableCell>
                    <TableCell className="text-xs text-muted-foreground max-w-[200px] truncate" title={req.reason}>{req.reason}</TableCell>
                    <TableCell className="text-center">
                      <Badge variant={req.status === "pending" ? "warning" : req.status === "approved" ? "success" : "destructive"}>
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
                        <span className="text-xs text-muted-foreground italic">Actioned</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}

                {((activeTab === "regularization" && regularizations.length === 0) ||
                  (activeTab === "overtime" && overtimes.length === 0) ||
                  (activeTab === "onduty" && onDuties.length === 0)) && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground text-xs">
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
    </div>
  );
};
