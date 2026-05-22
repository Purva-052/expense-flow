import API from "@/config/api/api";
import useFetchData from "@/hooks/use-fetch-data";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import instance from "@/config/instance/instance";
import usePatchData from "@/hooks/use-patch-data";
import usePostData from "@/hooks/use-post-data";
import { buildQueryString } from "@/utils/storage";
import { useAuthStore } from "@/stores/use-auth-store";
import axios from "axios";

const GET_DAILY_REPORT_LIST = API.daily_report.list;
const GET_PROJECT_MILESTONES = API.dropdown_api.milestones;
const GET_TASKS_DROPDOWN = API.dropdown_api.tasks;

export const useGetDailyReportList = (params?: any) => {
  return useFetchData({ url: GET_DAILY_REPORT_LIST, params });
};

export const useGetProjectMilestonesList = (
  params?: any,
  enabled: boolean = true
) => {
  return useFetchData({ url: GET_PROJECT_MILESTONES, params, enabled });
};

export const useGetTasksDropdownList = (
  params?: any,
  enabled: boolean = true
) => {
  return useFetchData({ url: GET_TASKS_DROPDOWN, params, enabled });
};

export const useUpdateDailyReport = (id: string, onSuccess?: () => void) => {
  return usePatchData({
    url: `${API.daily_report.update}/${id}`,
    refetchQueries: [GET_DAILY_REPORT_LIST, API.daily_report.report_analytics],
    onSuccess,
  });
};

export const useCreateDailyReport = (onSuccess?: () => void) => {
  return usePostData({
    url: API.daily_report.create,
    refetchQueries: [
      GET_DAILY_REPORT_LIST,
      API.daily_report.report_analytics,
      API.notifications.list,
    ],
    onSuccess,
  });
};

export const useDeleteDailyReport = (onSuccess?: () => void) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await instance.delete({
        url: `${API.daily_report.delete}/${id}`,
      });
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [GET_DAILY_REPORT_LIST, API.daily_report.report_analytics],
      });
      onSuccess?.();
    },
  });
};

export const useGetDailyReportById = (id: string) => {
  return useFetchData({
    url: `${API.daily_report.list}/${id}`,
    enabled: !!id,
  });
};

export const useGetTaskLogs = (taskId: string | number, params?: any) => {
  return useFetchData({
    url: `${API.daily_report.list}/tasks/${taskId}/logs`,
    params,
    enabled: !!taskId,
  });
};

export const useGetReportsAnalytics = () => {
  return useFetchData({
    url: API.daily_report.report_analytics,
    // refetchQueries: [API.daily_report.report_details],
  });
};

export const useGetReportDetails = (params: {
  type: string;
  sortBy?: "date" | "name";
  sortOrder?: "asc" | "desc";
  [key: string]: any;
}) => {
  return useFetchData({
    url: `${API.daily_report.report_details}`,
    params,
    enabled: !!params.type,
  });
};

export const useExportCSV = () => {
  return useMutation({
    mutationFn: async (params?: Record<string, any>) => {
      try {
        const queryString = buildQueryString(params ?? {});
        const baseURL = import.meta.env.VITE_API_BASE_URL;
        const token =
          useAuthStore.getState().user?.token ?? useAuthStore.getState().token;
        const response = await axios.get(
          `${baseURL}${API.daily_report.export_csv}${queryString}`,
          {
            responseType: "blob",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const contentDisposition = response.headers["content-disposition"];
        let filename = `daily_reports_export_${new Date().toISOString().split("T")[0]}.xlsx`;

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
                "Failed to generate CSV file"
            );
          } catch (parseError) {
            if (parseError instanceof Error) {
              throw parseError;
            }
          }
        }

        throw new Error(error?.message || "Failed to generate CSV file");
      }
    },
  });
};

export const useExportProjectLogsCSV = () => {
  return useMutation({
    mutationFn: async (params?: Record<string, any>) => {
      try {
        const queryString = buildQueryString(params ?? {});
        const baseURL = import.meta.env.VITE_API_BASE_URL;
        const token =
          useAuthStore.getState().user?.token ?? useAuthStore.getState().token;
        const response = await axios.get(
          `${baseURL}${API.daily_report.project_logs_csv}${queryString}`,
          {
            responseType: "blob",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const contentDisposition = response.headers["content-disposition"];
        let filename = `project_logs_export_${new Date().toISOString().split("T")[0]}.xlsx`;

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
                "Failed to generate CSV file"
            );
          } catch (parseError) {
            if (parseError instanceof Error) {
              throw parseError;
            }
          }
        }

        throw new Error(error?.message || "Failed to generate CSV file");
      }
    },
  });
};
