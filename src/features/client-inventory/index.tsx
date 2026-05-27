/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMemo } from "react";
import PageLayout from "@/components/layout/layout-provider";
import { GlobalTable } from "@/components/table/global-table";
import GlobalFilterSection from "@/components/table/global-table-filter";
import TablePageHeader from "@/components/table/table-page-header";
import { FilterConfig } from "@/components/table/table-toolbar";
import {
  useGetClientInventoryList,
  useGetClientsDropdown,
  useGetProjectsDropdown,
  useGetInventoryTypesDropdown,
  useGetBrandsDropdown,
} from "./services";
import { columns } from "./components/columns";
import { ActionFormModal } from "./components/actions";
import { parseAsInteger, parseAsString, useQueryStates } from "nuqs";
import { useClientInventoryStore } from "./stores/useClientInventory";

const ClientInventoryPage = () => {
  const { open, setOpen } = useClientInventoryStore();

  const [queryParams, setQueryParams] = useQueryStates({
    pageSize: parseAsInteger.withDefault(10),
    currentPage: parseAsInteger.withDefault(1),
    search: parseAsString.withDefault(""),
    clientId: parseAsInteger,
    projectId: parseAsInteger,
    inventoryTypeId: parseAsInteger,
    brandId: parseAsInteger,
  });

  const listParams = {
    currentPage: queryParams.currentPage,
    pageSize: queryParams.pageSize,
    search: queryParams.search,
    clientId: queryParams.clientId ?? undefined,
    projectId: queryParams.projectId ?? undefined,
    inventoryTypeId: queryParams.inventoryTypeId ?? undefined,
    brandId: queryParams.brandId ?? undefined,
  };

  const apiParams = {
    page: listParams.currentPage,
    limit: listParams.pageSize,
    search: listParams.search,
    pagination: true,
    clientId: listParams.clientId,
    projectId: listParams.projectId,
    inventoryTypeId: listParams.inventoryTypeId,
    brandId: listParams.brandId,
  };

  const { data: clientsRes, isPending: clientsLoading } =
    useGetClientsDropdown();
  const { data: projectsRes, isPending: projectsLoading } =
    useGetProjectsDropdown();
  const { data: inventoryTypesRes, isPending: inventoryTypesLoading } =
    useGetInventoryTypesDropdown();
  const { data: brandsRes, isPending: brandsLoading } = useGetBrandsDropdown();

  const extractArray = (res: any) => {
    if (!res) return [];
    if (Array.isArray(res)) return res;
    if (res.data && Array.isArray(res.data)) return res.data;
    return [];
  };

  const clientsList = useMemo(() => extractArray(clientsRes), [clientsRes]);
  const projectsList = useMemo(() => extractArray(projectsRes), [projectsRes]);
  const inventoryTypesList = useMemo(
    () => extractArray(inventoryTypesRes),
    [inventoryTypesRes]
  );
  const brandsList = useMemo(() => extractArray(brandsRes), [brandsRes]);

  const { data: listData, isPending: loading } =
    useGetClientInventoryList(apiParams);

  const totalCount = (listData as any)?.metadata?.totalCount;

  // const handleSearch = (search: string | undefined) => {
  //   setQueryParams({ search: search ?? "", currentPage: 1 });
  // };

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
    // {
    //   type: "search",
    //   placeholder: "Search client inventory...",
    //   key: "search",
    //   value: listParams.search,
    //   onChange: handleSearch,
    // },
    {
      type: "select",
      key: "clientId",
      placeholder: "Filter by Client",
      options: clientsList?.map((c: any) => ({
        value: c.id ?? c._id ?? c.value,
        label: c.name ?? c.fullName ?? c.label,
      })),
      value: listParams.clientId,
      onChange: (value: any) => {
        setQueryParams({
          clientId: value ?? null,
          currentPage: 1,
        });
      },
      isLoading: clientsLoading,
    },
    {
      type: "select",
      key: "projectId",
      placeholder: "Filter by Project",
      options: projectsList?.map((p: any) => ({
        value: p.id ?? p._id ?? p.value,
        label: p.name ?? p.fullName ?? p.label,
      })),
      value: listParams.projectId,
      onChange: (value: any) => {
        setQueryParams({
          projectId: value ?? null,
          currentPage: 1,
        });
      },
      isLoading: projectsLoading,
    },
    {
      type: "select",
      key: "inventoryTypeId",
      placeholder: "Filter by Inventory Type",
      options: inventoryTypesList?.map((i: any) => ({
        value: i.id ?? i._id ?? i.value,
        label: i.name ?? i.fullName ?? i.label,
      })),
      value: listParams.inventoryTypeId,
      onChange: (value: any) => {
        setQueryParams({
          inventoryTypeId: value ?? null,
          currentPage: 1,
        });
      },
      isLoading: inventoryTypesLoading,
    },
    {
      type: "select",
      key: "brandId",
      placeholder: "Filter by Brand",
      options: brandsList?.map((b: any) => ({
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
      isLoading: brandsLoading,
    },
  ];

  const handleAdd = () => {
    setOpen("add");
  };

  return (
    <PageLayout>
      <TablePageHeader
        title="Client Inventory"
        buttonText="Add Inventory"
        onButtonClick={handleAdd}
      >
        Manage client physical inventory items here.
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

export default ClientInventoryPage;
