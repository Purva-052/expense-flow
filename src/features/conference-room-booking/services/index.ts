/* eslint-disable @typescript-eslint/no-explicit-any */
import API from "@/config/api/api";
import useFetchData from "@/hooks/use-fetch-data";
import usePostData from "@/hooks/use-post-data";
import instance from "@/config/instance/instance";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { extractErrorInfo } from "@/utils/error-response";

const ConferenceRoom_list = API.conference_room.list;

export const useCreateConferenceRoomBooking = (onsuccess?: any) => {
  return usePostData({
    url: API.conference_room.create,
    refetchQueries: [ConferenceRoom_list],
    onSuccess: () => {
      onsuccess();
    },
  });
};

export const useGetConferenceRoomBooking = (params?: {
  timezone?: string;
  startDate?: string;
  endDate?: string;
  projectId?: any;
}) => {
  return useFetchData({
    url: ConferenceRoom_list,
    params,
    enabled: !!params?.timezone && !!params?.startDate && !!params?.endDate,
  });
};

export const useUpdateConferenceRoomBooking = (onsuccess?: any) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (variables: { id: number; data: any }) => {
      const { id, data: body } = variables;
      const response = await instance.patch({
        url: `${API.conference_room.update}/${id}`,
        data: body,
      });
      if (response?.statusCode === 200 || response?.statusCode === 201) {
        toast.success(
          response?.message ?? "Conference room booking updated successfully",
          {
            position: "top-right",
          }
        );
        return response.data;
      }
      const errorMessage =
        response?.message || "Failed to update conference room booking";
      throw new Error(errorMessage);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [ConferenceRoom_list] });
      if (onsuccess) onsuccess();
    },
    onError: (error: Error & { statusCode?: number }) => {
      const errorInfo = extractErrorInfo(error);
      toast.error(errorInfo.title, {
        description: errorInfo.description,
        duration: 3000,
        position: "top-right",
      });
    },
  });
};

export const useDeleteConferenceRoomBooking = (onsuccess?: any) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const response = await instance.delete({
        url: `${API.conference_room.delete}/${id}`,
      });
      if (
        response?.statusCode === 200 ||
        response?.statusCode === 202 ||
        response?.statusCode === 201
      ) {
        toast.success("Conference room booking deleted successfully", {
          duration: 3000,
          position: "top-right",
        });
        return response.data;
      }
      const errorMessage =
        response?.message || "Failed to delete conference room booking";
      if (response?.statusCode === 400) {
        throw Object.assign(new Error(errorMessage), { statusCode: 400 });
      }
      if (response?.statusCode === 401) {
        throw Object.assign(new Error("Unauthorized"), { statusCode: 401 });
      }
      throw new Error(errorMessage);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [ConferenceRoom_list] });
      if (onsuccess) onsuccess();
    },
    onError: (error: Error & { statusCode?: number }) => {
      const errorInfo = extractErrorInfo(error);
      toast.error(errorInfo.title, {
        description: errorInfo.description,
        duration: 3000,
        position: "top-right",
      });
    },
  });
};
