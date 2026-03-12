/* eslint-disable @typescript-eslint/no-explicit-any */
import API from "@/config/api/api";
import useFetchData from "@/hooks/use-fetch-data";
import usePostData from "@/hooks/use-post-data";
import usePatchData from "@/hooks/use-patch-data";
import useDeleteData from "@/hooks/use-delete-data";
import { useOutboundSourcesStore } from "../stores/useOutboundSourcesStore";

const GET_API_URL = API.outbound_sources.list;

export const useCreateOutboundSource = () => {
  const { setOpen } = useOutboundSourcesStore();
  return usePostData({
    url: API.outbound_sources.create,
    refetchQueries: [GET_API_URL],
    onSuccess: () => {
      setOpen(null);
    },
  });
};

export const useUpdateOutboundSource = (id: string) => {
  const { setOpen } = useOutboundSourcesStore();
  return usePatchData({
    url: `${API.outbound_sources.update}/${id}`,
    refetchQueries: [GET_API_URL],
    onSuccess: () => setOpen(null), // <-- ✅ correct place
  });
};

export const useGetOutboundSource = (params?: any) => {
  return useFetchData({ url: GET_API_URL, params });
};

export const useGetOutboundSourceDropdown = () => {
  return useFetchData({ url: GET_API_URL });
};

export const useDeleteOutboundSource = (id: string) => {
  const { setOpen } = useOutboundSourcesStore();
  return useDeleteData({
    url: `${API.outbound_sources.delete}/${id}`,
    refetchQueries: [GET_API_URL],
    onSuccess: () => {
      setOpen(null);
    },
  });
};
