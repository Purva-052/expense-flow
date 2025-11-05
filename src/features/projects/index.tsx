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
import { useGetProjectListForListView } from "./services";
import { useGetClientsData } from "../clients/services";
import { useGetUsersList } from "../users/services";
import { useGetProjectTypes } from "../Project-type/services";

const ProjectsPage = () => {
  const { open, setOpen } = useProjectsStore();
  const [listParams, setListParams] = useState({
    pageSize: 10,
    currentPage: 1,
    search: "",
    clientId: undefined,
    priority: undefined,
    handlerId: undefined,
    projectTypeId: undefined,
  });

  const apiParams = {
    page: listParams.currentPage,
    limit: listParams.pageSize,
    search: listParams.search,
    pagination: true,
    clientId: listParams.clientId,
    priority: listParams.priority,
    handlerId: listParams.handlerId,
    projectTypeId: listParams.projectTypeId,
  };

  const { data: listData, isPending: loading } =
    useGetProjectListForListView(apiParams);
  const { data: ProjectType, isPending: LoadingProjectType }: any =
    useGetProjectTypes({
      pagination: false,
    });
  const { data: projecthandler, isPending: projecthandlerLoading }: any =
    useGetUsersList({
      role: ["project_manager", "team_lead"],
      pagination: false,
    });

  const { data: clientsList, isPending: clientListLoading }: any =
    useGetClientsData({
      pagination: false,
    });

  const totalCount = (listData as any)?.metadata?.totalCount;

  const handleSearch = (search: string | undefined) => {
    setListParams({ ...listParams, search: search ?? "", currentPage: 1 });
  };

  const handleProjectHandleChange = (value: any) => {
    setListParams({ ...listParams, handlerId: value ?? null, currentPage: 1 });
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

  const handlePriorityChange = (value: any) => {
    setListParams({
      ...listParams,
      priority: value ?? undefined,
      currentPage: 1,
    });
  };

  const handleProjectTypeChange = (value: any) => {
    setListParams({
      ...listParams,
      projectTypeId: value ?? undefined,
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
      key: "handlerId",
      placeholder: "Filter by  Coordinator",
      options: projecthandler?.data?.map((value: any) => {
        return { label: value?.fullName, value: value?.id };
      }),
      value: listParams.handlerId, // 👈 pre-selects if set
      onChange: handleProjectHandleChange,
      isLoading: projecthandlerLoading,
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
      value: listParams.priority,
      onChange: handlePriorityChange,
    },
    {
      type: "select",
      key: "projectTypeId",
      placeholder: "Filter by Project Type",
      options: ProjectType?.data?.map((value: any) => {
        return { label: value?.name, value: value?.id };
      }),
      value: listParams.projectTypeId,
      onChange: handleProjectTypeChange,
      isLoading: LoadingProjectType,
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
          clientsList={clientsList}
          clientListLoading={clientListLoading}
          projectTypes={ProjectType?.data}
          projectTypesLoading={LoadingProjectType}
          projecthandler={projecthandler}
          projecthandlerLoading={projecthandlerLoading}
        />
      )}
      <ViewProjectModal />
    </PageLayout>
  );
};

export default ProjectsPage;
