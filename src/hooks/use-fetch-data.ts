
import instance from '@/config/instance/instance';
import { buildQueryString } from '@/utils/storage';
import { useQuery, UseQueryOptions } from '@tanstack/react-query';

const useFetchData = <TData = unknown, TParams = Record<string, unknown>>({
  url,
  params = {} as TParams,
  queryOptions = {},
  enabled = true
}: {
  url: string;
  params?: TParams;
  queryOptions?: Omit<
    UseQueryOptions<TData, Error, TData>,
    'queryKey' | 'queryFn'
  >;
  enabled?: boolean;
}) => {
  return useQuery<TData, Error>({
    queryKey: [url, params],
    queryFn: async (): Promise<TData> => {
      const queryString = buildQueryString(params as Record<string, unknown>);
      const response = await instance.get({
        url: `${url}${queryString}`,
      });
      if (response?.statusCode === 200 || response?.statusCode === 201) {
        return response as TData;
      }
      throw new Error(response?.message || 'Failed to fetch data');
    },
    retry: 1,
    refetchOnWindowFocus: false,
    enabled: enabled,
    staleTime: 0,
    ...queryOptions
  });
};

export default useFetchData;