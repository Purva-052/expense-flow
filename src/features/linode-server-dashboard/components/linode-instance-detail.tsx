import { useMemo, useState } from "react";
import PageLayout from "@/components/layout/layout-provider";
import TablePageHeader from "@/components/table/table-page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowUpDown,
  Cpu,
  HardDrive,
  MapPin,
  MemoryStick,
  Server,
  ShieldCheck,
  Terminal,
} from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import {
  useGetInstanceDetailById,
  useGetLinodeInstanceDetail,
} from "../services";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface LinodeInstanceDetailProps {
  instanceId: string;
}

export default function LinodeInstanceDetail({
  instanceId,
}: LinodeInstanceDetailProps) {
  const navigate = useNavigate();
  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState(
    currentDate.getMonth() + 1
  );
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());

  // State for synchronized tooltips
  const [syncId] = useState("performanceCharts");

  // Fetch instance detail with performance data
  const { data: detailData, isPending: detailLoading } =
    useGetLinodeInstanceDetail(instanceId, {
      month: selectedMonth,
      year: selectedYear,
    });

  // Fetch instance basic info directly by ID
  const { data: instanceData, isPending: instanceLoading } =
    useGetInstanceDetailById(instanceId);
  const instance = (instanceData as any)?.data;

  // Extract performance data
  const performanceData = Array.isArray((detailData as any)?.data?.data)
    ? (detailData as any)?.data?.data
    : [];

  // Format chart data
  const chartData = useMemo(() => {
    if (!Array.isArray(performanceData) || performanceData.length === 0) {
      return [];
    }
    return performanceData.map((point: any) => ({
      timestamp: point.timestamp,
      cpu: point.cpu || 0,
      net_in: point.net_in || 0,
      net_out: point.net_out || 0,
    }));
  }, [performanceData]);

  // Calculate average CPU for display
  const avgCpu = useMemo(() => {
    if (chartData.length === 0) return 0;
    const total = chartData.reduce((sum, point) => sum + point.cpu, 0);
    return (total / chartData.length).toFixed(2);
  }, [chartData]);

  // Date formatter for chart axes
  const dateFormatter = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const handleBack = () => {
    navigate({ to: "/Linode-server-dashboard" });
  };

  // Generate month options
  const months = [
    { value: 1, label: "January" },
    { value: 2, label: "February" },
    { value: 3, label: "March" },
    { value: 4, label: "April" },
    { value: 5, label: "May" },
    { value: 6, label: "June" },
    { value: 7, label: "July" },
    { value: 8, label: "August" },
    { value: 9, label: "September" },
    { value: 10, label: "October" },
    { value: 11, label: "November" },
    { value: 12, label: "December" },
  ];

  // Generate year options
  const years = [
    currentDate.getFullYear(),
    currentDate.getFullYear() - 1,
    currentDate.getFullYear() - 2,
  ];

  if (detailLoading || instanceLoading || !instance) {
    return (
      <PageLayout>
        <div className="space-y-6">
          {/* Header Skeleton */}
          <div className="space-y-3">
            <div className="h-8 w-48 bg-slate-200 rounded animate-pulse"></div>
            <div className="h-4 w-64 bg-slate-200 rounded animate-pulse"></div>
          </div>

          {/* Specs Cards Skeleton - UPDATED TO UNIFIED STRIP */}
          <Card className="w-full overflow-hidden">
            <div className="w-full overflow-x-auto">
              <div className="flex divide-x divide-slate-100 min-w-max">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                  <div
                    key={i}
                    className="flex-1 p-4 min-w-[150px] flex items-center gap-3"
                  >
                    <div className="h-10 w-10 bg-slate-100 rounded-lg animate-pulse flex-shrink-0" />
                    <div className="space-y-2 flex-1">
                      <div className="h-2 w-10 bg-slate-200 rounded animate-pulse" />
                      <div className="h-4 w-16 bg-slate-200 rounded animate-pulse" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          {/* Performance Section Skeleton */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="h-6 w-32 bg-slate-200 rounded animate-pulse"></div>
                <div className="flex gap-3">
                  <div className="h-10 w-[140px] bg-slate-200 rounded animate-pulse"></div>
                  <div className="h-10 w-[100px] bg-slate-200 rounded animate-pulse"></div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-8">
              {/* CPU Chart Skeleton */}
              <div>
                <div className="h-4 w-32 bg-slate-200 rounded animate-pulse mb-4"></div>
                <div className="h-[250px] w-full bg-slate-100 rounded-xl animate-pulse"></div>
              </div>

              {/* Network Chart Skeleton */}
              <div>
                <div className="h-4 w-40 bg-slate-200 rounded animate-pulse mb-4"></div>
                <div className="h-[250px] w-full bg-slate-100 rounded-xl animate-pulse"></div>
              </div>
            </CardContent>
          </Card>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="space-y-6">
        {/* Header */}
        <TablePageHeader
          showActionButton={true}
          buttonText="Back"
          onButtonClick={handleBack}
          showActionButtonIcon={false}
        >
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">{instance.label}</h1>
            <Badge
              variant={
                instance.status === "running" ? "success" : "destructive"
              }
              className="uppercase"
            >
              {instance.status}
            </Badge>
          </div>
          <div className="text-sm text-muted-foreground mt-1">
            {instance.region?.toUpperCase()} • {instance.ipv4?.[0] || "N/A"}
          </div>
        </TablePageHeader>

        {/* Specs Cards - UNIFIED DATA STRIP */}
        <Card className="w-full overflow-hidden">
          <div className="w-full overflow-x-auto">
            <div className="flex divide-x divide-slate-100 min-w-max">
              {/* Item 1 */}
              <div className="flex-1 p-4 min-w-[150px] flex items-center gap-3 hover:bg-slate-50 transition-colors">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                  <Server className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">
                    Type
                  </p>
                  <p
                    className="text-sm font-bold truncate"
                    title={instance.type}
                  >
                    {instance.type}
                  </p>
                </div>
              </div>

              {/* Item 2 */}
              <div className="flex-1 p-4 min-w-[150px] flex items-center gap-3 hover:bg-slate-50 transition-colors">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                  <MapPin className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">
                    Region
                  </p>
                  <p
                    className="text-sm font-bold truncate"
                    title={instance.region}
                  >
                    {instance.region}
                  </p>
                </div>
              </div>

              {/* Item 3 */}
              <div className="flex-1 p-4 min-w-[150px] flex items-center gap-3 hover:bg-slate-50 transition-colors">
                <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
                  <Cpu className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">
                    Cores
                  </p>
                  <p className="text-sm font-bold">
                    {instance.specs?.vcpus} CPU
                  </p>
                </div>
              </div>

              {/* Item 4 */}
              <div className="flex-1 p-4 min-w-[150px] flex items-center gap-3 hover:bg-slate-50 transition-colors">
                <div className="p-2 bg-pink-50 text-pink-600 rounded-lg">
                  <MemoryStick className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">
                    Memory
                  </p>
                  <p className="text-sm font-bold">
                    {instance.specs?.memory / 1024} GB
                  </p>
                </div>
              </div>

              {/* Item 5 */}
              <div className="flex-1 p-4 min-w-[150px] flex items-center gap-3 hover:bg-slate-50 transition-colors">
                <div className="p-2 bg-green-50 text-green-600 rounded-lg">
                  <HardDrive className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">
                    Storage
                  </p>
                  <p className="text-sm font-bold">
                    {instance.specs?.disk / 1024} GB
                  </p>
                </div>
              </div>

              {/* Item 6 */}
              <div className="flex-1 p-4 min-w-[150px] flex items-center gap-3 hover:bg-slate-50 transition-colors">
                <div className="p-2 bg-green-50 text-green-600 rounded-lg">
                  <Terminal className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">
                    OS
                  </p>
                  <p
                    className="text-sm font-bold truncate"
                    title={instance.ubuntuVersion}
                  >
                    {instance.ubuntuVersion || "N/A"}
                  </p>
                </div>
              </div>

              {/* Item 7 */}
              <div className="flex-1 p-4 min-w-[150px] flex items-center gap-3 hover:bg-slate-50 transition-colors">
                <div className="p-2 bg-green-50 text-green-600 rounded-lg">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">
                    Encryption
                  </p>
                  <p className="text-sm font-bold">
                    {instance.diskEncryption === "enabled" ? "On" : "Off"}
                  </p>
                </div>
              </div>

              {/* Item 8 */}
              <div className="flex-1 p-4 min-w-[150px] flex items-center gap-3 hover:bg-slate-50 transition-colors">
                <div className="p-2 bg-green-50 text-green-600 rounded-lg">
                  <ArrowUpDown className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">
                    Transfer
                  </p>
                  <p className="text-sm font-bold">{instance.transfer}</p>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Performance Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl">Performance</CardTitle>
              <div className="flex gap-3">
                <Select
                  value={selectedMonth.toString()}
                  onValueChange={(value) => setSelectedMonth(parseInt(value))}
                >
                  <SelectTrigger className="w-[140px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {months.map((month) => (
                      <SelectItem
                        key={month.value}
                        value={month.value.toString()}
                      >
                        {month.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select
                  value={selectedYear.toString()}
                  onValueChange={(value) => setSelectedYear(parseInt(value))}
                >
                  <SelectTrigger className="w-[100px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {years.map((year) => (
                      <SelectItem key={year} value={year.toString()}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-8">
            {/* CPU Utilization Chart */}
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground mb-4 uppercase tracking-wide">
                CPU Utilization
              </h3>
              <div className="text-xs text-muted-foreground mb-2">
                Average: {avgCpu}%
              </div>
              {detailLoading ? (
                <div className="h-[250px] w-full bg-slate-100 rounded-xl animate-pulse flex items-center justify-center">
                  <div className="text-slate-400 text-sm">
                    Loading chart data...
                  </div>
                </div>
              ) : chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <AreaChart data={chartData} syncId={syncId}>
                    <defs>
                      <linearGradient id="colorCpu" x1="0" y1="0" x2="0" y2="1">
                        <stop
                          offset="5%"
                          stopColor="#8b5cf6"
                          stopOpacity={0.3}
                        />
                        <stop
                          offset="95%"
                          stopColor="#8b5cf6"
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="#f1f5f9"
                    />
                    <XAxis
                      dataKey="timestamp"
                      type="number"
                      domain={["dataMin", "dataMax"]}
                      tickFormatter={dateFormatter}
                      tick={{ fontSize: 12 }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      width={40}
                      tick={{ fontSize: 12 }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <Tooltip
                      isAnimationActive={false}
                      cursor={{
                        stroke: "#94a3b8",
                        strokeWidth: 1,
                        strokeDasharray: "4 4",
                      }}
                      contentStyle={{
                        backgroundColor: "#fff",
                        border: "1px solid #e5e7eb",
                        borderRadius: "8px",
                      }}
                      labelFormatter={(label) =>
                        new Date(label).toLocaleString()
                      }
                    />
                    <Area
                      type="monotone"
                      dataKey="cpu"
                      stroke="#8b5cf6"
                      strokeWidth={2}
                      fill="url(#colorCpu)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[250px] w-full flex items-center justify-center text-slate-400 text-sm bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                  No data available
                </div>
              )}
            </div>

            {/* Network Traffic Chart */}
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground mb-4 uppercase tracking-wide">
                Network Traffic (MB/s)
              </h3>
              {detailLoading ? (
                <div className="h-[250px] w-full bg-slate-100 rounded-xl animate-pulse flex items-center justify-center">
                  <div className="text-slate-400 text-sm">
                    Loading chart data...
                  </div>
                </div>
              ) : chartData.length > 0 ? (
                <>
                  <ResponsiveContainer width="100%" height={250}>
                    <AreaChart data={chartData} syncId={syncId}>
                      <defs>
                        <linearGradient
                          id="colorNet"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor="#10b981"
                            stopOpacity={0.2}
                          />
                          <stop
                            offset="95%"
                            stopColor="#10b981"
                            stopOpacity={0}
                          />
                        </linearGradient>
                      </defs>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        vertical={false}
                        stroke="#f1f5f9"
                      />
                      <XAxis
                        dataKey="timestamp"
                        type="number"
                        domain={["dataMin", "dataMax"]}
                        tickFormatter={dateFormatter}
                        tick={{ fontSize: 12 }}
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis
                        width={40}
                        tick={{ fontSize: 12 }}
                        tickLine={false}
                        axisLine={false}
                      />
                      <Tooltip
                        isAnimationActive={false}
                        cursor={{
                          stroke: "#94a3b8",
                          strokeWidth: 1,
                          strokeDasharray: "4 4",
                        }}
                        contentStyle={{
                          backgroundColor: "#fff",
                          border: "1px solid #e5e7eb",
                          borderRadius: "8px",
                        }}
                        labelFormatter={(label) =>
                          new Date(label).toLocaleString()
                        }
                      />
                      <Area
                        type="monotone"
                        dataKey="net_in"
                        name="Inbound"
                        stroke="#10b981"
                        strokeWidth={2}
                        fill="url(#colorNet)"
                      />
                      <Area
                        type="monotone"
                        dataKey="net_out"
                        name="Outbound"
                        stroke="#3b82f6"
                        strokeWidth={2}
                        fill="transparent"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                  <div className="flex justify-center gap-6 mt-2 text-xs font-medium text-slate-500">
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 rounded-full bg-emerald-500"></div>{" "}
                      Inbound
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 rounded-full bg-blue-500"></div>{" "}
                      Outbound
                    </div>
                  </div>
                </>
              ) : (
                <div className="h-[250px] w-full flex items-center justify-center text-slate-400 text-sm bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                  No data available
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
}
