/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import PageLayout from "@/components/layout/layout-provider";
import { GlobalTable } from "@/components/table/global-table";
import GlobalFilterSection from "@/components/table/global-table-filter";
import TablePageHeader from "@/components/table/table-page-header";
import { FilterConfig } from "@/components/table/table-toolbar";
import { ActionFormModal } from "./components/action";
import { columns } from "./components/columns";
import { ViewUserModal } from "./components/view-model";
import { useUsersStore } from "./stores/useUsersStore";
import { useGetUsersList, useGetUsersRoles } from "./services";
import { useGetTechnologyDropdownList } from "../technology/services";
import { useAuthStore } from "@/stores/use-auth-store";
import { roleLabels, roles } from "@/utils/constant";

const UsersPage = () => {
  const { open, setOpen } = useUsersStore();
  const user = useAuthStore((state) => state.user);
  const UserRole = user?.user?.role;
  const isNewJoinee = location.pathname.includes("/New-joinees");
  const [listParams, setListParams] = useState({
    pageSize: 10,
    currentPage: 1,
    search: "",
    role: undefined,
    technologyId: null,
    status: "active",
  });

  const apiParams = {
    page: listParams.currentPage,
    limit: listParams.pageSize,
    search: listParams.search,
    pagination: true,
    role: listParams.role,
    technologyId: listParams.technologyId,
    status: listParams.status,
  };

  const { data: listData, isPending: loading } = useGetUsersList({
    ...apiParams,
    ...(isNewJoinee ? { is_joining: false } : { is_joining: true }),
  });

  const { data: technologyList, isPending: technologyListLoading }: any =
    useGetTechnologyDropdownList();

  const { data: roleList, isPending: roleListLoading }: any =
    useGetUsersRoles();

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

  const handleTechnologyChange = (value: any) => {
    setListParams({
      ...listParams,
      technologyId: value ?? null,
      currentPage: 1,
    });
  };

  const handleRoleChange = (value: any) => {
    setListParams({
      ...listParams,
      role: value ?? undefined,
      currentPage: 1,
    });
  };
  const handleStatusChange = (value: any) => {
    setListParams({
      ...listParams,
      status: value ?? undefined,
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
      key: "role",
      placeholder: "Filter by Role",
      options: roleList?.data?.map((role: any) => ({
        value: role,
        label: roleLabels[role]
          ? roleLabels[role]
          : role
              .split("_")
              .map((word: string) => word[0].toUpperCase() + word.slice(1))
              .join(" "),
      })),
      value: listParams.role,
      onChange: handleRoleChange,
      isLoading: roleListLoading,
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
      key: "status",
      placeholder: "Filter by Status",
      options: [
        {
          value: "active",
          label: "Active",
        },
        {
          value: "inactive",
          label: "Inactive",
        },
      ],
      value: listParams.status, // 👈 pre-selects if set
      onChange: handleStatusChange,
    },
  ];

  const handleAdd = () => {
    setOpen("add");
  };

  return (
    <PageLayout>
      <TablePageHeader
        title={`${isNewJoinee ? "New Joinee" : "Users"}`}
        buttonText="Add User"
        onButtonClick={handleAdd}
        showActionButton={
          UserRole === roles.ADMIN || UserRole === roles.PROJECT_MANAGER
            ? true
            : false
        }
      >
        {isNewJoinee
          ? "Manage your New Joinee here."
          : "Manage your Users here"}
        .
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
          technologyList={technologyList}
          technologyListLoading={technologyListLoading}
          roleList={roleList}
          roleListLoading={roleListLoading}
        />
      )}
      <ViewUserModal />
    </PageLayout>
  );
};

export default UsersPage;
