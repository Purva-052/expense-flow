/* eslint-disable @typescript-eslint/no-explicit-any */
import useFetchData from '../../../hooks/use-fetch-data'
import usePostData from '../../../hooks/use-post-data'

/**
 * Fetch dropdown options
 */
export const useGetDropdownOptions = (
  endpoint: string,
  params?: Record<string, any>,
  enabled: boolean = true // ✅ default true
) => {
  return useFetchData<string[]>({
    url: endpoint,
    params,
    enabled, // ✅ pass down correctly
  })
}

/**
 * Create a new dropdown option
 */
export const useCreateDropdownOption = (endpoint: string) => {
  return usePostData<string, { name: string }>({
    url: endpoint,
    onSuccess: () => {
      // Optionally do something after successful creation
      // e.g., refetch dropdown list will be handled automatically if we provide refetchQueries
    },
    refetchQueries: [endpoint], // Automatically refetch the dropdown after creating new option
  })
}
