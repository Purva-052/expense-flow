/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useCallback } from "react";
import { AxiosError } from "axios";
import axios from "axios";
import { toast } from "sonner";
import API from "@/config/api/api";
import useFetchData from "@/hooks/use-fetch-data";
import usePatchData from "@/hooks/use-patch-data";
import usePostData from "@/hooks/use-post-data";
import { useAuthStore } from "@/stores/use-auth-store";
import { buildQueryString } from "@/utils/storage";
import { useInfiniteQuery } from "@tanstack/react-query";

const GET_API_URL = API.users.available_developers;
const PROJECTS_API_URL = API.projects.list;
const GET_ALL_DEVELOPER_API_URL = API.users.all_developers;
const GET_BECOMEING_AVAILABLE_DEVELOPER_API_URL =
  API.users.becoming_available_developer;
const GET_PROJECT_HANDLER_API_URL = API.users.project_handler;
const GET_Inquiry_API_URL = API.inquiry.dashboard;
const GET_MILESTONE_LIST_API_URL = API.projects.project_milestone_list;

export const useGetAvailableDeveloperList = (params?: any) => {
  return useFetchData({ url: GET_API_URL, params });
};

export const useGetProjectHistoryData = (
  id: any,
  isOpen: boolean,
  params?: any
) => {
  return useFetchData({
    url: `${PROJECTS_API_URL}/${id}/developershistory`,
    params,
    enabled: isOpen && !!id,
  });
};

export const useGetAllDevelopers = (params?: any) => {
  return useFetchData({ url: GET_ALL_DEVELOPER_API_URL, params });
};
export const useGetAllBecomingAvailableDevelopers = (params?: any) => {
  return useFetchData({
    url: GET_BECOMEING_AVAILABLE_DEVELOPER_API_URL,
    params,
  });
};

export const useGetProjectHandlerProjectsAPI = (params: any) => {
  return useFetchData({
    url: GET_PROJECT_HANDLER_API_URL,
    enabled: params?.enabled,
    params,
  });
};

export const useAssignDeveloper = (onsuccess: any) => {
  return usePostData({
    url: API.projects.assign_developers,
    refetchQueries: [GET_ALL_DEVELOPER_API_URL, PROJECTS_API_URL],
    onSuccess: () => {
      onsuccess();
    },
  });
};

export const useUpdateProjectWorkingHour = (id: any, onsuccess: any) => {
  return usePatchData({
    url: `${API.projects.assign_developers}/${id}`,
    refetchQueries: [GET_ALL_DEVELOPER_API_URL, PROJECTS_API_URL],
    onSuccess: () => {
      onsuccess();
    },
  });
};

export const useProjectStatusChange = (onsuccess?: () => void) => {
  return usePostData({
    url: API.projects.status_change,
    refetchQueries: [PROJECTS_API_URL],
    onSuccess: () => {
      if (typeof onsuccess === "function") onsuccess();
    },
  });
};

export const useRemoveDeveloperFromProject = (onsuccess: any) => {
  return usePostData({
    url: API.users.remove_developer_from_project,
    refetchQueries: [PROJECTS_API_URL, GET_ALL_DEVELOPER_API_URL],
    onSuccess: () => {
      onsuccess();
    },
  });
};

export const useReallocateDeveloperTOProject = (onsuccess: any) => {
  return usePostData({
    url: API.users.reallocate_developer,
    refetchQueries: [PROJECTS_API_URL],
    onSuccess: () => {
      onsuccess();
    },
  });
};

const fetchInquirysDashboard = async ({ pageParam = 1, queryKey }: any) => {
  const [_key, params] = queryKey;
  const baseURL = import.meta.env.VITE_API_BASE_URL;
  const token =
    useAuthStore.getState().user?.token ?? useAuthStore.getState().token;
  const queryStr = buildQueryString({
    ...params,
    page: pageParam,
    limit: 10,
  });
  const response = await axios.get(
    baseURL + `${GET_Inquiry_API_URL}${queryStr}`,
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
};

export const useGetInquiryDashboardData = (params?: any) => {
  return useInfiniteQuery({
    queryKey: [GET_Inquiry_API_URL, params],
    queryFn: fetchInquirysDashboard,
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const metadata = lastPage?.metadata;
      return metadata?.page < metadata?.totalPages
        ? metadata.page + 1
        : undefined;
    },
  });
};

export const useGetProjectMilestonesList = (
  projectId: any,
  enabled: boolean = true
) => {
  return useFetchData<any>({
    url: API.dropdown_api.milestones,
    params: { projectId },
    enabled: !!projectId && enabled,
  });
};

export const useGetMilestoneTasks = (
  milestoneId: any,
  enabled: boolean = true
) => {
  return useFetchData<any>({
    url: `${API.projects.milestone_list}/${milestoneId}`,
    enabled: !!milestoneId && enabled,
  });
};

/* =======================
   Milestone Hooks
======================= */

interface UseDownloadMilestoneSampleReturn {
  isDownloading: boolean;
  downloadSample: () => Promise<void>;
}

/**
 * Custom hook to download milestone sample file
 * Uses the milestone_sample endpoint
 */
