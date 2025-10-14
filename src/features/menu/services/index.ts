/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-console */
import API from '@/config/api/api'
import useDeleteData from '@/hooks/use-delete-data'
import useFetchData from '@/hooks/use-fetch-data'
import usePostData from '@/hooks/use-post-data'
import usePutData from '@/hooks/use-put-data'
import { useMenuStore } from '../stores/useMenuStore'
import { useAuthStore } from '@/stores/use-auth-store'
import usePatchData from '@/hooks/use-patch-data'


const GET_API_URL = API.vendor.menu.list
const MENU_KEYS = {
  all: ['menu'] as const,
  list: (venueId: string) => [...MENU_KEYS.all, 'list', venueId] as const,
  detail: (id: string) => [...MENU_KEYS.all, 'detail', id] as const,
}



export const useCreateMenuData = () => {
  const { setOpen } = useMenuStore()
  const { user } = useAuthStore()
  const venueId = user?.user?.venue?.id

  const fullUrl = `${API.vendor.menu.list}/${venueId}/menu-items`
  return usePostData({
    url: API.vendor.menu.add,
    refetchQueries: [fullUrl],
    onSuccess: (data) => {
      console.log('🚀 ~ useCreateCountryData ~ data:', data)
      setOpen(null)
    },
  })
}

export const useUpdateMenuData = (id: string) => {
  const { setOpen } = useMenuStore()
  const { user } = useAuthStore()
  const venueId = user?.user?.venue?.id

  const fullUrl = `${API.vendor.menu.list}/${venueId}/menu-items`
  return usePutData({
    url: `${API.vendor.menu.update}/${id}`,
    refetchQueries: [fullUrl],
    onSuccess: () => setOpen(null), // <-- ✅ correct place
  })
}

export const useGetMenuData = ( params?: any) => {
const {user} = useAuthStore()
const venueId = user?.user?.venue?.id
  return useFetchData({ url: `${GET_API_URL}/${venueId}/menu-items`, params })
}

export const useDeleteMenuData = (id: string) => {
  const { user } = useAuthStore()
  const venueId = user?.user?.venue?.id

  const fullUrl = `${API.vendor.menu.list}/${venueId}/menu-items`
  const { setOpen } = useMenuStore()
  return useDeleteData({
    url: `${API.vendor.menu.delete}/${id}`,
    refetchQueries: [fullUrl],
    onSuccess: () => {
      setOpen(null)
    },
  })
}



export const useAvailableMenuData = (id:any) => {
  const { user } = useAuthStore()
  const venueId = user?.user?.venue?.id
  const fullUrl = `${API.vendor.menu.list}/${venueId}/menu-items`
  return usePatchData({
    url: `${API.vendor.menu.availability}/${id}/availability`,
    refetchQueries: [fullUrl],
    onSuccess: (data) => {
      console.log('🚀 ~ useCreateCountryData ~ data:', data)
    },
  })
}
