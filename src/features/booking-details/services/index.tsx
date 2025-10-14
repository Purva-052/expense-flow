/* eslint-disable @typescript-eslint/no-explicit-any */
import API from '@/config/api/api'
import useFetchData from '@/hooks/use-fetch-data'
import { useAuthStore } from '@/stores/use-auth-store'


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

export const useGetBookingDetails = (id: any) => {
  const api = useBookingsAPI()
  return useFetchData({ url: `${api.details}/${id}` })
}
