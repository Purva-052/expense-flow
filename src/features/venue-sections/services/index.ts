/* eslint-disable @typescript-eslint/no-explicit-any */
import API from '@/config/api/api'
import useDeleteData from '@/hooks/use-delete-data'
import useFetchData from '@/hooks/use-fetch-data'
import usePostData from '@/hooks/use-post-data'
import usePutData from '@/hooks/use-put-data'
import { useVenueSectionStore } from '../stores/useVenueSectionStore'

const GET_API_URL = API.vendor.venueSection.list

export const useCreateVenueSection = () => {
  const { setOpen } = useVenueSectionStore()
  return usePostData({
    url: API.vendor.venueSection.add,
    refetchQueries: [GET_API_URL],
    onSuccess: () => {
      setOpen(null)
    },
  })
}

export const useUpdateVenueSection = (id: string) => {
  const { setOpen } = useVenueSectionStore()
  return usePutData({
    url: `${API.vendor.venueSection.update}/${id}`,
    refetchQueries: [GET_API_URL],
    onSuccess: () => {
      setOpen(null)
    },
  })
}

export const useGetVenueSection = (params?: any) => {
  return useFetchData({ url: GET_API_URL, params })
}

export const useDeleteVenueSection = (id: string) => {
  const { setOpen } = useVenueSectionStore()
  return useDeleteData({
    url: `${API.vendor.venueSection.delete}/${id}`,
    refetchQueries: [GET_API_URL],
    onSuccess: () => {
      setOpen(null)
    },
  })
}
