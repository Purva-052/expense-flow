/* eslint-disable @typescript-eslint/no-explicit-any */
import PageLayout from "@/components/layout/layout-provider";
import { GlobalTable } from "@/components/table/global-table";
import GlobalFilterSection from "@/components/table/global-table-filter";
import TablePageHeader from "@/components/table/table-page-header";
import { FilterConfig } from "@/components/table/table-toolbar";
import { ActionFormModal } from "./components/action";
import { columns } from "./components/columns";
import { useLeaveStore } from "./stores";
import { useGeEmployeeData, useGetLeaveData } from "./services";
import { parseAsInteger, parseAsString, useQueryStates } from "nuqs";
import { formatDate } from "@/utils/commonFunctions";

const LeaveManagementPage = () => {
  const { open, setOpen } = useLeaveStore();
  const [queryParams, setQueryParams] = useQueryStates({
    pageSize: parseAsInteger.withDefault(10),
    currentPage: parseAsInteger.withDefault(1),
    search: parseAsString.withDefault(""),
    employeeId: parseAsInteger,
    startDate: parseAsString,
    endDate: parseAsString,
  });

  const listParams = {
    pageSize: queryParams.pageSize,
    currentPage: queryParams.currentPage,
    search: queryParams.search,
    employeeId: queryParams.employeeId,
    startDate: queryParams.startDate,
    endDate: queryParams.endDate,
  };

  const apiParams = {
    page: listParams.currentPage,
    limit: listParams.pageSize,
    search: listParams.search,
    pagination: true,
    employeeId: listParams.employeeId,
    fromDate: listParams.startDate,
    toDate: listParams.endDate,
  };

  const { data: listData, isPending: loading } = useGetLeaveData(apiParams);

  const { data: employeesList, isPending: employeesListLoading }: any =
    useGeEmployeeData();

  const totalCount = (listData as any)?.metadata?.totalCount;

  const handleSearch = (search: string | undefined) => {
    setQueryParams({ ...listParams, search: search ?? "", currentPage: 1 });
  };

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

  const filters: FilterConfig[] = [
    {
      type: "search",
      placeholder: "Search by reason or description...",
      key: "search",
      value: listParams.search,
      onChange: handleSearch,
    },
    {
      type: "dateRange",
      key: "leaveDate",
      placeholder: "Filter by date...",
      value: {
        from: listParams.startDate ? new Date(listParams.startDate) : undefined,
        to: listParams.endDate ? new Date(listParams.endDate) : undefined,
      },
      onChange: (range: { from?: Date; to?: Date } | undefined) => {
        setQueryParams({
          ...listParams,
          startDate: formatDate(range?.from) ?? null,
          endDate: formatDate(range?.to) ?? null,
          currentPage: 1,
        });
      },
    },
    {
      type: "select",
      key: "employeeId",
      placeholder: "Filter by employee",
      options: employeesList?.data?.map((user: any) => ({
        value: user.id,
        label: user.fullName,
      })),
      value: listParams.employeeId?.toString(),
      onChange: (value: any) => {
        setQueryParams({
          ...listParams,
          employeeId: value ? Number(value) : null,
          currentPage: 1,
        });
      },
      isLoading: employeesListLoading,
    },
  ];

  const handleAdd = () => {
    setOpen("add");
  };

  return (
    <PageLayout>
      <TablePageHeader
        title="Leave Management"
        buttonText="Add Leave"
        onButtonClick={handleAdd}
      >
        Manage employee leaves and track attendance.
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
      {open && <ActionFormModal />}
    </PageLayout>
  );
};

export default LeaveManagementPage;
