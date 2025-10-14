/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-console */
import API from '@/config/api/api'
import useDeleteData from '@/hooks/use-delete-data'
import useFetchData from '@/hooks/use-fetch-data'
import usePostData from '@/hooks/use-post-data'
import usePutData from '@/hooks/use-put-data'
import { useCountryStore } from '../stores/useCountryStore'

const GET_API_URL = API.country.list

export const useCreateCountryData = () => {
  const { setOpen } = useCountryStore()
  return usePostData({
    url: API.country.create,
    refetchQueries: [GET_API_URL],
    onSuccess: (data) => {
      console.log('🚀 ~ useCreateCountryData ~ data:', data)
      setOpen(null)
    },
  })
}

export const useUpdateCountryData = (id: string) => {
  const { setOpen } = useCountryStore()
  return usePutData({
    url: `${API.country.update}/${id}`,
    refetchQueries: [GET_API_URL],
    onSuccess: () => setOpen(null), // <-- ✅ correct place
  })
}

export const useGetCountryList = (params?: any) => {
  return useFetchData({ url: GET_API_URL, params })
}

export const useDeleteCountryData = (id: string) => {
  const { setOpen } = useCountryStore()
  return useDeleteData({
    url: `${API.country.delete}/${id}`,
    refetchQueries: [GET_API_URL],
    onSuccess: () => {
      setOpen(null)
    },
  })
}
