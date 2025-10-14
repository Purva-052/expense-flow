/* eslint-disable @typescript-eslint/no-explicit-any */
import API from '@/config/api/api'
import useDeleteData from '@/hooks/use-delete-data'
import useFetchData from '@/hooks/use-fetch-data'
import usePostData from '@/hooks/use-post-data'
import usePutData from '@/hooks/use-put-data'
import { useLocalityStore } from '../stores/useLocalityStore'

const GET_API_URL = API.locality.list

export const useCreateLocalityData = () => {
  const { setOpen } = useLocalityStore()
  return usePostData({
    url: API.locality.create,
    refetchQueries: [GET_API_URL],
    onSuccess: () => {
      setOpen(null)
    },
  })
}

export const useUpdateLocalityData = (id: string) => {
  const { setOpen } = useLocalityStore()
  return usePutData({
    url: `${API.locality.update}/${id}`,
    refetchQueries: [GET_API_URL],
    onSuccess: () => setOpen(null), // <-- ✅ correct place
  })
}

export const useGetLocalityData = (params?: any) => {
  return useFetchData({ url: GET_API_URL, params })
}

export const useDeleteLocalityData = (id: string) => {
  const { setOpen } = useLocalityStore()
  return useDeleteData({
    url: `${API.locality.delete}/${id}`,
    refetchQueries: [GET_API_URL],
    onSuccess: () => {
      setOpen(null)
    },
  })
}
