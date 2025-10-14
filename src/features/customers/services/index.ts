/* eslint-disable @typescript-eslint/no-explicit-any */

import API from '@/config/api/api'
import useFetchData from '@/hooks/use-fetch-data'
import { useAuthStore } from '@/stores/use-auth-store'



const getCustomerAPI = (role: 'super_admin' | 'venue_owner') => {
  return role === 'super_admin'
    ? API.adminCustomer
    : API.vendor.customer
}

const useCustomerAPI = () => {
  const { user } = useAuthStore() 
  const role = user?.user?.role?.name // or however you access role
  return getCustomerAPI(role)
}

export const useGetCustomerListData = (params?: any) => {
  const api = useCustomerAPI()
  return useFetchData({ url: api.list, params })
}

