/* eslint-disable @typescript-eslint/no-explicit-any */
import API from "@/config/api/api";
import useFetchData from "@/hooks/use-fetch-data";
import usePostData from "@/hooks/use-post-data";
import usePatchData from "@/hooks/use-patch-data";
import useDeleteData from "@/hooks/use-delete-data";
import { useHRPolicyStore } from "../stores/useHRPolicyStore";

const GET_API_URL = API.hr_policy.list;

export const useCreateHRPolicy = () => {
  const { setOpen } = useHRPolicyStore();
  return usePostData({
    url: API.hr_policy.create,
    refetchQueries: [GET_API_URL],
    onSuccess: () => {
      setOpen(null);
    },
  });
};

export const useUpdateHRPolicy = () => {
  const { setOpen } = useHRPolicyStore();
  return usePatchData({
    url: API.hr_policy.update,
    refetchQueries: [GET_API_URL],
    onSuccess: () => setOpen(null),
  });
};

export const useGetHRPolicyList = () => {
  return useFetchData({ url: GET_API_URL });
};

export const useDeleteHRPolicy = (id: string) => {
  const { setOpen } = useHRPolicyStore();
  return useDeleteData({
    url: `${API.hr_policy.delete}/${id}`,
    refetchQueries: [GET_API_URL],
    onSuccess: () => {
      setOpen(null);
    },
  });
};

export const useUploadHRPolicyFile = () => {
  return usePostData({
    url: API.interview.upload,
    refetchQueries: [GET_API_URL],
  });
};
