/* eslint-disable @typescript-eslint/no-explicit-any */
import API from "@/config/api/api";
import useFetchData from "@/hooks/use-fetch-data";
import usePostData from "@/hooks/use-post-data";

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
