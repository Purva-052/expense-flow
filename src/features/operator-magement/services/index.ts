/* eslint-disable @typescript-eslint/no-explicit-any */
// src/features/operators/services.ts

import API from '@/config/api/api'
import useDeleteData from '@/hooks/use-delete-data'
import useFetchData from '@/hooks/use-fetch-data'
import usePatchData from '@/hooks/use-patch-data'
import usePostData from '@/hooks/use-post-data'
import { useOperatorStore } from '../store' // Changed from useProductStore

const GET_API_URL = API.operators.list

export const useGetOperators = (params?: any) => {
  return useFetchData({ url: GET_API_URL, params })
}

export const useCreateOperator = () => { // Renamed from useCreateOperaator
  const { setOpen } = useOperatorStore()
  return usePostData({
    url: API.operators.add,
    refetchQueries: [GET_API_URL],
    onSuccess: () => {
      setOpen(null)
    },
  })
}

export const useUpdateOperator = (id: string) => {
  const { setOpen } = useOperatorStore()
  return usePatchData({
    url: `${API.operators.update}/${id}`,
    refetchQueries: [GET_API_URL],
    onSuccess: () => {
      setOpen(null)
    }
  })
}

export const useDeleteOperator = (id: string) => {
  const { setOpen } = useOperatorStore()
  return useDeleteData({
    url: `${API.operators.delete}/${id}`,
    refetchQueries: [GET_API_URL],
    onSuccess: () => {
      setOpen(null)
    }
  })
}