/* eslint-disable @typescript-eslint/no-explicit-any */
import API from '@/config/api/api'
import useFetchData from '@/hooks/use-fetch-data'


const GET_API_URL = API.payment.list


export const useGetPaymentsData = ( params?: any) => {
  return useFetchData({ url: GET_API_URL, params })
}

