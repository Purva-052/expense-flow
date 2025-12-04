import { useAuthStore } from "@/stores/use-auth-store";
import { useNewJoineeStore } from "./stores/useNewJoineeStore";
import { useState } from "react";
import { useGetNewJoineesList } from "./services";
import { useGetTechnologyDropdownList } from "../technology/services";
import { FilterConfig } from "@/components/table/table-toolbar";
import { roles } from "@/utils/constant";
import PageLayout from "@/components/layout/layout-provider";
import TablePageHeader from "@/components/table/table-page-header";
import GlobalFilterSection from "@/components/table/global-table-filter";
import { GlobalTable } from "@/components/table/global-table";
import { columns } from "./component/columns";
import { ActionFormModal } from "./component/action";
import { ViewNewJoineeModal } from "./component/view-modal";

const NewJoineesPage = () => {
  const { open, setOpen } = useNewJoineeStore();
  const user = useAuthStore((state) => state.user);
  const UserRole = user?.user?.role;
  const [listParams, setListParams] = useState({
    pageSize: 10,
    currentPage: 1,
    search: "",
    technologyId: null,
    status: undefined,
  });

  const apiParams = {
    page: listParams.currentPage,
    limit: listParams.pageSize,
    search: listParams.search,
    pagination: true,
    technologyId: listParams.technologyId,
    status: listParams.status,
  };

  const { data: listData, isPending: loading } =
    useGetNewJoineesList(apiParams);

  const { data: technologyList, isPending: technologyListLoading }: any =
    useGetTechnologyDropdownList();

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

  const filters: FilterConfig[] = [
    {
      type: "search",
      placeholder: "Search by Candidate name ...",
      key: "search",
      value: listParams.search,
      onChange: handleSearch,
    },
    {
      type: "select",
      key: "technologyId",
      placeholder: "Filter by Technology",
      options: technologyList?.data?.map((technology: any) => {
        return { value: technology.id, label: technology.name };
      }),
      value: listParams.technologyId,
      onChange: handleTechnologyChange,
      isLoading: technologyListLoading,
    },
    // {
    //   type: "select",
    //   key: "status",
    //   placeholder: "Filter by Status",
    //   options: [
    //     {
    //       value: "active",
    //       label: "Active",
    //     },
    //     {
    //       value: "inactive",
    //       label: "Inactive",
    //     },
    //   ],
    //   value: listParams.status,
    //   onChange: handleStatusChange,
    // },
  ];

  const handleAdd = () => {
    setOpen("add");
  };

  return (
    <PageLayout>
      <TablePageHeader
        title="To be Join"
        buttonText="Add New Joinee"
        onButtonClick={handleAdd}
        showActionButton={
          UserRole === roles.ADMIN || UserRole === roles.PROJECT_MANAGER
            ? true
            : false
        }
      >
        Manage your new joinees here.
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
        />
      )}
      <ViewNewJoineeModal />
    </PageLayout>
  );
};

export default NewJoineesPage;
