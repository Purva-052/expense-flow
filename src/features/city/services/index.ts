/* eslint-disable @typescript-eslint/no-explicit-any */
import API from '@/config/api/api'
import useDeleteData from '@/hooks/use-delete-data'
import useFetchData from '@/hooks/use-fetch-data'
import usePostData from '@/hooks/use-post-data'
import usePutData from '@/hooks/use-put-data'
import { useCityStore } from '../stores/useCityStore'

const GET_API_URL = API.city.list

export const useCreateCityData = () => {
  const { setOpen } = useCityStore()
  return usePostData({
    url: API.city.create,
    refetchQueries: [GET_API_URL],
    onSuccess: () => {
      setOpen(null)
    },
  })
}

export const useUpdateCityData = (id: string) => {
  const { setOpen } = useCityStore()
  return usePutData({
    url: `${API.city.update}/${id}`,
    refetchQueries: [GET_API_URL],
    onSuccess: () => setOpen(null), // <-- ✅ correct place
  })
}

export const useGetCityData = (params?: any) => {
  return useFetchData({ url: GET_API_URL, params })
}

export const useDeleteCityData = (id: string) => {
  const { setOpen } = useCityStore()
  return useDeleteData({
    url: `${API.city.delete}/${id}`,
    refetchQueries: [GET_API_URL],
    onSuccess: () => {
      setOpen(null)
    },
  })
}
