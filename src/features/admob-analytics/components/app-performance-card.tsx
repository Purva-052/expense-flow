import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AdMobAppPerformance } from "../types";
import { cn } from "@/lib/utils";

export const AppPerformanceCard = ({ data }: { data: AdMobAppPerformance[] }) => {
  return (
    <Card className="border-border flex flex-col h-full">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base font-semibold">
          App Performance
        </CardTitle>
        <button className="text-xs font-bold text-primary hover:underline">
          Export CSV
        </button>
      </CardHeader>
      <CardContent className="p-0">
        <div className="w-full overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/50 text-muted-foreground font-medium text-left">
                <th className="px-4 py-3 font-semibold">App Name</th>
                <th className="px-4 py-3 font-semibold text-right">Earnings</th>
                <th className="px-4 py-3 font-semibold text-right">
                  Impressions
                </th>
                <th className="px-4 py-3 font-semibold text-right">Clicks</th>
                <th className="px-4 py-3 font-semibold text-center">CTR</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {data.slice(0, 5).map((app) => (
                <tr
                  key={app.appId}
                  className="hover:bg-muted/30 transition-colors"
                >
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          "h-8 w-8 rounded-lg flex items-center justify-center font-bold text-xs shrink-0",
                          app.platform === "Android"
                            ? "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400"
                            : "bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-400"
                        )}
                      >
                        {app.appName.charAt(0).toUpperCase()}
                      </div>
                      <div className="font-semibold text-foreground leading-tight truncate max-w-[140px]">
                        <p className="font-semibold text-foreground leading-tight">
                          {app.appName}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-right font-medium">
                    {app.displayEarnings}
                  </td>
                  <td className="px-4 py-4 text-right text-muted-foreground">
                    {app.impressions.toLocaleString()}
                  </td>
                  <td className="px-4 py-4 text-right text-muted-foreground">
                    {app.clicks.toLocaleString()}
                  </td>
                  <td className="px-4 py-4 text-center">
                    <span className="inline-flex items-center rounded-md bg-emerald-50 dark:bg-emerald-900/30 px-2 py-1 text-xs font-bold text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                      {app.displayCtr}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};
