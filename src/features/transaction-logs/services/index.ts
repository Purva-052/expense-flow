/* eslint-disable @typescript-eslint/no-explicit-any */
import API from "@/config/api/api";
import usePostData from "@/hooks/use-post-data";
import usePatchData from "@/hooks/use-patch-data";
// import useFetchData from "@/hooks/use-fetch-data";
import useDeleteData from "@/hooks/use-delete-data";
import { useTransactionStore } from "../stores";
import useFetchData from "@/hooks/use-fetch-data";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { buildQueryString } from "@/utils/storage";
import { useAuthStore } from "@/stores/use-auth-store";

const GET_API_URL = API.transaction_logs.list;
// const GET_CLIENT_DROPDOWN = API.dropdown_api.client;
// const GET_COUNTRY_DROPDOWN = API.dropdown_api.country;

export const useCreateTransactionData = () => {
  const { setOpen } = useTransactionStore();
  return usePostData({
    url: API.transaction_logs.create,
    refetchQueries: [GET_API_URL],
    onSuccess: () => {
      setOpen(null);
    },
  });
};

export const useUpdateTransactionData = (id: string) => {
  const { setOpen } = useTransactionStore();
  return usePatchData({
    url: `${API.transaction_logs.update}/${id}`,
    refetchQueries: [GET_API_URL],
    onSuccess: () => setOpen(null), // <-- ✅ correct place
  });
};

export const useGetTransactionData = (params?: any) => {
  return useFetchData({ url: GET_API_URL, params });
};

// export const useGetClientsDropdownList = (params?: any) => {
//   return useFetchData({ url: GET_CLIENT_DROPDOWN, params });
// };

// export const useGetCountryDropdownList = (params?: any) => {
//   return useFetchData({ url: GET_COUNTRY_DROPDOWN, params });
// };

export const useDeleteTransactionData = (id: string) => {
  const { setOpen } = useTransactionStore();
  return useDeleteData({
    url: `${API.transaction_logs.delete}/${id}`,
    refetchQueries: [GET_API_URL],
    onSuccess: () => {
      setOpen(null);
    },
  });
};

export const useApproveRejectTransaction = (id: string) => {
  const { setOpen } = useTransactionStore();
  return usePatchData({
    url: API.transaction_logs.request.replace("{id}", id),
    refetchQueries: [GET_API_URL],
    onSuccess: () => {
      setOpen(null);
    },
  });
};

export const useUploadTransactionFile = () => {
  return usePostData({
    url: API.interview.upload,
    refetchQueries: [GET_API_URL],
  });
};

export const useExportTransactionData = () => {
  return useMutation({
    mutationFn: async (params?: Record<string, any>) => {
      try {
        const queryString = buildQueryString(params ?? {});
        const baseURL = import.meta.env.VITE_API_BASE_URL;
        const token =
          useAuthStore.getState().user?.token ?? useAuthStore.getState().token;
        const response = await axios.get(
          `${baseURL}${API.transaction_logs.export}${queryString}`,
          {
            responseType: "blob",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const contentDisposition = response.headers["content-disposition"];
        let filename = `transaction_logs_export_${new Date().toISOString().split("T")[0]}.xlsx`;

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
