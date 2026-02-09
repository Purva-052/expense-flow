/* eslint-disable @typescript-eslint/no-explicit-any */
import instance from "@/config/instance/instance";
import { extractErrorInfo } from "@/utils/error-response";
import {
  useMutation,
  UseMutationOptions,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";

interface ApiResponse<T = unknown> {
  statusCode: number;
  message: string;
  data: T;
  error?: boolean;
}

interface UsePostDataProps<TData, TVariables> {
  url: string;
  mutationOptions?: UseMutationOptions<TData, Error, TVariables>;
  headers?: Record<string, string>;
  refetchQueries?: string[];
  onSuccess?: (data: TData) => void;
  onError?: (error: Error) => void;
}

const usePostData = <TData = unknown, TVariables = unknown>({
  url,
  mutationOptions,
  headers = {},
  refetchQueries,
  onSuccess = () => {},
  onError = () => {},
}: UsePostDataProps<TData, TVariables>) => {
  const queryClient = useQueryClient();

  return useMutation<TData, Error, TVariables>({
    mutationFn: async (variables: TVariables) => {
      const response: any = await instance.post<ApiResponse<TData>>({
        url,
        data: variables,
        headers,
      });
      if (response?.statusCode === 200 || response?.statusCode === 201) {
        toast.success(response?.message, {
          duration: 3000,
          position: "top-right",
        });
        return response.data;
      }

      if (response?.statusCode === 400) {
        throw Object.assign(new Error(response?.message || "Bad Request"), {
          statusCode: 400,
        });
      }
      throw new Error(response?.message || "Failed to post data");
    },
    onSuccess: (data) => {
      if (refetchQueries) {
        refetchQueries.forEach((queryKey) => {
          queryClient.refetchQueries({ queryKey: [queryKey] });
        });
      }
      onSuccess(data);
    },
    onError: (error: Error) => {
      const errorInfo = extractErrorInfo(error);
      toast.error(errorInfo.title, {
        description: errorInfo.description,
        duration: 3000,
        position: "top-right",
      });

      if (onError) {
        onError(error);
      }
    },
    ...mutationOptions,
  });
};

export default usePostData;
