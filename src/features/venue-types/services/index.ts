/* eslint-disable @typescript-eslint/no-explicit-any */
import API from '@/config/api/api'
import useDeleteData from '@/hooks/use-delete-data'
import useFetchData from '@/hooks/use-fetch-data'
import usePostData from '@/hooks/use-post-data'
import usePutData from '@/hooks/use-put-data'
import { useVenueTypeStore } from '../stores/useVenueTypeStore'

const GET_API_URL = API.venueTypes.list

export const useCreateVenueTypesData = () => {
  const { setOpen } = useVenueTypeStore()
  return usePostData({
    url: API.venueTypes.create,
    refetchQueries: [GET_API_URL],
    onSuccess: () => {
      setOpen(null)
    },
  })
}

export const useUpdateVenueTypesData = (id: string) => {
  const { setOpen } = useVenueTypeStore()
  return usePutData({
    url: `${API.venueTypes.update}/${id}`,
    refetchQueries: [GET_API_URL],
    onSuccess: () => setOpen(null), // <-- ✅ correct place
  })
}

export const useGetVenueTypesData = (params?: any) => {
  return useFetchData({ url: GET_API_URL, params })
}

export const useDeleteVenueTypesData = (id: string) => {
  const { setOpen } = useVenueTypeStore()
  return useDeleteData({
    url: `${API.venueTypes.delete}/${id}`,
    refetchQueries: [GET_API_URL],
    onSuccess: () => {
      setOpen(null)
    },
  })
}
