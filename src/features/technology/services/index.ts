/* eslint-disable @typescript-eslint/no-explicit-any */
import API from '@/config/api/api';
import useFetchData from '@/hooks/use-fetch-data';
import { useTechnologyStore } from '../stores/useTechnologyStore';
import usePostData from '@/hooks/use-post-data';
import usePatchData from '@/hooks/use-patch-data';
import useDeleteData from '@/hooks/use-delete-data';

const GET_API_URL = API.technology.list;
const GET_TECHNOLOGY_DROPDOWN = API.dropdown_api.technology;

export const useCreateTechnologyData = () => {
  const { setOpen } = useTechnologyStore();
  return usePostData({
    url: API.technology.create,
    refetchQueries: [GET_API_URL],
    onSuccess: () => {
      setOpen(null);
    },
  });
};

export const useUpdateTechnologyData = (id: string) => {
  const { setOpen } = useTechnologyStore();
  return usePatchData({
    url: `${API.technology.list}/${id}`,
    refetchQueries: [GET_API_URL],
    onSuccess: () => setOpen(null), // <-- ✅ correct place
  });
};

export const useGetTechnologyData = (params?: any) => {
  return useFetchData({ url: GET_API_URL, params });
};

export const useGetTechnologyDropdownList = (
  params?: any,
  enabled?: boolean
) => {
  return useFetchData({
    url: GET_TECHNOLOGY_DROPDOWN,
    params,
    enabled: !!enabled,
  });
};

export const useDeleteTechnologyData = (id: string) => {
  const { setOpen } = useTechnologyStore();
  return useDeleteData({
    url: `${API.technology.delete}/${id}`,
    refetchQueries: [GET_API_URL],
    onSuccess: () => {
      setOpen(null);
    },
  });
};
