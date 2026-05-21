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
import { buildQueryString } from "@/utils/storage";
import { useProjectServerStore } from "../stores/useProjectServerStore";
import { useProjectDocumentStore } from "../stores/useProjectDocumentStore";
import { toast } from "sonner";

const GET_API_URL = API.projects.list;
const GET_PRIORITY_DROPDOWN = API.dropdown_api.priority;
const Project_Server_List = API.projects.server_project;
const Project_Document = API.document.list;

export const useCreateProjectsData = () => {
  const { setOpen } = useProjectsStore();
  return usePostData({
    url: API.projects.create,
    refetchQueries: ["projects"],
    onSuccess: () => {
      setOpen(null);
    },
  });
};

export const useUpdateProjectsData = (id: string) => {
  const { setOpen } = useProjectsStore();
  return usePatchData({
    url: `${API.projects.list}/${id}`,
    refetchQueries: ["projects"],
    onSuccess: () => setOpen(null),
  });
};

const fetchProjects = async ({ pageParam = 1, queryKey }: any) => {
  const [_key, params] = queryKey;
  const baseURL = import.meta.env.VITE_API_BASE_URL;
  const token =
    useAuthStore.getState().user?.token ?? useAuthStore.getState().token;
  const queryStr = buildQueryString({
    ...params,
    page: pageParam,
    limit: 9,
  });
  const response = await axios.get(baseURL + `${GET_API_URL}${queryStr}`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

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

export const useGetProjectPriorityDropdownList = (params?: any) => {
  return useFetchData({ url: GET_PRIORITY_DROPDOWN, params });
};

export const useDeleteProjectsData = (id: string) => {
  const { setOpen } = useProjectsStore();
  return useDeleteData({
    url: `${API.projects.delete}/${id}`,
    refetchQueries: ["projects"],
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

export const useGetProjectsDetailData = (id: string | undefined) => {
  return useFetchData({
    url: `${API.projects.list}/${id}`,
    enabled: !!id,
  });
};

export const useCreateProjectServer = () => {
  const { setOpen } = useProjectServerStore();
  return usePostData({
    url: Project_Server_List,
    refetchQueries: [Project_Server_List],
    onSuccess: () => {
      setOpen(null);
    },
  });
};

export const useUpdateProjectServer = (id: string) => {
  const { setOpen } = useProjectServerStore();
  return usePatchData({
    url: `${Project_Server_List}/${id}`,
    refetchQueries: [Project_Server_List],
    onSuccess: () => setOpen(null),
  });
};

export const useGetProjectServerList = (params?: any) => {
  return useFetchData({ url: Project_Server_List, params });
};

export const useDeleteProjectServer = (id: string) => {
  const { setOpen } = useProjectServerStore();
  return useDeleteData({
    url: `${Project_Server_List}/${id}`,
    refetchQueries: [Project_Server_List],
    onSuccess: () => {
      setOpen(null);
    },
  });
};

export const useCreateProjectDocument = () => {
  const { setOpen, setCurrentRow } = useProjectDocumentStore();
  return usePostData({
    url: API.document.create,
    refetchQueries: [Project_Document],
    onSuccess: () => {
      setOpen(null);
      setCurrentRow(null);
    },
  });
};

export const useUpdateProjectsDocument = (id: string) => {
  const { setOpen, setCurrentRow } = useProjectDocumentStore();
  return usePatchData({
    url: `${Project_Document}/${id}`,
    refetchQueries: [Project_Document],
    onSuccess: () => {
      setOpen(null);
      setCurrentRow(null);
    },
  });
};

export const useGetProjectsDocument = (params: any) => {
  return useFetchData({
    url: Project_Document,
    params: params,
  });
};

export const useDeleteProjectDocument = (id: string) => {
  const { setOpen, setCurrentRow } = useProjectDocumentStore();
  return useDeleteData({
    url: `${Project_Document}/${id}`,
    refetchQueries: [Project_Document],
    onSuccess: () => {
      setOpen(null);
      setCurrentRow(null);
    },
  });
};

export const usePinProject = (id: string) => {
  return usePostData<any, void>({
    url: `${API.projects.list}/${id}${API.projects.pin_project}`,
    refetchQueries: ["projects"],
  });
};

export const useUnpinProject = (id: string) => {
  return useDeleteData({
    url: `${API.projects.list}/${id}${API.projects.remove_pin_project}`,
    refetchQueries: ["projects"],
    isSuccessMessage: false,
    onSuccess: () => {
      toast.success("Project Unpinned successfully");
    },
  });
};
