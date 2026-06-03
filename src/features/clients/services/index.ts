/* eslint-disable @typescript-eslint/no-explicit-any */
import API from "@/config/api/api";
import usePostData from "@/hooks/use-post-data";
import { useClientsStore } from "../stores/useClientsStore";
import usePatchData from "@/hooks/use-patch-data";
import useFetchData from "@/hooks/use-fetch-data";
import useDeleteData from "@/hooks/use-delete-data";
import axios from "axios";
import { buildQueryString } from "@/utils/storage";
import { useMutation } from "@tanstack/react-query";
import { useAuthStore } from "@/stores/use-auth-store";

const GET_API_URL = API.clients.list;
const GET_CLIENT_DROPDOWN = API.dropdown_api.client;
const GET_COUNTRY_DROPDOWN = API.dropdown_api.country;

export const useCreateClientsData = () => {
  const { setOpen } = useClientsStore();
  return usePostData({
    url: API.clients.create,
    refetchQueries: [GET_API_URL],
    onSuccess: () => {
      setOpen(null);
    },
  });
};

export const useUpdateClientsData = (id: string) => {
  const { setOpen } = useClientsStore();
  return usePatchData({
    url: `${API.clients.list}/${id}`,
    refetchQueries: [GET_API_URL],
    onSuccess: () => setOpen(null), // <-- ✅ correct place
  });
};

export const useGetClientsData = (params?: any) => {
  return useFetchData({ url: GET_API_URL, params });
};

export const useGetClientsDropdownList = (params?: any) => {
  return useFetchData({ url: GET_CLIENT_DROPDOWN, params });
};

export const useGetCountryDropdownList = (params?: any) => {
  return useFetchData({ url: GET_COUNTRY_DROPDOWN, params });
};

export const useDeleteClientsData = (id: string) => {
  const { setOpen } = useClientsStore();
  return useDeleteData({
    url: `${API.clients.delete}/${id}`,
    refetchQueries: [GET_API_URL],
    onSuccess: () => {
      setOpen(null);
    },
  });
};

export const useExportClientsData = () => {
  return useMutation({
    mutationFn: async (params?: Record<string, any>) => {
      try {
        const queryString = buildQueryString(params ?? {});
        const baseURL = import.meta.env.VITE_API_BASE_URL;
        const token =
          useAuthStore.getState().user?.token ?? useAuthStore.getState().token;
        const response = await axios.get(
          `${baseURL}${API.clients.export}${queryString}`,
          {
            responseType: "blob",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const contentDisposition = response.headers["content-disposition"];
        let filename = `clients_export_${new Date().toISOString().split("T")[0]}.xlsx`;

        if (contentDisposition) {
          const filenameMatch = contentDisposition.match(
            /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/
          );
          if (filenameMatch?.[1]) {
            filename = filenameMatch[1].replace(/['"]/g, "");
          }
        }

        return {
          blob: response.data,
          filename,
        };
      } catch (error: any) {
        if (axios.isAxiosError(error) && error.response?.data instanceof Blob) {
          try {
            const errorText = await error.response.data.text();
            const parsedError = JSON.parse(errorText);
            throw new Error(
              parsedError?.message ||
                parsedError?.messages?.[0] ||
                "Failed to generate CSV file"
            );
          } catch (parseError) {
            if (parseError instanceof Error) {
              throw parseError;
            }
          }
        }

        throw new Error(error?.message || "Failed to generate CSV file");
      }
    },
  });
};
