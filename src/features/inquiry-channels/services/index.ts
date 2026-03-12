/* eslint-disable @typescript-eslint/no-explicit-any */
import API from "@/config/api/api";
import useFetchData from "@/hooks/use-fetch-data";
import usePostData from "@/hooks/use-post-data";
import usePatchData from "@/hooks/use-patch-data";
import useDeleteData from "@/hooks/use-delete-data";
import { useInquiryCategoryStore } from "../stores/useInquiryCategoryStore";

const GET_API_URL = API.inquiry_source.list;

export const useCreateInquiryCategory = () => {
  const { setOpen } = useInquiryCategoryStore();
  return usePostData({
    url: API.inquiry_source.create,
    refetchQueries: [GET_API_URL],
    onSuccess: () => {
      setOpen(null);
    },
  });
};

export const useUpdateInquiryCategory = (id: string) => {
  const { setOpen } = useInquiryCategoryStore();
  return usePatchData({
    url: `${API.inquiry_source.update}/${id}`,
    refetchQueries: [GET_API_URL],
    onSuccess: () => setOpen(null), // <-- ✅ correct place
  });
};

export const useGetInquiryCategory = (params?: any) => {
  return useFetchData({ url: GET_API_URL, params });
};

export const useGetInquiryCategoryDropdown = () => {
  return useFetchData({ url: GET_API_URL });
};

export const useDeleteInquiryCategory = (id: string) => {
  const { setOpen } = useInquiryCategoryStore();
  return useDeleteData({
    url: `${API.inquiry_source.delete}/${id}`,
    refetchQueries: [GET_API_URL],
    onSuccess: () => {
      setOpen(null);
    },
  });
};
