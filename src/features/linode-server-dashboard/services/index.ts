/* eslint-disable @typescript-eslint/no-explicit-any */
import API from "@/config/api/api";
import useFetchData from "@/hooks/use-fetch-data";

export const useGetLinodeList = (params?: any) => {
  const GET_API_URL = API.linode_api.list;
  return useFetchData({ url: GET_API_URL, params });
};

export const useGetLinodeInstanceDetail = (
  id?: any,
  params?: { month?: number; year?: number }
) => {
  return useFetchData({
    url: `${API.linode_api.details}/${id}`,
    params,
    enabled: !!id,
  });
};

export const useGetLinodeDashboardAnalytics = () => {
  return useFetchData({ url: API.linode_api.dashboardAnalytics });
};
