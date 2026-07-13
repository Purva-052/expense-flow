/* eslint-disable @typescript-eslint/no-explicit-any */
import useFetchData from "@/hooks/use-fetch-data";
import usePatchData from "@/hooks/use-patch-data";
import usePostData from "@/hooks/use-post-data";
import useDeleteData from "@/hooks/use-delete-data";
import API from "@/config/api/api";
import { useSystemInventoryStore } from "../stores/useSystemInventoryStore";

const SYSTEM_INVENTORY_LIST_API = API.system_inventory.list;

export const useGetSystemInventoryData = (params?: any, enabled = true) => {
  return useFetchData({
    url: SYSTEM_INVENTORY_LIST_API,
    params,
    enabled,
  });
};

export const useCreateSystemInventoryData = () => {
  const { setOpen } = useSystemInventoryStore();

  return usePostData({
    url: API.system_inventory.create,
    refetchQueries: [SYSTEM_INVENTORY_LIST_API],
    onSuccess: () => {
      setOpen(null);
    },
  });
};

export const useUpdateSystemInventoryData = (id: string | number) => {
  const { setOpen } = useSystemInventoryStore();

  return usePatchData({
    url: `${API.system_inventory.update}/${id}`,
    refetchQueries: [SYSTEM_INVENTORY_LIST_API],
    onSuccess: () => {
      setOpen(null);
    },
  });
};

export const useDeleteSystemInventoryData = (id: string | number) => {
  const { setOpen } = useSystemInventoryStore();

  return useDeleteData({
    url: `${API.system_inventory.delete}/${id}`,
    refetchQueries: [SYSTEM_INVENTORY_LIST_API],
    onSuccess: () => {
      setOpen(null);
    },
  });
};

export const useGetProcessorDropdown = () => {
  return useFetchData({
    url: API.system_inventory_dropdowns.processor,
  });
};

export const useGetRamDropdown = () => {
  return useFetchData({
    url: API.system_inventory_dropdowns.ram,
  });
};

export const useGetStorageDropdown = () => {
  return useFetchData({
    url: API.system_inventory_dropdowns.storage,
  });
};

export const useGetBrandDropdown = () => {
  return useFetchData({
    url: API.system_inventory_dropdowns.brand,
  });
};

export const useGetHeadphoneBrandDropdown = () => {
  return useFetchData({
    url: API.system_inventory_dropdowns.headphone,
  });
};

export const useGetMonitorsizeDropdown = () => {
  return useFetchData({
    url: API.system_inventory_dropdowns.monitor,
  });
};
