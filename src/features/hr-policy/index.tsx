/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMemo } from "react";
import PageLayout from "@/components/layout/layout-provider";
import { GlobalTable } from "@/components/table/global-table";
import GlobalFilterSection from "@/components/table/global-table-filter";
import TablePageHeader from "@/components/table/table-page-header";
import { FilterConfig } from "@/components/table/table-toolbar";
import { getColumns } from "./components/columns";
import { useHRPolicyStore } from "./stores/useHRPolicyStore";
import { ActionFormModal } from "./components/actions";
import { useGetHRPolicyList } from "./services";
import { parseAsInteger, parseAsString, useQueryStates } from "nuqs";
import { useAuthStore } from "@/stores/use-auth-store";
import { roles } from "@/utils/constant";

const HRPolicyPage = () => {
  const { open, setOpen } = useHRPolicyStore();

  const user = useAuthStore((state) => state.user);
  const userRole = user?.user?.role;
  const isAdmin = userRole === roles.ADMIN;

  const [queryParams, setQueryParams] = useQueryStates({
    pageSize: parseAsInteger.withDefault(10),
    currentPage: parseAsInteger.withDefault(1),
    search: parseAsString.withDefault(""),
  });

  const listParams = {
    currentPage: queryParams.currentPage,
    pageSize: queryParams.pageSize,
    search: queryParams.search,
  };

  const { data: listData, isPending: loading } = useGetHRPolicyList();

  const dataList = useMemo(() => {
    if (!listData) return [];
    
    // Case 1: Direct array of policies
    if (Array.isArray(listData)) {
      return listData;
    }
    
    if (listData && typeof listData === "object") {
      const anyData = listData as any;
      
      // Check if it has a 'data' property
      if ("data" in anyData) {
        const nestedData = anyData.data;
        if (!nestedData) return [];
        
        // Case 3: nested data is an array
        if (Array.isArray(nestedData)) {
          return nestedData;
        }
        
        // Case 5: nested data has rows property
        if (typeof nestedData === "object") {
          if (Array.isArray(nestedData.rows)) {
            return nestedData.rows;
          }
          // Case 6: nested rows is a single object
          if (nestedData.rows && typeof nestedData.rows === "object" && nestedData.rows.id) {
            return [nestedData.rows];
          }
          // Case 4: nested data is a single policy object
          if (nestedData.id && nestedData.title) {
            return [nestedData];
          }
        }
      }
      
      // Case 2: direct raw object (no data property)
      if (anyData.id && anyData.title) {
        return [anyData];
      }
    }
    return [];
  }, [listData]);

  const totalCount = useMemo(() => {
    if (!listData) return 0;
    const anyData = listData as any;
    if (anyData.metadata && typeof anyData.metadata.totalCount === "number") {
      return anyData.metadata.totalCount;
    }
    if (anyData.data && anyData.data.count !== undefined) {
      return anyData.data.count;
    }
    return dataList.length;
  }, [listData, dataList]);

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
      placeholder: "Search by title ...",
      key: "search",
      value: listParams.search,
      onChange: handleSearch,
    },
  ];

  const handleAdd = () => {
    setOpen("add");
  };

  const columns = useMemo(() => getColumns(isAdmin), [isAdmin]);

  return (
    <PageLayout>
      <TablePageHeader
        title="HR Policies"
        buttonText="Add HR Policy"
        onButtonClick={handleAdd}
        showActionButton={isAdmin}
      >
        View and manage organizational HR Policies and guidelines.
      </TablePageHeader>
      <GlobalFilterSection filters={filters ?? []} />
      <GlobalTable
        pageSize={listParams.pageSize}
        currentPage={listParams.currentPage}
        totalCount={totalCount}
        data={dataList}
        onPaginationChange={handlePaginationChange}
        columns={columns}
        loading={loading}
        isPaginationEnabled
      />
      {open && <ActionFormModal />}
    </PageLayout>
  );
};

export default HRPolicyPage;
