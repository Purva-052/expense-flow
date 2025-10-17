/* eslint-disable @typescript-eslint/no-explicit-any */
import API from "@/config/api/api";
import useFetchData from "@/hooks/use-fetch-data";
import usePostData from "@/hooks/use-post-data";

const GET_API_URL = API.users.available_developers;
const PROJECTS_API_URL = API.projects.list;

export const useGetAvailableDeveloperList = (params?: any) => {
  return useFetchData({ url: GET_API_URL, params });
};

export const useAssignDeveloper = (onsuccess: any) => {
  return usePostData({
    url: API.projects.assign_developers,
    refetchQueries: [PROJECTS_API_URL],
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
