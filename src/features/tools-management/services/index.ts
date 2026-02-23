/* eslint-disable @typescript-eslint/no-explicit-any */
import API from "@/config/api/api";
import usePostData from "@/hooks/use-post-data";
import usePatchData from "@/hooks/use-patch-data";
import useDeleteData from "@/hooks/use-delete-data";
import useFetchData from "@/hooks/use-fetch-data";
import { useToolsStore } from "../stores";

const GET_API_URL = API.tools_management.list;

export const useCreateToolsData = () => {
  const { setOpen } = useToolsStore();
  return usePostData({
    url: API.tools_management.create,
    refetchQueries: [GET_API_URL],
    onSuccess: () => {
      setOpen(null);
    },
  });
};

export const useUpdateToolsData = (id: string) => {
  const { setOpen } = useToolsStore();
  return usePatchData({
    url: `${API.tools_management.update}/${id}`,
    refetchQueries: [GET_API_URL],
    onSuccess: () => setOpen(null),
  });
};

export const useGetToolsData = (params?: any) => {
  return useFetchData({ url: GET_API_URL, params });
};

export const useDeleteToolsData = (id: string) => {
  const { setOpen } = useToolsStore();
  return useDeleteData({
    url: `${API.tools_management.delete}/${id}`,
    refetchQueries: [GET_API_URL],
    onSuccess: () => {
      setOpen(null);
    },
  });
};