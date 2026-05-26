/* eslint-disable @typescript-eslint/no-explicit-any */
import API from "@/config/api/api";
import useFetchData from "@/hooks/use-fetch-data";
import usePostData from "@/hooks/use-post-data";
import usePatchData from "@/hooks/use-patch-data";
import useDeleteData from "@/hooks/use-delete-data";
import { useClientInventoryStore } from "../stores/useClientInventory";

const GET_API_URL = API.client_inventory.list;

export const useCreateClientInventory = () => {
  const { setOpen } = useClientInventoryStore();
  return usePostData({
    url: API.client_inventory.create,
    refetchQueries: [GET_API_URL],
    onSuccess: () => {
      setOpen(null);
    },
  });
};

export const useUpdateClientInventory = (id: string) => {
  const { setOpen } = useClientInventoryStore();
  return usePatchData({
    url: `${API.client_inventory.update}/${id}`,
    refetchQueries: [GET_API_URL],
    onSuccess: () => setOpen(null), // <-- ✅ correct place
  });
};

export const useGetClientInventoryList = (params?: any) => {
  return useFetchData({ url: GET_API_URL, params });
};

// export const useGetClientInventoryTypeDropdownList = () => {
//   return useFetchData({ url: API.client_inventory.dropdown });
// };

export const useDeleteClientInventory = (id: string) => {
  const { setOpen } = useClientInventoryStore();
  return useDeleteData({
    url: `${API.client_inventory.delete}/${id}`,
    refetchQueries: [GET_API_URL],
    onSuccess: () => {
      setOpen(null);
    },
  });
};

export const useGetClientsDropdown = () => {
  return useFetchData({ url: API.dropdown_api.client });
};

export const useGetProjectsDropdown = () => {
  return useFetchData({ url: API.dropdown_api.project_list });
};

export const useGetInventoryTypesDropdown = () => {
  return useFetchData({ url: API.client_inventory_type.dropdown });
};

export const useGetBrandsDropdown = () => {
  return useFetchData({ url: API.system_inventory_dropdowns.brand });
};

export const useGetMonitorSizesDropdown = () => {
  return useFetchData({ url: API.system_inventory_dropdowns.monitor });
};

export const useGetProcessorsDropdown = () => {
  return useFetchData({ url: API.system_inventory_dropdowns.processor });
};

export const useGetRamsDropdown = () => {
  return useFetchData({ url: API.system_inventory_dropdowns.ram });
};

export const useGetStoragesDropdown = () => {
  return useFetchData({ url: API.system_inventory_dropdowns.storage });
};

export const useGetPrinterTypesDropdown = () => {
  return useFetchData({ url: API.printer_type.dropdown });
};

export const useGetDevicesDropdown = () => {
  return useFetchData({ url: API.device_management.dropdown });
};

