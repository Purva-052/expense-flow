/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMemo } from "react";
import PageLayout from "@/components/layout/layout-provider";
import { GlobalTable } from "@/components/table/global-table";
import GlobalFilterSection from "@/components/table/global-table-filter";
import TablePageHeader from "@/components/table/table-page-header";
import { FilterConfig } from "@/components/table/table-toolbar";
import { columns } from "./components/columns";
import { ActionFormModal } from "./components/actions";
import { parseAsInteger, parseAsString, parseAsBoolean, useQueryStates } from "nuqs";
import { useMobileInventoryStore } from "./stores/useMobileInventoryStore";
import { useGetMobileInventoryList } from "./services";
import { useGetBrandDropdown } from "@/features/system-inventory/services";

const MobileInventoryPage = () => {
  const { open, setOpen } = useMobileInventoryStore();

  const [queryParams, setQueryParams] = useQueryStates({
    pageSize: parseAsInteger.withDefault(10),
    currentPage: parseAsInteger.withDefault(1),
    search: parseAsString.withDefault(""),
    brandId: parseAsInteger,
    isActive: parseAsBoolean,
  });

  const listParams = {
    currentPage: queryParams.currentPage,
    pageSize: queryParams.pageSize,
    search: queryParams.search,
    brandId: queryParams.brandId ?? undefined,
    isActive: queryParams.isActive ?? undefined,
  };

  const apiParams = {
    page: listParams.currentPage,
    limit: listParams.pageSize,
    search: listParams.search || undefined,
    pagination: true,
    brandId: listParams.brandId,
    isActive: listParams.isActive,
  };

  const { data: listData, isPending: loading } = useGetMobileInventoryList(apiParams);
  const { data: brandDetails, isPending: brandLoading } = useGetBrandDropdown();

  const totalCount = (listData as any)?.metadata?.totalCount;

  const extractArray = (res: any) => {
    if (!res) return [];
    if (Array.isArray(res)) return res;
    if (res.data && Array.isArray(res.data)) return res.data;
    return [];
  };

  const brandList = useMemo(() => extractArray(brandDetails), [brandDetails]);

  // const ACTIVE_STATUS_OPTIONS = [
  //   { value: "true", label: "Active" },
  //   { value: "false", label: "Inactive" },
  // ];

  const handleSearch = (search: string | undefined) => {
    setQueryParams({ search: search ?? "", currentPage: 1 });
  };

  const handlePaginationChange = (newPagination: {
    pageIndex: number;
    pageSize: number;
  }) => {
    setQueryParams({
      pageSize: newPagination.pageSize,
      currentPage: newPagination.pageIndex + 1,
    });
  };

  const filters: FilterConfig[] = [
    {
      type: "search",
      placeholder: "Search by model, serial number, OS ...",
      key: "search",
      value: listParams.search,
      onChange: handleSearch,
    },
    {
      type: "select",
      key: "brandId",
      placeholder: "Filter by Brand",
      options: brandList?.map((b: any) => ({
        value: b.id ?? b._id ?? b.value,
        label: b.name ?? b.fullName ?? b.label,
      })),
      value: listParams.brandId,
      onChange: (value: any) => {
        setQueryParams({
          brandId: value ?? null,
          currentPage: 1,
        });
      },
      isLoading: brandLoading,
    },
    // {
    //   type: "select",
    //   key: "isActive",
    //   placeholder: "Filter by Active Status",
    //   options: ACTIVE_STATUS_OPTIONS,
    //   value: listParams.isActive === undefined ? null : String(listParams.isActive),
    //   onChange: (value: any) => {
    //     setQueryParams({
    //       isActive: value === "true" ? true : value === "false" ? false : null,
    //       currentPage: 1,
    //     });
    //   },
    // },
  ];

  const handleAdd = () => {
    setOpen("add");
  };

  return (
    <PageLayout>
      <TablePageHeader
        title="Mobile Inventory"
        buttonText="Add Mobile Inventory"
        onButtonClick={handleAdd}
      >
        Manage your Mobile Inventories here.
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

export default MobileInventoryPage;
