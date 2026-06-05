/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isWithinInterval,
  parseISO,
  startOfDay,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import { addDays } from "date-fns";
import { LEAVE_TYPE } from "@/utils/constant";
import type {
  LeaveDashboardData,
  LeaveDashboardGroup,
  LeaveDashboardEmployeeRow,
} from "../types/leave-dashboard";

export type LeaveDayEntry = {
  date: string;
  dayType: string;
  halfType?: string | null;
};

export function normalizeDateStr(date: Date | string): string {
  if (typeof date === "string") {
    const match = date.match(/^\d{4}-\d{2}-\d{2}/);
    if (match) return match[0];
    return format(startOfDay(parseISO(date)), "yyyy-MM-dd");
  }
  return format(startOfDay(date), "yyyy-MM-dd");
}

export function getLeaveDatesWithTypes(leave: any): LeaveDayEntry[] {
  if (Array.isArray(leave?.leaveDays) && leave.leaveDays.length > 0) {
    return leave.leaveDays.map((d: any) => ({
      date: normalizeDateStr(d.date || leave.fromDate),
      dayType: d.dayType || "full",
      halfType: d.halfType ?? null,
    }));
  }

  if (!leave?.fromDate || !leave?.toDate) return [];

  try {
    const start = startOfDay(new Date(leave.fromDate));
    const end = startOfDay(new Date(leave.toDate));
    return eachDayOfInterval({ start, end }).map((d) => ({
      date: format(d, "yyyy-MM-dd"),
      dayType: "full",
      halfType: null,
    }));
  } catch {
    return [];
  }
}

export function isApprovedLeaveOnDate(leave: any, date: Date): boolean {
  if (String(leave?.status || "").toLowerCase() !== "approved") return false;
  const target = normalizeDateStr(date);
  return getLeaveDatesWithTypes(leave).some((d) => d.date === target);
}

export function getLeaveDayOnDate(leave: any, date: Date): LeaveDayEntry | null {
  const target = normalizeDateStr(date);
  return getLeaveDatesWithTypes(leave).find((d) => d.date === target) ?? null;
}

export function countEmployeesOnLeave(leaves: any[], date: Date): number {
  const ids = new Set<string>();
  leaves.forEach((leave) => {
    if (isApprovedLeaveOnDate(leave, date)) {
      const id = leave.employee?.id ?? leave.employeeId;
      if (id != null) ids.add(String(id));
    }
  });
  return ids.size;
}

export function countLeavesInWeek(leaves: any[], weekDate: Date): number {
  const start = startOfWeek(weekDate, { weekStartsOn: 1 });
  const end = endOfWeek(weekDate, { weekStartsOn: 1 });
  const ids = new Set<string>();

  leaves.forEach((leave) => {
    if (String(leave?.status || "").toLowerCase() !== "approved") return;
    getLeaveDatesWithTypes(leave).forEach((day) => {
      const d = parseISO(day.date);
      if (
        isWithinInterval(d, { start, end }) &&
        leave.employee?.id != null
      ) {
        ids.add(`${leave.employee.id}-${day.date}`);
      }
    });
  });

  return ids.size;
}

export function getLeaveTypeLabel(leave: any): string {
  const id = leave.leaveTypeId ?? leave.leaveType?.id;
  const fromConstant = LEAVE_TYPE.find(
    (t) => Number(t.value) === Number(id)
  )?.label;
  return (
    fromConstant ??
    leave.leaveType?.name ??
    (id ? `Leave Type ${id}` : "Leave")
  );
}

export function getLeaveTypeChartColor(leaveTypeId: number | string): string {
  const id = Number(leaveTypeId);
  const colors: Record<number, string> = {
    1: "#10b981",
    2: "#3b82f6",
    3: "#f59e0b",
    4: "#8b5cf6",
  };
  return colors[id] ?? "#94a3b8";
}

export function aggregateLeaveTypeBreakdown(
  leaves: any[],
  rangeStart: Date,
  rangeEnd: Date
) {
  const counts = new Map<string, { name: string; value: number; color: string }>();

  leaves.forEach((leave) => {
    if (String(leave?.status || "").toLowerCase() !== "approved") return;
    const typeId = leave.leaveTypeId ?? leave.leaveType?.id ?? "other";
    const label = getLeaveTypeLabel(leave);
    const color = getLeaveTypeChartColor(typeId);

    getLeaveDatesWithTypes(leave).forEach((day) => {
      const d = parseISO(day.date);
      if (!isWithinInterval(d, { start: rangeStart, end: rangeEnd })) return;

      const weight = day.dayType === "half" ? 0.5 : 1;
      const key = String(typeId);
      const existing = counts.get(key);
      if (existing) {
        existing.value += weight;
      } else {
        counts.set(key, { name: label, value: weight, color });
      }
    });
  });

  return Array.from(counts.values()).filter((d) => d.value > 0);
}

