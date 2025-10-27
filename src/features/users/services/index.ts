/* eslint-disable @typescript-eslint/no-explicit-any */
import API from '@/config/api/api'
import useFetchData from '@/hooks/use-fetch-data'
import { useUsersStore } from '../stores/useUsersStore'
import usePostData from '@/hooks/use-post-data'
import usePatchData from '@/hooks/use-patch-data'
import useDeleteData from '@/hooks/use-delete-data'


const GET_API_URL = API.users.list
const GET_ROLES_API_URL = API.users.role

export const useCreateUserData = () => {
  const { setOpen } = useUsersStore()
  return usePostData({
    url: API.users.create,
    refetchQueries: [GET_API_URL],
    onSuccess: () => {
      setOpen(null)
    },
  })
}

export const useUpdateUserData = (id: string,onsuccess?:any) => {
  const { setOpen } = useUsersStore()
  return usePatchData({
    url: `${API.users.list}/${id}`,
    refetchQueries: [GET_API_URL],
    onSuccess: () => {
      setOpen(null)
      if(onsuccess){
        onsuccess()
      }
    }, // <-- ✅ correct place
  })
}

export const useGetUsersList = (params?: any) => {
  return useFetchData({ url: GET_API_URL, params })
}

export const useGetUsersRoles = (params?: any) => {
  return useFetchData({ url: GET_ROLES_API_URL, params })
}

export const useDeleteUserData = (id: string) => {
  const { setOpen } = useUsersStore()
  return useDeleteData({
    url: `${API.users.delete}/${id}`,
    refetchQueries: [GET_API_URL],
    onSuccess: () => {
      setOpen(null)
    },
  })
}
