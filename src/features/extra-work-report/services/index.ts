/* eslint-disable @typescript-eslint/no-explicit-any */
import API from "@/config/api/api";
import usePostData from "@/hooks/use-post-data";
import usePatchData from "@/hooks/use-patch-data";
// import useFetchData from "@/hooks/use-fetch-data";
import useDeleteData from "@/hooks/use-delete-data";
import useFetchData from "@/hooks/use-fetch-data";
import { useExtraWorkStore } from "../stores";

const GET_API_URL = API.extra_hours.list;

export const useCreateExtraWorkData = () => {
  const { setOpen } = useExtraWorkStore();
  return usePostData({
    url: API.extra_hours.create,
    refetchQueries: [GET_API_URL],
    onSuccess: () => {
      setOpen(null);
    },
  });
};

export const useUpdateExtraWorkData = (id: string) => {
  const { setOpen } = useExtraWorkStore();
  return usePatchData({
    url: `${API.extra_hours.update}/${id}`,
    refetchQueries: [GET_API_URL],
    onSuccess: () => setOpen(null),
  });
};

export const useGetExtraWorkData = (params?: any) => {
  return useFetchData({ url: GET_API_URL, params });
};

export const useDeleteExtraWorkData = (id: string) => {
  const { setOpen } = useExtraWorkStore();
  return useDeleteData({
    url: `${API.extra_hours.delete}/${id}`,
    refetchQueries: [GET_API_URL],
    onSuccess: () => {
      setOpen(null);
    },
  });
};
