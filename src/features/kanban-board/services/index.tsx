/* eslint-disable @typescript-eslint/no-explicit-any */
import API from "@/config/api/api";
import useFetchData from "@/hooks/use-fetch-data";
import usePostData from "@/hooks/use-post-data";

const GET_API_URL = API.users.available_developers;
const PROJECTS_API_URL = API.projects.list;
const GET_ALL_DEVELOPER_API_URL = API.users.all_developers;
const GET_PROJECT_HANDLER_API_URL = API.users.project_handler;

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

export const useGetProjectHandlerProjectsAPI = (
  isenabled: any,
  params?: any
) => {
  return useFetchData({
    url: GET_PROJECT_HANDLER_API_URL,
    enabled: isenabled,
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

export const useProjectStatusChange = () => {
  return usePostData({
    url: API.projects.status_change,
    refetchQueries: [PROJECTS_API_URL],
    onSuccess: () => {},
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
