import { useState } from "react";
import PageLayout from "@/components/layout/layout-provider";
import { GlobalTable } from "@/components/table/global-table";
import GlobalFilterSection from "@/components/table/global-table-filter";
import TablePageHeader from "@/components/table/table-page-header";
import { FilterConfig } from "@/components/table/table-toolbar";
import { ActionFormModal } from "./components/action";
import { columns } from "./components/columns";
import { useServerStore } from "./stores/useServerStore";
import { ViewServerModal } from "./components/view-model";

const ServerPage = () => {
  const { open, setOpen } = useServerStore();
  const [listParams, setListParams] = useState({
    pageSize: 10,
    currentPage: 1,
    search: "",
  });

  // const apiParams = {
  //   page: listParams.currentPage,
  //   limit: listParams.pageSize,
  //   search: listParams.search,
  //   pagination: true,
  // };

  // const { data: listData, isPending: loading } = useGetInquiry(apiParams);

  // const totalCount = (listData as any)?.metadata?.totalCount;

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
      placeholder: "Search by name ...",
      key: "search",
      value: listParams.search,
      onChange: handleSearch,
    },
  ];

  const handleAdd = () => {
    setOpen("add");
  };

  return (
    <PageLayout>
      <TablePageHeader
        title="Servers"
        buttonText="Add Server"
        onButtonClick={handleAdd}
      >
        Manage your Servers here.
      </TablePageHeader>
      <GlobalFilterSection filters={filters ?? []} />
      <GlobalTable
        pageSize={listParams.pageSize}
        currentPage={listParams.currentPage}
        totalCount={0}
        // totalCount={totalCount ?? 0}
        data={[]}
        // data={(listData as any)?.data ?? []}
        onPaginationChange={handlePaginationChange}
        columns={columns}
        // loading={loading}
        isPaginationEnabled
      />
      {open && <ActionFormModal />}
      <ViewServerModal />
    </PageLayout>
  );
};

export default ServerPage;
