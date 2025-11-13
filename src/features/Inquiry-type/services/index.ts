/* eslint-disable @typescript-eslint/no-explicit-any */
import API from "@/config/api/api";
import useFetchData from "@/hooks/use-fetch-data";
import usePostData from "@/hooks/use-post-data";
import usePatchData from "@/hooks/use-patch-data";
import useDeleteData from "@/hooks/use-delete-data";
import { useInquiryTypeStore } from "../stores/useInquiryTypeStore";

const GET_API_URL = API.project_modules.list;

export const useCreateInquiryType = () => {
  const { setOpen } = useInquiryTypeStore()
  return usePostData({
    url: API.project_modules.create,
    refetchQueries: [GET_API_URL],
    onSuccess: () => {
      setOpen(null)
    },
  })
}

export const useUpdateInquiryType = (id: string) => {
  const { setOpen } = useInquiryTypeStore()
  return usePatchData({
    url: `${API.project_modules.update}/${id}`,
    refetchQueries: [GET_API_URL],
    onSuccess: () => setOpen(null), // <-- ✅ correct place
  })
}

export const useGetInquiryType = (params?: any) => {
  return useFetchData({ url: GET_API_URL, params })
}

export const useDeleteInquiryType = (id: string) => {
  const { setOpen } = useInquiryTypeStore()
  return useDeleteData({
    url: `${API.project_modules.delete}/${id}`,
    refetchQueries: [GET_API_URL],
    onSuccess: () => {
      setOpen(null)
    },
  })
}
