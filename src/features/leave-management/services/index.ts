/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from "axios";
import { useAuthStore } from "@/stores/use-auth-store";
import { buildQueryString } from "@/utils/storage";
import API from "@/config/api/api";
import usePostData from "@/hooks/use-post-data";
import usePatchData from "@/hooks/use-patch-data";
import useDeleteData from "@/hooks/use-delete-data";
import useFetchData from "@/hooks/use-fetch-data";
import { useLeaveStore } from "../stores";
import { useMutation, useQueryClient } from "@tanstack/react-query";

// Assuming your API structure has a leaves endpoint
const GET_API_URL = API.leave_management.list;
const LEAVE_DASHBOARD_URL = API.leave_management.leave_dashboard;

const leaveRefetchQueries = [
  GET_API_URL,
  API.leave_balance.get,
  LEAVE_DASHBOARD_URL,
  API.leave_management.leave_balance,
  API.users.list,
  API.leave_balance.allocations,
];

export const useGetTLEmployees = (params?: any, enabled?: boolean) => {
  return useFetchData({ url: API.leave_management.employee, params, enabled });
};

export const useCreateLeaveData = () => {
  const { setOpen } = useLeaveStore();
  return usePostData({
    url: API.leave_management.create,
    refetchQueries: leaveRefetchQueries,
    onSuccess: () => {
      setOpen(null);
    },
  });
};

export const useUpdateLeaveData = (id: string | number) => {
  const { setOpen } = useLeaveStore();
  const queryClient = useQueryClient();

  return usePatchData({
    url: `${API.leave_management.update}/${id}`,
    refetchQueries: leaveRefetchQueries,
    onSuccess: () => {
      queryClient.invalidateQueries({
        predicate: (query) =>
          typeof query.queryKey[0] === "string" &&
          query.queryKey[0].includes("/leave-management/") &&
          query.queryKey[0].includes("/details"),
      });
      setOpen(null);
    },
  });
};

export const useGetLeaveData = (params?: any, enabled = true) => {
  return useFetchData({ url: GET_API_URL, params, enabled });
};

export const useGetLeaveDetails = (id?: string | number, enabled = true) => {
  const cleanUrl = API.leave_management.leave_details.trim();
  return useFetchData({
    url: id ? cleanUrl.replace("{id}", String(id)) : "",
    enabled: enabled && !!id,
  });
};

export const useGetLeaveCreditHistory = (params?: any, enabled = true) => {
  return useFetchData({
    url: API.leave_management.leave_balance,
    params,
    enabled,
  });
};

/**
 * Leave dashboard — grouped by technology for a given filter.
 * @param params.filter - today | tomorrow | week | upcoming | low_balance
 * @param params.date - optional yyyy-MM-dd for a specific day (today board navigation)
 */
export const useGetLeaveDashboard = (
  params?: { filter?: string | string[]; date?: string },
  enabled = true
) => {
  return useFetchData({
    url: LEAVE_DASHBOARD_URL,
    params,
    enabled,
  });
};

export const useDeleteLeaveData = (id: string) => {
  const { setOpen } = useLeaveStore();
  const queryClient = useQueryClient();
  return useDeleteData({
    url: `${API.leave_management.delete}/${id}`,
    refetchQueries: leaveRefetchQueries,
    onSuccess: () => {
      queryClient.invalidateQueries({
        predicate: (query) =>
          typeof query.queryKey[0] === "string" &&
          query.queryKey[0].includes("/leave-management/") &&
          query.queryKey[0].includes("/details"),
      });
      setOpen(null);
    },
  });
};

export const useApproveRejectLeave = (id: string) => {
  const { setOpen } = useLeaveStore();
  const queryClient = useQueryClient();
  return usePatchData({
    url: API.leave_management.action.replace("{id}", id),
    refetchQueries: leaveRefetchQueries,
    onSuccess: () => {
      queryClient.invalidateQueries({
        predicate: (query) =>
          typeof query.queryKey[0] === "string" &&
          query.queryKey[0].includes("/leave-management/") &&
          query.queryKey[0].includes("/details"),
      });
      setOpen(null);
    },
  });
};

