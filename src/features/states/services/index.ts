/* eslint-disable @typescript-eslint/no-explicit-any */
import API from '@/config/api/api'
import useDeleteData from '@/hooks/use-delete-data'
import useFetchData from '@/hooks/use-fetch-data'
import usePostData from '@/hooks/use-post-data'
import usePutData from '@/hooks/use-put-data'
import { useStateStore } from '../stores/useStateStore'

const GET_API_URL = API.state.list

export const useCreateStateData = () => {
  const { setOpen } = useStateStore()
  return usePostData({
    url: API.state.create,
    refetchQueries: [GET_API_URL],
    onSuccess: () => {
      setOpen(null)
    },
  })
}

export const useUpdateStateData = (id: string) => {
  const { setOpen } = useStateStore()
  return usePutData({
    url: `${API.state.update}/${id}`,
    refetchQueries: [GET_API_URL],
    onSuccess: () => setOpen(null), // <-- ✅ correct place
  })
}

export const useGetStateData = (params?: any) => {
  return useFetchData({ url: GET_API_URL, params })
}

export const useDeleteStateData = (id: string) => {
  const { setOpen } = useStateStore()
  return useDeleteData({
    url: `${API.state.delete}/${id}`,
    refetchQueries: [GET_API_URL],
    onSuccess: () => {
      setOpen(null)
    },
  })
}
