/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-explicit-any */
import API from "@/config/api/api";
import { useProjectsStore } from "../stores/useProjectsStore";
import usePostData from "@/hooks/use-post-data";
import usePatchData from "@/hooks/use-patch-data";
import useDeleteData from "@/hooks/use-delete-data";
import { useInfiniteQuery } from "@tanstack/react-query";
import axios from "axios";
import { useAuthStore } from "@/stores/use-auth-store";
import useFetchData from "@/hooks/use-fetch-data";

const GET_API_URL = API.projects.list;

export const useCreateProjectsData = () => {
  const { setOpen } = useProjectsStore();
  return usePostData({
    url: API.projects.create,
    refetchQueries: [GET_API_URL],
    onSuccess: () => {
      setOpen(null);
    },
  });
};

export const useUpdateProjectsData = (id: string) => {
  const { setOpen } = useProjectsStore();
  return usePatchData({
    url: `${API.projects.list}/${id}`,
    refetchQueries: [GET_API_URL],
    onSuccess: () => setOpen(null),
  });
};

const fetchProjects = async ({ pageParam = 1, queryKey }: any) => {
  const [_key, params] = queryKey;
  const token =
    useAuthStore.getState().user?.token ?? useAuthStore.getState().token;
  const response = await axios.get(
    `https://api-resource-management.devstree.in/api/v1${GET_API_URL}`,
    {
      params: {
        ...params,
        page: pageParam,
        limit: 10,
      },
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
};

export const useGetProjectsData = (params?: any) => {
  return useInfiniteQuery({
    queryKey: ["projects", params],
    queryFn: fetchProjects,
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const metadata = lastPage?.metadata;
      return metadata?.page < metadata?.totalPages
        ? metadata.page + 1
        : undefined;
    },
  });
};

export const useGetProjectListForListView = (params?: any) => {
  return useFetchData({ url: GET_API_URL, params });
};

export const useDeleteProjectsData = (id: string) => {
  const { setOpen } = useProjectsStore();
  return useDeleteData({
    url: `${API.projects.delete}/${id}`,
    refetchQueries: [GET_API_URL],
    onSuccess: () => {
      setOpen(null);
    },
  });
};

export const useGetProjectsHistoryData = (id: string | undefined) => {
  return useFetchData({
    url: `${API.projects.history}/${id}`,
    enabled: !!id,
  });
};
