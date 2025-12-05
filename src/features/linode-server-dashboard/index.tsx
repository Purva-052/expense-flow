/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import PageLayout from "@/components/layout/layout-provider";
import { GlobalTable } from "@/components/table/global-table";
import GlobalFilterSection from "@/components/table/global-table-filter";
import { FilterConfig } from "@/components/table/table-toolbar";
import { columns } from "./components/columns";
import { useGetLinodeList, useGetLinodeDashboardAnalytics } from "./services";
import { FilterType } from "./types";
import { Card, CardContent } from "@/components/ui/card";
import { CalendarClock, DollarSign, Ghost, CheckCircle2 } from "lucide-react";

const LinodeDashboard = () => {
  const [filter, setFilter] = useState<FilterType>(FilterType.ALL);
  const [listParams, setListParams] = useState({
    pageSize: 10,
    currentPage: 1,
    search: "",
    status: undefined as string | undefined,
    region: undefined as string | undefined,
  });

  // API parameters to send to backend
  const apiParams = {
    page: listParams.currentPage,
    limit: listParams.pageSize,
    search: listParams.search || undefined,
    status: listParams.status || undefined,
    region: listParams.region || undefined,
    pagination: true,
    // Send zombieCount: true when Zombie tab is active
    zombieCount: filter === FilterType.ZOMBIE ? true : undefined,
  };

  // 1. Fetch List with API params
  const { data: listData, isPending: listLoading } =
    useGetLinodeList(apiParams);
  const instances = (listData as any)?.data || [];
  const totalCount = (listData as any)?.metadata?.totalCount || 0;

  // 2. Fetch Analytics (replaces heavy metrics hook)
  const { data: analyticsData, isPending: analyticsLoading } =
    useGetLinodeDashboardAnalytics();
  const analytics = (analyticsData as any)?.data || {};

  // 3. Derived Metrics from Analytics API
  const balance_uninvoiced = analytics.balanceUninvoiced || 0;
  const totalRunRate = analytics.monthlyCostTotal || 0;
  const activeCount = analytics.activeInstanceCount || 0;
  const zombieCount = analytics.zombieCount || 0;

  // --- HANDLERS ---
  const handleSearch = (search: string | undefined) => {
    setListParams({ ...listParams, search: search ?? "", currentPage: 1 });
  };

  const handlePaginationChange = (newPagination: {
    pageIndex: number;
    pageSize: number;
  }) => {
    setListParams({
      ...listParams,
      pageSize: newPagination.pageSize,
      currentPage: newPagination.pageIndex + 1,
    });
  };

  const handleStatusChange = (value: any) => {
    setListParams({
      ...listParams,
      status: value ?? undefined,
      currentPage: 1,
    });
  };

  // const handleRegionChange = (region: string | undefined) => {
  //   setListParams({
  //     ...listParams,
  //     region: region ?? "",
  //     currentPage: 1,
  //   });
  // };

  // Status options for Linode instances
  const statusOptions = [
    { value: "running", label: "Running" },
    { value: "offline", label: "Offline" },
    { value: "stopped", label: "Stopped" },
    { value: "booting", label: "Booting" },
    { value: "provisioning", label: "Provisioning" },
    { value: "deleting", label: "Deleting" },
    { value: "migrating", label: "Migrating" },
  ];

  const filters: FilterConfig[] = [
    {
      type: "search",
      placeholder: "Search by label or IP...",
      key: "search",
      value: listParams.search,
      onChange: handleSearch,
    },
    // {
    //   type: "search",
    //   placeholder: "Search by region...",
    //   key: "region",
    //   value: listParams.region,
    //   onChange: handleRegionChange,
    // },
    {
      type: "select",
      key: "status",
      placeholder: "Filter by Status",
      options: statusOptions,
      value: listParams.status,
      onChange: handleStatusChange,
    },
  ];

  return (
    <PageLayout>
      <div className="space-y-6">
        {/* Header Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Month to Date Card */}
          <Card className="border-slate-200 hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex justify-between items-start mb-4">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide flex items-center gap-1">
                  <CalendarClock size={14} /> Month-to-Date
                </span>
                <div className="p-2 bg-green-50 text-green-600 rounded-xl">
                  <DollarSign size={20} />
                </div>
              </div>
              {analyticsLoading ? (
                <div className="h-[60px] w-full bg-slate-100 rounded-xl animate-pulse flex items-center justify-center">
                  <div className="text-slate-400 text-sm">Loading...</div>
                </div>
              ) : (
                <div>
                  <div className="text-3xl font-bold text-slate-900 tracking-tight">
                    ${balance_uninvoiced.toFixed(2)}
                  </div>
                  <div className="text-xs font-medium text-slate-400 mt-1">
                    Est. Run Rate: ${totalRunRate.toFixed(2)}/mo
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Zombie Instances Card */}
          <Card
            className={`border transition-all cursor-pointer hover:shadow-md ${
              filter === FilterType.ZOMBIE
                ? "bg-orange-50 border-orange-200 ring-2 ring-orange-100"
                : "border-slate-200"
            }`}
            onClick={() => {
              setFilter(FilterType.ZOMBIE);
              setListParams({ ...listParams, currentPage: 1 });
            }}
          >
            <CardContent className="p-6 relative overflow-hidden">
              <div className="flex justify-between items-start mb-4 relative z-10">
                <span
                  className={`text-xs font-semibold uppercase tracking-wide ${
                    filter === FilterType.ZOMBIE
                      ? "text-orange-700"
                      : "text-slate-400"
                  }`}
                >
                  Zombie Instances
                </span>
                <div
                  className={`p-2 rounded-xl transition-transform ${
                    filter === FilterType.ZOMBIE
                      ? "bg-orange-200 text-orange-700"
                      : "bg-orange-50 text-orange-500"
                  }`}
                >
                  <Ghost size={20} />
                </div>
              </div>
              <div
                className={`text-3xl font-bold tracking-tight relative z-10 ${
                  filter === FilterType.ZOMBIE
                    ? "text-orange-900"
                    : "text-slate-900"
                }`}
              >
                {/* Show skeleton or number */}
                {analyticsLoading ? (
                  <div className="h-[60px] w-full bg-slate-100 rounded-xl animate-pulse flex items-center justify-center">
                    <div className="text-slate-400 text-sm">Loading...</div>
                  </div>
                ) : (
                  <>
                    {zombieCount}{" "}
                    <span className="text-lg font-medium opacity-60">
                      Instances
                    </span>
                  </>
                )}
              </div>
              <div className="absolute -bottom-4 -right-4 text-orange-100/50 transform rotate-12 z-0">
                <Ghost size={100} />
              </div>
            </CardContent>
          </Card>

          {/* Active Instances Card */}
          <Card className="border-slate-200 hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
                  Active Instances
                </span>
                <div className="p-2 bg-primary-50 text-primary-500 rounded-xl">
                  <CheckCircle2 size={20} />
                </div>
              </div>
              {analyticsLoading ? (
                <div className="h-[60px] w-full bg-slate-100 rounded-xl animate-pulse flex items-center justify-center">
                  <div className="text-slate-400 text-sm">Loading...</div>
                </div>
              ) : (
                <div className="text-3xl font-bold text-slate-900 tracking-tight">
                  {activeCount}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-slate-100 p-1 rounded-2xl w-full md:w-auto gap-2 items-center">
          {[
            { label: "All Instances", value: FilterType.ALL },
            { label: "Zombies", value: FilterType.ZOMBIE },
          ].map((tab) => (
            <button
              key={tab.value}
              onClick={() => {
                setFilter(tab.value);
                setListParams({ ...listParams, currentPage: 1 });
              }}
              className={`flex-1 md:flex-none px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 whitespace-nowrap ${
                filter === tab.value
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Filters */}
        <GlobalFilterSection filters={filters ?? []} />

        {/* Table */}
        <GlobalTable
          pageSize={listParams.pageSize}
          currentPage={listParams.currentPage}
          totalCount={totalCount ?? 0}
          data={instances ?? []}
          onPaginationChange={handlePaginationChange}
          columns={columns}
          loading={listLoading}
          isPaginationEnabled
        />
      </div>
    </PageLayout>
  );
};

export default LinodeDashboard;
