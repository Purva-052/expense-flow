/* eslint-disable @typescript-eslint/no-explicit-any */
import API from "@/config/api/api";
import useFetchData from "@/hooks/use-fetch-data";
import usePostData from "@/hooks/use-post-data";
import usePatchData from "@/hooks/use-patch-data";
import useDeleteData from "@/hooks/use-delete-data";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { useAuthStore } from "@/stores/use-auth-store";
import { useClientNDAStore } from "../stores/useClientNDA";
import { toast } from "sonner";

const GET_NDA_LIST = API.client_NDA.list;

export const useGetNDAList = (params?: any) => {
  return useFetchData({ url: GET_NDA_LIST, params });
};

export const useCreateNDA = (onSuccess?: (data: any) => void) => {
  return usePostData({
    url: API.client_NDA.create,
    refetchQueries: [GET_NDA_LIST],
    onSuccess,
  });
};

export const useUpdateNDA = (id: string, onSuccess?: (data: any) => void) => {
  return usePatchData({
    url: `${API.client_NDA.update}/${id}`,
    refetchQueries: [GET_NDA_LIST],
    onSuccess,
  });
};

export const useSendNDA = (id: string, onSuccess?: () => void) => {
  return usePostData({
    url: API.client_NDA.send(id),
    refetchQueries: [GET_NDA_LIST],
    onSuccess,
  });
};

export const useDeleteNDA = (id: string) => {
  const { setOpen } = useClientNDAStore();
  return useDeleteData({
    url: `${API.client_NDA.delete}/${id}`,
    refetchQueries: [GET_NDA_LIST],
    isSuccessMessage: false,
    onSuccess: () => {
      setOpen(null);
      toast.success("NDA document deleted successfully", {
        duration: 3000,
        position: "top-right",
      });
    },
  });
};

export const useGetClientsDropdown = () => {
  return useFetchData({ url: API.dropdown_api.client });
};

export const useGetCountryDropdown = () => {
  return useFetchData({ url: API.dropdown_api.country });
};

// Hook to fetch preview PDF blob
export const useGetNDAPreviewBlob = () => {
  return useMutation({
    mutationFn: async (id: string) => {
      const baseURL = import.meta.env.VITE_API_BASE_URL;
      const token =
        useAuthStore.getState().user?.token ?? useAuthStore.getState().token;
      const response = await axios.get(
        `${baseURL}${API.client_NDA.preview(id)}`,
        {
          responseType: "blob",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data;
    },
  });
};

// Hook to fetch downloaded signed PDF blob
export const useGetNDADownloadBlob = () => {
  return useMutation({
    mutationFn: async (id: string) => {
      const baseURL = import.meta.env.VITE_API_BASE_URL;
      const token =
        useAuthStore.getState().user?.token ?? useAuthStore.getState().token;
      const response = await axios.get(
        `${baseURL}${API.client_NDA.download(id)}`,
        {
          responseType: "blob",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data;
    },
  });
};
