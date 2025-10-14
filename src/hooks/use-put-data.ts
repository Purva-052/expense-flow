import {
  UseMutationOptions,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query'
import instance from '@/config/instance/instance'
import { toast } from 'sonner'
import { extractErrorInfo } from '@/utils/error-response'

interface PutDataOptions<TData, TVariables> {
  url: string
  refetchQueries?: string[]
  headers?: Record<string, string>
  mutationOptions?: UseMutationOptions<TData, Error, TVariables>
  onSuccess?: (data: TData) => void
  onError?: (error: Error) => void
}

const usePutData = <TData = unknown, TVariables = unknown>({
  url,
  refetchQueries = [],
  headers,
  mutationOptions,
  onSuccess,
  onError,
}: PutDataOptions<TData, TVariables>) => {
  const queryClient = useQueryClient()

  return useMutation<TData, Error, TVariables>({
    mutationFn: async (variables: TVariables): Promise<TData> => {
      const response = await instance.put({ url, data: variables, headers })

      if (response?.statusCode === 200) {
        toast.success(response?.message ?? 'Data updated successfully', {
          position: 'top-right',
        })
        return response.data as TData
      }

      const errorMessage = response?.message || 'Failed to update data'
      const error = new Error(errorMessage)

      if (response?.statusCode === 400) {
        throw Object.assign(error, { statusCode: 400 })
      }
      if (response?.statusCode === 401) {
        throw Object.assign(error, {
          statusCode: 401,
          message: 'Unauthorized',
        })
      }

      throw error
    },
    onSuccess: (data: TData) => {
      // ✅ same refetch logic as patch hook
      refetchQueries.forEach((query) =>
        queryClient.invalidateQueries({ queryKey: [query] })
      )

      if (onSuccess) {
        onSuccess(data)
      }
    },
    onError: (error: Error & { statusCode?: number }) => {
      const errorInfo = extractErrorInfo(error)
      toast.error(errorInfo.title, {
        description: errorInfo.description,
        duration: 3000,
        position: 'top-right',
      })

      if (onError) {
        onError(error)
      }
    },
    ...mutationOptions,
  })
}

export default usePutData
