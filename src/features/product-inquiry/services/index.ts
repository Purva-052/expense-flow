/* eslint-disable @typescript-eslint/no-explicit-any */
import API from "@/config/api/api";
import useFetchData from "@/hooks/use-fetch-data";
import usePostData from "@/hooks/use-post-data";
import usePatchData from "@/hooks/use-patch-data";
import useDeleteData from "@/hooks/use-delete-data";
import { useProductInquiryStore } from "../stores/useProductInquiry";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import instance from "@/config/instance/instance";
import { toast } from "sonner";

const GET_API_URL = API.product_inquiry.list;

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

export const useUpdateProductInquiryComment = (inquiryId: string, commentId: string) => {
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
