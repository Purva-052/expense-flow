import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AdMobAnalyticsData } from "../types";

export const EarningsTrendChart = ({
  data,
}: {
  data: AdMobAnalyticsData["earningsTrend"];
}) => {
  return (
    <Card className="border-slate-200 dark:border-slate-800 transition-shadow hover:shadow-md">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="space-y-1">
          <CardTitle className="text-base font-semibold">
            Earnings Trend
          </CardTitle>
          <p className="text-xs text-muted-foreground">
            Daily estimated revenue performance across platforms.
          </p>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={320}>
          <BarChart
            data={data}
            margin={{ top: 12, right: 12, left: 12, bottom: 12 }}
            barGap={10}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="currentColor"
              className="text-slate-200 dark:text-slate-800"
            />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 10, fill: "currentColor" }}
              className="text-slate-500 dark:text-slate-400"
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => {
                // date comes as YYYYMMDD from API, let's format it briefly
                if (v.length === 8) {
                  return `${v.substring(6)}/${v.substring(4, 6)}`;
                }
                return v;
              }}
            />
            <YAxis
              tick={{ fontSize: 12, fill: "currentColor" }}
              className="text-slate-500 dark:text-slate-400"
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => `$${v}`}
            />
            <Tooltip
              cursor={{ fill: "currentColor", opacity: 0.05 }}
              contentStyle={{
                backgroundColor: "hsl(var(--popover))",
                borderColor: "hsl(var(--border))",
                borderRadius: "12px",
                fontSize: "12px",
                boxShadow:
                  "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
                padding: "12px",
                border: "1px solid hsl(var(--border))",
              }}
              itemStyle={{
                fontWeight: "600",
                color: "hsl(var(--foreground))",
                padding: "2px 0",
              }}
              labelStyle={{
                fontWeight: "700",
                marginBottom: "6px",
                color: "hsl(var(--foreground))",
                opacity: 0.8,
              }}
              formatter={(value: number) => [
                `$${Number(value).toFixed(2)}`,
                "Earnings",
              ]}
            />
            <Bar dataKey="earnings" radius={[6, 6, 0, 0]} maxBarSize={42}>
              {data.map((i: any) => (
                <Cell
                  key={i}
                  fill="#E80339"
                  className="transition-all duration-300 hover:opacity-80"
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
