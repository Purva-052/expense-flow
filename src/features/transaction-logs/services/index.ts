/* eslint-disable @typescript-eslint/no-explicit-any */
import API from "@/config/api/api";
import usePostData from "@/hooks/use-post-data";
import usePatchData from "@/hooks/use-patch-data";
// import useFetchData from "@/hooks/use-fetch-data";
import useDeleteData from "@/hooks/use-delete-data";
import { useTransactionStore } from "../stores";
import useFetchData from "@/hooks/use-fetch-data";

const GET_API_URL = API.transaction_logs.list;
// const GET_CLIENT_DROPDOWN = API.dropdown_api.client;
// const GET_COUNTRY_DROPDOWN = API.dropdown_api.country;

export const useCreateTransactionData = () => {
  const { setOpen } = useTransactionStore();
  return usePostData({
    url: API.transaction_logs.create,
    refetchQueries: [GET_API_URL],
    onSuccess: () => {
      setOpen(null);
    },
  });
};

export const useUpdateTransactionData = (id: string) => {
  const { setOpen } = useTransactionStore();
  return usePatchData({
    url: `${API.transaction_logs.update}/${id}`,
    refetchQueries: [GET_API_URL],
    onSuccess: () => setOpen(null), // <-- ✅ correct place
  });
};

export const useGetTransactionData = (params?: any) => {
  return useFetchData({ url: GET_API_URL, params });
};

// export const useGetClientsDropdownList = (params?: any) => {
//   return useFetchData({ url: GET_CLIENT_DROPDOWN, params });
// };

// export const useGetCountryDropdownList = (params?: any) => {
//   return useFetchData({ url: GET_COUNTRY_DROPDOWN, params });
// };

export const useDeleteTransactionData = (id: string) => {
  const { setOpen } = useTransactionStore();
  return useDeleteData({
    url: `${API.transaction_logs.delete}/${id}`,
    refetchQueries: [GET_API_URL],
    onSuccess: () => {
      setOpen(null);
    },
  });
};

export const useUploadTransactionFile = () => {
  return usePostData({
    url: API.interview.upload,
    refetchQueries: [GET_API_URL],
  });
};
