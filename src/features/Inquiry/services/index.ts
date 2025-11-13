/* eslint-disable @typescript-eslint/no-explicit-any */
import API from "@/config/api/api";
import useDeleteData from "@/hooks/use-delete-data";
import useFetchData from "@/hooks/use-fetch-data";
import usePatchData from "@/hooks/use-patch-data";
import usePostData from "@/hooks/use-post-data";
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

export const useCreateInquiryStatus = (onSucessStatusChange?: any) => {
  return usePostData({
    url: `${API.inquiry_status.create}`,
    refetchQueries: [Inquiry_List],
    onSuccess: () => {
      onSucessStatusChange();
    },
  });
};

export const useGetInquiryHistoryData = (id?: any) => {
  return useFetchData({
    url: `${API.inquiry_status.history}/${id}`,
    enabled: !!id,
  });
};
