/* eslint-disable @typescript-eslint/no-explicit-any */
import API from '@/config/api/api'
import useDeleteData from '@/hooks/use-delete-data'
import useFetchData from '@/hooks/use-fetch-data'
import usePostData from '@/hooks/use-post-data'
import usePutData from '@/hooks/use-put-data'
import { useVenueSectionTypeStore } from '../stores/useVenueSectionTypeStore'
import { useAuthStore } from '@/stores/use-auth-store'


const getSectionTypeApi = (role: 'super_admin' | 'venue_owner') => {
  return role === 'super_admin'
    ? API.venueSectionTypes
    : API.vendorVenueSectionTypes
}

const useSectionTypeApi = () => {
  const { user } = useAuthStore() 
  const role = user?.user?.role?.name // or however you access role
  return getSectionTypeApi(role)
}



export const useCreateVenueSectionTypesData = () => {
  const { setOpen } = useVenueSectionTypeStore()
  const api = useSectionTypeApi()
  return usePostData({
    url: api.create,
    refetchQueries: [api.list],
    onSuccess: () => {
      setOpen(null)
    },
  })
}

export const useUpdateVenueSectionTypesData = (id: string) => {
  const { setOpen } = useVenueSectionTypeStore()
  const api = useSectionTypeApi()
  return usePutData({
    url: `${api.update}/${id}`,
    refetchQueries: [api.list],
    onSuccess: () => setOpen(null), // <-- ✅ correct place
  })
}

export const useGetVenueSectionTypesData = (params?: any) => {
  const api = useSectionTypeApi()
  return useFetchData({ url: api.list, params })
}

export const useDeleteVenueSectionTypesData = (id: string) => {
  const { setOpen } = useVenueSectionTypeStore()
  const api = useSectionTypeApi()
  return useDeleteData({
    url: `${api.delete}/${id}`,
    refetchQueries: [api.list],
    onSuccess: () => {
      setOpen(null)
    },
  })
}
