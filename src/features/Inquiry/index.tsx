/* eslint-disable @typescript-eslint/no-explicit-any */
import PageLayout from "@/components/layout/layout-provider";
import { GlobalTable } from "@/components/table/global-table";
import GlobalFilterSection from "@/components/table/global-table-filter";
import TablePageHeader from "@/components/table/table-page-header";
import { FilterConfig } from "@/components/table/table-toolbar";
import { useAuthStore } from "@/stores/use-auth-store";
import { roles } from "@/utils/constant";
import { useState } from "react";
import { ActionFormModal } from "./components/action";
import { columns } from "./components/columns";
import { ViewInquiryModal } from "./components/view-model";
import { useGetInquiry } from "./services";
import { useInquiryStore } from "./stores/useInquiryStore";
import { HistoryProjectModal } from "./components/history-modal";

const InquiryPage = () => {
  const { open, setOpen } = useInquiryStore();
  const user = useAuthStore((state) => state.user);
  const userRole = user?.user?.role;
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

  const { data: listData, isPending: loading } = useGetInquiry(apiParams);

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
        title="Inquiry "
        buttonText="Add Inquiry "
        onButtonClick={handleAdd}
        showActionButton={
          userRole === roles.BDE || userRole === roles.ADMIN ? true : false
        }
      >
        Manage your Inquiry here.
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
      <ViewInquiryModal />
      <HistoryProjectModal />
    </PageLayout>
  );
};

export default InquiryPage;
