import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AdMobAnalyticsData, AdMobTopApp } from "../types";
import { Star } from "lucide-react";

export const PlatformRevenueCard = ({
  data,
  topApp,
}: {
  data: AdMobAnalyticsData["platformRevenue"];
  topApp: AdMobTopApp;
}) => {
  return (
    <Card className="border-slate-200 dark:border-slate-800 transition-shadow hover:shadow-md h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold">
          Platform Revenue
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          {data.map((item) => (
            <div key={item.platform} className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-slate-500">
                  {item.platform}
                </span>
                <span className="font-bold text-slate-900 dark:text-slate-100">
                  {item.displayEarnings}
                </span>
              </div>
              <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800">
                <div
                  className="h-full rounded-full bg-primary transition-all duration-500"
                  style={{ width: `${item.contributionPercentage}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        {topApp && (
          <div className="rounded-2xl bg-slate-50 dark:bg-slate-800/50 p-4 border border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-amber-100 text-amber-600 rounded-lg">
                <Star className="h-4 w-4 fill-current" />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Top Performing App
              </span>
            </div>
            <p className="font-bold text-slate-900 dark:text-slate-100 truncate">
              {topApp.appName}
            </p>
            <div className="mt-2 flex items-center justify-between">
              <span className="text-sm font-medium text-slate-500">
                {topApp.platform}
              </span>
              <span className="text-sm font-bold text-primary">
                {topApp.displayEarnings}
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
