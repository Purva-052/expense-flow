import API from "@/config/api/api";
import useFetchData from "@/hooks/use-fetch-data";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import instance from "@/config/instance/instance";
import usePatchData from "@/hooks/use-patch-data";
import usePostData from "@/hooks/use-post-data";

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
    refetchQueries: [GET_DAILY_REPORT_LIST],
    onSuccess,
  });
};

export const useCreateDailyReport = (onSuccess?: () => void) => {
  return usePostData({
    url: API.daily_report.create,
    refetchQueries: [GET_DAILY_REPORT_LIST],
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
      queryClient.invalidateQueries({ queryKey: [GET_DAILY_REPORT_LIST] });
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
