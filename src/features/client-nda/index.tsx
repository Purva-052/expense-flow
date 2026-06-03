/* eslint-disable @typescript-eslint/no-explicit-any */
import PageLayout from "@/components/layout/layout-provider";
import { GlobalTable } from "@/components/table/global-table";
import GlobalFilterSection from "@/components/table/global-table-filter";
import TablePageHeader from "@/components/table/table-page-header";
import { FilterConfig } from "@/components/table/table-toolbar";
import { ActionFormModal } from "./components/actions";
import { columns } from "./components/columns";
import { useClientNDAStore } from "./stores/useClientNDA";
import { useGetNDAList, useGetCountryDropdown } from "./services";
import { parseAsInteger, parseAsString, useQueryStates } from "nuqs";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useAuthStore } from "@/stores/use-auth-store";
import API from "@/config/api/api";
import { toast } from "sonner";

const ClientNDAPage = () => {
  const { open, setOpen, setCurrentRow } = useClientNDAStore();
  const queryClient = useQueryClient();

  const [queryParams, setQueryParams] = useQueryStates({
    pageSize: parseAsInteger.withDefault(10),
    currentPage: parseAsInteger.withDefault(1),
    search: parseAsString.withDefault(""),
    status: parseAsString.withDefault(""),
    country: parseAsString.withDefault(""),
  });

  const listParams = {
    pageSize: queryParams.pageSize,
    currentPage: queryParams.currentPage,
    search: queryParams.search,
    status: queryParams.status,
    country: queryParams.country,
  };

  const apiParams = {
    page: listParams.currentPage,
    limit: listParams.pageSize,
    search: listParams.search,
    status: listParams.status || undefined,
    country: listParams.country || undefined,
    pagination: true,
  };

  const { data: listData, isPending: loading } = useGetNDAList(apiParams);
  const { data: countryData } = useGetCountryDropdown();

  const countryOptions =
    (countryData as any)?.data?.map((country: any) => ({
      value: country.name,
      label: country.name,
    })) || [];

  const statusOptions = [
    { value: "draft", label: "Draft" },
    { value: "sent", label: "Sent" },
    { value: "signed", label: "Signed" },
    { value: "rejected", label: "Rejected" },
  ];

  const totalCount = (listData as any)?.metadata?.totalCount || (listData as any)?.meta?.totalCount;

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

  const handleStatusChange = (status: string | undefined) => {
    setQueryParams({
      ...listParams,
      status: status ?? "",
      currentPage: 1,
    });
  };

  const handleCountryChange = (country: string | undefined) => {
    setQueryParams({
      ...listParams,
      country: country ?? "",
      currentPage: 1,
    });
  };

  const filters: FilterConfig[] = [
    {
      type: "search",
      placeholder: "Search by client name or email...",
      key: "search",
      value: listParams.search,
      onChange: handleSearch,
    },
    {
      type: "select",
      placeholder: "Filter by Status",
      key: "status",
      value: listParams.status || undefined,
      options: statusOptions,
      onChange: handleStatusChange,
    },
    {
      type: "select",
      placeholder: "Filter by Country",
      key: "country",
      value: listParams.country || undefined,
      options: countryOptions,
      onChange: handleCountryChange,
    },
  ];

  // Action Mutators
  const { mutate: sendSigningLink } = useMutation({
    mutationFn: async (id: string) => {
      const baseURL = import.meta.env.VITE_API_BASE_URL;
      const token =
        useAuthStore.getState().user?.token ?? useAuthStore.getState().token;
      const response = await axios.post(
        `${baseURL}${API.client_NDA.send(id)}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [API.client_NDA.list] });
      toast.success("Signing link sent successfully");
    },
    onError: (err: any) => {
      const errorMsg = err.response?.data?.message || err.message || "Failed to send signing link";
      toast.error(errorMsg);
    },
  });

  const { mutate: downloadSignedNDA } = useMutation({
    mutationFn: async (row: any) => {
      const baseURL = import.meta.env.VITE_API_BASE_URL;
      const token =
        useAuthStore.getState().user?.token ?? useAuthStore.getState().token;
      const response = await axios.get(
        `${baseURL}${API.client_NDA.download(row.id)}`,
        {
          responseType: "blob",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return { blob: response.data, name: row.clientName || "Client" };
    },
    onSuccess: (data: any) => {
      const fileUrl = URL.createObjectURL(data.blob);
      const link = document.createElement("a");
      link.href = fileUrl;
      link.download = `Signed_NDA_${data.name}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(fileUrl);
      toast.success("Signed NDA downloaded successfully");
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to download signed NDA");
    },
  });

  const handleSend = (row: any) => {
    sendSigningLink(row.id);
  };

  const handleDownload = (row: any) => {
    downloadSignedNDA(row);
  };

  const handlePreview = (row: any) => {
    setCurrentRow(row);
    setOpen("preview");
  };

  const handleDelete = (row: any) => {
    setCurrentRow(row);
    setOpen("delete");
  };

  const handleAdd = () => {
    setOpen("add");
  };

  return (
    <PageLayout>
      <TablePageHeader
        title="Client NDA"
        buttonText="Create NDA"
        onButtonClick={handleAdd}
      >
        Create, preview, and send non-disclosure agreements for signature.
      </TablePageHeader>
      <GlobalFilterSection filters={filters} />
      <GlobalTable
        pageSize={listParams.pageSize}
        currentPage={listParams.currentPage}
        totalCount={totalCount ?? 0}
        data={(listData as any)?.data ?? []}
        onPaginationChange={handlePaginationChange}
        columns={columns(handleSend, handleDownload, handlePreview, handleDelete)}
        loading={loading}
        isPaginationEnabled
      />
      {open && <ActionFormModal />}
    </PageLayout>
  );
};

export default ClientNDAPage;
