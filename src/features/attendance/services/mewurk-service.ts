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

// Background credential definition
const MEWURK_EMAIL = "hr@devstree.in";
const MEWURK_PASSWORD = "Devs@2026";

const BASE_URL = typeof window !== "undefined" && (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1")
  ? "/mewurk-api"
  : "https://app.mewurk.com/api/v1";

export const MewurkService = {
  /**
   * Safe login helper that handles lookup, login and caching of token/refresh token.
   * If a token is already present and valid, it returns the cached token.
   * If the token has expired, it tries to refresh it.
   * If refresh fails, it logs in again.
   */
  getAuthToken: async (forceRefresh = false): Promise<string> => {
    if (typeof window === "undefined") return "";

    let token = localStorage.getItem("mewurk_token");
    let refreshToken = localStorage.getItem("mewurk_refresh_token");
    const expiresAtStr = localStorage.getItem("mewurk_expires_at");
    const now = Date.now();

    if (token && refreshToken && expiresAtStr && !forceRefresh) {
      const expiresAt = Number(expiresAtStr);
      // If token is still valid (with 5-minute buffer)
      if (expiresAt - now > 5 * 60 * 1000) {
        return token;
      }

      // Try refresh
      try {
        const response = await fetch(`${BASE_URL}/userservice/account/refreshtoken`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refreshToken }),
        });
        if (response.ok) {
          const json = await response.json();
          if (json.isSuccess && json.data?.token) {
            token = json.data.token;
            refreshToken = json.data.refreshToken;
            localStorage.setItem("mewurk_token", token || "");
            localStorage.setItem("mewurk_refresh_token", refreshToken || "");
            localStorage.setItem("mewurk_expires_at", String(Date.now() + 2.5 * 3600 * 1000));
            return token || "";
          }
        }
      } catch (err) {
        console.warn("Mewurk token refresh failed, falling back to login:", err);
      }
    }

    // Full authentication flow
    try {
      // 1. Lookup tenant
      const lookupRes = await fetch(`${BASE_URL}/userservice/account/lookup?userName=${encodeURIComponent(MEWURK_EMAIL)}`, {
        method: "GET",
        headers: { "accept": "application/json", "content-type": "application/json" }
      });
      if (!lookupRes.ok) throw new Error(`Lookup failed: ${lookupRes.status}`);
      const lookupJson = await lookupRes.json();
      if (!lookupJson.isSuccess || !lookupJson.data?.tenantDetails?.length) {
        throw new Error(lookupJson.message || "Tenant lookup failed");
      }
      const tenantId = lookupJson.data.tenantDetails[0].tenantId;

      // 2. Login
      const encodedUserName = btoa(`${MEWURK_EMAIL}|${tenantId}`);
      const loginRes = await fetch(`${BASE_URL}/userservice/account/login`, {
        method: "POST",
        headers: { "accept": "application/json", "content-type": "application/json" },
        body: JSON.stringify({ userName: encodedUserName, password: MEWURK_PASSWORD, otp: null })
      });
      if (!loginRes.ok) throw new Error(`Login failed: ${loginRes.status}`);
      const loginJson = await loginRes.json();
      if (loginJson.isSuccess && loginJson.data?.token) {
        token = loginJson.data.token;
        refreshToken = loginJson.data.refreshToken;
        localStorage.setItem("mewurk_token", token || "");
        localStorage.setItem("mewurk_refresh_token", refreshToken || "");
        localStorage.setItem("mewurk_expires_at", String(Date.now() + 2.5 * 3600 * 1000));
        return token || "";
      } else {
        throw new Error(loginJson.message || "Login authentication failed");
      }
    } catch (error) {
      console.error("Mewurk authentication flow error:", error);
      throw error;
    }
  },

  /**
   * Fetch all employees using getdirectory (POST)
   */
  fetchDirectory: async (): Promise<EmployeeSearchResult[]> => {
    try {
      const token = await MewurkService.getAuthToken();
      const res = await fetch(`${BASE_URL}/employeeservice/employee/getdirectory`, {
        method: "POST",
        headers: {
          "accept": "application/json",
          "authorization": `Bearer ${token}`,
          "content-type": "application/json",
        },
        body: JSON.stringify({ searchText: "", pageNumber: 1, pageSize: 1000 }),
      });
      if (!res.ok) throw new Error(`Failed to load directory: ${res.status}`);
      const json = await res.json();
      if (json.isSuccess && json.data?.employeesDataResponse) {
        return json.data.employeesDataResponse;
      }
      return [];
    } catch (error) {
      console.error("Mewurk fetchDirectory error:", error);
      return [];
    }
  },

  /**
   * Fetch monthly logs for an employee for a specific year & month.
   */
  fetchMonthlyLogs: async (employeeCode: number, year: number, month: number): Promise<AttendanceData[]> => {
    try {
      const token = await MewurkService.getAuthToken();
      const res = await fetch(`${BASE_URL}/attendanceservice/attendance/mymonthlylogs`, {
        method: "POST",
        headers: {
          "accept": "application/json",
          "authorization": `Bearer ${token}`,
          "content-type": "application/json",
        },
        body: JSON.stringify({
          employeeCode,
          reportYear: year,
          reportMonth: month,
          monthlyHistoryFilter: 0
        }),
      });
      if (!res.ok) throw new Error(`Failed to load monthly logs: ${res.status}`);
      const json = await res.json();
      if (json.isSuccess && Array.isArray(json.data)) {
        return json.data;
      }
      return [];
    } catch (error) {
      console.error(`Mewurk fetchMonthlyLogs error for employee ${employeeCode}:`, error);
      return [];
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

  fetchClockInDetails: async (employeeCode: number, dateStr: string): Promise<any> => {
    try {
      const token = await MewurkService.getAuthToken();
      const res = await fetch(`${BASE_URL}/attendanceservice/attendancelogs/clockindetails`, {
        method: "POST",
        headers: {
          "accept": "application/json",
          "authorization": `Bearer ${token}`,
          "content-type": "application/json",
        },
        body: JSON.stringify({
          employeeCode,
          clockDate: dateStr
        }),
      });
      if (!res.ok) throw new Error(`Failed to load clock-in details: ${res.status}`);
      const json = await res.json();
      if (json.isSuccess && json.data) {
        return json.data;
      }
      return null;
    } catch (error) {
      console.error(`Mewurk fetchClockInDetails error for ${employeeCode} on ${dateStr}:`, error);
      return null;
    }
  },

  /**
   * Fetch all employees monthly summary via POST /attendanceservice/attendance/monthlysummary
   */
  fetchMonthlySummary: async (
    year: number,
    month: number,
    pageNumber = 1,
    pageSize = 25
  ): Promise<{
    data: any[];
    totalCount: number;
  }> => {
    try {
      const token = await MewurkService.getAuthToken();
      const lastDay = new Date(year, month, 0).getDate();
      const startDate = `${year}-${String(month).padStart(2, "0")}-01`;
      const endDate = `${year}-${String(month).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;

      const res = await fetch(`${BASE_URL}/attendanceservice/attendance/monthlysummary`, {
        method: "POST",
        headers: {
          "accept": "application/json",
          "authorization": `Bearer ${token}`,
          "content-type": "application/json",
        },
        body: JSON.stringify({
          startDate,
          endDate,
          officeIds: [],
          departmentIds: [],
          designationIds: [],
          employeeTypeIds: [],
          groupIds: [],
          reporteesType: 0,
          employeeCodes: [],
          employeeStatus: 1,
          pagination: {
            currentPage: pageNumber,
            pageSize: pageSize
          }
        }),
      });

      if (!res.ok) throw new Error(`Failed to load monthly summary: ${res.status}`);
      const json = await res.json();
      if (json.isSuccess && Array.isArray(json.data)) {
        const totalCount = json.paginationResponse?.totalRecords || json.data.length;
        return {
          data: json.data,
          totalCount
        };
      }
      return { data: [], totalCount: 0 };
    } catch (error) {
      console.error("Mewurk fetchMonthlySummary error:", error);
      return { data: [], totalCount: 0 };
    }
  }
};
