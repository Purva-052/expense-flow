/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-explicit-any */
import PageLayout from "@/components/layout/layout-provider";
import { GlobalTable } from "@/components/table/global-table";
import GlobalFilterSection from "@/components/table/global-table-filter";
import TablePageHeader from "@/components/table/table-page-header";
import { FilterConfig } from "@/components/table/table-toolbar";
import { ActionFormModal } from "./components/action";
import { columns } from "./components/columns";
import { useClientsStore } from "./stores/useClientsStore";
import { useExportClientsData, useGetClientsData } from "./services";
import { ViewClientsModal } from "./components/view-model";
import { parseAsInteger, parseAsString, useQueryStates } from "nuqs";
import { format } from "date-fns";
import { toast } from "sonner";
import { Download } from "lucide-react";
import { useAuthStore } from "@/stores/use-auth-store";
import { roles } from "@/utils/constant";
import { Button } from "@/components/ui/button";

const ClientsPage = () => {
  const { open, setOpen } = useClientsStore();
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
  const { user } = useAuthStore();

  const userRole = user?.user?.role;

  const isPMUser = user?.user_id === "126";

  const { mutate: exportCSV, isPending: exportCSVLoading } =
    useExportClientsData();

  const canExportCSV = userRole === roles.ADMIN;

  const { data: listData, isPending: loading } = useGetClientsData(apiParams);

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

  const handleExportCSV = () => {
    // Use apiParams directly instead of localStorage
    const payload = Object.fromEntries(
      Object.entries(apiParams).filter(
        ([, value]) => value !== "" && value !== null && value !== undefined
      )
    );

    exportCSV(payload, {
      onSuccess: (response: any) => {
        const fileBlob = response?.blob;
        const filename =
          response?.filename ||
          `clients_export_${format(new Date(), "yyyy-MM-dd")}.xlsx`;

        if (fileBlob) {
          const fileUrl = URL.createObjectURL(fileBlob);
          const link = document.createElement("a");
          link.href = fileUrl;
          link.download = filename;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(fileUrl);
          toast.success("CSV export generated successfully");
        } else {
          console.error("No file URL found in response:", response);
          toast.error("Failed to generate CSV file");
        }
      },
      onError: (error: Error) => {
        console.error("CSV export failed:", error);
        // toast.error(error.message || "Failed to generate CSV file");
      },
    });
  };

  return (
    <PageLayout>
      <TablePageHeader
        title="Clients"
        buttonText="Add Client"
        onButtonClick={handleAdd}
        actions={
          (canExportCSV || isPMUser) && (
            <Button
              onClick={handleExportCSV}
              disabled={exportCSVLoading}
              className="whitespace-nowrap h-10 px-5"
            >
              {exportCSVLoading ? (
                "Exporting..."
              ) : (
                <>
                  <Download className="w-4 h-4 mr-2" />
                  Export CSV
                </>
              )}
            </Button>
          )
        }
      >
        Manage your Clients here.
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
      <ViewClientsModal />
    </PageLayout>
  );
};

export default ClientsPage;
