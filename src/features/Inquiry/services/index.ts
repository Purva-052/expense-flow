/* eslint-disable @typescript-eslint/no-explicit-any */
import API from "@/config/api/api";
import useDeleteData from "@/hooks/use-delete-data";
import useFetchData from "@/hooks/use-fetch-data";
import usePatchData from "@/hooks/use-patch-data";
import usePostData from "@/hooks/use-post-data";
import { buildQueryString } from "@/utils/storage";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { useAuthStore } from "@/stores/use-auth-store";
import { useInquiryStore } from "../stores/useInquiryStore";

const Inquiry_List = API.inquiry.list;

export const useCreateInquiry = () => {
  const { setOpen } = useInquiryStore();
  return usePostData({
    url: API.inquiry.create,
    refetchQueries: [Inquiry_List],
    onSuccess: () => {
      setOpen(null);
    },
  });
};

export const useUpdateInquiry = (id: string) => {
  const { setOpen } = useInquiryStore();
  return usePatchData({
    url: `${API.inquiry.update}/${id}`,
    refetchQueries: [Inquiry_List],
    onSuccess: () => setOpen(null), // <-- ✅ correct place
  });
};

export const useGetInquiry = (params?: any) => {
  return useFetchData({ url: Inquiry_List, params });
};

export const useDeleteInquiry = (id: string) => {
  const { setOpen } = useInquiryStore();
  return useDeleteData({
    url: `${API.inquiry.delete}/${id}`,
    refetchQueries: [Inquiry_List],
    onSuccess: () => {
      setOpen(null);
    },
  });
};

export const useUpdateInquiryStatus = (
  id: string,
  onSucessStatusChange?: any
) => {
  return usePatchData({
    url: `${API.inquiry_status.update}/${id}`,
    refetchQueries: [Inquiry_List],
    onSuccess: () => {
      onSucessStatusChange();
    },
  });
};

export const useCreateInquiryStatus = () => {
  return usePostData({
    url: `${API.inquiry_status.create}`,
    refetchQueries: [Inquiry_List],
  });
};

export const useGetInquiryHistoryData = (id?: any) => {
  return useFetchData({
    url: `${API.inquiry_status.history}/${id}`,
    enabled: !!id,
  });
};

export const useExportCSV = () => {
  return useMutation({
    mutationFn: async (params?: Record<string, any>) => {
      try {
        const queryString = buildQueryString(params ?? {});
        const baseURL = import.meta.env.VITE_API_BASE_URL;
        const token =
          useAuthStore.getState().user?.token ?? useAuthStore.getState().token;
        const response = await axios.get(
          `${baseURL}${API.inquiry.export_csv}${queryString}`,
          {
            responseType: "blob",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const contentDisposition = response.headers["content-disposition"];
        let filename = `lead_management_export_${new Date().toISOString().split("T")[0]}.xlsx`;

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

export const useGetInquiryPerformance = (params?: any, enabled: boolean = true) => {
  return useFetchData({
    url: API.inquiry.performance,
    params,
    enabled,
  });
};