/**
 * Fetch leave balance for a specific user and leave type.
 * @param params - { employeeId: number | string, leaveTypeId: string }
 * @param enabled - whether query should execute
 */
export const useGetLeaveBalance = (
  params?: { userId?: number | string; leaveTypeId?: string },
  enabled = true
) => {
  const hasRequiredParams = !!(params?.userId && params?.leaveTypeId);
  return useFetchData({
    url: API.leave_balance.get,
    params: { employeeId: params?.userId, leaveTypeId: params?.leaveTypeId },
    enabled: enabled && hasRequiredParams,
  });
};

/**
 * Fetch all leave balances for a user (all leave types at once).
 * Used to display CL / PL balance summary cards on the Leave Management page.
 * @param employeeId - the user's employee ID
 * @param enabled - whether query should execute
 */
export const useGetAllLeaveBalances = (
  employeeId?: number | string,
  enabled = true
) => {
  return useFetchData({
    url: API.leave_balance.get,
    params: { employeeId },
    enabled: enabled && !!employeeId,
  });
};

/**
 * Adjust leave balance for a specific employee and leave type.
 */
export const useAdjustLeaveBalance = (onSuccess?: () => void) => {
  return usePatchData({
    url: API.leave_management.leave_adjust,
    refetchQueries: leaveRefetchQueries,
    onSuccess,
  });
};

/**
 * Set leave allocations for an employee.
 */
export const useSetLeaveAllocations = (onSuccess?: () => void) => {
  return usePostData({
    url: API.leave_balance.add,
    refetchQueries: leaveRefetchQueries,
    onSuccess,
  });
};

/**
 * Fetch leave allocations settings.
 */
export const useGetLeaveAllocations = (enabled = true) => {
  return useFetchData({
    url: API.leave_balance.allocations,
    enabled,
  });
};

/**
 * Fetch available leave types.
 */
export const useGetLeaveTypes = (enabled = true) => {
  return useFetchData({
    url: "/leave-types",
    enabled,
  });
};

export const useUpdateExamLeaveEligibility = (employeeId: string | number) => {
  return usePatchData({
    url: `${API.leave_management.exam_leave}/${employeeId}`,
    refetchQueries: leaveRefetchQueries,
  });
};

/**
 * Submits an attendance regularization request.
 */
export const useCreateRegularizationRequest = (onSuccess?: (data?: any) => void) => {
  return usePostData({
    url: API.attendance.regularizations,
    refetchQueries: [API.attendance.compensatory_date],
    onSuccess,
  });
};

export const useDeleteLeaveCreditHistory = (id: string | number, onSuccess?: () => void) => {
  return useDeleteData({
    url: `${API.leave_balance.delete}/${id}`,
    refetchQueries: leaveRefetchQueries,
    onSuccess,
  });
};

export const useExportLeaveSummary = () => {
  return useMutation({
    mutationFn: async (params?: Record<string, any>) => {
      try {
        const queryString = buildQueryString(params ?? {});
        const baseURL = import.meta.env.VITE_API_BASE_URL;
        const token =
          useAuthStore.getState().user?.token ?? useAuthStore.getState().token;
        const response = await axios.get(
          `${baseURL}${API.leave_management.export_summary}${queryString}`,
          {
            responseType: "blob",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const contentDisposition = response.headers["content-disposition"];
        let filename = `leave_summary_${new Date().toISOString().split("T")[0]}.xlsx`;

        if (contentDisposition) {
          const filenameMatch = contentDisposition.match(
            /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/
          );
          if (filenameMatch?.[1]) {
            filename = filenameMatch[1].replace(/['"]/g, "");
          }
        }

        return {
          blob: response.data,
          filename,
        };
      } catch (error: any) {
        if (axios.isAxiosError(error) && error.response?.data instanceof Blob) {
          try {
            const errorText = await error.response.data.text();
            const parsedError = JSON.parse(errorText);
            throw new Error(
              parsedError?.message ||
                parsedError?.messages?.[0] ||
                "Failed to generate leave summary file"
            );
          } catch (parseError) {
            if (parseError instanceof Error) {
              throw parseError;
            }
          }
        }

        throw new Error(error?.message || "Failed to generate leave summary file");
      }
    },
  });
};
