/* eslint-disable @typescript-eslint/no-explicit-any */
import API from "@/config/api/api";
import useFetchData from "@/hooks/use-fetch-data";
import usePostData from "@/hooks/use-post-data";
import usePatchData from "@/hooks/use-patch-data";
import useDeleteData from "@/hooks/use-delete-data";
import { useDomainStore } from "../stores/useDomainStore";

const GET_API_URL = API.domain.list;

export const useCreateDomain = () => {
  const { setOpen } = useDomainStore();
  return usePostData({
    url: API.domain.create,
    refetchQueries: [GET_API_URL],
    onSuccess: () => {
      setOpen(null);
    },
  });
};

export const useUpdateDomain = (id: string) => {
  const { setOpen } = useDomainStore();
  return usePatchData({
    url: `${API.domain.update}/${id}`,
    refetchQueries: [GET_API_URL],
    onSuccess: () => setOpen(null), // <-- ✅ correct place
  });
};

export const useGetDomainList = (params?: any) => {
  return useFetchData({ url: GET_API_URL, params });
};

export const useGetDomainDropdownList = () => {
  return useFetchData({ url: API.domain.dropdown });
};

export const useDeleteDomain = (id: string) => {
  const { setOpen } = useDomainStore();
  return useDeleteData({
    url: `${API.domain.delete}/${id}`,
    refetchQueries: [GET_API_URL],
    onSuccess: () => {
      setOpen(null);
    },
  });
};
