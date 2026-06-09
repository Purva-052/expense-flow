/* eslint-disable @typescript-eslint/no-explicit-any */
import API from "@/config/api/api";
import usePostData from "@/hooks/use-post-data";
import usePatchData from "@/hooks/use-patch-data";
import useDeleteData from "@/hooks/use-delete-data";
import useFetchData from "@/hooks/use-fetch-data";
import { useLeaveStore } from "../stores";

// Assuming your API structure has a leaves endpoint
const GET_API_URL = API.leave_management.list;
const LEAVE_DASHBOARD_URL = API.leave_management.leave_dashboard;

const leaveRefetchQueries = [
  GET_API_URL,
  API.leave_balance.get,
  LEAVE_DASHBOARD_URL,
  API.leave_management.leave_balance,
];

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

export const useUpdateLeaveData = (id: string) => {
  const { setOpen } = useLeaveStore();
  return usePatchData({
    url: `${API.leave_management.update}/${id}`,
    refetchQueries: leaveRefetchQueries,
    onSuccess: () => setOpen(null),
  });
};

export const useGetLeaveData = (params?: any, enabled = true) => {
  return useFetchData({ url: GET_API_URL, params, enabled });
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
  return useDeleteData({
    url: `${API.leave_management.delete}/${id}`,
    refetchQueries: leaveRefetchQueries,
    onSuccess: () => {
      setOpen(null);
    },
  });
};

export const useApproveRejectLeave = (id: string) => {
  const { setOpen } = useLeaveStore();
  return usePatchData({
    url: API.leave_management.action.replace("{id}", id),
    refetchQueries: leaveRefetchQueries,
    onSuccess: () => {
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
 * Fetch available leave types.
 */
export const useGetLeaveTypes = (enabled = true) => {
  return useFetchData({
    url: "/leave-types",
    enabled,
  });
};
