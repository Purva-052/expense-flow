/* eslint-disable @typescript-eslint/no-explicit-any */
import API from "@/config/api/api";
import useFetchData from "@/hooks/use-fetch-data";
import usePostData from "@/hooks/use-post-data";
import usePatchData from "@/hooks/use-patch-data";
import useDeleteData from "@/hooks/use-delete-data";
import { useDeviceStore } from "../stores/useDeviceStore";

const GET_API_URL = API.device_management.list;

export const useCreateDevice = () => {
  const { setOpen } = useDeviceStore();
  return usePostData({
    url: API.device_management.create,
    refetchQueries: [GET_API_URL],
    onSuccess: () => {
      setOpen(null);
    },
  });
};

export const useUpdateDevice = (id: string) => {
  const { setOpen } = useDeviceStore();
  return usePatchData({
    url: `${API.device_management.update}/${id}`,
    refetchQueries: [GET_API_URL],
    onSuccess: () => setOpen(null), // <-- ✅ correct place
  });
};

export const useGetDeviceList = (params?: any) => {
  return useFetchData({ url: GET_API_URL, params });
};

export const useGetDeviceDropdownList = () => {
  return useFetchData({ url: API.device_management.dropdown });
};

export const useDeleteDevice = (id: string) => {
  const { setOpen } = useDeviceStore();
  return useDeleteData({
    url: `${API.device_management.delete}/${id}`,
    refetchQueries: [GET_API_URL],
    onSuccess: () => {
      setOpen(null);
    },
  });
};
