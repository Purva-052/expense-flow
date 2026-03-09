/* eslint-disable @typescript-eslint/no-explicit-any */
import useFetchData from "@/hooks/use-fetch-data";
import usePostData from "@/hooks/use-post-data";
import usePatchData from "@/hooks/use-patch-data";
import useDeleteData from "@/hooks/use-delete-data";
import { useSystemInventoryMasterStore } from "../stores/useSystemInventoryMasterStore";
import { SystemInventoryApiConfig } from "../constants";

export const useCreateSystemInventoryType = (
  apiConfig: SystemInventoryApiConfig
) => {
  const { setOpen } = useSystemInventoryMasterStore();
  return usePostData({
    url: apiConfig.create,
    refetchQueries: [apiConfig.list],
    onSuccess: () => {
      setOpen(null);
    },
  });
};

export const useUpdateSystemInventoryType = (
  apiConfig: SystemInventoryApiConfig,
  id: string
) => {
  const { setOpen } = useSystemInventoryMasterStore();
  return usePatchData({
    url: `${apiConfig.update}/${id}`,
    refetchQueries: [apiConfig.list],
    onSuccess: () => setOpen(null),
  });
};

export const useGetSystemInventoryTypes = (
  apiConfig: SystemInventoryApiConfig,
  params?: any
) => {
  return useFetchData({ url: apiConfig.list, params });
};

export const useDeleteSystemInventoryTypes = (
  apiConfig: SystemInventoryApiConfig,
  id: string
) => {
  const { setOpen } = useSystemInventoryMasterStore();
  return useDeleteData({
    url: `${apiConfig.delete}/${id}`,
    refetchQueries: [apiConfig.list],
    onSuccess: () => {
      setOpen(null);
    },
  });
};
