import { useMemo, useState } from "react";
import PageLayout from "@/components/layout/layout-provider";
import { GlobalTable } from "@/components/table/global-table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DollarSign,
  Eye,
  MousePointerClick,
  Percent,
  BarChart2,
  LayoutGrid,
  CheckCircle2,
  Clock,
  AlertCircle,
} from "lucide-react";
import SimpleDropDownSearchable from "@/components/shared/custome-simple-dropdown";
import TablePageHeader from "@/components/table/table-page-header";
import { columns, appColumns } from "./components/columns";
import { TabView } from "./types";
import { useGetAdmobDashboard, useGetAdmobApps } from "./services";
import { DateRange } from "react-day-picker";
import { formatDate } from "@/utils/commonFunctions";
import DateRangeFilter from "@/components/table/custome-dateRange";

// Refactored Components
import { StatCard } from "./components/stat-card";
import { AppPerformanceCard } from "./components/app-performance-card";
import { TopCountriesCard } from "./components/top-countries-card";
import { PlatformRevenueCard } from "./components/platform-revenue-card";
import { EarningsTrendChart } from "./components/earnings-trend-chart";
import { AdMobAnalyticsSkeleton } from "./components/skeleton";

const tabTriggerClass =
  "flex items-center gap-2 rounded-[50px] !px-3 !py-2 transition-all h-[35px] " +
  "text-foreground/70 hover:text-foreground " +
  "data-[state=active]:bg-foreground data-[state=active]:text-background data-[state=active]:shadow-sm " +
  "dark:text-muted-foreground dark:hover:text-foreground " +
  "dark:data-[state=active]:bg-primary dark:data-[state=active]:text-white dark:data-[state=active]:shadow-[0_2px_8px_oklch(0_0_0/0.5)]";

