/* eslint-disable @typescript-eslint/no-explicit-any */
import API from "@/config/api/api";
import useDeleteData from "@/hooks/use-delete-data";
import useFetchData from "@/hooks/use-fetch-data";
import usePatchData from "@/hooks/use-patch-data";
import usePostData from "@/hooks/use-post-data";
import { useInterviewStore } from "../store/useInterviewStore";

const Interview_list = API.interview.list;

export const useCreateInterview = (onsuccess?: any) => {
  return usePostData({
    url: API.interview.create,
    refetchQueries: [Interview_list],
    onSuccess: () => {
      onsuccess();
    },
  });
};

export const useGetInterview = (params?: {
  time_zone?: string;
  current_date?: string;
}) => {
  return useFetchData({
    url: Interview_list,
    params,
    enabled: !!params?.time_zone && !!params?.current_date, // Only fetch when both params are available
  });
};

export const useCreateInterviewResumeLink = () => {
  return usePostData({
    url: API.interview.upload,
    refetchQueries: [Interview_list],
  });
};

export const useUpdateInterview = () => {
  const { setOpen } = useInterviewStore();
  return usePatchData({
    url: API.interview.update,
    refetchQueries: [Interview_list],
    onSuccess: () => setOpen(null),
  });
};

export const useDeleteInterview = (id: string) => {
  const { setOpen } = useInterviewStore();
  return useDeleteData({
    url: `${API.interview.delete}/${id}}`,
    refetchQueries: [Interview_list],
    onSuccess: () => {
      setOpen(null);
    },
  });
};
