/* eslint-disable @typescript-eslint/no-explicit-any */
import PageLayout from "@/components/layout/layout-provider";
import { GlobalTable } from "@/components/table/global-table";
import TablePageHeader from "@/components/table/table-page-header";
import { parseAsInteger, parseAsString, useQueryStates } from "nuqs";
import { useGetCronJobsData } from "./services";
import { columns } from "./components/columns";
import GlobalFilterSection from "@/components/table/global-table-filter";
import { FilterConfig } from "@/components/table/table-toolbar";
import type { DateRange } from "react-day-picker";

const CronJobsPage = () => {
  const [queryParams, setQueryParams] = useQueryStates({
    pageSize: parseAsInteger.withDefault(10),
    currentPage: parseAsInteger.withDefault(1),
    search: parseAsString.withDefault(""),
    status: parseAsString.withDefault(""),
    fromDate: parseAsString.withDefault(""),
    toDate: parseAsString.withDefault(""),
  });

  const listParams = {
    pageSize: queryParams.pageSize,
    currentPage: queryParams.currentPage,
    search: queryParams.search,
    status: queryParams.status,
    fromDate: queryParams.fromDate,
    toDate: queryParams.toDate,
  };

  const apiParams = {
    page: listParams.currentPage,
    limit: listParams.pageSize,
    search: listParams.search || undefined,
    status: listParams.status || undefined,
    fromDate: listParams.fromDate || undefined,
    toDate: listParams.toDate || undefined,
    pagination: true,
  };

  const { data: listData, isPending: loading } = useGetCronJobsData(apiParams);

  const totalCount = (listData as any)?.metadata?.totalCount ?? (listData as any)?.data?.length ?? 0;

  const handlePaginationChange = (newPagination: {
    pageIndex: number;
    pageSize: number;
  }) => {
    setQueryParams({
      ...listParams,
      pageSize: newPagination.pageSize,
      currentPage: newPagination.pageIndex + 1,
    });
  };

  const handleSearch = (search: string | undefined) => {
    setQueryParams({ ...listParams, search: search ?? "", currentPage: 1 });
  };

  const handleStatusChange = (status: string | undefined) => {
    setQueryParams({ ...listParams, status: status ?? "", currentPage: 1 });
  };

  const handleDateChange = (dateRange: DateRange | undefined) => {
    setQueryParams({ 
      ...listParams, 
      fromDate: dateRange?.from ? dateRange.from.toISOString() : "",
      toDate: dateRange?.to ? dateRange.to.toISOString() : "",
      currentPage: 1 
    });
  };

  const filters: FilterConfig[] = [
    {
      type: "search",
      placeholder: "Search Cron Jobs...",
      key: "search",
      value: listParams.search,
      onChange: handleSearch,
    },
    {
      type: "select",
      placeholder: "Filter by Status",
      key: "status",
      value: listParams.status,
      options: [
        { label: "Success", value: "success" },
        { label: "Failed", value: "failed" },
      ],
      onChange: handleStatusChange,
    },
    {
      type: "dateRange",
      placeholder: "Filter by Triggered Date",
      key: "triggeredDateRange",
      value: {
        from: listParams.fromDate ? new Date(listParams.fromDate) : undefined,
        to: listParams.toDate ? new Date(listParams.toDate) : undefined,
      },
      onChange: handleDateChange,
    },
  ];

  return (
    <PageLayout>
      <TablePageHeader
        title="Background Jobs / Cron"
        showActionButton={false}
      >
        View your scheduled and background cron jobs.
      </TablePageHeader>
      <GlobalFilterSection filters={filters ?? []} />
      <GlobalTable
        pageSize={listParams.pageSize}
        currentPage={listParams.currentPage}
        totalCount={totalCount ?? 0}
        data={(listData as any)?.data ?? []}
        onPaginationChange={handlePaginationChange}
        columns={columns}
        loading={loading}
        isPaginationEnabled
      />
    </PageLayout>
  );
};

export default CronJobsPage;
