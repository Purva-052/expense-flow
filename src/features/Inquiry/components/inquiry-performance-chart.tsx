/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useMemo } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useGetInquiryPerformance } from "../services";

interface InquiryPerformanceChartProps {
  salesPersonId: number | null | undefined;
  fromDate?: string | null;
  toDate?: string | null;
}

const CHART_ITEMS = [
  { key: "newInquiry",    name: "New Inquiry",    color: "#3b82f6" },
  { key: "inDiscussion",  name: "In Discussion",  color: "#f59e0b" },
  { key: "nearToClose",   name: "Near to Close",  color: "#8b5cf6" },
  { key: "closed",        name: "Closed",         color: "#10b981" },
  { key: "optedOut",      name: "Opted Out",      color: "#ef4444" },
];

export function InquiryPerformanceChart({
  salesPersonId,
  fromDate,
  toDate,
}: InquiryPerformanceChartProps) {
  const [groupBy, setGroupBy] = useState<"month" | "week" | "day">("month");

  const { data: performanceRes, isPending: loading } = useGetInquiryPerformance(
    { salesPersonId, fromDate, toDate, groupBy },
    !!salesPersonId
  );

  const rawData = (performanceRes as any)?.data;

  const chartData = useMemo(() => {
    if (!rawData) return [];
    return CHART_ITEMS.map((item) => ({
      name:  item.name,
      value: rawData[item.key] || 0,
      color: item.color,
    })).filter((d) => d.value > 0);
  }, [rawData]);

  const total = useMemo(
    () => chartData.reduce((sum, d) => sum + d.value, 0),
    [chartData]
  );

  return (
    <Card className="overflow-hidden border border-border/60 shadow-md bg-card">
      {/* ── Header ── */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border/40 bg-muted/30">
        <div className="flex items-center gap-3">
          <div className="w-1.5 h-7 rounded-full bg-primary" />
          <div>
            <h3 className="text-sm font-bold text-foreground tracking-tight">
              Inquiry Performance
            </h3>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Lead status breakdown ·{" "}
              {groupBy.charAt(0).toUpperCase() + groupBy.slice(1)}ly view
            </p>
          </div>
        </div>

        {/* GroupBy toggle */}
        <div className="flex gap-0.5 bg-muted/80 p-0.5 rounded-lg border border-border/50">
          {(["month", "week", "day"] as const).map((opt) => (
            <button
              key={opt}
              type="button"
              className={cn(
                "px-3 py-1 text-[11px] font-semibold rounded-md capitalize transition-all duration-150 cursor-pointer",
                groupBy === opt
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
              onClick={() => setGroupBy(opt)}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>

      {/* ── Body ── */}
      <CardContent className="p-0">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-14 gap-3">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            <span className="text-xs text-muted-foreground font-medium">
              Fetching performance data...
            </span>
          </div>
        ) : total === 0 ? (
          <div className="flex flex-col items-center justify-center py-14 gap-2">
            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
              <span className="text-lg">📊</span>
            </div>
            <span className="text-sm font-medium text-foreground">
              No data available
            </span>
            <span className="text-xs text-muted-foreground">
              No inquiry records found for this period.
            </span>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-[auto_1fr] divide-y lg:divide-y-0 lg:divide-x divide-border/40">
            {/* Donut chart */}
            <div className="flex flex-col items-center justify-center px-8 py-6 gap-4 min-w-[220px]">
              <div className="relative w-[160px] h-[160px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={52}
                      outerRadius={72}
                      paddingAngle={3}
                      dataKey="value"
                      strokeWidth={0}
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "var(--popover)",
                        borderColor: "var(--border)",
                        borderRadius: "10px",
                        fontSize: "12px",
                        fontWeight: "600",
                        padding: "8px 12px",
                        boxShadow: "0 8px 24px -4px rgb(0 0 0 / 0.2)",
                      }}
                      itemStyle={{ color: "var(--foreground)" }}
                      formatter={(value: any, name: any) => [
                        `${value} leads`,
                        name,
                      ]}
                    />
                  </PieChart>
                </ResponsiveContainer>

                {/* Center label */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-2xl font-extrabold text-foreground leading-none">
                    {total}
                  </span>
                  <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider mt-0.5">
                    Total
                  </span>
                </div>
              </div>
            </div>

            {/* Legend with progress bars */}
            <div className="flex flex-col justify-center gap-2.5 px-6 py-6">
              {chartData.map((entry, index) => {
                const percent =
                  total > 0 ? Math.round((entry.value / total) * 100) : 0;
                return (
                  <div key={index} className="flex items-center gap-3">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0 border border-foreground/15"
                      style={{ backgroundColor: entry.color }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-semibold text-foreground truncate">
                          {entry.name}
                        </span>
                        <div className="flex items-center gap-2 shrink-0 ml-3">
                          <span className="text-xs text-muted-foreground">
                            {entry.value} leads
                          </span>
                          <span
                            className="text-[11px] font-bold px-1.5 py-0.5 rounded"
                            style={{
                              backgroundColor: `${entry.color}20`,
                              color: entry.color,
                            }}
                          >
                            {percent}%
                          </span>
                        </div>
                      </div>
                      {/* Progress bar */}
                      <div className="w-full h-1.5 rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-700 ease-out"
                          style={{
                            width: `${percent}%`,
                            backgroundColor: entry.color,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
