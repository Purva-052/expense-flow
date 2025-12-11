/* eslint-disable @typescript-eslint/no-explicit-any */
import API from "@/config/api/api";
import useFetchData from "@/hooks/use-fetch-data";
import usePostData from "@/hooks/use-post-data";
import usePatchData from "@/hooks/use-patch-data";
import useDeleteData from "@/hooks/use-delete-data";
import { useProjectTypeStore } from "../stores/useProjectTypeStore";

const GET_API_URL = API.project_types.list;
const GET_PROJECT_TYPE_DROPDOWN = API.dropdown_api.project_types;
const GET_PROJECT_LIST_DROPDOWN = API.dropdown_api.project_list;

export const useCreateProjectType = () => {
  const { setOpen } = useProjectTypeStore();
  return usePostData({
    url: API.project_types.create,
    refetchQueries: [GET_API_URL],
    onSuccess: () => {
      setOpen(null);
    },
  });
};

export const useUpdateProjectType = (id: string) => {
  const { setOpen } = useProjectTypeStore();
  return usePatchData({
    url: `${API.project_types.update}/${id}`,
    refetchQueries: [GET_API_URL],
    onSuccess: () => setOpen(null), // <-- ✅ correct place
  });
};

export const useGetProjectTypes = (params?: any) => {
  return useFetchData({ url: GET_API_URL, params });
};

export const useGetProjectTypesDropdownList = (params?: any) => {
  return useFetchData({ url: GET_PROJECT_TYPE_DROPDOWN, params });
};

export const useGetProjectSDropdownList = (params?: any) => {
  return useFetchData({ url: GET_PROJECT_LIST_DROPDOWN, params });
};

export const useDeleteProjectTypes = (id: string) => {
  const { setOpen } = useProjectTypeStore();
  return useDeleteData({
    url: `${API.project_types.delete}/${id}`,
    refetchQueries: [GET_API_URL],
    onSuccess: () => {
      setOpen(null);
    },
  });
};
