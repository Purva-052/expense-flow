import usePostData from "@/hooks/use-post-data";
import useFetchData from "@/hooks/use-fetch-data";
import { useNewJoineeStore } from "../stores/useNewJoineeStore";
import API from "@/config/api/api";

const GET_API_URL = API.interview.list;

export const useGetNewJoineesList = (params?: any) => {
  return useFetchData({
    url: GET_API_URL,
    params: {
      ...params,
      view: "to_be_joined",
    },
  });
};

export const useCreateUserData = () => {
  const { setOpen } = useNewJoineeStore();
  return usePostData({
    url: API.interview.toBeJoined,
    refetchQueries: [GET_API_URL],
    onSuccess: () => {
      setOpen(null);
    },
  });
};
