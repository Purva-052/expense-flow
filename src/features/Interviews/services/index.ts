/* eslint-disable @typescript-eslint/no-explicit-any */
import API from "@/config/api/api";
import useFetchData from "@/hooks/use-fetch-data";
import usePostData from "@/hooks/use-post-data";


const Interview_list = API.interview.list;


export const useCreateInterview = (onsuccess?:any) => {
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