/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMemo } from "react";
import PageLayout from "@/components/layout/layout-provider";
import { GlobalTable } from "@/components/table/global-table";
import GlobalFilterSection from "@/components/table/global-table-filter";
import TablePageHeader from "@/components/table/table-page-header";
import { FilterConfig } from "@/components/table/table-toolbar";
import { ActionFormModal } from "./components/action";
import { getColumns } from "./components/columns";
import {
  SYSTEM_INVENTORY_MASTER_CONFIG,
  SystemInventoryMasterType,
} from "./constants";
import { useGetSystemInventoryTypes } from "./services";
import { useSystemInventoryMasterStore } from "./stores/useSystemInventoryMasterStore";
import { parseAsInteger, parseAsString, useQueryStates } from "nuqs";

interface Props {
  masterType?: SystemInventoryMasterType;
}

const SystemInventoryPage = ({ masterType = "processor" }: Readonly<Props>) => {
  const { open, setOpen } = useSystemInventoryMasterStore();
  const config = SYSTEM_INVENTORY_MASTER_CONFIG[masterType];
  const columns = useMemo(() => getColumns(config), [config]);

  const [queryParams, setQueryParams] = useQueryStates({
    pageSize: parseAsInteger.withDefault(10),
    currentPage: parseAsInteger.withDefault(1),
    search: parseAsString.withDefault(""),
  });

  const listParams = {
    pageSize: queryParams.pageSize,
    currentPage: queryParams.currentPage,
    search: queryParams.search,
  };

  const apiParams = {
    page: listParams.currentPage,
    limit: listParams.pageSize,
    search: listParams.search,
    pagination: true,
  };

  const { data: listData, isPending: loading } = useGetSystemInventoryTypes(
    config.api,
    apiParams
  );

  const totalCount = (listData as any)?.metadata?.totalCount;

  const handleSearch = (search: string | undefined) => {
    setQueryParams({ ...listParams, search: search ?? "", currentPage: 1 });
  };

  const handlePaginationChange = (newPagination: {
    pageIndex: number;
    pageSize: number;
  }) => {
    setQueryParams({
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
        title={config.pageTitle}
        buttonText={config.addButtonText}
        onButtonClick={handleAdd}
      >
        {config.description}
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
      {open && <ActionFormModal config={config} />}
    </PageLayout>
  );
};

export default SystemInventoryPage;
