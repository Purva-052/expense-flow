/* eslint-disable @typescript-eslint/no-explicit-any */
import API from "@/config/api/api";
import usePostData from "@/hooks/use-post-data";
import { useClientsStore } from "../stores/useClientsStore";
import usePatchData from "@/hooks/use-patch-data";
import useFetchData from "@/hooks/use-fetch-data";
import useDeleteData from "@/hooks/use-delete-data";


const GET_API_URL = API.clients.list
const GET_CLIENT_DROPDOWN = API.dropdown_api.client

export const useCreateClientsData = () => {
  const { setOpen } = useClientsStore()
  return usePostData({
    url: API.clients.create,
    refetchQueries: [GET_API_URL],
    onSuccess: () => {
      setOpen(null)
    },
  })
}

export const useUpdateClientsData = (id: string) => {
  const { setOpen } = useClientsStore()
  return usePatchData({
    url: `${API.clients.list}/${id}`,
    refetchQueries: [GET_API_URL],
    onSuccess: () => setOpen(null), // <-- ✅ correct place
  })
}

export const useGetClientsData = (params?: any) => {
  return useFetchData({ url: GET_API_URL, params })
}

export const useGetClientsDropdownList = (params?: any) => {
  return useFetchData({ url: GET_CLIENT_DROPDOWN, params })
}

export const useDeleteClientsData = (id: string) => {
  const { setOpen } = useClientsStore()
  return useDeleteData({
    url: `${API.clients.delete}/${id}`,
    refetchQueries: [GET_API_URL],
    onSuccess: () => {
      setOpen(null)
    },
  })
}
