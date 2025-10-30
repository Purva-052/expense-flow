/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import PageLayout from "@/components/layout/layout-provider";
import { GlobalTable } from "@/components/table/global-table";
import GlobalFilterSection from "@/components/table/global-table-filter";
import TablePageHeader from "@/components/table/table-page-header";
import { FilterConfig } from "@/components/table/table-toolbar";
import { ActionFormModal } from "./components/action";
import { columns } from "./components/columns";
import { useProjectsStore } from "./stores/useProjectsStore";
import { ViewProjectModal } from "./components/view-model";
import { useGetProjectsData } from "./services";
import { useGetUsersList } from "../users/services";
import { useGetClientsData } from "../clients/services";

const ProjectsPage = () => {
  const { open, setOpen } = useProjectsStore();
  const [listParams, setListParams] = useState({
    pageSize: 10,
    currentPage: 1,
    search: "",
    clientId: undefined,
    managerId: undefined,
    priority: undefined,
  });

  const apiParams = {
    page: listParams.currentPage,
    limit: listParams.pageSize,
    search: listParams.search,
    pagination: true,
    clientId: listParams.clientId,
    managerId: listParams.managerId,
    priority: listParams.priority,
  };

  const { data: listData, isPending: loading } = useGetProjectsData(apiParams);
  const { data: managerList, isPending: managerListLoading }: any =
    useGetUsersList({
      pagination: false,
      role: "project_manager",
    });
  const { data: teamLeaderList, isPending: teamLeaderListLoading }: any =
    useGetUsersList({
      pagination: false,
      role: "team_lead",
    });

  const { data: clientsList, isPending: clientListLoading }: any =
    useGetClientsData({
      pagination: false,
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

  const handleClientChange = (value: any) => {
    setListParams({ ...listParams, clientId: value ?? null, currentPage: 1 });
  };

  const handleManagerChange = (value: any) => {
    setListParams({ ...listParams, managerId: value ?? null, currentPage: 1 });
  };

  const handlePriorityChange = (value: any) => {
    setListParams({
      ...listParams,
      priority: value ?? undefined,
      currentPage: 1,
    });
  };

  const filters: FilterConfig[] = [
    {
      type: "search",
      placeholder: "Search by name ...",
      key: "search",
      value: listParams.search,
      onChange: handleSearch,
    },
    {
      type: "select",
      key: "clientId",
      placeholder: "Filter by Client",
      options: clientsList?.data?.map((value: any) => {
        return { label: value?.name, value: value?.id };
      }),
      value: listParams.clientId, // 👈 pre-selects if set
      onChange: handleClientChange,
      isLoading: clientListLoading,
    },
    {
      type: "select",
      key: "managerId",
      placeholder: "Filter by Manager",
      options: managerList?.data?.map((value: any) => {
        return { label: value?.fullName, value: value?.id };
      }),
      value: listParams.managerId, // 👈 pre-selects if set
      onChange: handleManagerChange,
      isLoading: managerListLoading,
    },
    {
      type: "select",
      key: "priority",
      placeholder: "Filter by Priority",
      options: [
        { label: "Low", value: "low" },
        { label: "Medium", value: "medium" },
        { label: "High", value: "high" },
      ],
      value: listParams.priority, // 👈 pre-selects if set
      onChange: handlePriorityChange,
    },
  ];

  const handleAdd = () => {
    setOpen("add");
  };

  return (
    <PageLayout>
      <TablePageHeader
        title="Projects"
        buttonText="Add Project"
        onButtonClick={handleAdd}
      >
        Manage your Projects here.
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
      {open && (
        <ActionFormModal
          managerList={managerList}
          managerListLoading={managerListLoading}
          teamLeaderList={teamLeaderList}
          teamLeaderListLoading={teamLeaderListLoading}
          clientsList={clientsList}
          clientListLoading={clientListLoading}
        />
      )}
      <ViewProjectModal />
    </PageLayout>
  );
};

export default ProjectsPage;