export type TechnologyInfo = {
  id: string;
  name: string;
  color?: string;
};

export function extractTechnologyList(response: unknown): any[] {
  if (Array.isArray(response)) return response;
  if (Array.isArray((response as any)?.data)) return (response as any).data;
  if (Array.isArray((response as any)?.data?.data))
    return (response as any).data.data;
  return [];
}

export function buildTechnologyById(
  technologies: any[]
): Map<string, TechnologyInfo> {
  const map = new Map<string, TechnologyInfo>();
  technologies.forEach((tech) => {
    if (!tech?.name) return;
    map.set(String(tech.id), {
      id: String(tech.id),
      name: tech.name,
      color: tech.color ?? "#94a3b8",
    });
  });
  return map;
}

export function buildTechnologyByEmployeeId(
  employees: any[],
  technologyById: Map<string, TechnologyInfo>
): Map<string, TechnologyInfo> {
  const map = new Map<string, TechnologyInfo>();

  employees.forEach((emp) => {
    if (!emp?.id) return;

    if (emp.technology?.name) {
      map.set(String(emp.id), {
        id: String(emp.technology.id ?? emp.technology.name),
        name: emp.technology.name,
        color: emp.technology.color ?? "#94a3b8",
      });
      return;
    }

    if (emp.technologyId != null) {
      const tech = technologyById.get(String(emp.technologyId));
      if (tech) map.set(String(emp.id), tech);
    }
  });

  return map;
}

export function enrichLeavesWithEmployeeData(
  leaves: any[],
  employees: any[],
  technologyById: Map<string, TechnologyInfo>
): any[] {
  const employeeMap = new Map(
    employees.map((emp) => [String(emp.id), emp])
  );

  return leaves.map((leave) => {
    const empId = leave.employee?.id ?? leave.employeeId;
    if (empId == null) return leave;

    const fullEmployee = employeeMap.get(String(empId));
    if (!fullEmployee) return leave;

    let technology = leave.employee?.technology ?? fullEmployee.technology;
    if (!technology?.name && fullEmployee.technologyId != null) {
      const fromCatalog = technologyById.get(String(fullEmployee.technologyId));
      if (fromCatalog) {
        technology = {
          id: Number(fromCatalog.id),
          name: fromCatalog.name,
          color: fromCatalog.color,
        };
      }
    }

    return {
      ...leave,
      employee: {
        ...fullEmployee,
        ...leave.employee,
        id: leave.employee?.id ?? fullEmployee.id,
        fullName: leave.employee?.fullName ?? fullEmployee.fullName,
        profilePicUrl:
          leave.employee?.profilePicUrl ?? fullEmployee.profilePicUrl,
        technologyId:
          leave.employee?.technologyId ?? fullEmployee.technologyId,
        technology,
      },
    };
  });
}

export function getEmployeeTechnology(
  employee: any,
  technologyByEmployeeId?: Map<string, TechnologyInfo>,
  technologyById?: Map<string, TechnologyInfo>
): TechnologyInfo {
  const tech = employee?.technology;
  if (tech?.name) {
    return {
      id: String(tech.id ?? tech.name),
      name: tech.name,
      color: tech.color ?? "#94a3b8",
    };
  }

  const empId = employee?.id ?? employee?.employeeId;
  if (empId != null && technologyByEmployeeId?.has(String(empId))) {
    return technologyByEmployeeId.get(String(empId))!;
  }

  const techId = employee?.technologyId;
  if (techId != null && technologyById?.has(String(techId))) {
    return technologyById.get(String(techId))!;
  }

  return { id: "unassigned", name: "Unassigned", color: "#94a3b8" };
}

/** Approved leaves with at least one day from tomorrow onward (excludes today-only). */
export function getUpcomingLeavesExcludingToday(leaves: any[], limit = 10) {
  const today = startOfDay(new Date());
  const tomorrow = addDays(today, 1);

  const hasUpcomingDay = (leave: any) => {
    const days = getLeaveDatesWithTypes(leave);
    if (days.length > 0) {
      return days.some((d) => parseISO(d.date) >= tomorrow);
    }
    if (!leave.fromDate) return false;
    const from = startOfDay(new Date(leave.fromDate));
    const to = leave.toDate
      ? startOfDay(new Date(leave.toDate))
      : from;
    return to >= tomorrow || from >= tomorrow;
  };

  return [...leaves]
    .filter((leave) => {
      if (String(leave?.status || "").toLowerCase() !== "approved") return false;
      return hasUpcomingDay(leave);
    })
    .sort((a, b) => {
      const fromA = new Date(a.fromDate ?? 0).getTime();
      const fromB = new Date(b.fromDate ?? 0).getTime();
      return fromA - fromB;
    })
    .slice(0, limit);
}

