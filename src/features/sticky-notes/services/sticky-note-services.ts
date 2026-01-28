/* eslint-disable @typescript-eslint/no-explicit-any */
import API from "@/config/api/api";
import useFetchData from "@/hooks/use-fetch-data";
import usePostData from "@/hooks/use-post-data";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import instance from "@/config/instance/instance";

const STICKY_NOTES_API = API.projects.sticky_notes;

export const useGetStickyNotes = (projectId: string) => {
  return useFetchData({
    url: STICKY_NOTES_API,
    params: { projectId: Number(projectId), pagination: false },
    enabled: !!projectId,
  });
};

export const useCreateStickyNote = () => {
  return usePostData({
    url: STICKY_NOTES_API,
    refetchQueries: [`${STICKY_NOTES_API}`],
  });
};

export const useUpdateStickyNote = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const response = await instance.patch({
        url: `${STICKY_NOTES_API}/${id}`,
        data,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [STICKY_NOTES_API],
      });
    },
  });
};

export const useDeleteStickyNote = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await instance.delete({
        url: STICKY_NOTES_API,
        params: { id },
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [STICKY_NOTES_API],
      });
    },
  });
};
