/* eslint-disable @typescript-eslint/no-explicit-any */
import API from '@/config/api/api'
import usePostData from '@/hooks/use-post-data'

export const useSendOTP = (onsuccess: any) => {
  return usePostData({
    url: API.auth.sendOTP,
    //   refetchQueries: [GET_API_URL],
    onSuccess: (data) => {
      onsuccess(data)
    },
  })
}

export const useVerifyOTP = (onsuccess: any) => {
  return usePostData({
    url: API.auth.verifyOTP,
    //   refetchQueries: [GET_API_URL],
    onSuccess: (data) => {
      onsuccess(data)
    },
  })
}
