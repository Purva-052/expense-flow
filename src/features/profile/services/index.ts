/* eslint-disable @typescript-eslint/no-explicit-any */
import API from "@/config/api/api";
import useDeleteData from "@/hooks/use-delete-data";
import useFetchData from "@/hooks/use-fetch-data";
import usePostData from "@/hooks/use-post-data";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import instance from "@/config/instance/instance";
import { toast } from "sonner";

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
  return usePostData<any, { skillId: number; skillType: string }>({
    url: API.skills.learning,
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

export const useCreateCertificate = (userId: string, onSuccess?: any) => {
  return usePostData<Certificate, { name: string }>({
    url: API.certificates.create,
    refetchQueries: [`${API.users.list}/${userId}`],
    onSuccess,
  });
};

export const useUpdateCertificate = (userId: string, onSuccess?: any) => {
  const queryClient = useQueryClient();
  return useMutation<any, Error, { id: number | string; name: string }>({
    mutationFn: async ({ id, name }) => {
      const response = await instance.patch({
        url: `${API.certificates.update}/${id}`,
        data: { name },
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
