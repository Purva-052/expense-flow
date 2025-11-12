/* eslint-disable @typescript-eslint/no-explicit-any */
import API from "@/config/api/api";
import useFetchData from "@/hooks/use-fetch-data";
import usePostData from "@/hooks/use-post-data";
import usePatchData from "@/hooks/use-patch-data";
import useDeleteData from "@/hooks/use-delete-data";
import { useServerStore } from "../stores/useServerStore";

const Server_List = API.server.list;

export const useCreateServer = () => {
  const { setOpen } = useServerStore();
  return usePostData({
    url: API.server.create,
    refetchQueries: [Server_List],
    onSuccess: () => {
      setOpen(null);
    },
  });
};

export const useUpdateServer = (id: string) => {
  const { setOpen } = useServerStore();
  return usePatchData({
    url: `${API.server.update}/${id}`,
    refetchQueries: [Server_List],
    onSuccess: () => setOpen(null),
  });
};

export const useGetServerList = (params?: any) => {
  return useFetchData({ url: Server_List, params });
};

export const useDeleteServer = (id: string) => {
  const { setOpen } = useServerStore();
  return useDeleteData({
    url: `${API.server.delete}/${id}`,
    refetchQueries: [Server_List],
    onSuccess: () => {
      setOpen(null);
    },
  });
};
