/* eslint-disable @typescript-eslint/no-explicit-any */
import API from "@/config/api/api";
import useFetchData from "@/hooks/use-fetch-data";

const GET_CRON_JOBS_API_URL = API.background_jobs.cron;

export const useGetCronJobsData = (params?: any) => {
  return useFetchData({ url: GET_CRON_JOBS_API_URL, params });
};
