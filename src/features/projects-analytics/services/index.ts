import API from "@/config/api/api";
import useFetchData from "@/hooks/use-fetch-data";

const GET_API_URL = API.projects_analytics.list;

export interface ProjectAnalyticsSummary {
  total: number;
  critical: number;
  healthy: number;
  on_track: number;
  // not_started: number;
}

export interface ProjectAnalyticsItem {
  projectId: number;
  projectName: string;
  plannedHours: number;
  actualHours: number;
  variance: number;
  projectHealth: string;
}

export interface ProjectAnalyticsResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: {
    summary: ProjectAnalyticsSummary;
    data: ProjectAnalyticsItem[];
  };
}

export const useGetProjectAnalytics = () => {
  return useFetchData<ProjectAnalyticsResponse>({
    url: GET_API_URL,
  });
};

