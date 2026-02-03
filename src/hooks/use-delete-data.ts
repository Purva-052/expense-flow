/* eslint-disable no-console */
import {
  UseMutationOptions,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import instance from "@/config/instance/instance";
import { toast } from "sonner";
import { extractErrorInfo } from "@/utils/error-response";

interface DeleteDataOptions<TData> {
  url: string;
  refetchQueries?: string[];
  mutationOptions?: UseMutationOptions<TData, Error, void>;
  onSuccess?: (data: TData) => void;
  onError?: (error: Error) => void;
  isSuccessMessage?: boolean;
}

const useDeleteData = <TData = unknown>({
  url,
  refetchQueries = [],
  mutationOptions,
  onError,
  onSuccess,
  isSuccessMessage = true,
}: DeleteDataOptions<TData>) => {
  const queryClient = useQueryClient();

  return useMutation<TData, Error, void>({
    mutationFn: async (): Promise<TData> => {
      const response = await instance.delete({ url });

      if (
        response?.statusCode === 200 ||
        response?.statusCode === 202 ||
        response?.statusCode === 201
      ) {
        if (isSuccessMessage) {
          toast.success("Data deleted successfully", {
            duration: 3000,
            position: "top-right",
          });
        }

        return response.data as TData;
      }

      const errorMessage = response?.message || "Failed to delete data";
      if (response?.statusCode === 400) {
        throw Object.assign(new Error(errorMessage), { statusCode: 400 });
      }
      if (response?.statusCode === 401) {
        throw Object.assign(new Error("Unauthorized"), { statusCode: 401 });
      }

      throw new Error(errorMessage);
    },
    onSuccess: (data: TData) => {
      refetchQueries.forEach((query) =>
        queryClient.invalidateQueries({ queryKey: [query] })
      );
      if (onSuccess) {
        onSuccess(data);
      }
    },
    onError: (error: Error & { statusCode?: number }) => {
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

export default useDeleteData;
