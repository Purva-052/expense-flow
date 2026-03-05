/* eslint-disable @typescript-eslint/no-explicit-any */
import API from "@/config/api/api";
import usePostData from "@/hooks/use-post-data";

export const useForgotPassword = (onsuccess: any = () => {}) => {
  return usePostData({
    url: API.auth.forgotPassword,
    onSuccess: (data) => {
      onsuccess(data);
    },
  });
};

export const useVerifyForgotPasswordOtp = (onsuccess: any = () => {}) => {
  return usePostData({
    url: API.auth.verifyOtp,
    onSuccess: (data) => {
      onsuccess(data);
    },
  });
};

export const useResetPasswordWithOtp = (onsuccess: any = () => {}) => {
  return usePostData({
    url: API.auth.resetPasswordwithOtp,
    onSuccess: (data) => {
      onsuccess(data);
    },
  });
};

export const useResetPassword = (onsuccess: any = () => {}) => {
  return usePostData({
    url: API.auth.resetPassword,
    onSuccess: (data) => {
      onsuccess(data);
    },
  });
};
