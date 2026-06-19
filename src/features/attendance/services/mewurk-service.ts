import instance from "@/config/instance/instance";

export interface EmployeeSearchResult {
  employeeCode: number;
  firstName: string;
  lastName: string;
  employeeName?: string;
  emailId: string;
  designationName?: string;
  departmentName?: string;
  mobileNumber?: string;
  employeeStatus?: string;
  profileImageUrl?: string;
}

export interface ClockInDetail {
  inOutType: "IN" | "OUT";
  clockTime: string;
  deviceName: string;
  latitude: string;
  longitude: string;
  officeName: string;
  sourceName: string;
}

export interface AttendanceData {
  id: number;
  employeeCode: number;
  attendanceDate: string;
  firstClockIn: string | null;
  firstInSource: string | null;
  lastClockOut: string | null;
  lastOutSource: string | null;
  lateInMinutes: number;
  earlyOutMinutes: number;
  totalWorkingHour: number;
  clientStatusName: string | null;
  internalConditionName: string | null;
  overtime: number;
  isOvertime: boolean;
  shiftName: string | null;
  sandboxIconEnabled: boolean;
  sandboxIconMessage: string;
  isShiftPolicy: boolean;
  isRegularization: boolean;
  isManualOverride: boolean;
  remarks: string;
}

