/* eslint-disable @typescript-eslint/no-explicit-any */
import API from "@/config/api/api";
import useDeleteData from "@/hooks/use-delete-data";
import useFetchData from "@/hooks/use-fetch-data";
import usePostData from "@/hooks/use-post-data";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import instance from "@/config/instance/instance";
import { toast } from "sonner";
import { useAuthStore } from "@/stores/use-auth-store";
import { extractErrorInfo } from "@/utils/error-response";

const GET_SKILLS_API_URL = API.skills.list;

export interface Skill {
  id: string;
  skillName: string;
}

export interface SkillsResponse {
  statusCode: number;
  message: string;
  data: Skill[];
}

export interface SkillReference {
  id: number;
  skillId: number;
  userId: number;
  skillType: "skill" | "learning";
}

export interface SkillReferenceResponse {
  statusCode: number;
  message: string;
  data: SkillReference[];
}

export const useGetSkillsList = (params?: any) => {
  return useFetchData<SkillsResponse>({ url: GET_SKILLS_API_URL, params });
};

export const useCreateSkill = () => {
  return usePostData<Skill, { skillName: string }>({
    url: API.skills.create,
    refetchQueries: [GET_SKILLS_API_URL],
  });
};

export const useCreateLearning = () => {
  const queryClient = useQueryClient();

  return usePostData<any, { skillId: number; skillType: string }>({
    url: API.skills.learning,
    onSuccess: (data) => {
      const authState = useAuthStore.getState().user;
      const fallbackUserId = authState?.user?.id ?? authState?.user_id;
      const responseUserId = data?.userId ?? data?.user?.id;
      const resolvedUserId = responseUserId || fallbackUserId;

      if (resolvedUserId) {
        queryClient.invalidateQueries({
          queryKey: [`${API.users.list}/${resolvedUserId}`],
        });
      }
    },
  });
};

export const useGetSkillReference = (userId?: string | number) => {
  return useFetchData<SkillReferenceResponse>({
    url: API.skills.skill_reference,
    params: { userId },
    enabled: !!userId,
  });
};

export const useUpdateSkillReference = (onSuccess?: any) => {
  const queryClient = useQueryClient();
  return useMutation<
    any,
    Error,
    { id: number | string; skillId: number; userId: number; skillType: string }
  >({
    mutationFn: async ({ id, skillId, userId, skillType }) => {
      const response = await instance.patch({
        url: `${API.skills.update_reference}/${id}`,
        data: { skillId, userId, skillType },
      });
      return response.data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: [`${API.users.list}/${variables.userId}`],
      });
      if (onSuccess) onSuccess(data);
      toast.success("Skill reference updated successfully", {
        duration: 3000,
        position: "top-right",
      });
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to update skill reference", {
        duration: 3000,
        position: "top-right",
      });
    },
  });
};

export interface Certificate {
  id: number;
  name: string;
}

export interface CertificatesResponse {
  statusCode: number;
  message: string;
  data: Certificate[];
}

export const useGetCertificatesList = (params?: any) => {
  return useFetchData<CertificatesResponse>({
    url: API.certificates.list,
    params,
  });
};

export const useGetCertificatesDropdown = () => {
  return useFetchData<CertificatesResponse>({
    url: API.certificates.dropdown,
  });
};

export const useCreateCertificate = (userId: string, onSuccess?: any) => {
  return usePostData<Certificate, { name: string; status: string }>({
    url: API.certificates.create,
    refetchQueries: [`${API.users.list}/${userId}`],
    onSuccess,
  });
};

export const useUpdateCertificate = (userId: string, onSuccess?: any) => {
  const queryClient = useQueryClient();
  return useMutation<
    any,
    Error,
    { id: number | string; name: string; status: string }
  >({
    mutationFn: async ({ id, name, status }) => {
      const response = await instance.patch({
        url: `${API.certificates.update}/${id}`,
        data: { name, status },
      });
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: [`${API.users.list}/${userId}`],
      });
      if (onSuccess) onSuccess(data);
    },
  });
};

export const useDeleteCertificate = (userId: string, onSuccess?: any) => {
  const queryClient = useQueryClient();

  return useMutation<any, Error, { id: number }>({
    mutationFn: async (variables: { id: number }) => {
      const response = await instance.delete({
        url: `${API.certificates.delete}/${variables.id}`,
      });

      if (
        response?.statusCode === 200 ||
        response?.statusCode === 202 ||
        response?.statusCode === 201
      ) {
        toast.success("Certificate deleted successfully", {
          duration: 3000,
          position: "top-right",
        });
        return response.data;
      }

      const errorMessage = response?.message || "Failed to delete certificate";
      throw new Error(errorMessage);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: [`${API.users.list}/${userId}`],
      });
      if (onSuccess) {
        onSuccess(data);
      }
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to delete certificate", {
        duration: 3000,
        position: "top-right",
      });
    },
  });
};

export const useDeleteSkill = (id: string) => {
  return useDeleteData({
    url: `${API.skills.delete}/${id}`,
    refetchQueries: [GET_SKILLS_API_URL],
  });
};

export const useSetPrivacyPassword = () => {
  const queryClient = useQueryClient();
  return useMutation<any, Error, any>({
    mutationFn: async (data) => {
      const response = await instance.post({
        url: API.privacy_password.set,
        data,
      });
      return response;
    },
    onSuccess: (data: any) => {
      if (data?.message) {
        toast.success(data.message, {
          position: "top-right",
        });
      }
      const authState = useAuthStore.getState().user;
      const userId = authState?.user?.id ?? authState?.user_id;
      if (userId) {
        queryClient.invalidateQueries({
          queryKey: [`${API.users.list}/${userId}`],
        });
      }
    },
    onError: (error: any) => {
      const errorInfo = extractErrorInfo(error);
      toast.error(errorInfo.description || errorInfo.title, {
        position: "top-right",
      });
    },
  });
};

export const useUpdatePrivacyPassword = () => {
  const queryClient = useQueryClient();
  return useMutation<any, Error, any>({
    mutationFn: async (data) => {
      const response = await instance.patch({
        url: API.privacy_password.update,
        data,
      });
      return response;
    },
    onSuccess: (data: any) => {
      if (data?.message) {
        toast.success(data.message, {
          position: "top-right",
        });
      }
      const authState = useAuthStore.getState().user;
      const userId = authState?.user?.id ?? authState?.user_id;
      if (userId) {
        queryClient.invalidateQueries({
          queryKey: [`${API.users.list}/${userId}`],
        });
      }
    },
    onError: (error: any) => {
      const errorInfo = extractErrorInfo(error);
      toast.error(errorInfo.description || errorInfo.title, {
        position: "top-right",
      });
    },
  });
};

export const useVerifyPrivacyPassword = () => {
  return useMutation<any, Error, { privacyPassword: string }>({
    mutationFn: async (data) => {
      const response = await instance.post({
        url: API.privacy_password.verify,
        data,
      });
      return response;
    },
  });
};
