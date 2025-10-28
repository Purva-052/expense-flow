/* eslint-disable @typescript-eslint/no-explicit-any */
import API from "@/config/api/api";
import useFetchData from "@/hooks/use-fetch-data";
import usePostData from "@/hooks/use-post-data";

const GET_API_URL = API.users.available_developers;
const PROJECTS_API_URL = API.projects.list;
const GET_ALL_DEVELOPER_API_URL = API.users.all_developers;

export const useGetAvailableDeveloperList = (params?: any) => {
  return useFetchData({ url: GET_API_URL, params });
};

export const useGetAllDevelopers = (params?: any) => {
  return useFetchData({ url: GET_ALL_DEVELOPER_API_URL, params });
};

export const useAssignDeveloper = (onsuccess: any) => {
  return usePostData({
    url: API.projects.assign_developers,
    refetchQueries: [GET_API_URL],
    onSuccess: () => {
      onsuccess();
    },
  });
};

export const useRemoveDeveloperFromProject = (onsuccess: any) => {
  return usePostData({
    url: API.users.remove_developer_from_project,
    refetchQueries: [PROJECTS_API_URL],
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
