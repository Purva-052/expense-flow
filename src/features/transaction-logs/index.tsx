/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMemo } from "react";
import PageLayout from "@/components/layout/layout-provider";
import { GlobalTable } from "@/components/table/global-table";
import GlobalFilterSection from "@/components/table/global-table-filter";
import TablePageHeader from "@/components/table/table-page-header";
import { FilterConfig } from "@/components/table/table-toolbar";
import { ActionFormModal } from "./components/action";
import { columns } from "./components/columns";
import { ViewTransactionModal } from "./components/view-model";
import { useTransactionStore } from "./stores";
import { useGetTransactionData, useExportTransactionData } from "./services";
import { useGetProjectSDropdownList } from "../Project-type/services";
import {
  ACCOUNTANT_USER_IDS,
  roles,
  SubscriptionTypeOptions,
  TransactionTypeOptions,
} from "@/utils/constant";
import { useGetUserDropdownList } from "../users/services";
import { formatDate } from "@/utils/commonFunctions";
import { parseAsInteger, parseAsString, useQueryStates } from "nuqs";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { toast } from "sonner";
import { useAuthStore } from "@/stores/use-auth-store";

const TransactionPage = () => {
  const { open, setOpen } = useTransactionStore();

  const [queryParams, setQueryParams] = useQueryStates({
    pageSize: parseAsInteger.withDefault(10),
    currentPage: parseAsInteger.withDefault(1),
    search: parseAsString.withDefault(""),
    projectId: parseAsInteger,
    transactionType: parseAsString,
    subscriptionCycle: parseAsString,
    userId: parseAsInteger,
    transactionStartDate: parseAsString,
    transactionEndDate: parseAsString,
    tab: parseAsString.withDefault("requests"),
  });

  const listParams = {
    pageSize: queryParams.pageSize,
    currentPage: queryParams.currentPage,
    search: queryParams.search,
    projectId: queryParams.projectId ?? undefined,
    transactionType: queryParams.transactionType ?? undefined,
    subscriptionCycle: queryParams.subscriptionCycle ?? undefined,
    userId: queryParams.userId ?? undefined,
    tab: queryParams.tab,
    transactionStartDate: queryParams.transactionStartDate ?? undefined,
    transactionEndDate: queryParams.transactionEndDate ?? undefined,
  };

  const getStatusFromTab = (tab: string) => {
    if (tab === "completed") return ["completed"];
    if (tab === "rejected") return ["rejected"];
    return ["pending", "approved"];
  };

  const apiParams = {
    page: listParams.currentPage,
    limit: listParams.pageSize,
    search: listParams.search,
    pagination: true,
    projectId: listParams.projectId,
    transactionType: listParams.transactionType,
    subscriptionCycle: listParams.subscriptionCycle,
    userId: listParams.userId,
    status: getStatusFromTab(queryParams.tab),
    transactionStartDate: listParams.transactionStartDate,
    transactionEndDate: listParams.transactionEndDate,
  };

  const handleProjectChange = (value: any) => {
    setQueryParams({
      ...listParams,
      projectId: value ?? null,
      currentPage: 1,
    });
  };

  const { data: listData, isPending: loading } =
    useGetTransactionData(apiParams);
  const { mutate: exportCSV, isPending: exportCSVLoading } =
    useExportTransactionData();
  const { data: projectsList, isPending: projectsListLoading }: any =
    useGetProjectSDropdownList();
  const totalCount = (listData as any)?.metadata?.totalCount;
  const { data: usersList, isPending: usersListLoading }: any =
    useGetUserDropdownList({
      role: [roles.TEAM_LEAD, roles.ADMIN, roles.PROJECT_MANAGER, roles.BDE],
      status: "active",
    });

  const user = useAuthStore((state) => state.user);
  const userRole = user?.user?.role;
  const isAccountManager = [169, 170, 171].includes(Number(user?.user.id));

  const hasExportPermission =
    userRole === roles.ADMIN ||
    userRole === roles.PROJECT_MANAGER ||
    isAccountManager;

  const filteredUsersList = usersList?.data?.filter(
    (user: any) => !ACCOUNTANT_USER_IDS.includes(Number(user?.id))
  );

  const userOptions = useMemo(() => {
    if (!filteredUsersList) return [];

    const baseOptions = filteredUsersList.map((user: any) => ({
      value: user.id,
      label: user.fullName,
    }));

    const hasUser86 = baseOptions.some((opt: any) => Number(opt.value) === 86);
    if (!hasUser86) {
      return [{ value: 86, label: "Bhavdeep Devmurari" }, ...baseOptions];
    }
    return baseOptions;
  }, [filteredUsersList]);

  const handleSearch = (search: string | undefined) => {
    setQueryParams({ ...listParams, search: search ?? "", currentPage: 1 });
  };

  const handleExportCSV = () => {
    const payload = {
      search: apiParams.search || undefined,
      projectId: apiParams.projectId || undefined,
      transactionType: apiParams.transactionType || undefined,
      subscriptionCycle: apiParams.subscriptionCycle || undefined,
      userId: apiParams.userId || undefined,
      status: apiParams.status || undefined,
      transactionStartDate: apiParams.transactionStartDate || undefined,
      transactionEndDate: apiParams.transactionEndDate || undefined,
    };

    const cleanedPayload = Object.fromEntries(
      Object.entries(payload).filter(
        ([, value]) => value !== "" && value !== null && value !== undefined
      )
    );

    exportCSV(cleanedPayload, {
      onSuccess: (response: any) => {
        const fileBlob = response?.blob;
        const filename =
          response?.filename ||
          `transaction_logs_export_${new Date().toISOString().split("T")[0]}.xlsx`;

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
          toast.error("Failed to generate CSV file");
        }
      },
      onError: (error: Error) => {
        toast.error(error.message || "Failed to generate CSV file");
      },
    });
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
      placeholder: "Search by reason , amount or card number ...",
      key: "search",
      value: listParams.search,
      onChange: handleSearch,
    },
    {
      type: "dateRange",
      key: "transactionDate",
      placeholder: "Filter by Transaction Date",
      value: {
        from: listParams.transactionStartDate
          ? new Date(listParams.transactionStartDate)
          : undefined,
        to: listParams.transactionEndDate
          ? new Date(listParams.transactionEndDate)
          : undefined,
      },
      onChange: (range: { from?: Date; to?: Date } | undefined) => {
        setQueryParams({
          ...listParams,
          transactionStartDate: formatDate(range?.from) ?? null,
          transactionEndDate: formatDate(range?.to) ?? null,
          currentPage: 1,
        });
      },
    },
    {
      type: "select",
      key: "projectId",
      placeholder: "Filter by Project",
      options: projectsList?.data?.map((project: any) => {
        return { value: project.id, label: project.name };
      }),
      value: listParams.projectId,
      onChange: handleProjectChange,
      isLoading: projectsListLoading,
    },
    {
      type: "select",
      key: "transactionType",
      placeholder: "Filter by Transaction Type",
      options: TransactionTypeOptions,
      value: listParams.transactionType,
      onChange: (value: any) => {
        setQueryParams({
          ...listParams,
          transactionType: value ?? null,
          currentPage: 1,
        });
      },
      isLoading: false,
    },
    {
      type: "select",
      key: "SubscriptionCycle",
      placeholder: "Filter by Subscription Cycle",
      options: SubscriptionTypeOptions,
      value: listParams.subscriptionCycle,
      onChange: (value: any) => {
        setQueryParams({
          ...listParams,
          subscriptionCycle: value ?? null,
          currentPage: 1,
        });
      },
      isLoading: false,
    },
    {
      type: "select",
      key: "userId",
      placeholder: "Filter by User",
      options: userOptions,
      value: listParams.userId,
      onChange: (value: any) => {
        setQueryParams({
          ...listParams,
          userId: value ?? null,
          currentPage: 1,
        });
      },
      isLoading: usersListLoading,
    },
  ];

  const handleTabChange = (val: string) => {
    setQueryParams({
      ...listParams,
      tab: val,
      currentPage: 1,
    });
  };

  const handleAdd = () => {
    setOpen("add");
  };

  const tabTriggerClass =
    "flex items-center gap-2 rounded-[50px] !px-3 !py-2 transition-all h-[35px] " +
    "text-foreground/70 hover:text-foreground " +
    "data-[state=active]:bg-foreground data-[state=active]:text-background data-[state=active]:shadow-sm " +
    "dark:text-muted-foreground dark:hover:text-foreground " +
    "dark:data-[state=active]:bg-primary dark:data-[state=active]:text-white dark:data-[state=active]:shadow-[0_2px_8px_oklch(0_0_0/0.5)]";

  return (
    <PageLayout>
      <TablePageHeader
        title="Transaction Logs"
        buttonText="Request Transaction"
        onButtonClick={handleAdd}
        actions={
          hasExportPermission && (
            <Button onClick={handleExportCSV} disabled={exportCSVLoading}>
              <Download />
              {exportCSVLoading ? "Exporting CSV ..." : "Export CSV"}
            </Button>
          )
        }
      >
        Manage your Transaction Logs here.
      </TablePageHeader>

      <div className="flex flex-col gap-4 py-2">
        <Tabs
          value={queryParams.tab}
          onValueChange={handleTabChange}
          className="w-full"
        >
          <TabsList className="bg-[#fdebef] rounded-full dark:bg-muted dark:border-white/10 border border-rose-100/50 h-9 w-fit">
            <TabsTrigger value="requests" className={tabTriggerClass}>
              Pending & Approved
            </TabsTrigger>
            <TabsTrigger value="completed" className={tabTriggerClass}>
              Completed
            </TabsTrigger>
            <TabsTrigger value="rejected" className={tabTriggerClass}>
              Rejected
            </TabsTrigger>
          </TabsList>
        </Tabs>

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
      </div>

      {open && <ActionFormModal />}
      <ViewTransactionModal />
    </PageLayout>
  );
};

export default TransactionPage;
