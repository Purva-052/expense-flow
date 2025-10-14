/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-explicit-any */
import API from '@/config/api/api'
import { useAuthStore } from '@/stores/use-auth-store'
import useFetchData from '@/hooks/use-fetch-data'
import usePostData from '@/hooks/use-post-data'

const getUserProfileAPI = (role: 'super_admin' | 'venue_owner') => {
  return role === 'super_admin'
    ? API.auth.adminProfile
    : API.auth.venueOwnerProfile
}

const useUserProfileAPI = () => {
  const { user } = useAuthStore()
  const role = user?.user?.role?.name // or however you access role
  return getUserProfileAPI(role)
}

export const useGetUserProfileData = (params?: any) => {
  const api = useUserProfileAPI()
  return useFetchData({ url: api, params })
}

export const useUpdatePassword = (onSuccess: any, otpToken?: any) => {
  console.log('🚀 ~ useUpdatePassword ~ otpToken:', otpToken)

  const api = useUserProfileAPI()

  return usePostData({
    headers: {
      Authorization: `Bearer ${otpToken}`,
    },
    url: API.auth.resetPassword,
    refetchQueries: [api],
    onSuccess: () => {
      onSuccess()
    },
  })
}
