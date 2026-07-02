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
export const useGetCompensatoryDates = (
  employeeCode?: string | number,
  regularizationDate?: string,
  enabled = true
) => {
  return useFetchData({
    url: API.attendance.compensatory_date,
    params: {
      ...(employeeCode ? { employeeCode } : {}),
      ...(regularizationDate ? { regularizationDate } : {}),
    },
    enabled: enabled && !!employeeCode && !!regularizationDate,
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
    month?: number;
    year?: number;
    employeeCodes?: string[];
  } = {},
  enabled = true
) => {
  return useFetchData({
    url: API.attendance.summary,
    params,
    enabled: enabled && !!params.month && !!params.year,
  });
};

/**
 * Fetches the listing of attendance regularization requests.
 * Supports optional filtering by empId, status, page, limit.
 */
export const useGetRegularizationRequests = (
  params: {
    employeeId?: number;
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
