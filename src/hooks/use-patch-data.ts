import {
  UseMutationOptions,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query'
import instance from '@/config/instance/instance'
import { toast } from 'sonner'
import { extractErrorInfo } from '@/utils/error-response'

interface PatchDataOptions<TData, TVariables> {
  url: string
  refetchQueries?: string[]
  headers?: Record<string, string>
  mutationOptions?: UseMutationOptions<TData, Error, TVariables>
  onSuccess?: (data: TData) => void
  onError?: (error: Error) => void
}

const usePatchData = <TData = unknown, TVariables = unknown>({
  url,
  refetchQueries = [],
  headers,
  mutationOptions,
  onSuccess,
  onError,
}: PatchDataOptions<TData, TVariables>) => {
  const queryClient = useQueryClient()

  return useMutation<TData, Error, TVariables>({
    mutationFn: async (variables: TVariables): Promise<TData> => {
      const response = await instance.patch({ url, data: variables, headers })
      if (response?.statusCode === 200 || response?.statusCode === 201) {
        toast.success(response?.message??'Data updated successfully',{
          position:'top-right'
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

export default usePatchData
