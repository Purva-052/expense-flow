/* eslint-disable @typescript-eslint/no-explicit-any */
import API from "@/config/api/api";
import useFetchData from "@/hooks/use-fetch-data";
import usePostData from "@/hooks/use-post-data";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import instance from "@/config/instance/instance";
import { toast } from "sonner";

/**
 * Fetches past attendance days with working time above 8:15 for the logged-in user or specified employee.
 * Used to determine valid compensatory dates for regularization.
 */
export const useGetHighWorkingHoursDates = (
  employeeCode?: string | number,
  enabled = true
) => {
  return useFetchData({
    url: API.attendance.high_working_hours,
    params: employeeCode ? { employeeCode } : {},
    enabled: enabled && !!employeeCode,
  });
};

/**
 * Submits an attendance regularization request.
 */
export const useCreateRegularizationRequest = (onSuccess?: () => void) => {
  return usePostData({
    url: API.attendance.regularizations,
    refetchQueries: [API.attendance.high_working_hours],
    onSuccess,
  });
};

/**
 * Fetches attendance employees for filter dropdowns.
 */
export const useGetAttendanceEmployees = (enabled = true) => {
  return useFetchData({
    url: API.dropdown_api.empCode,
    enabled,
  });
};

/**
 * Fetches day-by-day attendance summary grid for a date range.
 */
export const useGetAttendanceSummary = (
  params: {
    page?: number;
    limit?: number;
    search?: string;
    pagination?: boolean;
    fromDate?: string;
    toDate?: string;
    employeeCodes?: string[];
  } = {},
  enabled = true
) => {
  return useFetchData({
    url: API.attendance.summary,
    params,
    enabled: enabled && !!params.fromDate && !!params.toDate,
  });
};

/**
 * Fetches the listing of attendance regularization requests.
 * Supports optional filtering by empId, status, page, limit.
 */
export const useGetRegularizationRequests = (
  params: {
    empId?: number;
    status?: string;
    page?: number;
    limit?: number;
  } = {},
  enabled = true
) => {
  return useFetchData({
    url: API.attendance.regularization_list,
    params,
    enabled,
  });
};

/**
 * Approves or rejects an attendance regularization request.
 * For approve: pass { status: "approved" }
 * For reject: pass { status: "rejected", rejectionReason: "..." }
 */
export const useRegularizationAction = (
  onSuccess?: () => void
) => {
  const queryClient = useQueryClient();
  return useMutation<any, Error, { id: number; status: "approved" | "rejected"; rejectionReason?: string }>({
    mutationFn: async ({ id, status, rejectionReason }) => {
      const body: any = { status };
      if (rejectionReason) body.rejectionReason = rejectionReason;
      const response = await instance.patch({
        url: API.attendance.regularization_action(id),
        data: body,
      });
      return response;
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: [API.attendance.regularization_list] });
      const msg = data?.message || "Action completed successfully";
      toast.success(msg, { position: "top-right" });
      if (onSuccess) onSuccess();
    },
    onError: (error: any) => {
      toast.error(error?.message || "Action failed", { position: "top-right" });
    },
  });
};
