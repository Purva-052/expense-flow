/* eslint-disable @typescript-eslint/no-explicit-any */
import API from '@/config/api/api'
import useDeleteData from '@/hooks/use-delete-data'
import useFetchData from '@/hooks/use-fetch-data'
import usePostData from '@/hooks/use-post-data'
import usePutData from '@/hooks/use-put-data'
import { useAdminMenuCategoriesStore } from '../stores/useAdminMenuCategoriesStore'
import { useAuthStore } from '@/stores/use-auth-store'



const getMenuCategoryApi = (role: 'super_admin' | 'venue_owner') => {
  return role === 'super_admin'
    ? API.adminMenuCategories
    : API.venueMenuCategories
}

const useMenuCategoryApi = () => {
  const { user } = useAuthStore() 
  const role = user?.user?.role?.name // or however you access role
  return getMenuCategoryApi(role)
}

export const useCreateMenuCategories = () => {
  const { setOpen } = useAdminMenuCategoriesStore()
  const api = useMenuCategoryApi()
  return usePostData({
    url: api.create,
    refetchQueries: [api.list],
    onSuccess: () => {
      setOpen(null)
    },
  })
}

export const useUpdateMenuCategories = (id: string) => {
  const { setOpen } = useAdminMenuCategoriesStore()
  const api = useMenuCategoryApi()
  return usePutData({
    url: `${api.update}/${id}`,
    refetchQueries: [api.list],
    onSuccess: () => setOpen(null), // <-- ✅ correct place
  })
}

export const useGetMenuCategories = (params?: any) => {
  const api = useMenuCategoryApi()
  return useFetchData({ url: api.list, params })
}

export const useDeleteMenuCategories = (id: string) => {
  const { setOpen } = useAdminMenuCategoriesStore()
  const api = useMenuCategoryApi()
  return useDeleteData({
    url: `${api.delete}/${id}`,
    refetchQueries: [api.list],
    onSuccess: () => {
      setOpen(null)
    },
  })
}
