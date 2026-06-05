export type LeaveDashboardFilter =
  | "today"
  | "tomorrow"
  | "week"
  | "upcoming"
  | "low_balance";

export interface LeaveDashboardEmployee {
  leaveId: number;
  employeeId: number;
  employeeName: string;
  profilePicUrl: string | null;
  fromDate: string;
  toDate: string;
  totalDays: string;
  leaveTypeName: string;
  leaveStatus: string;
}

export interface LeaveDashboardGroup {
  technologyId: number;
  technologyName: string;
  technologyColor: string;
  count: number;
  employees: LeaveDashboardEmployee[];
}

export interface LeaveDashboardData {
  filter: string;
  dateRange: {
    from: string;
    to: string;
  };
  totalOnLeave: number;
  groups: LeaveDashboardGroup[];
}

export interface LeaveDashboardEmployeeRow extends LeaveDashboardEmployee {
  technologyName: string;
  technologyColor: string;
}