export function formatLeaveDateRange(leave: any): string {
  if (!leave.fromDate) return "-";
  const from = new Date(leave.fromDate);
  const to = leave.toDate ? new Date(leave.toDate) : from;
  const days = getLeaveDatesWithTypes(leave).reduce((sum, d) => {
    return sum + (d.dayType === "half" ? 0.5 : 1);
  }, 0);
  const dayLabel =
    days === 1 ? "1 day" : `${Number.isInteger(days) ? days : days.toFixed(1)} days`;

  const fmt = (d: Date) =>
    d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });

  if (normalizeDateStr(from) === normalizeDateStr(to)) {
    return `${fmt(from)} (${dayLabel})`;
  }
  return `${fmt(from)} - ${fmt(to)} (${dayLabel})`;
}

export function groupLeavesByTechnology(
  leaves: any[],
  date: Date,
  technologyByEmployeeId?: Map<string, TechnologyInfo>,
  technologyById?: Map<string, TechnologyInfo>
) {
  const groups = new Map<
    string,
    {
      key: string;
      label: string;
      color?: string;
      employees: any[];
    }
  >();

  leaves.forEach((leave) => {
    if (!isApprovedLeaveOnDate(leave, date)) return;

    const tech = getEmployeeTechnology(
      leave.employee,
      technologyByEmployeeId,
      technologyById
    );

    if (!groups.has(tech.id)) {
      groups.set(tech.id, {
        key: tech.id,
        label: tech.name,
        color: tech.color,
        employees: [],
      });
    }

    const dayEntry = getLeaveDayOnDate(leave, date);
    groups.get(tech.id)!.employees.push({
      id: leave.employee?.id ?? leave.id,
      fullName: leave.employee?.fullName ?? "Unknown",
      profilePicUrl: leave.employee?.profilePicUrl,
      leaveType: getLeaveTypeLabel(leave),
      dayType: dayEntry?.dayType ?? "full",
      halfType: dayEntry?.halfType,
      leave,
    });
  });

  return Array.from(groups.values())
    .map((g) => ({
      ...g,
      employees: g.employees.sort((a, b) =>
        a.fullName.localeCompare(b.fullName)
      ),
    }))
    .sort((a, b) => b.employees.length - a.employees.length);
}

export function countHalfDayOnDate(leaves: any[], date: Date): number {
  let count = 0;
  leaves.forEach((leave) => {
    const day = getLeaveDayOnDate(leave, date);
    if (day?.dayType === "half") count += 1;
  });
  return count;
}

export function getMonthRange(reference = new Date()) {
  return {
    start: startOfMonth(reference),
    end: endOfMonth(reference),
  };
}

export function parseLeaveDashboardResponse(
  response: unknown
): LeaveDashboardData | null {
  const raw = response as any;
  const data = raw?.data?.data ?? raw?.data;
  if (!data || !Array.isArray(data.groups)) return null;
  return data;
}

export function formatDashboardEmployeeDateRange(emp: {
  fromDate: string;
  toDate: string;
  totalDays?: string;
}): string {
  const from = new Date(emp.fromDate);
  const to = new Date(emp.toDate);
  const fmt = (d: Date) =>
    d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });

  const days = emp.totalDays
    ? parseFloat(emp.totalDays)
    : 1;
  const dayLabel =
    days === 1 ? "1 day" : `${Number.isInteger(days) ? days : days.toFixed(1)} days`;

  if (normalizeDateStr(from) === normalizeDateStr(to)) {
    return `${fmt(from)} (${dayLabel})`;
  }
  return `${fmt(from)} - ${fmt(to)} (${dayLabel})`;
}

export function flattenDashboardEmployees(
  groups: LeaveDashboardGroup[],
  limit = 10
): LeaveDashboardEmployeeRow[] {
  const rows = groups.flatMap((group) =>
    group.employees.map((emp) => ({
      ...emp,
      technologyName: group.technologyName,
      technologyColor: group.technologyColor,
    }))
  );

  return rows
    .sort(
      (a, b) =>
        new Date(a.fromDate).getTime() - new Date(b.fromDate).getTime()
    )
    .slice(0, limit);
}
