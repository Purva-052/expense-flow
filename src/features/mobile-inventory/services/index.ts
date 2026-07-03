/* eslint-disable @typescript-eslint/no-explicit-any */
import API from "@/config/api/api";
import useFetchData from "@/hooks/use-fetch-data";
import usePostData from "@/hooks/use-post-data";
import usePatchData from "@/hooks/use-patch-data";
import useDeleteData from "@/hooks/use-delete-data";
import { useMobileInventoryStore } from "../stores/useMobileInventoryStore";

const GET_API_URL = API.mobile_inventory.list;

export const useCreateMobileInventory = () => {
  const { setOpen } = useMobileInventoryStore();
  return usePostData({
    url: API.mobile_inventory.create,
    refetchQueries: [GET_API_URL],
    onSuccess: () => {
      setOpen(null);
    },
  });
};

export const useUpdateMobileInventory = (id: string) => {
  const { setOpen } = useMobileInventoryStore();
  return usePatchData({
    url: API.mobile_inventory.update_inventory(id),
    refetchQueries: [GET_API_URL],
    onSuccess: () => setOpen(null),
  });
};

export const useGetMobileInventoryList = (params?: any) => {
  return useFetchData({ url: GET_API_URL, params });
};

export const useGetMobileInventory = (id: string, enabled = true) => {
  return useFetchData({
    url: `${API.mobile_inventory.list}/${id}`,
    enabled,
  });
};

export const useDeleteMobileInventory = (id: string) => {
  const { setOpen } = useMobileInventoryStore();
  return useDeleteData({
    url: API.mobile_inventory.delete(id),
    refetchQueries: [GET_API_URL],
    onSuccess: () => {
      setOpen(null);
    },
  });
};
