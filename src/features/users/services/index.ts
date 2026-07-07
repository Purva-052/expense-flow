/* eslint-disable @typescript-eslint/no-explicit-any */
import API from "@/config/api/api";
import useFetchData from "@/hooks/use-fetch-data";
import { useUsersStore } from "../stores/useUsersStore";
import usePostData from "@/hooks/use-post-data";
import usePatchData from "@/hooks/use-patch-data";
import useDeleteData from "@/hooks/use-delete-data";
import axios from "axios";
import { AxiosError } from "axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { buildQueryString } from "@/utils/storage";
import { useAuthStore } from "@/stores/use-auth-store";
import { useState, useCallback } from "react";
import { toast } from "sonner";
import instance from "@/config/instance/instance";
import { extractErrorInfo } from "@/utils/error-response";

const GET_API_URL = API.users.list;
const GET_ROLES_API_URL = API.users.role;
const GET_USER_DROPDOWN = API.dropdown_api.users;

export const useCreateUserData = () => {
  const { setOpen } = useUsersStore();
  return usePostData({
    url: API.users.create,
    refetchQueries: [GET_API_URL],
    onSuccess: () => {
      setOpen(null);
    },
  });
};

export const useUpdateUserData = (id: string, onsuccess?: any) => {
  const { setOpen } = useUsersStore();
  return usePatchData({
    url: `${API.users.list}/${id}`,
    refetchQueries: [GET_API_URL, "projects"],
    onSuccess: () => {
      setOpen(null);
      if (onsuccess) {
        onsuccess();
      }
    }, // <-- ✅ correct place
  });
};

export const useGetUsersList = (params?: any, enabled?: boolean) => {
  return useFetchData({ url: GET_API_URL, params, enabled });
};

export const useGetUserDetails = (id: string, params?: any) => {
  return useFetchData({ url: `${GET_API_URL}/${id}`, enabled: !!id, params });
};

export const useGetUserDropdownList = (params?: any, enabled?: boolean) => {
  return useFetchData({ url: GET_USER_DROPDOWN, params, enabled });
};

export const useGetUsersRoles = (params?: any) => {
  return useFetchData({ url: GET_ROLES_API_URL, params });
};

export const useDeleteUserData = (id: string) => {
  const { setOpen } = useUsersStore();
  return useDeleteData({
    url: `${API.users.delete}/${id}`,
    refetchQueries: [GET_API_URL],
    onSuccess: () => {
      setOpen(null);
    },
  });
};

export const useGetNotificationsList = (params?: any) => {
  return useFetchData({ url: API.notifications.list, params });
};

// export const useMarkNotificationsAsRead = () => {
//   return usePostData({
//     url: API.notifications.markAsRead,
//     refetchQueries: [API.notifications.list],
//   });
// };

export const useExportCSV = () => {
  return useMutation({
    mutationFn: async (params?: Record<string, any>) => {
      try {
        const queryString = buildQueryString(params ?? {});
        const baseURL = import.meta.env.VITE_API_BASE_URL;
        const token =
          useAuthStore.getState().user?.token ?? useAuthStore.getState().token;
        const response = await axios.get(
          `${baseURL}${API.users.export_csv}${queryString}`,
          {
            responseType: "blob",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const contentDisposition = response.headers["content-disposition"];
        let filename = `users_export_${new Date().toISOString().split("T")[0]}.xlsx`;

        if (contentDisposition) {
          const filenameMatch = contentDisposition.match(
            /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/
          );
          if (filenameMatch?.[1]) {
            filename = filenameMatch[1].replace(/['"]/g, "");
          }
        }

        return {
          blob: response.data,
          filename,
        };
      } catch (error: any) {
        if (axios.isAxiosError(error) && error.response?.data instanceof Blob) {
          try {
            const errorText = await error.response.data.text();
            const parsedError = JSON.parse(errorText);
            throw new Error(
              parsedError?.message ||
                parsedError?.messages?.[0] ||
                "Failed to generate CSV file"
            );
          } catch (parseError) {
            if (parseError instanceof Error) {
              throw parseError;
            }
          }
        }

        throw new Error(error?.message || "Failed to generate CSV file");
      }
    },
  });
};

interface UseImportUsersReturn {
  isUploading: boolean;
  uploadFile: (
    file: File
  ) => Promise<{ statusCode: number; message: string } | undefined>;
}

/**
 * Custom hook to import users from an Excel file.
 * Uses the /users/import endpoint (multipart/form-data).
 */
export const useImportUsers = (): UseImportUsersReturn => {
  const [isUploading, setIsUploading] = useState(false);

  const extractErrorMessage = (error: unknown): string => {
    if (error instanceof AxiosError) {
      if (error.code === "ERR_NETWORK")
        return "Network error. Please check your internet connection.";
      if (error.response?.status === 401)
        return "Authentication failed. Please log in again.";
      if (
        error.response?.status &&
        error.response.status >= 400 &&
        error.response.status < 500
      ) {
        return (
          error.response?.data?.message ||
          "Invalid file or request. Please check and try again."
        );
      }
      if (error.response?.status && error.response.status >= 500)
        return "Server error. Please try again later.";
      if (error.response?.data?.message) return error.response.data.message;
    }
    return "Failed to import users. Please try again.";
  };

  const uploadFile = useCallback(async (file: File) => {
    if (!file) {
      toast.error("Please select a file to upload.");
      return;
    }

    const allowedTypes = [
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-excel",
      "text/csv",
    ];

    if (!allowedTypes.includes(file.type)) {
      toast.error("Please upload a valid Excel or CSV file.");
      return;
    }

    setIsUploading(true);
    try {
      const baseURL = import.meta.env.VITE_API_BASE_URL;
      const token =
        useAuthStore.getState().user?.token ?? useAuthStore.getState().token;
      const formData = new FormData();
      formData.append("file", file);

      const response = await axios.post(
        `${baseURL}${API.leave_balance.import}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (
        response?.data?.statusCode === 200 ||
        response?.data?.statusCode === 201
      ) {
        toast.success(response?.data?.message || "Users imported successfully");
        return response.data;
      } else {
        toast.error(response?.data?.message || "Failed to import users");
      }
    } catch (error) {
      toast.error(extractErrorMessage(error));
    } finally {
      setIsUploading(false);
    }
  }, []);

  return { isUploading, uploadFile };
};

export const useUpdateSingleCheckInAllowed = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      isSingleCheckInAllowed,
    }: {
      id: string | number;
      isSingleCheckInAllowed: boolean;
    }) => {
      const response = await instance.patch({
        url: `${API.users.list}/${id}`,
        data: { isSingleCheckInAllowed },
      });
      if (response?.statusCode === 200 || response?.statusCode === 201) {
        return response;
      }
      throw new Error(response?.message || "Failed to update user settings");
    },
    onSuccess: (data: any) => {
      toast.success(data?.message ?? "Single check-in settings updated successfully", {
        position: "top-right",
      });
      queryClient.invalidateQueries({ queryKey: [GET_API_URL] });
    },
    onError: (error: any) => {
      const errorInfo = extractErrorInfo(error);
      toast.error(errorInfo.title, {
        description: errorInfo.description,
        duration: 3000,
        position: "top-right",
      });
    },
  });
};

