/* eslint-disable @typescript-eslint/no-explicit-any */
import API from "@/config/api/api";
import usePostData from "@/hooks/use-post-data";
import usePatchData from "@/hooks/use-patch-data";
import useDeleteData from "@/hooks/use-delete-data";
import useFetchData from "@/hooks/use-fetch-data";
import { useLeaveStore } from "../stores";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import instance from "@/config/instance/instance";
import { toast } from "sonner";
import { extractErrorInfo } from "@/utils/error-response";

// Assuming your API structure has a leaves endpoint
const GET_API_URL = API.leave_management.list;
const LEAVE_DASHBOARD_URL = API.leave_management.leave_dashboard;

const leaveRefetchQueries = [
  GET_API_URL,
  API.leave_balance.get,
  LEAVE_DASHBOARD_URL,
  API.leave_management.leave_balance,
  API.users.list,
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

export const useUpdateLeaveData = () => {
  const { setOpen } = useLeaveStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string | number;
      data: FormData;
    }) => {
      const response = await instance.patch({
        url: `${API.leave_management.update}/${id}`,
        data,
      });
      return response;
    },
    onSuccess: (data: any) => {
      toast.success(data?.message ?? "Leave updated successfully", {
        position: "top-right",
      });
      leaveRefetchQueries.forEach((query) =>
        queryClient.invalidateQueries({ queryKey: [query] })
      );
      setOpen(null);
    },
    onError: (error: any) => {
      const errorInfo = extractErrorInfo(error);
      toast.error(errorInfo.title, {
        description: errorInfo.description,
        duration: 3000,
        position: "top-right",
      });
    },
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
 * Fetch leave allocations settings.
 */
export const useGetLeaveAllocations = (enabled = true) => {
  return useQuery<any, Error>({
    queryKey: [API.leave_balance.add, "fetch"],
    queryFn: async (): Promise<any> => {
      const response = await instance.post({
        url: API.leave_balance.add,
        data: {},
      });
      return response;
    },
    refetchOnWindowFocus: false,
    retry: 1,
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

export const useUpdateExamLeaveEligibility = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      employeeId,
      isExamLeaveEligible,
    }: {
      employeeId: number | string;
      isExamLeaveEligible: boolean;
    }) => {
      const response = await instance.patch({
        url: `${API.leave_management.exam_leave}/${employeeId}`,
        data: { isExamLeaveEligible },
      });
      return response;
    },
    onSuccess: (data: any) => {
      toast.success(
        data?.message ?? "Exam leave eligibility updated successfully",
        {
          position: "top-right",
        }
      );
      leaveRefetchQueries.forEach((query) =>
        queryClient.invalidateQueries({ queryKey: [query] })
      );
    },
    onError: (error: any) => {
      const errorInfo = extractErrorInfo(error);
      toast.error(errorInfo.title, {
        description: errorInfo.description,
        duration: 3000,
        position: "top-right",
      });
    },
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



