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
import {
  useGetProjectListForListView,
  useGetProjectPriorityDropdownList,
} from "./services";
import { useGetClientsDropdownList } from "../clients/services";
import { useGetUserDropdownList } from "../users/services";
import { useGetProjectTypesDropdownList } from "../Project-type/services";
import { HistoryProjectModal } from "./components/history-modal";
import { useGetTechnologyDropdownList } from "../technology/services";

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
    technologyId: undefined,
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
    technologyId: listParams.technologyId,
  };

  const { data: listData, isPending: loading } =
    useGetProjectListForListView(apiParams);
  const { data: ProjectType, isPending: LoadingProjectType }: any =
    useGetProjectTypesDropdownList();
  const { data: projecthandler, isPending: projecthandlerLoading }: any =
    useGetUserDropdownList();
  const { data: PriorityList, isPending: PriorityListLoading }: any =
    useGetProjectPriorityDropdownList();
  const { data: technologyList, isPending: technologyListLoading }: any =
    useGetTechnologyDropdownList();

  const { data: clientsList, isPending: clientListLoading }: any =
    useGetClientsDropdownList();

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

  const handleTechnologyChange = (value: any) => {
    setListParams({
      ...listParams,
      technologyId: value ?? null,
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
      key: "technologyId",
      placeholder: "Filter by Technology",
      options: technologyList?.data?.map((technology: any) => {
        return { value: technology.id, label: technology.name };
      }),
      value: listParams.technologyId, // 👈 pre-selects if set
      onChange: handleTechnologyChange,
      isLoading: technologyListLoading,
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
      options: PriorityList?.data?.map((value: any) => ({
        label: value,
        value: value,
      })),
      value: listParams.priority,
      onChange: handlePriorityChange,
      isLoading: PriorityListLoading,
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
          technologyList={technologyList}
          technologyListLoading={technologyListLoading}
        />
      )}
      <ViewProjectModal />
      <HistoryProjectModal />
    </PageLayout>
  );
};

export default ProjectsPage;
