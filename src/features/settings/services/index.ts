/* eslint-disable @typescript-eslint/no-explicit-any */

import API from '@/config/api/api'
import useFetchData from '@/hooks/use-fetch-data'
import usePutData from '@/hooks/use-put-data'
import { useAuthStore } from '@/stores/use-auth-store'



const getSettingAPI = (role: 'super_admin' | 'venue_owner') => {
  return role === 'super_admin'
    ? API.adminSetting
    : API.vendor.setting
}

const useSettingAPI = () => {
  const { user } = useAuthStore() 
  const role = user?.user?.role?.name // or however you access role
  return getSettingAPI(role)
}

export const useGetSettingList = (params?: any) => {
  const api = useSettingAPI()
  return useFetchData({ url: api.list, params })
}

export const useUpdateSettingData = (onSuccessUpdateSettings:any) => {
  const api = useSettingAPI()
  return usePutData({
    url: api.update,
    refetchQueries: [api.list],
    onSuccess: (data) => {
      onSuccessUpdateSettings(data)
    },
  })
}