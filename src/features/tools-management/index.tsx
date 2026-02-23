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
import { useToolsStore } from "./stores";
import { useGetToolsData } from "./services";
import { useGetUserDropdownList } from "../users/services";
import { roles } from "@/utils/constant";

const ToolsManagementPage = () => {
  const { open, setOpen } = useToolsStore();
  const [listParams, setListParams] = useState({
    pageSize: 10,
    currentPage: 1,
    search: "",
    purchasedFromDate: undefined as string | undefined,
    purchasedToDate: undefined as string | undefined,
    expiryFromDate: undefined as string | undefined,
    expiryToDate: undefined as string | undefined,
    purchasedBy: undefined as number | undefined,
  });

  const apiParams = {
    page: listParams.currentPage,
    limit: listParams.pageSize,
    search: listParams.search,
    pagination: true,
    purchasedFromDate: listParams.purchasedFromDate,
    purchasedToDate: listParams.purchasedToDate,
    expiryFromDate: listParams.expiryFromDate,
    expiryToDate: listParams.expiryToDate,
    purchasedBy: listParams.purchasedBy,
  };

  const formatDate = (date?: Date) => {
    if (!date) return undefined;
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  };

  const { data: listData, isPending: loading } = useGetToolsData(apiParams);

  const { data: usersList, isPending: usersListLoading }: any =
    useGetUserDropdownList({
      role: [
        roles.TEAM_LEAD,
        roles.ADMIN,
        roles.PROJECT_MANAGER,
        roles.DEVELOPER,
      ],
      status: "active",
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

  const filters: FilterConfig[] = [
    {
      type: "search",
      placeholder: "Search tools...",
      key: "search",
      value: listParams.search,
      onChange: handleSearch,
    },
    // Filter by Purchased By
    {
      type: "select",
      key: "purchasedBy",
      placeholder: "Purchased By",
      options: usersList?.data?.map((user: any) => ({
        value: user.id,
        label: user.fullName,
      })),
      value: listParams.purchasedBy?.toString(),
      onChange: (value: any) => {
        setListParams({
          ...listParams,
          purchasedBy: value ? Number(value) : undefined,
          currentPage: 1,
        });
      },
      isLoading: usersListLoading,
    },
    // Filter by Purchase Date
    {
      type: "dateRange",
      key: "purchaseDate",
      placeholder: "Filter by purchase Date",
      value: {
        from: listParams.purchasedFromDate
          ? new Date(listParams.purchasedFromDate)
          : undefined,
        to: listParams.purchasedToDate
          ? new Date(listParams.purchasedToDate)
          : undefined,
      },
      onChange: (range: { from?: Date; to?: Date } | undefined) => {
        setListParams({
          ...listParams,
          purchasedFromDate: formatDate(range?.from) ?? undefined,
          purchasedToDate: formatDate(range?.to) ?? undefined,
          currentPage: 1,
        });
      },
    },
    // Filter by Expiry Date
    {
      type: "dateRange",
      key: "expiryDate",
      placeholder: "Filter by expiry Date",
      value: {
        from: listParams.expiryFromDate
          ? new Date(listParams.expiryFromDate)
          : undefined,
        to: listParams.expiryToDate
          ? new Date(listParams.expiryToDate)
          : undefined,
      },
      onChange: (range: { from?: Date; to?: Date } | undefined) => {
        setListParams({
          ...listParams,
          expiryFromDate: formatDate(range?.from) ?? undefined,
          expiryToDate: formatDate(range?.to) ?? undefined,
          currentPage: 1,
        });
      },
    },
  ];

  const handleAdd = () => {
    setOpen("add");
  };

  return (
    <PageLayout>
      <TablePageHeader
        title="Tools Management"
        buttonText="Add Tool"
        onButtonClick={handleAdd}
      >
        Manage purchased tools and licenses.
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

export default ToolsManagementPage;
