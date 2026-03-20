/* eslint-disable @typescript-eslint/no-explicit-any */
import PageLayout from "@/components/layout/layout-provider";
import { GlobalTable } from "@/components/table/global-table";
import GlobalFilterSection from "@/components/table/global-table-filter";
import TablePageHeader from "@/components/table/table-page-header";
import { FilterConfig } from "@/components/table/table-toolbar";
import { parseAsInteger, parseAsString, useQueryStates } from "nuqs";
import { ActionFormModal } from "./components/action";
import { columns } from "./components/columns";
import { ViewTransactionModal } from "./components/view-model";
import { useExtraWorkStore } from "./stores";
import { useGetExtraWorkData } from "./services";
import { useGetProjectSDropdownList } from "../Project-type/services";
import { useGetUserDropdownList } from "../users/services";
import { roles } from "@/utils/constant";
import { formatDate } from "@/utils/commonFunctions";

const ExtraWorkReport = () => {
  const { open, setOpen } = useExtraWorkStore();
  const [queryParams, setQueryParams] = useQueryStates({
    pageSize: parseAsInteger.withDefault(10),
    currentPage: parseAsInteger.withDefault(1),
    search: parseAsString.withDefault(""),
    projectId: parseAsInteger,
    employeeId: parseAsInteger,
    startDate: parseAsString,
    endDate: parseAsString,
  });

  const listParams = {
    pageSize: queryParams.pageSize,
    currentPage: queryParams.currentPage,
    search: queryParams.search,
    projectId: queryParams.projectId ?? undefined,
    employeeId: queryParams.employeeId ?? undefined,
    startDate: queryParams.startDate ?? undefined,
    endDate: queryParams.endDate ?? undefined,
  };

  const apiParams = {
    page: listParams.currentPage,
    limit: listParams.pageSize,
    search: listParams.search,
    pagination: true,
    projectId: listParams.projectId,
    employeeId: listParams.employeeId,
    fromDate: listParams.startDate,
    toDate: listParams.endDate,
  };

  const { data: listData, isPending: loading } = useGetExtraWorkData(apiParams);
  const { data: projectsList, isPending: projectsListLoading }: any =
    useGetProjectSDropdownList();

  const { data: usersList, isPending: usersListLoading }: any =
    useGetUserDropdownList({
      role: [
        roles.TEAM_LEAD,
        roles.ADMIN,
        roles.PROJECT_MANAGER,
        roles.DEVELOPER,
      ],
      status: "active",
    });

  const totalCount = (listData as any)?.metadata?.totalCount;

  const handleSearch = (search: string | undefined) => {
    setQueryParams({ search: search ?? "", currentPage: 1 });
  };

  const handlePaginationChange = (newPagination: {
    pageIndex: number;
    pageSize: number;
  }) => {
    setQueryParams({
      pageSize: newPagination.pageSize,
      currentPage: newPagination.pageIndex + 1,
    });
  };

  const filters: FilterConfig[] = [
    {
      type: "search",
      placeholder: "Search by Employee or Project description...",
      key: "search",
      value: listParams.search,
      onChange: handleSearch,
    },
    {
      type: "dateRange",
      key: "reportingDate",
      placeholder: "Filter by Reporting Date",
      value: {
        from: listParams.startDate ? new Date(listParams.startDate) : undefined,
        to: listParams.endDate ? new Date(listParams.endDate) : undefined,
      },
      onChange: (range: { from?: Date; to?: Date } | undefined) => {
        setQueryParams({
          startDate: formatDate(range?.from) ?? null,
          endDate: formatDate(range?.to) ?? null,
          currentPage: 1,
        });
      },
    },
    {
      type: "select",
      key: "projectId",
      placeholder: "Filter by Project",
      options: projectsList?.data?.map((project: any) => ({
        value: project.id.toString(),
        label: project.name,
      })),
      value: listParams.projectId?.toString(),
      onChange: (value: any) => {
        setQueryParams({
          projectId: value ? Number(value) : null,
          currentPage: 1,
        });
      },
      isLoading: projectsListLoading,
    },
    {
      type: "select",
      key: "employeeId",
      placeholder: "Filter by Employee",
      options: usersList?.data?.map((user: any) => ({
        value: user.id,
        label: user.fullName,
      })),
      value: listParams.employeeId?.toString(),
      onChange: (value: any) => {
        setQueryParams({
          employeeId: value ? Number(value) : null,
          currentPage: 1,
        });
      },
      isLoading: usersListLoading,
    },
  ];

  const handleAdd = () => {
    setOpen("add");
  };

  return (
    <PageLayout>
      <TablePageHeader
        title="Extra Work Report"
        buttonText="Add Extra Work"
        onButtonClick={handleAdd}
      >
        Manage your Extra Work hours here.
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
      <ViewTransactionModal />
    </PageLayout>
  );
};

export default ExtraWorkReport;
