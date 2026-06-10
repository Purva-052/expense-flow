/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useMemo, useState } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface LeaveSummaryChartProps {
  monthGroups: any[];
  weekGroups: any[];
  dayGroups: any[];
  loading?: boolean;
}

type GroupBy = "month" | "week" | "day";

export function LeaveSummaryChart({
  monthGroups,
  weekGroups,
  dayGroups,
  loading,
}: LeaveSummaryChartProps) {
  const [groupBy, setGroupBy] = useState<GroupBy>("month");

  const chartData = useMemo(() => {
    const activeGroups =
      groupBy === "month"
        ? monthGroups
        : groupBy === "week"
          ? weekGroups
          : dayGroups;

    if (!Array.isArray(activeGroups)) return [];

    return activeGroups
      .map((g: any) => ({
        name: g.technologyName || "Other",
        value: Number(g.count || 0),
        color: g.technologyColor || "#94a3b8",
      }))
      .filter((item) => item.value > 0);
  }, [groupBy, monthGroups, weekGroups, dayGroups]);

  const total = useMemo(
    () => chartData.reduce((sum, d) => sum + d.value, 0),
    [chartData]
  );

  const periodLabel =
    groupBy === "month"
      ? "This month"
      : groupBy === "week"
        ? "This week"
        : "Today";

  return (
    <Card className="overflow-hidden border border-border/60 shadow-md bg-card h-full flex flex-col">
      <div className="flex items-center justify-between px-6 py-4 border-b border-border/40 bg-muted/30 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-1.5 h-7 rounded-full bg-primary" />
          <div>
            <h3 className="text-sm font-bold text-foreground tracking-tight">
              Employees on Leave
            </h3>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Department breakdown · {periodLabel}
            </p>
          </div>
        </div>

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

      <CardContent className="p-0 flex-1 flex flex-col min-h-0">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-14 gap-3 flex-1">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            <span className="text-xs text-muted-foreground font-medium">
              Loading leave summary...
            </span>
          </div>
        ) : total === 0 ? (
          <div className="flex flex-col items-center justify-center py-14 gap-2 flex-1">
            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
              <span className="text-lg">📊</span>
            </div>
            <span className="text-sm font-medium text-foreground">
              No leave data
            </span>
            <span className="text-xs text-muted-foreground">
              No employees on leave found for {periodLabel.toLowerCase()}.
            </span>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-[auto_1fr] divide-y lg:divide-y-0 lg:divide-x divide-border/40 flex-1 min-h-0">
            <div className="flex flex-col items-center justify-center px-8 py-6 gap-4 min-w-[220px] shrink-0">
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
                        `${value} ${value === 1 ? "employee" : "employees"}`,
                        name,
                      ]}
                    />
                  </PieChart>
                </ResponsiveContainer>

                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-2xl font-extrabold text-foreground leading-none">
                    {total}
                  </span>
                  <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider mt-0.5">
                    {total === 1 ? "Employee" : "Employees"}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto max-h-[320px] [scrollbar-gutter:stable] pr-1 px-6 py-6 flex flex-col justify-start gap-2.5">
              {chartData.map((entry, index) => {
                const percent =
                  total > 0 ? Math.round((entry.value / total) * 100) : 0;
                const displayValue = entry.value;
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
                            {displayValue} {displayValue === 1 ? "employee" : "employees"}
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
