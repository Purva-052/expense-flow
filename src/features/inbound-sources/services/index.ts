/* eslint-disable @typescript-eslint/no-explicit-any */
import API from "@/config/api/api";
import useFetchData from "@/hooks/use-fetch-data";
import usePostData from "@/hooks/use-post-data";
import usePatchData from "@/hooks/use-patch-data";
import useDeleteData from "@/hooks/use-delete-data";
import { useInboundSourcesStore } from "../stores/useInboundSourcesStore";

const GET_API_URL = API.inbound_sources.list;

export const useCreateInboundSource = () => {
  const { setOpen } = useInboundSourcesStore();
  return usePostData({
    url: API.inbound_sources.create,
    refetchQueries: [GET_API_URL],
    onSuccess: () => {
      setOpen(null);
    },
  });
};

export const useUpdateInboundSource = (id: string) => {
  const { setOpen } = useInboundSourcesStore();
  return usePatchData({
    url: `${API.inbound_sources.update}/${id}`,
    refetchQueries: [GET_API_URL],
    onSuccess: () => setOpen(null), // <-- ✅ correct place
  });
};

export const useGetInboundSource = (params?: any) => {
  return useFetchData({ url: GET_API_URL, params });
};

export const useGetInboundSourceDropdown = () => {
  return useFetchData({ url: GET_API_URL });
};

export const useDeleteInboundSource = (id: string) => {
  const { setOpen } = useInboundSourcesStore();
  return useDeleteData({
    url: `${API.inbound_sources.delete}/${id}`,
    refetchQueries: [GET_API_URL],
    onSuccess: () => {
      setOpen(null);
    },
  });
};
