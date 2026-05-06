import API from "@/config/api/api";
import useFetchData from "@/hooks/use-fetch-data";
import { AdMobAnalyticsResponse, AdMobAppsResponse } from "../types";

export const useGetAdmobDashboard = (params?: any) => {
  return useFetchData<AdMobAnalyticsResponse>({
    url: API.admob_analytics.dashboard,
    params,
  });
};

export const useGetAdmobApps = (params?: any) => {
  return useFetchData<AdMobAppsResponse>({
    url: API.admob_analytics.apps,
    params,
  });
};
