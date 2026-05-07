/* eslint-disable @typescript-eslint/no-explicit-any */
import PageLayout from "@/components/layout/layout-provider";
import { GlobalTable } from "@/components/table/global-table";
import GlobalFilterSection from "@/components/table/global-table-filter";
import TablePageHeader from "@/components/table/table-page-header";
import { FilterConfig } from "@/components/table/table-toolbar";
import { parseAsInteger, parseAsString, useQueryStates } from "nuqs";
import { useProductInquiryStore } from "./stores/useProductInquiry";
import { useGetProductInquiryList } from "./services";
import { getColumns } from "./components/columns";
import { ActionFormModal } from "./components/actions";
import { useMemo } from "react";
import { useGetIndustryDropdownList } from "../industry/services";
import { PRODUCT_INQUIRY_STATUS_OPTIONS } from "@/utils/constant";

const ProductInquiryPage = () => {
  const { setOpen } = useProductInquiryStore();

  const [queryParams, setQueryParams] = useQueryStates({
    pageSize: parseAsInteger.withDefault(10),
    currentPage: parseAsInteger.withDefault(1),
    search: parseAsString.withDefault(""),
    industryId: parseAsString.withDefault(""),
    status: parseAsString.withDefault(""),
  });

  const apiParams = {
    page: queryParams.currentPage,
    limit: queryParams.pageSize,
    search: queryParams.search,
    industryId: queryParams.industryId || undefined,
    status: queryParams.status || undefined,
    pagination: true,
  };

  const { data: listData, isPending: loading } =
    useGetProductInquiryList(apiParams);
  const { data: industryDropdownData, isPending: loadingIndustry }: any =
    useGetIndustryDropdownList();

  const totalCount = (listData as any)?.metadata?.totalCount ?? 0;

  const handleSearch = (search: string | undefined) => {
    setQueryParams({ search: search ?? "", currentPage: 1 });
  };

  const handleIndustryFilter = (industryId?: string) => {
    setQueryParams({ industryId: industryId ?? "", currentPage: 1 });
  };

  const handleStatusFilter = (status?: string) => {
    setQueryParams({ status: status ?? "", currentPage: 1 });
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
      placeholder: "Search by company name ...",
      key: "search",
      value: queryParams.search,
      onChange: handleSearch,
    },
    {
      type: "select",
      key: "industryId",
      placeholder: "Filter by industry",
      value: queryParams.industryId || undefined,
      onChange: handleIndustryFilter,
      isLoading: loadingIndustry,
      options: (industryDropdownData?.data ?? []).map((industry: any) => ({
        value: String(industry.id),
        label: industry.name,
      })),
    },
    {
      type: "select",
      key: "status",
      placeholder: "Filter by status",
      value: queryParams.status || undefined,
      onChange: handleStatusFilter,
      options: PRODUCT_INQUIRY_STATUS_OPTIONS,
    },
  ];

  const handleAdd = () => {
    setOpen("add");
  };

  const columns = useMemo(() => getColumns(), []);

  return (
    <PageLayout className="h-[calc(100vh-100px)] overflow-y-auto flex flex-col">
      <TablePageHeader
        title="Product Inquiries"
        buttonText="Add Inquiry"
        onButtonClick={handleAdd}
      >
        Manage your product inquiries and trial requests here.
      </TablePageHeader>

      <div className="space-y-4">
        <GlobalFilterSection
          filters={filters}
          className="!my-3 flex flex-wrap gap-2"
        />

        <GlobalTable
          pageSize={queryParams.pageSize}
          currentPage={queryParams.currentPage}
          totalCount={totalCount}
          data={(listData as any)?.data ?? []}
          onPaginationChange={handlePaginationChange}
          columns={columns}
          loading={loading}
          isPaginationEnabled
          enableSorting
        />
      </div>

      <ActionFormModal />
    </PageLayout>
  );
};

export default ProductInquiryPage;
