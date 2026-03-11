/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import PageLayout from "@/components/layout/layout-provider";
import { GlobalTable } from "@/components/table/global-table";
import GlobalFilterSection from "@/components/table/global-table-filter";
import TablePageHeader from "@/components/table/table-page-header";
import { FilterConfig } from "@/components/table/table-toolbar";
import { columns } from "./components/columns";
import { ActionFormModal } from "./components/actions";
import { useOutboundSourcesStore } from "./stores/useOutboundSourcesStore";
import { useGetOutboundSource } from "./services";

const OutboundSourcePage = () => {
  const { open, setOpen } = useOutboundSourcesStore();
  const [listParams, setListParams] = useState({
    pageSize: 10,
    currentPage: 1,
    search: "",
  });

  const apiParams = {
    page: listParams.currentPage,
    limit: listParams.pageSize,
    search: listParams.search,
    pagination: true,
  };

  const { data: listData, isPending: loading } =
    useGetOutboundSource(apiParams);

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
        title="Outbound Source Types"
        buttonText="Add Source"
        onButtonClick={handleAdd}
      >
        Manage your Outbound Sources Types here.
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

export default OutboundSourcePage;
