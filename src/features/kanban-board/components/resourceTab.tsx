import PageLayout from "@/components/layout/layout-provider";
// import { useBoardStore } from "../store/useBoardStore";
import TablePageHeader from "@/components/table/table-page-header";
import GlobalFilterSection from "@/components/table/global-table-filter";
import { GlobalTable } from "@/components/table/global-table";
import { useState } from "react";
import { FilterConfig } from "@/components/table/table-toolbar";
import { ResourceColumn } from "./ResourceColumn";

const ResourceTab = () => {
  //   const { open, setOpen } = useBoardStore();
  const [listParams, setListParams] = useState({
    pageSize: 10,
    currentPage: 1,
    search: "",
  });

  //   const apiParams = {
  //     page: listParams.currentPage,
  //     limit: listParams.pageSize,
  //     search: listParams.search,
  //     pagination: true,
  //   };

  //   const { data: listData, isPending: loading } =
  //     useGetTechnologyData(apiParams);

  //   const totalCount = (listData as any)?.metadata?.totalCount;

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

  return (
    <PageLayout>
      <TablePageHeader title="Resources" showActionButton={false}>
        Manage your Resources here.
      </TablePageHeader>
      <GlobalFilterSection filters={filters ?? []} />
      <GlobalTable
        pageSize={listParams.pageSize}
        currentPage={listParams.currentPage}
        // totalCount={totalCount ?? 0}
        totalCount={0}
        // data={(listData as any)?.data ?? []}
        data={[]}
        onPaginationChange={handlePaginationChange}
        columns={ResourceColumn}
        // loading={loading}
        isPaginationEnabled
      />
    </PageLayout>
  );
};

export default ResourceTab;