export const MewurkService = {
  /**
   * Fetch employee name + Mewurk employee code list, for attendance lookups.
   */
  fetchAttendanceEmployees: async (employeeCode?: string): Promise<any> => {
    try {
      const response = await instance.get<any>({
        url: `/attendance/employees`,
        params: employeeCode ? { employeeCode } : {},
      });
      return response.data;
    } catch (error) {
      console.error("Mewurk fetchAttendanceEmployees error:", error);
      throw error;
    }
  },

  /**
   * Fetch employee monthly attendance summary via GET /attendance/monthly
   */
  fetchEmployeeMonthlyAttendance: async (
    mewurkEmployeeCode: string | number,
    month: number,
    year: number
  ): Promise<any> => {
    try {
      const response = await instance.get<any>({
        url: `/attendance/monthly`,
        params: {
          mewurkEmployeeCode,
          month,
          year,
        },
      });
      return response.data;
    } catch (error) {
      console.error("Mewurk fetchEmployeeMonthlyAttendance error:", error);
      throw error;
    }
  },

  fetchClockInDetails: async (
    employeeCode: string | number,
    dateStr: string
  ): Promise<any> => {
    try {
      const parts = dateStr.split("-");
      if (parts.length < 3) {
        throw new Error(`Invalid date format: ${dateStr}`);
      }
      const year = parseInt(parts[0]);
      const month = parseInt(parts[1]);

      const response = await instance.get<any>({
        url: `/attendance/monthly`,
        params: {
          mewurkEmployeeCode: employeeCode,
          month,
          year,
        },
      });

      const resData = response.data?.data ?? response.data;
      if (resData && Array.isArray(resData.attendance)) {
        const targetDate = dateStr; // YYYY-MM-DD
        const entry = resData.attendance.find((item: any) => {
          if (!item.date) return false;
          const itemDatePart = item.date.split("T")[0];
          return itemDatePart === targetDate;
        });

        if (entry) {
          const mappedClockInDetails = (entry.clockInDetails || []).map(
            (punch: any) => {
              if (punch.clockTime) {
                try {
                  const d = new Date(punch.clockTime);
                  if (!isNaN(d.getTime())) {
                    return {
                      ...punch,
                      clockTime: d.toISOString(),
                    };
                  }
                } catch (e) {
                  console.error("Error parsing punch clockTime:", e);
                }
              }
              return punch;
            }
          );

          return {
            ...entry,
            attendanceDate: entry.date,
            clockInDetails: mappedClockInDetails,
          };
        }
      }
      return null;
    } catch (error) {
      console.error(
        `Mewurk fetchClockInDetails error for ${employeeCode} on ${dateStr}:`,
        error
      );
      return null;
    }
  },

  /**
   * Fetch all employees monthly attendance via GET /attendance/monthly (our backend).
   * Fetches all users from our DB, then calls /attendance/monthly per employee in parallel.
   * Returns data normalized to the same shape used by EmployeeAttendance calendar grid.
   */
  fetchAllEmployeesMonthlyAttendance: async (
    year: number,
    month: number
  ): Promise<{
    data: any[];
    totalCount: number;
  }> => {
    try {
      // 1. Fetch all active users from our backend to get their mewurkEmployeeCode + metadata
      const usersRes = await instance.get<any>({
        url: `/users/attendanceservice/attendance/monthlysummary`,
        params: { pagination: false, status: "active" },
      });

      let users: any[] = [];
      const usersData = usersRes?.data;
      if (Array.isArray(usersData)) {
        users = usersData;
      } else if (Array.isArray(usersData?.data)) {
        users = usersData.data;
      } else if (Array.isArray(usersData?.data?.data)) {
        users = usersData.data.data;
      }

      // Only keep employees that have a mewurkEmployeeCode
      const eligible = users.filter(
        (u: any) =>
          u.mewurkEmployeeCode && String(u.mewurkEmployeeCode).trim() !== ""
      );

      if (eligible.length === 0) return { data: [], totalCount: 0 };

      // Status string → short code mapping matching the response format
      const STATUS_MAP: Record<string, "P" | "A" | "WO" | "AH" | "E" | "L"> = {
        present: "P",
        absent: "A",
        "weekly off": "WO",
        weekly_off: "WO",
        weeklyoff: "WO",
        "half day": "AH",
        halfday: "AH",
        late: "E",
        leave: "L",
        "on leave": "L",
      };

      const resolveStatus = (
        finalStatus: string,
        originalStatus: string
      ): "P" | "A" | "WO" | "AH" | "E" | "L" | "" => {
        const raw = (finalStatus || originalStatus || "").toLowerCase().trim();
        return STATUS_MAP[raw] ?? "";
      };

      // 2. Fetch attendance for every employee in parallel (batched to avoid overloading)
      const BATCH_SIZE = 10;
      const results: any[] = [];

      for (let i = 0; i < eligible.length; i += BATCH_SIZE) {
        const batch = eligible.slice(i, i + BATCH_SIZE);
        const batchResults = await Promise.allSettled(
          batch.map(async (u: any) => {
            try {
              const res = await instance.get<any>({
                url: `/attendance/monthly`,
                params: {
                  mewurkEmployeeCode: u.mewurkEmployeeCode,
                  month,
                  year,
                },
              });
              const attData = res?.data?.data ?? res?.data ?? null;
              return { user: u, attData };
            } catch {
              return { user: u, attData: null };
            }
          })
        );

        batchResults.forEach((r) => {
          if (r.status === "fulfilled") results.push(r.value);
        });
      }

      // 3. Normalize each result into the flat keyed format EmployeeAttendance expects
      const normalized = results.map(({ user, attData }) => {
        const name = (user.fullName || "").trim();
        const code = String(user.mewurkEmployeeCode || "");

        // Build date-keyed map: { "2026-06-01": { clientStatusCode: "P" }, ... }
        const dateMap: Record<string, { clientStatusCode: string }> = {};

        if (attData && Array.isArray(attData.attendance)) {
          attData.attendance.forEach((entry: any) => {
            if (!entry.date) return;
            const dateKey = entry.date.split("T")[0]; // normalize to "YYYY-MM-DD"
            const statusCode = resolveStatus(
              entry.finalStatus,
              entry.originalStatus
            );
            dateMap[dateKey] = { clientStatusCode: statusCode };
          });
        }

        return {
          // Fields used by employeesList mapper in employee-attendance.tsx
          EmployeeCode: code,
          EmployeeName: name,
          EmailId: user.email || "",
          // Spread the date map so legacy date-keyed access (emp["2026-06-01"]) works
          ...dateMap,
          // Also attach summary fields for any consumer that reads them
          workingDays: attData?.workingDays ?? 0,
          absentDays: attData?.absentDays ?? 0,
          avgWorkingHours: attData?.avgWorkingHours ?? "",
          totalWorkingHours: attData?.totalWorkingHours ?? "",
          attendance: attData?.attendance ?? [],
          // Keep original user for reference
          _user: user,
        };
      });

      return { data: normalized, totalCount: normalized.length };
    } catch (error) {
      console.error("fetchAllEmployeesMonthlyAttendance error:", error);
      return { data: [], totalCount: 0 };
    }
  },
};
