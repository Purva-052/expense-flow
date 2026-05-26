/* eslint-disable @typescript-eslint/no-explicit-any */
import API from "@/config/api/api";
import useFetchData from "@/hooks/use-fetch-data";
import usePostData from "@/hooks/use-post-data";
import usePatchData from "@/hooks/use-patch-data";
import useDeleteData from "@/hooks/use-delete-data";
import { usePrinterStore } from "../stores/usePrinterStore";

const GET_API_URL = API.printer_type.list;

export const useCreatePrinter = () => {
  const { setOpen } = usePrinterStore();
  return usePostData({
    url: API.printer_type.create,
    refetchQueries: [GET_API_URL],
    onSuccess: () => {
      setOpen(null);
    },
  });
};

export const useUpdatePrinter = (id: string) => {
  const { setOpen } = usePrinterStore();
  return usePatchData({
    url: `${API.printer_type.update}/${id}`,
    refetchQueries: [GET_API_URL],
    onSuccess: () => setOpen(null), // <-- ✅ correct place
  });
};

export const useGetPrinterList = (params?: any) => {
  return useFetchData({ url: GET_API_URL, params });
};

export const useGetPrinterDropdownList = () => {
  return useFetchData({ url: API.printer_type.dropdown });
};

export const useDeletePrinter = (id: string) => {
  const { setOpen } = usePrinterStore();
  return useDeleteData({
    url: `${API.printer_type.delete}/${id}`,
    refetchQueries: [GET_API_URL],
    onSuccess: () => {
      setOpen(null);
    },
  });
};
