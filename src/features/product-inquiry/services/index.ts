/* eslint-disable @typescript-eslint/no-explicit-any */
import API from "@/config/api/api";
import useFetchData from "@/hooks/use-fetch-data";
import usePostData from "@/hooks/use-post-data";
import usePatchData from "@/hooks/use-patch-data";
import useDeleteData from "@/hooks/use-delete-data";
import { buildQueryString } from "@/utils/storage";
import { useProductInquiryStore } from "../stores/useProductInquiry";
import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import axios from "axios";
import instance from "@/config/instance/instance";
import { useAuthStore } from "@/stores/use-auth-store";
import { toast } from "sonner";

const GET_API_URL = API.product_inquiry.list;

const fetchProductInquiries = async ({ pageParam = 1, queryKey }: any) => {
  const [_key, params] = queryKey;
  const baseURL = import.meta.env.VITE_API_BASE_URL;
  const token =
    useAuthStore.getState().user?.token ?? useAuthStore.getState().token;
  const queryStr = buildQueryString({
    ...params,
    page: pageParam,
    limit: 9,
  });
  const response = await axios.get(baseURL + `${GET_API_URL}${queryStr}`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
};

export const useGetProductInquiryListInfinite = (params?: any) => {
  return useInfiniteQuery({
    queryKey: [GET_API_URL, params],
    queryFn: fetchProductInquiries,
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const metadata = lastPage?.metadata;
      return metadata?.page < metadata?.totalPages
        ? metadata.page + 1
        : undefined;
    },
  });
};

export const useCreateProductInquiry = () => {
  const { setOpen } = useProductInquiryStore();
  return usePostData({
    url: API.product_inquiry.create,
    refetchQueries: [GET_API_URL],
    onSuccess: () => {
      setOpen(null);
    },
  });
};

interface UpdateProductInquiryOptions {
  closeOnSuccess?: boolean;
  onSuccess?: () => void;
}

export const useUpdateProductInquiry = (
  id: string,
  { closeOnSuccess = true, onSuccess }: UpdateProductInquiryOptions = {}
) => {
  const { setOpen } = useProductInquiryStore();
  return usePatchData({
    url: `${API.product_inquiry.update}/${id}`,
    refetchQueries: [GET_API_URL],
    onSuccess: () => {
      if (closeOnSuccess) {
        setOpen(null);
      }
      onSuccess?.();
    },
  });
};

export const useGetProductInquiryList = (params?: any) => {
  return useFetchData({ url: GET_API_URL, params });
};

export const useGetProductDropdown = () => {
  return useFetchData({ url: API.product_inquiry.productDropdown });
};

export const useDeleteProductInquiry = (id: string) => {
  const { setOpen } = useProductInquiryStore();
  return useDeleteData({
    url: `${API.product_inquiry.delete}/${id}`,
    refetchQueries: [GET_API_URL],
    onSuccess: () => {
      setOpen(null);
    },
  });
};

// --- Comment Hooks ---

export const useGetProductInquiryComments = (inquiryId: string) => {
  return useFetchData({
    url: API.product_inquiry.comments.list(inquiryId),
    enabled: !!inquiryId,
  });
};

export const useCreateProductInquiryComment = (inquiryId: string) => {
  return usePostData({
    url: API.product_inquiry.comments.create(inquiryId),
    refetchQueries: [API.product_inquiry.comments.list(inquiryId)],
  });
};

export const useUpdateProductInquiryComment = (
  inquiryId: string,
  commentId: string
) => {
  return usePatchData({
    url: API.product_inquiry.comments.update(inquiryId, commentId),
    refetchQueries: [API.product_inquiry.comments.list(inquiryId)],
  });
};

export const useDeleteProductInquiryComment = (inquiryId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (commentId: string) => {
      const response = await instance.delete({
        url: API.product_inquiry.comments.delete(inquiryId, commentId),
      });
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [API.product_inquiry.comments.list(inquiryId)],
      });
      toast.success("Comment deleted successfully");
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to delete comment");
    },
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
          `${baseURL}${API.product_inquiry.export_csv}${queryString}`,
          {
            responseType: "blob",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const contentDisposition = response.headers["content-disposition"];
        let filename = `product_inquiries_export_${new Date().toISOString().split("T")[0]}.xlsx`;

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
