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
    purchaseDate: undefined as string | undefined,
    expiryDate: undefined as string | undefined,
    purchasedBy: undefined as number | undefined,
  });

  const apiParams = {
    page: listParams.currentPage,
    limit: listParams.pageSize,
    search: listParams.search,
    pagination: true,
    purchaseDate: listParams.purchaseDate,
    expiryDate: listParams.expiryDate,
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
      type: "date",
      key: "purchaseDate",
      placeholder: "Purchase Date",
      value: listParams.purchaseDate
        ? new Date(listParams.purchaseDate)
        : undefined,
      onChange: (date: Date | undefined) => {
        setListParams({
          ...listParams,
          purchaseDate: formatDate(date),
          currentPage: 1,
        });
      },
    },
    // Filter by Expiry Date
    {
      type: "date",
      key: "expiryDate",
      placeholder: "Expiry Date",
      value: listParams.expiryDate
        ? new Date(listParams.expiryDate)
        : undefined,
      onChange: (date: Date | undefined) => {
        setListParams({
          ...listParams,
          expiryDate: formatDate(date),
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
