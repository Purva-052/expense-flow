/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import PageLayout from "@/components/layout/layout-provider";
import { GlobalTable } from "@/components/table/global-table";
import GlobalFilterSection from "@/components/table/global-table-filter";
import TablePageHeader from "@/components/table/table-page-header";
import { FilterConfig } from "@/components/table/table-toolbar";
import { ActionFormModal } from "./components/action";
import { columns } from "./components/columns";
import { ViewTransactionModal } from "./components/view-model";
import { useExtraWorkStore } from "./stores";
import { useGetExtraWorkData } from "./services";
import { useGetProjectSDropdownList } from "../Project-type/services";
import { useGetUserDropdownList } from "../users/services";
import { roles } from "@/utils/constant";

const ExtraWorkReport = () => {
  const { open, setOpen } = useExtraWorkStore();
  const [listParams, setListParams] = useState({
    pageSize: 10,
    currentPage: 1,
    search: "",
    projectId: undefined as number | undefined,
    employeeId: undefined as number | undefined,
    startDate: undefined as string | undefined,
    endDate: undefined as string | undefined,
  });

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

  const formatDate = (date?: Date) => {
    if (!date) return undefined;

    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");

    return `${yyyy}-${mm}-${dd}`;
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
        setListParams({
          ...listParams,
          startDate: formatDate(range?.from) ?? undefined,
          endDate: formatDate(range?.to) ?? undefined,
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
        setListParams({
          ...listParams,
          projectId: value ? Number(value) : undefined,
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
        setListParams({
          ...listParams,
          employeeId: value ? Number(value) : undefined,
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
