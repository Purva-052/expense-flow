/* eslint-disable @typescript-eslint/no-explicit-any */
import API from '@/config/api/api'
import useFetchData from '@/hooks/use-fetch-data'
import usePostData from '@/hooks/use-post-data'
import { useAuthStore } from '@/stores/use-auth-store'

const GET_API_URL = API.vendor.booking.list

const getBookingsAPI = (role: 'super_admin' | 'venue_owner') => {
  return role === 'super_admin'
    ? API.adminBookings
    : API.vendor.booking
}

const useBookingsAPI = () => {
  const { user } = useAuthStore() 
  const role = user?.user?.role?.name // or however you access role
  return getBookingsAPI(role)
}


export const useGetBookingList = (params?: any) => {
  const api = useBookingsAPI()
  return useFetchData({ url: api.list, params })
}

export const useBlockBooking = (onsuccess: any) => {
  return usePostData({
    url: API.vendor.booking.block_date,
    refetchQueries: [GET_API_URL],
    onSuccess: (data) => {
      onsuccess(data)
    },
  })
}
