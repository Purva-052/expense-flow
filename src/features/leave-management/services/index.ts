/* eslint-disable @typescript-eslint/no-explicit-any */
import API from "@/config/api/api";
import usePostData from "@/hooks/use-post-data";
import usePatchData from "@/hooks/use-patch-data";
import useDeleteData from "@/hooks/use-delete-data";
import useFetchData from "@/hooks/use-fetch-data";
import { useLeaveStore } from "../stores";

// Assuming your API structure has a leaves endpoint
const GET_API_URL = API.leave_management.list; // Update this in your API config
const GET_EMPLOYEES_API_URL = API.leave_management.employee; // Update this in your API config

export const useCreateLeaveData = () => {
  const { setOpen } = useLeaveStore();
  return usePostData({
    url: API.leave_management.create,
    refetchQueries: [GET_API_URL],
    onSuccess: () => {
      setOpen(null);
    },
  });
};

export const useUpdateLeaveData = (id: string) => {
  const { setOpen } = useLeaveStore();
  return usePatchData({
    url: `${API.leave_management.update}/${id}`,
    refetchQueries: [GET_API_URL],
    onSuccess: () => setOpen(null),
  });
};

export const useGetLeaveData = (params?: any) => {
  return useFetchData({ url: GET_API_URL, params });
};

export const useGeEmployeeData = (params?: any, enabled = true) => {
  return useFetchData({ url: GET_EMPLOYEES_API_URL, params, enabled });
};

export const useDeleteLeaveData = (id: string) => {
  const { setOpen } = useLeaveStore();
  return useDeleteData({
    url: `${API.leave_management.delete}/${id}`,
    refetchQueries: [GET_API_URL],
    onSuccess: () => {
      setOpen(null);
    },
  });
};

export const useApproveRejectLeave = (id: string) => {
  const { setOpen } = useLeaveStore();
  return usePatchData({
    url: API.leave_management.action.replace("{id}", id),
    refetchQueries: [GET_API_URL],
    onSuccess: () => {
      setOpen(null);
    },
  });
};