/* eslint-disable @typescript-eslint/no-explicit-any */
import API from "@/config/api/api";
import useFetchData from "@/hooks/use-fetch-data";
import usePatchData from "@/hooks/use-patch-data";
import usePostData from "@/hooks/use-post-data";
import { useAuthStore } from "@/stores/use-auth-store";
import { buildQueryString } from "@/utils/storage";
import { useInfiniteQuery } from "@tanstack/react-query";
import axios from "axios";

const GET_API_URL = API.users.available_developers;
const PROJECTS_API_URL = API.projects.list;
const GET_ALL_DEVELOPER_API_URL = API.users.all_developers;
const GET_BECOMEING_AVAILABLE_DEVELOPER_API_URL =
  API.users.becoming_available_developer;
const GET_PROJECT_HANDLER_API_URL = API.users.project_handler;
const GET_Inquiry_API_URL = API.inquiry.dashboard;

export const useGetAvailableDeveloperList = (params?: any) => {
  return useFetchData({ url: GET_API_URL, params });
};

export const useGetProjectHistoryData = (
  id: any,
  isOpen: boolean,
  params?: any
) => {
  return useFetchData({
    url: `${PROJECTS_API_URL}/${id}/developershistory`,
    params,
    enabled: isOpen && !!id,
  });
};

export const useGetAllDevelopers = (params?: any) => {
  return useFetchData({ url: GET_ALL_DEVELOPER_API_URL, params });
};
export const useGetAllBecomingAvailableDevelopers = (params?: any) => {
  return useFetchData({
    url: GET_BECOMEING_AVAILABLE_DEVELOPER_API_URL,
    params,
  });
};

export const useGetProjectHandlerProjectsAPI = (params: any) => {
  return useFetchData({
    url: GET_PROJECT_HANDLER_API_URL,
    enabled: params?.enabled,
    params,
  });
};

export const useAssignDeveloper = (onsuccess: any) => {
  return usePostData({
    url: API.projects.assign_developers,
    refetchQueries: [GET_ALL_DEVELOPER_API_URL, PROJECTS_API_URL],
    onSuccess: () => {
      onsuccess();
    },
  });
};

export const useUpdateProjectWorkingHour = (id: any, onsuccess: any) => {
  return usePatchData({
    url: `${API.projects.assign_developers}/${id}`,
    refetchQueries: [GET_ALL_DEVELOPER_API_URL, PROJECTS_API_URL],
    onSuccess: () => {
      onsuccess();
    },
  });
};

export const useProjectStatusChange = (onsuccess?: () => void) => {
  return usePostData({
    url: API.projects.status_change,
    refetchQueries: [PROJECTS_API_URL],
    onSuccess: () => {
      if (typeof onsuccess === "function") onsuccess();
    },
  });
};

export const useRemoveDeveloperFromProject = (onsuccess: any) => {
  return usePostData({
    url: API.users.remove_developer_from_project,
    refetchQueries: [PROJECTS_API_URL, GET_ALL_DEVELOPER_API_URL],
    onSuccess: () => {
      onsuccess();
    },
  });
};

export const useReallocateDeveloperTOProject = (onsuccess: any) => {
  return usePostData({
    url: API.users.reallocate_developer,
    refetchQueries: [PROJECTS_API_URL],
    onSuccess: () => {
      onsuccess();
    },
  });
};

const fetchInquirysDashboard = async ({ pageParam = 1, queryKey }: any) => {
  const [_key, params] = queryKey;
  const baseURL = import.meta.env.VITE_API_BASE_URL;
  const token =
    useAuthStore.getState().user?.token ?? useAuthStore.getState().token;
  const queryStr = buildQueryString({
    ...params,
    page: pageParam,
    limit: 10,
  });
  const response = await axios.get(baseURL + `${GET_Inquiry_API_URL}${queryStr}`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
};

export const useGetInquiryDashboardData = (params?: any) => {
  return useInfiniteQuery({
    queryKey: [GET_Inquiry_API_URL, params],
    queryFn: fetchInquirysDashboard,
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const metadata = lastPage?.metadata;
      return metadata?.page < metadata?.totalPages
        ? metadata.page + 1
        : undefined;
    },
  });
};
