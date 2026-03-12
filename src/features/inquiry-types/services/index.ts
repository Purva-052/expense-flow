/* eslint-disable @typescript-eslint/no-explicit-any */
import API from "@/config/api/api";
import useFetchData from "@/hooks/use-fetch-data";
import usePostData from "@/hooks/use-post-data";
import usePatchData from "@/hooks/use-patch-data";
import useDeleteData from "@/hooks/use-delete-data";
import { useInquiryTypeStore } from "../stores/useInquiryTypeStore";
const GET_API_URL = API.inquiry_types.list;

export const useCreateInquiryType = () => {
  const { setOpen } = useInquiryTypeStore();
  return usePostData({
    url: API.inquiry_types.create,
    refetchQueries: [GET_API_URL],
    onSuccess: () => {
      setOpen(null);
    },
  });
};

export const useUpdateInquiryType = (id: string) => {
  const { setOpen } = useInquiryTypeStore();
  return usePatchData({
    url: `${API.inquiry_types.update}/${id}`,
    refetchQueries: [GET_API_URL],
    onSuccess: () => setOpen(null), // <-- ✅ correct place
  });
};

export const useGetInquiryType = (params?: any) => {
  return useFetchData({ url: GET_API_URL, params });
};

export const useGetInquiryDropdownList = () => {
  return useFetchData({ url: API.inquiry_types.dropdown });
};

export const useDeleteInquiryType = (id: string) => {
  const { setOpen } = useInquiryTypeStore();
  return useDeleteData({
    url: `${API.inquiry_types.delete}/${id}`,
    refetchQueries: [GET_API_URL],
    onSuccess: () => {
      setOpen(null);
    },
  });
};