export const useDownloadMilestoneSample =
  (): UseDownloadMilestoneSampleReturn => {
    const [isDownloading, setIsDownloading] = useState(false);

    // Helper function to extract error messages
    const extractErrorMessage = (error: unknown): string => {
      if (error instanceof AxiosError) {
        // Network error
        if (error.code === "ERR_NETWORK") {
          return "Network error. Please check your internet connection.";
        }

        // Authentication error
        if (error.response?.status === 401) {
          return "Authentication failed. Please log in again.";
        }

        // Server error (5xx)
        if (error.response?.status && error.response.status >= 500) {
          return "Server error. Please try again later.";
        }

        // Other errors with response message
        if (error.response?.data?.message) {
          return error.response.data.message;
        }
      }

      return "Failed to download sample file. Please try again.";
    };

    // Download handler function
    const downloadSample = useCallback(async () => {
      setIsDownloading(true);

      try {
        const baseURL = import.meta.env.VITE_API_BASE_URL;
        const token =
          useAuthStore.getState().user?.token ?? useAuthStore.getState().token;

        // Make API call with blob responseType using axios directly
        const response = await axios.get(
          baseURL + API.projects.milestone_sample,
          {
            responseType: "blob",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        // Create blob URL
        const blob = new Blob([response.data], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });
        const url = URL.createObjectURL(blob);

        // Extract filename from Content-Disposition header or use default
        const contentDisposition = response.headers["content-disposition"];
        let filename = "milestone_sample.xlsx";

        if (contentDisposition) {
          const filenameMatch = contentDisposition.match(
            /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/
          );
          if (filenameMatch && filenameMatch[1]) {
            filename = filenameMatch[1].replace(/['"]/g, "");
          }
        }

        // Create temporary link and trigger download
        const link = document.createElement("a");
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();

        // Cleanup
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        toast.success("Sample file downloaded successfully");
      } catch (error) {
        const errorMessage = extractErrorMessage(error);
        toast.error(errorMessage);
      } finally {
        setIsDownloading(false);
      }
    }, []);

    return {
      isDownloading,
      downloadSample,
    };
  };

interface UploadResponse {
  statusCode: number;
  message: string;
  data?: unknown;
}

interface UseUploadMilestoneFileReturn {
  isUploading: boolean;
  uploadFile: (
    file: File,
    projectId?: string | number
  ) => Promise<UploadResponse | undefined>;
}

/**
 * Custom hook to upload/export milestone file
 * Uses the project_milestones endpoint
 */
export const useUploadMilestoneFile = (): UseUploadMilestoneFileReturn => {
  const [isUploading, setIsUploading] = useState(false);

  // Helper function to extract error messages
  const extractErrorMessage = (error: unknown): string => {
    if (error instanceof AxiosError) {
      // Network error
      if (error.code === "ERR_NETWORK") {
        return "Network error. Please check your internet connection.";
      }

      // Authentication error
      if (error.response?.status === 401) {
        return "Authentication failed. Please log in again.";
      }

      // Validation error (4xx)
      if (
        error.response?.status &&
        error.response.status >= 400 &&
        error.response.status < 500
      ) {
        if (error.response?.data?.message) {
          return error.response.data.message;
        }
        return "Invalid file or request. Please check and try again.";
      }

      // Server error (5xx)
      if (error.response?.status && error.response.status >= 500) {
        return "Server error. Please try again later.";
      }

      // Other errors with response message
      if (error.response?.data?.message) {
        return error.response.data.message;
      }
    }

    return "Failed to upload file. Please try again.";
  };

  // Upload handler function
  const uploadFile = useCallback(
    async (file: File, projectId?: string | number) => {
      // Validate file
      if (!file) {
        toast.error("Please select a file to upload.");
        return;
      }

      // Validate file type
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

        // Create FormData for file upload
        const formData = new FormData();
        formData.append("file", file);

        // Build URL with projectId query parameter if provided
        let uploadUrl = baseURL + API.projects.project_milestones;
        if (projectId) {
          uploadUrl += `?projectId=${projectId}`;
        }

        // Make API call using axios directly
        const response = await axios.post<UploadResponse>(uploadUrl, formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        });

        if (
          response?.data?.statusCode === 200 ||
          response?.data?.statusCode === 201
        ) {
          toast.success(
            response?.data?.message || "File uploaded successfully"
          );
          return response.data;
        } else {
          toast.error(response?.data?.message || "Failed to upload file");
        }
      } catch (error) {
        const errorMessage = extractErrorMessage(error);
        toast.error(errorMessage);
      } finally {
        setIsUploading(false);
      }
    },
    []
  );

  return {
    isUploading,
    uploadFile,
  };
};

/**
 * Custom hook to create a milestone manually
 * Uses the add_milestones endpoint
 */
export const useCreateManualMilestone = (onSuccess?: () => void) => {
  return usePostData({
    url: API.projects.add_milestones,
    refetchQueries: [API.dropdown_api.milestones],
    onSuccess: () => {
      if (onSuccess) onSuccess();
    },
  });
};

export const useAddMileStones = () => {
  return usePostData({
    url: API.projects.add_milestones,
    refetchQueries: [GET_MILESTONE_LIST_API_URL],
    // onSuccess: () => {
    //   setOpen(null);
    // },
  });
};
