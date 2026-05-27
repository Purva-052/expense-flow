/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMemo } from "react";
import PageLayout from "@/components/layout/layout-provider";
import { GlobalTable } from "@/components/table/global-table";
import GlobalFilterSection from "@/components/table/global-table-filter";
import TablePageHeader from "@/components/table/table-page-header";
import { FilterConfig } from "@/components/table/table-toolbar";
import { columns } from "./components/columns";
import { ActionFormModal } from "./components/actions";
import { parseAsInteger, parseAsString, useQueryStates } from "nuqs";
import { useDeviceStore } from "./stores/useDeviceStore";
import { useGetDeviceList } from "./services";
import { useGetBrandDropdown } from "@/features/system-inventory/services";

const DevicePage = () => {
  const { open, setOpen } = useDeviceStore();

  const [queryParams, setQueryParams] = useQueryStates({
    pageSize: parseAsInteger.withDefault(10),
    currentPage: parseAsInteger.withDefault(1),
    search: parseAsString.withDefault(""),
    brandId: parseAsInteger,
    osType: parseAsString,
  });

  const listParams = {
    currentPage: queryParams.currentPage,
    pageSize: queryParams.pageSize,
    search: queryParams.search,
    brandId: queryParams.brandId ?? undefined,
    osType: queryParams.osType ?? undefined,
  };

  const apiParams = {
    page: listParams.currentPage,
    limit: listParams.pageSize,
    search: listParams.search,
    pagination: true,
    brandId: listParams.brandId,
    osType: listParams.osType,
  };

  const { data: listData, isPending: loading } = useGetDeviceList(apiParams);
  const { data: brandDetails, isPending: brandLoading } = useGetBrandDropdown();

  const totalCount = (listData as any)?.metadata?.totalCount;

  const extractArray = (res: any) => {
    if (!res) return [];
    if (Array.isArray(res)) return res;
    if (res.data && Array.isArray(res.data)) return res.data;
    return [];
  };

  const brandList = useMemo(() => extractArray(brandDetails), [brandDetails]);

  const OPERATING_SYSTEM_OPTIONS = [
    { value: "Android", label: "Android" },
    { value: "ios", label: "iOS" },
  ];

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
      placeholder: "Search by name ...",
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
    {
      type: "select",
      key: "osType",
      placeholder: "Filter by OS",
      options: OPERATING_SYSTEM_OPTIONS,
      value: listParams.osType,
      onChange: (value: any) => {
        setQueryParams({
          osType: value ?? null,
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
        title="Device Management"
        buttonText="Add Device"
        onButtonClick={handleAdd}
      >
        Manage your Devices here.
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

export default DevicePage;