const AdMobAnalyticsDashboard = () => {
  const [tab, setTab] = useState<TabView>("overview");
  const [search, setSearch] = useState("");
  // const [platformFilter, setPlatformFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const [date, setDate] = useState<DateRange | undefined>({
    from: undefined,
    to: undefined,
  });

  const appliedDate = useMemo(() => {
    if (date?.from && date?.to) return date;
    return undefined;
  }, [date]);

  const filterParams = useMemo(
    () => ({
      startDate: formatDate(appliedDate?.from) ?? undefined,
      endDate: formatDate(appliedDate?.to) ?? undefined,
    }),
    [appliedDate]
  );

  const { data: apiResponse, isLoading: isDashboardLoading } =
    useGetAdmobDashboard(filterParams);
  const dashboardData = apiResponse?.data;

  const { data: appsResponse, isLoading: isAppsLoading } = useGetAdmobApps({
    ...filterParams,
    page: currentPage,
    pageSize,
    appApprovalState: statusFilter === "all" ? undefined : statusFilter,
  });
  const appsData = appsResponse?.data;

  const isLoading = tab === "overview" ? isDashboardLoading : isAppsLoading;

  // client-side filtering + pagination for apps
  const filteredApps = useMemo(() => {
    const list =
      tab === "overview" ? dashboardData?.appPerformance : appsData?.apps;
    if (!list) return [];
    return list.filter((app: any) => {
      const matchSearch =
        !search || app.appName.toLowerCase().includes(search.toLowerCase());
      // const matchPlatform =
      //   platformFilter === "all" || app.platform === platformFilter;
      return matchSearch;
    });
  }, [dashboardData, appsData, search, tab]);

  const totalCount =
    tab === "overview"
      ? filteredApps.length
      : appsData?.metadata?.totalCount || filteredApps.length;

  const paginatedApps = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredApps.slice(start, start + pageSize);
  }, [filteredApps, currentPage]);

  const handlePaginationChange = (p: {
    pageIndex: number;
    pageSize: number;
  }) => {
    setCurrentPage(p.pageIndex + 1);
  };

  const statCards = [
    {
      label: "Total Earnings",
      value: dashboardData?.summary.totalEarnings.displayValue || "$0.00",
      growth: dashboardData?.summary.totalEarnings.growthPercentage,
      displayGrowth:
        dashboardData?.summary.totalEarnings.displayGrowthPercentage,
      helperText: "Revenue for selected period",
      icon: (
        <DollarSign className="h-5 w-5 text-emerald-700 dark:text-emerald-400" />
      ),
      iconBg: "bg-emerald-100 dark:bg-emerald-900/30",
    },
    {
      label: "Impressions",
      value: dashboardData?.summary.impressions.displayValue || "0",
      growth: dashboardData?.summary.impressions.growthPercentage,
      displayGrowth: dashboardData?.summary.impressions.displayGrowthPercentage,
      helperText: "Total ad views",
      icon: <Eye className="h-5 w-5 text-sky-700 dark:text-sky-400" />,
      iconBg: "bg-sky-100 dark:bg-sky-900/30",
    },
    {
      label: "Total Clicks",
      value: dashboardData?.summary.totalClicks.displayValue || "0",
      growth: dashboardData?.summary.totalClicks.growthPercentage,
      displayGrowth: dashboardData?.summary.totalClicks.displayGrowthPercentage,
      helperText: "Total ad interactions",
      icon: (
        <MousePointerClick className="h-5 w-5 text-violet-700 dark:text-violet-400" />
      ),
      iconBg: "bg-violet-100 dark:bg-violet-900/30",
    },
    {
      label: "Overall CTR",
      value: dashboardData?.summary.overallCtr.displayValue || "0%",
      growth: dashboardData?.summary.overallCtr.growthPercentage,
      displayGrowth: dashboardData?.summary.overallCtr.displayGrowthPercentage,
      helperText: "Click-through rate performance",
      icon: (
        <Percent className="h-5 w-5 text-orange-700 dark:text-orange-400" />
      ),
      iconBg: "bg-orange-100 dark:bg-orange-900/30",
    },
    {
      label: "eCPM",
      value: dashboardData?.summary.ecpm.displayValue || "$0.00",
      growth: dashboardData?.summary.ecpm.growthPercentage,
      displayGrowth: dashboardData?.summary.ecpm.displayGrowthPercentage,
      helperText: "Effective cost per mille",
      icon: <BarChart2 className="h-5 w-5 text-rose-700 dark:text-rose-400" />,
      iconBg: "bg-rose-100 dark:bg-rose-900/30",
    },
  ];

  // const platformOptions = [
  //   { value: "all", label: "All Platforms" },
  //   { value: "Android", label: "Android" },
  //   { value: "iOS", label: "iOS" },
  // ];

  const statusOptions = [
    { value: "all", label: "All Status" },
    { value: "APPROVED", label: "Approved" },
    { value: "IN_REVIEW", label: "In Review" },
    { value: "ACTION_REQUIRED", label: "Action Required" },
  ];

  const appStatCards = [
    {
      label: "Total Apps",
      value: appsData?.summary.totalApps.value.toString() || "0",
      helperText: "Total apps integrated",
      icon: <LayoutGrid className="h-5 w-5 text-blue-700 dark:text-blue-400" />,
      iconBg: "bg-blue-100 dark:bg-blue-900/30",
    },
    {
      label: "Active Apps",
      value: appsData?.summary.activeApps.value.toString() || "0",
      helperText: "Approved and serving ads",
      icon: (
        <CheckCircle2 className="h-5 w-5 text-emerald-700 dark:text-emerald-400" />
      ),
      iconBg: "bg-emerald-100 dark:bg-emerald-900/30",
    },
    {
      label: "Pending Approval",
      value: appsData?.summary.pendingApproval.value.toString() || "0",
      helperText: "Currently under review",
      icon: <Clock className="h-5 w-5 text-amber-700 dark:text-amber-400" />,
      iconBg: "bg-amber-100 dark:bg-amber-900/30",
    },
    {
      label: "Action Required",
      value: appsData?.summary.actionRequired.value.toString() || "0",
      helperText: "Need your attention",
      icon: (
        <AlertCircle className="h-5 w-5 text-rose-700 dark:text-rose-400" />
      ),
      iconBg: "bg-rose-100 dark:bg-rose-900/30",
    },
  ];

  return (
    <PageLayout>
      <div className="space-y-6">
        <TablePageHeader title="AdMob Analytics" showActionButton={false}>
          Monitor your mobile ad revenue performance with platform-level
          filtering.
        </TablePageHeader>

        {isLoading ? (
          <AdMobAnalyticsSkeleton />
        ) : (
          <Tabs
            value={tab}
            onValueChange={(v) => setTab(v as TabView)}
            className="w-full"
          >
            <div className="flex flex-col gap-4">
              <TabsList className="bg-[#fdebef] rounded-full dark:bg-muted dark:border-white/10 border-rose-100/50 w-fit">
                <TabsTrigger className={tabTriggerClass} value="overview">
                  Overview
                </TabsTrigger>
                <TabsTrigger className={tabTriggerClass} value="apps">
                  App Performance
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="overview" className="mt-6 space-y-6">
              {/* ── Overview Stat Cards ── */}
              <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-4">
                {statCards.map((card) => (
                  <StatCard key={card.label} {...card} />
                ))}
              </div>

              <div className="flex justify-start lg:justify-end">
                <DateRangeFilter
                  placeholder="Pick a date range"
                  value={date}
                  onChange={setDate}
                  disabled={{ after: new Date() }}
                />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Earnings Trend — takes 2 cols */}
                <div className="lg:col-span-2">
                  <EarningsTrendChart
                    data={dashboardData?.earningsTrend || []}
                  />
                </div>
                {/* Platform Revenue — 1 col */}
                <PlatformRevenueCard
                  data={dashboardData?.platformRevenue || []}
                  topApp={dashboardData?.topPerformingApp!}
                />
              </div>

              {/* Bottom section: App Performance + Top Countries */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <AppPerformanceCard
                    data={dashboardData?.appPerformance || []}
                  />
                </div>
                <TopCountriesCard data={dashboardData?.topCountries || []} />
              </div>
            </TabsContent>

            {/* ── Tab 2: App Performance (Listing) ── */}
            <TabsContent value="apps" className="mt-6 space-y-6">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {appStatCards.map((card) => (
                  <StatCard key={card.label} {...card} />
                ))}
              </div>

              {/* Filters */}
              <div className="flex flex-col sm:flex-row gap-3">
                {/* Search */}
                <div className="relative flex-1 max-w-sm">
                  <svg
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <circle cx="11" cy="11" r="8" />
                    <path d="m21 21-4.35-4.35" />
                  </svg>
                  <input
                    type="text"
                    placeholder="Search apps by name..."
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-full h-10 rounded-lg border border-border bg-background pl-9 pr-4 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>

                {/* Status filter */}
                <SimpleDropDownSearchable
                  options={statusOptions}
                  value={statusFilter}
                  onChange={(value) => {
                    setStatusFilter(value ?? "all");
                    setCurrentPage(1);
                  }}
                  placeholder="All Status"
                  className="min-w-45 h-10"
                  allowClear={statusFilter !== "all"}
                />

                {/* Platform filter */}
                {/* <SimpleDropDownSearchable
                  options={platformOptions}
                  value={platformFilter}
                  onChange={(value) => {
                    setPlatformFilter(value ?? "all");
                    setCurrentPage(1);
                  }}
                  placeholder="All Platforms"
                  className="min-w-45 h-10"
                  allowClear={platformFilter !== "all"}
                /> */}

                <div className="flex justify-start lg:justify-end lg:ml-auto">
                  <DateRangeFilter
                    placeholder="Pick a date range"
                    value={date}
                    onChange={setDate}
                    disabled={{ after: new Date() }}
                  />
                </div>
              </div>

              {/* Table */}
              <GlobalTable<any>
                data={paginatedApps}
                columns={tab === "overview" ? columns : appColumns}
                totalCount={totalCount}
                currentPage={currentPage}
                pageSize={pageSize}
                onPaginationChange={handlePaginationChange}
                isPaginationEnabled
                //@ts-ignore
                isLoading={isLoading}
              />
            </TabsContent>
          </Tabs>
        )}
      </div>
    </PageLayout>
  );
};

export default AdMobAnalyticsDashboard;
