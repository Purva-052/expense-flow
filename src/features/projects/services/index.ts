/* eslint-disable @typescript-eslint/no-explicit-any */
import API from "@/config/api/api";
import { useProjectsStore } from "../stores/useProjectsStore";
import usePostData from "@/hooks/use-post-data";
import usePatchData from "@/hooks/use-patch-data";
import useFetchData from "@/hooks/use-fetch-data";
import useDeleteData from "@/hooks/use-delete-data";

const GET_API_URL = API.projects.list

export const useCreateProjectsData = () => {
  const { setOpen } = useProjectsStore()
  return usePostData({
    url: API.projects.create,
    refetchQueries: [GET_API_URL],
    onSuccess: () => {
      setOpen(null)
    },
  })
}

export const useUpdateProjectsData = (id: string) => {
  const { setOpen } = useProjectsStore()
  return usePatchData({
    url: `${API.projects.list}/${id}`,
    refetchQueries: [GET_API_URL],
    onSuccess: () => setOpen(null), // <-- ✅ correct place
  })
}

export const useGetProjectsData = (params?: any) => {
  return useFetchData({ url: GET_API_URL, params })
}

export const useDeleteProjectsData = (id: string) => {
  const { setOpen } = useProjectsStore()
  return useDeleteData({
    url: `${API.projects.delete}/${id}`,
    refetchQueries: [GET_API_URL],
    onSuccess: () => {
      setOpen(null)
    },
  })
}
