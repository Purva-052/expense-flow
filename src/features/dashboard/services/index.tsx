import API from '@/config/api/api'
import { useAuthStore } from '@/stores/use-auth-store'
import useFetchData from '@/hooks/use-fetch-data'

const GET_API_URL = API.vendor.stripeAccountActive.list


const getDashboardAPI = (role: 'super_admin' | 'venue_owner') => {
  return role === 'super_admin' ? API.adminDashboard : API.vendor.dashboard
}

const useDashboardAPI = () => {
  const { user } = useAuthStore()
  const role = user?.user?.role?.name // or however you access role
  return getDashboardAPI(role)
}

export const useStripeAccountActiveAPI = (Active: boolean) => {
  const { user } = useAuthStore()
  const role = user?.user?.role?.name
  return useFetchData({
    url: GET_API_URL,
    enabled: !Active && role === 'venue_owner',
  })
}

export const useGetDashboardDataVenueAPI = () => {
  const api = useDashboardAPI()
  return useFetchData({
    url: api.list,
  })
}
