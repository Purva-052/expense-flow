/* eslint-disable @typescript-eslint/no-explicit-any */
import API from "@/config/api/api";
import useFetchData from "@/hooks/use-fetch-data";
import usePostData from "@/hooks/use-post-data";
import usePatchData from "@/hooks/use-patch-data";
import useDeleteData from "@/hooks/use-delete-data";
import { useIndustryStore } from "../stores/useIndustryStore";

const GET_API_URL = API.industry.list;

export const useCreateIndustry = () => {
  const { setOpen } = useIndustryStore();
  return usePostData({
    url: API.industry.create,
    refetchQueries: [GET_API_URL],
    onSuccess: () => {
      setOpen(null);
    },
  });
};

export const useUpdateIndustry = (id: string) => {
  const { setOpen } = useIndustryStore();
  return usePatchData({
    url: `${API.industry.update}/${id}`,
    refetchQueries: [GET_API_URL],
    onSuccess: () => setOpen(null), // <-- ✅ correct place
  });
};

export const useGetIndustryList = (params?: any) => {
  return useFetchData({ url: GET_API_URL, params });
};

export const useGetIndustryDropdownList = () => {
  return useFetchData({ url: API.industry.dropdown });
};

export const useDeleteIndustry = (id: string) => {
  const { setOpen } = useIndustryStore();
  return useDeleteData({
    url: `${API.industry.delete}/${id}`,
    refetchQueries: [GET_API_URL],
    onSuccess: () => {
      setOpen(null);
    },
  });
};
