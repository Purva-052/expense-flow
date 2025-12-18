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
import { useTransactionStore } from "./stores";
import { useGetTransactionData } from "./services";
import { useGetProjectSDropdownList } from "../Project-type/services";
import {
  SubscriptionTypeOptions,
  TransactionTypeOptions,
} from "@/utils/constant";

const TransactionPage = () => {
  const { open, setOpen } = useTransactionStore();
  const [listParams, setListParams] = useState({
    pageSize: 10,
    currentPage: 1,
    search: "",
    projectId: undefined,
    transactionType: undefined,
    subscriptionCycle: undefined,
  });

  const apiParams = {
    page: listParams.currentPage,
    limit: listParams.pageSize,
    search: listParams.search,
    pagination: true,
    projectId: listParams.projectId,
    transactionType: listParams.transactionType,
  };

  const handleProjectChange = (value: any) => {
    setListParams({
      ...listParams,
      projectId: value ?? null,
      currentPage: 1,
    });
  };

  const { data: listData, isPending: loading } =
    useGetTransactionData(apiParams);
  const { data: projectsList, isPending: projectsListLoading }: any =
    useGetProjectSDropdownList();
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
      placeholder: "Search by reason or card number ...",
      key: "search",
      value: listParams.search,
      onChange: handleSearch,
    },
    {
      type: "select",
      key: "projectId",
      placeholder: "Filter by Project",
      options: projectsList?.data?.map((project: any) => {
        return { value: project.id, label: project.name };
      }),
      value: listParams.projectId,
      onChange: handleProjectChange,
      isLoading: projectsListLoading,
    },
    {
      type: "select",
      key: "transactionType",
      placeholder: "Filter by Transaction Type",
      options: TransactionTypeOptions,
      value: listParams.transactionType,
      onChange: (value: any) => {
        setListParams({
          ...listParams,
          transactionType: value ?? null,
          currentPage: 1,
        });
      },
      isLoading: false,
    },
    {
      type: "select",
      key: "SubscriptionCycle",
      placeholder: "Filter by Subscription Cycle",
      options: SubscriptionTypeOptions,
      value: listParams.subscriptionCycle,
      onChange: (value: any) => {
        setListParams({
          ...listParams,
          subscriptionCycle: value ?? null,
          currentPage: 1,
        });
      },
      isLoading: false,
    },
  ];

  const handleAdd = () => {
    setOpen("add");
  };

  return (
    <PageLayout>
      <TablePageHeader
        title="Transaction Logs"
        buttonText="Add Transaction"
        onButtonClick={handleAdd}
      >
        Manage your Transaction Logs here.
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

export default TransactionPage;
