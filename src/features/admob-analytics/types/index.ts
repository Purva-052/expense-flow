export type AdMobPlatform = "Android" | "iOS";
export type TabView = "overview" | "apps";
export type TrendRange = "7D" | "ALL";

export interface AdMobMetricValue {
  value: number;
  displayValue: string;
  growthPercentage: number;
  displayGrowthPercentage: string;
}

export interface AdMobSummary {
  totalEarnings: AdMobMetricValue;
  impressions: AdMobMetricValue;
  totalClicks: AdMobMetricValue;
  overallCtr: AdMobMetricValue;
  ecpm: AdMobMetricValue;
}

export interface AdMobEarningsTrend {
  date: string;
  earnings: number;
  displayEarnings: string;
}

export interface AdMobPlatformRevenue {
  platform: AdMobPlatform;
  earnings: number;
  displayEarnings: string;
  contributionPercentage: number;
}

export interface AdMobTopApp {
  appId: string;
  appName: string;
  platform: AdMobPlatform;
  earnings: number;
  displayEarnings: string;
  contributionPercentage: number;
}

export interface AdMobAppPerformance {
  appId: string;
  appName: string;
  platform: AdMobPlatform;
  earnings: number;
  displayEarnings: string;
  impressions: number;
  clicks: number;
  ctr: number;
  displayCtr: string;
}

export interface AdMobTopCountry {
  countryCode: string;
  countryName: string;
  earnings: number;
  displayEarnings: string;
}

export interface AdMobAnalyticsData {
  filters: {
    startDate: string;
    endDate: string;
  };
  summary: AdMobSummary;
  earningsTrend: AdMobEarningsTrend[];
  platformRevenue: AdMobPlatformRevenue[];
  topPerformingApp: AdMobTopApp;
  appPerformance: AdMobAppPerformance[];
  topCountries: AdMobTopCountry[];
}

export interface AdMobAppSummaryItem {
  value: number;
}

export interface AdMobAppsSummary {
  totalApps: AdMobAppSummaryItem;
  activeApps: AdMobAppSummaryItem;
  pendingApproval: AdMobAppSummaryItem;
  actionRequired: AdMobAppSummaryItem;
}

export interface AdMobApp {
  appId: string;
  appName: string;
  appStoreId: string | null;
  platform: AdMobPlatform;
  status: "APPROVED" | "IN_REVIEW" | "ACTION_REQUIRED";
  statusLabel: string;
  estimatedEarnings: number;
  displayEstimatedEarnings: string;
  fillRate: number;
  displayFillRate: string;
  lastReportDate: string;
}

export interface AdMobAppsData {
  summary: AdMobAppsSummary;
  apps: AdMobApp[];
  metadata?: {
    page: number;
    limit: number;
    totalCount: number;
    totalPages: number;
  };
}

export interface AdMobAppsResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: AdMobAppsData;
}

export interface AdMobAnalyticsResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: AdMobAnalyticsData;
}
