/* eslint-disable @typescript-eslint/no-explicit-any */
import API from "@/config/api/api";
import useFetchData from "@/hooks/use-fetch-data";
import usePostData from "@/hooks/use-post-data";
import usePatchData from "@/hooks/use-patch-data";
import useDeleteData from "@/hooks/use-delete-data";
import { useClientInventoryTypeStore } from "../stores/useClientInventoryTypeStore";

const GET_API_URL = API.client_inventory_type.list;

export const useCreateClientInventoryType = () => {
  const { setOpen } = useClientInventoryTypeStore();
  return usePostData({
    url: API.client_inventory_type.create,
    refetchQueries: [GET_API_URL],
    onSuccess: () => {
      setOpen(null);
    },
  });
};

export const useUpdateClientInventoryType = (id: string) => {
  const { setOpen } = useClientInventoryTypeStore();
  return usePatchData({
    url: `${API.client_inventory_type.update}/${id}`,
    refetchQueries: [GET_API_URL],
    onSuccess: () => setOpen(null), // <-- ✅ correct place
  });
};

export const useGetClientInventoryTypeList = (params?: any) => {
  return useFetchData({ url: GET_API_URL, params });
};

export const useGetClientInventoryTypeDropdownList = () => {
  return useFetchData({ url: API.client_inventory_type.dropdown });
};

export const useDeleteClientInventoryType = (id: string) => {
  const { setOpen } = useClientInventoryTypeStore();
  return useDeleteData({
    url: `${API.client_inventory_type.delete}/${id}`,
    refetchQueries: [GET_API_URL],
    onSuccess: () => {
      setOpen(null);
    },
  });
};
