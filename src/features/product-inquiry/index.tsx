/* eslint-disable @typescript-eslint/no-explicit-any */
import PageLayout from "@/components/layout/layout-provider";
import GlobalFilterSection from "@/components/table/global-table-filter";
import TablePageHeader from "@/components/table/table-page-header";
import { FilterConfig } from "@/components/table/table-toolbar";
import { parseAsInteger, parseAsString, useQueryStates } from "nuqs";
import { useProductInquiryStore } from "./stores/useProductInquiry";
import {
  useExportCSV,
  useGetProductInquiryListInfinite,
  useGetProductInquiryStats,
} from "./services";
import { ActionFormModal } from "./components/actions";
import { useEffect, useMemo, useRef, useState } from "react";
import { useGetIndustryDropdownList } from "../industry/services";
import { PRODUCT_INQUIRY_STATUS_OPTIONS } from "@/utils/constant";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Download,
  LayoutGrid,
  List,
  Table as TableIcon,
} from "lucide-react";
import { toast } from "sonner";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { ProjectCardSkeleton } from "@/components/layout/project-card-skeleton";
import { useInView } from "react-intersection-observer";
import { InquiryCard } from "./components/product-inquiry-card";
import { GlobalTable } from "@/components/table/global-table";
import { getColumns } from "./components/columns";
import { ProductInquiryStats } from "./components/product-inquiry-stats";
import { useGetProductInquiryList } from "./services";
import { formatDate } from "@/utils/commonFunctions";

const ProductInquiryPage = () => {
  const { setOpen, silencedInquiries } = useProductInquiryStore();
  const skeletonCount = 9;

  const [view, setView] = useState<"grid" | "list" | "table">(() => {
    const stored = localStorage.getItem("productInquiryViewType") as
      | "grid"
      | "list"
      | "table"
      | null;
    return stored || "grid";
  });

  const handleViewChange = (v: string) => {
    setView(v as "grid" | "list" | "table");
    localStorage.setItem("productInquiryViewType", v);
  };

  const [queryParams, setQueryParams] = useQueryStates({
    search: parseAsString.withDefault(""),
    industryId: parseAsString.withDefault(""),
    status: parseAsString.withDefault(""),
    drilled: parseAsString.withDefault(""),
    productId: parseAsString.withDefault(""),
    fromDate: parseAsString,
    toDate: parseAsString,
    pageSize: parseAsInteger.withDefault(10),
    currentPage: parseAsInteger.withDefault(1),
  });

  const [activeTab, setActiveTab] = useState<"active" | "inactive">("active");

  const currentView = activeTab === "inactive" ? "table" : view;

  const handleTabChange = (newTab: "active" | "inactive") => {
    setActiveTab(newTab);
    setQueryParams({
      status: "",
      currentPage: 1,
      productId: "",
      drilled: "",
      fromDate: null,
      toDate: null,
    });
  };

  const isSearchActive = queryParams.drilled === "true";

  useEffect(() => {
    if (!isSearchActive) {
      const stored = localStorage.getItem("productInquiryViewType") as
        | "grid"
        | "list"
        | "table"
        | null;
      const targetView = stored || "grid";
      if (view !== targetView) {
        setView(targetView);
      }
    }
  }, [isSearchActive]);

  const apiParams = {
    search: queryParams.search || undefined,
    industryId: queryParams.industryId || undefined,
    status: queryParams.status || activeTab,
    productId: queryParams.productId || undefined,
    fromDate: queryParams.fromDate || undefined,
    toDate: queryParams.toDate || undefined,
    pagination: true,
  };

  const {
    data: inquiryPages,
    isPending: loading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useGetProductInquiryListInfinite(apiParams);

  const { data: statsData, isPending: loadingStats } =
    useGetProductInquiryStats(
      {
        productId: queryParams.productId,
        fromDate: queryParams.fromDate || undefined,
        toDate: queryParams.toDate || undefined,
      },
      isSearchActive
    );
  const stats = (statsData as any)?.data;

  const { mutate: exportCSV, isPending: exportCSVLoading } = useExportCSV();
  const { data: industryDropdownData, isPending: loadingIndustry }: any =
    useGetIndustryDropdownList();

  // Table view data — only fetched when in table mode to avoid duplicate API calls
  const { data: tableData, isPending: loadingTable } = useGetProductInquiryList(
    currentView === "table"
      ? {
        ...apiParams,
        page: queryParams.currentPage,
        limit: queryParams.pageSize,
      }
      : null
  );

  const columns = useMemo(() => getColumns(), []);

  const inquiryList = useMemo(
    () => inquiryPages?.pages?.flatMap((page: any) => page.data) ?? [],
    [inquiryPages]
  );

  const selectedProduct = useMemo(() => {
    if (!queryParams.productId) return null;
    const list = inquiryList || [];
    const found = list.find(
      (inq: any) => String(inq?.product?.id) === String(queryParams.productId)
    );
    return found?.product;
  }, [inquiryList, queryParams.productId]);

  // Compute early so it can be used inside the memo below

  const getRowClassName = () => {
    return "";
  };

  const displayedInquiryList = useMemo(() => {
    // When drilling into a product (search active) → show individual records
    // so action menus, reminders, and demo dates are all visible per record
    if (isSearchActive) {
      return inquiryList;
    }

    // Otherwise group by product name for the top-level grid/list overview
    const groups: Record<string, any> = {};
    inquiryList.forEach((inquiry: any) => {
      const pName = inquiry?.product?.name || "No Product";
      if (!groups[pName]) {
        groups[pName] = {
          id: `group-${pName}`,
          isGroup: true,
          product: inquiry.product,
          inquiries: [],
          totalUsers: 0,
          industries: new Set(),
          statuses: new Set(),
          companies: new Set(),
          contacts: [],
          hasDemoToday: false,
          silenced: false,
        };
      }
      const g = groups[pName];
      g.inquiries.push(inquiry);

      if (inquiry.numberOfUsers) {
        g.totalUsers += Number(inquiry.numberOfUsers);
      }
      if (inquiry.industry?.name) {
        g.industries.add(inquiry.industry.name);
      }
      if (inquiry.status) {
        g.statuses.add(inquiry.status);
      }
      if (inquiry.companyName) {
        g.companies.add(inquiry.companyName);
      }

      const contactName =
        inquiry?.contactPerson?.fullName ?? inquiry?.contactPerson;
      const contactPicUrl = inquiry?.contactPerson?.profilePicUrl ?? null;
      if (contactName && contactName !== "N/A") {
        if (!g.contacts.some((c: any) => c.name === contactName)) {
          g.contacts.push({
            name: contactName,
            profilePicUrl: contactPicUrl,
            id: inquiry.id,
          });
        }
      }

      // Use LOCAL midnight comparison so timezone offsets (e.g. IST UTC+5:30)
      // don't cause a demo at "2026-05-14T18:30:00Z" (= May 15 IST) to miss
      if (inquiry?.status === "demo_scheduled" && inquiry?.demoDate) {
        const todayLocal = new Date();
        todayLocal.setHours(0, 0, 0, 0);
        const demoLocal = new Date(inquiry.demoDate);
        demoLocal.setHours(0, 0, 0, 0);
        if (demoLocal.getTime() <= todayLocal.getTime()) {
          g.hasDemoToday = true;
          const isSilenced = silencedInquiries.includes(inquiry.id);
          if (!isSilenced) {
            g.isBlinking = true;
          }
        }
      }
    });

    return Object.values(groups);
  }, [inquiryList, isSearchActive, silencedInquiries]);

  // const totalCount =
  //   inquiryPages?.pages?.[0]?.metadata?.totalCount ??
  //   inquiryPages?.pages?.[inquiryPages.pages.length - 1]?.metadata
  //     ?.totalCount ??
  //   0;

  const fetchingLock = useRef(false);

  const { ref: loadMoreRef } = useInView({
    threshold: 0,
    rootMargin: "300px",
    onChange: (inView) => {
      if (
        inView &&
        hasNextPage &&
        !isFetchingNextPage &&
        !fetchingLock.current
      ) {
        fetchingLock.current = true;
        fetchNextPage();
      }
    },
  });

  const handlePaginationChange = (newPagination: {
    pageIndex: number;
    pageSize: number;
  }) => {
    setQueryParams({
      pageSize: newPagination.pageSize,
      currentPage: newPagination.pageIndex + 1,
    });
  };

  useEffect(() => {
    if (!isFetchingNextPage) {
      fetchingLock.current = false;
    }
  }, [isFetchingNextPage]);

  const handleSearch = (search: string | undefined) => {
    setQueryParams({
      search: search ?? "",
      drilled: "",
      productId: "",
      fromDate: null,
      toDate: null,
    });
  };

  const handleIndustryFilter = (industryId?: string) => {
    setQueryParams({
      industryId: industryId ?? "",
      drilled: "",
      productId: "",
      fromDate: null,
      toDate: null,
    });
  };

  const handleStatusFilter = (status?: string) => {
    setQueryParams({ status: status ?? "" });
  };

  const handleProductClick = (productId: string) => {
    setQueryParams(
      { productId, drilled: "true", search: "" },
      { history: "push" }
    );
    // When drilling into a product, switch to list view (grid is hidden)
    if (view === "grid") setView("list");
  };

  const filters: FilterConfig[] = [
    {
      type: "search",
      placeholder: "Search by company or product name ...",
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
    // Status & Date Range filters: always shown when on Archive tab, or when drilled into a product on Active tab
    ...(isSearchActive || activeTab === "inactive"
      ? [
        {
          type: "select" as const,
          key: "status",
          placeholder: "Filter by status",
          value: queryParams.status || undefined,
          onChange: handleStatusFilter,
          options:
            activeTab === "active"
              ? [
                { value: "in_progress", label: "In Progress" },
                ...PRODUCT_INQUIRY_STATUS_OPTIONS,
              ]
              : PRODUCT_INQUIRY_STATUS_OPTIONS.filter(
                (opt) =>
                  opt.value === "lost" ||
                  opt.value === "won" ||
                  opt.value === "unqualified_lead"
              ),
        },
        {
          type: "dateRange" as const,
          key: "dateRange",
          placeholder: "Filter by Date",
          disable: { after: new Date() },
          value: {
            from: queryParams.fromDate
              ? new Date(queryParams.fromDate)
              : undefined,
            to: queryParams.toDate ? new Date(queryParams.toDate) : undefined,
          },
          onChange: (range: { from?: Date; to?: Date } | undefined) => {
            setQueryParams({
              fromDate: formatDate(range?.from) ?? null,
              toDate: formatDate(range?.to) ?? null,
              currentPage: 1,
            });
          },
        },
      ]
      : []),
  ];

  const handleAdd = () => {
    setOpen("add");
  };

  const handleExportCSV = () => {
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
          `product_inquiries_export_${new Date().toISOString().split("T")[0]}.xlsx`;

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
      },
    });
  };

  const tabTriggerClass =
    "flex items-center gap-2 rounded-[50px] !px-3 !py-2 transition-all h-[35px] " +
    "text-foreground/70 hover:text-foreground " +
    "data-[state=active]:bg-foreground data-[state=active]:text-background data-[state=active]:shadow-sm " +
    "dark:text-muted-foreground dark:hover:text-foreground " +
    "dark:data-[state=active]:bg-primary dark:data-[state=active]:text-white dark:data-[state=active]:shadow-[0_2px_8px_oklch(0_0_0/0.5)]";

  const skeletons = Array.from({ length: skeletonCount }).map((_, index) => (
    <ProjectCardSkeleton
      key={`inquiry-skeleton-${currentView}-${index}`}
      view={currentView}
    />
  ));

  return (
    <PageLayout className="h-[calc(100vh-100px)] overflow-y-auto flex flex-col">
      <TablePageHeader
        title="Product Inquiries"
        buttonText="Add Inquiry"
        onButtonClick={handleAdd}
        actions={
          <Button onClick={handleExportCSV} disabled={exportCSVLoading}>
            <Download />
            {exportCSVLoading ? "Exporting CSV ..." : "Export CSV"}
          </Button>
        }
      >
        Manage your product inquiries here.
      </TablePageHeader>

      <div className="flex-1 min-h-0 flex flex-col gap-4 py-2">
        <div className="flex items-center justify-between w-full">
          <Tabs
            value={activeTab}
            onValueChange={(val) => handleTabChange(val as "active" | "inactive")}
            className="w-auto"
          >
            <TabsList className="bg-[#fdebef] rounded-full dark:bg-muted dark:border-white/10 border border-rose-100/50 h-9 w-fit">
              <TabsTrigger value="active" className={tabTriggerClass}>
                Active Inquiries
              </TabsTrigger>
              <TabsTrigger value="inactive" className={tabTriggerClass}>
                Archive Inquiries
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Back navigation when drilled into a product */}
          {isSearchActive && (
            <div className="flex items-center gap-2 bg-muted/40 px-3 py-1 rounded-lg border border-border/50 w-fit shadow-sm">
              <Button
                variant="ghost"
                size="sm"
                className="flex items-center gap-1 text-muted-foreground hover:text-foreground px-2 h-7 hover:bg-muted rounded text-xs font-semibold"
                onClick={() => {
                  setQueryParams({
                    search: "",
                    status: "",
                    drilled: "",
                    productId: "",
                    fromDate: null,
                    toDate: null,
                  });
                  setView("grid");
                }}
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>All Products</span>
              </Button>
              <span className="text-muted-foreground/40 text-xs">/</span>
              <span className="text-xs font-bold text-foreground pr-1">
                {selectedProduct?.name || "Product"}
              </span>
            </div>
          )}
        </div>

        {/* Stats Cards */}
        {isSearchActive && (
          <ProductInquiryStats
            totalInquiries={stats?.totalInquiries?.count ?? 0}
            inProgressCount={stats?.inProgressInquiries?.count ?? 0}
            wonCount={stats?.wonInquiries?.count ?? 0}
            lostCount={stats?.lostInquiries?.count ?? 0}
            loadingStats={loadingStats}
            activeStatus={queryParams.status}
            onStatusClick={(status) => setQueryParams({ status })}
          />
        )}



        {/* Filters + View Toggle */}
        <div className="flex flex-wrap items-start gap-3">
          <div className="flex-1 min-w-0">
            <GlobalFilterSection filters={filters} className="" />
          </div>
          {activeTab === "active" && (
            <Tabs
              value={view}
              onValueChange={handleViewChange}
              className="flex-none"
            >
              <TabsList className="bg-rose-50 dark:bg-muted rounded-full h-9 border border-rose-100/50 dark:border-white/10">
                {!isSearchActive && (
                  <TabsTrigger
                    value="grid"
                    className={cn(
                      tabTriggerClass,
                      "gap-2 px-3 h-8 text-xs font-medium transition-all",
                      view === "grid" &&
                      "bg-background text-foreground shadow-sm"
                    )}
                  >
                    <LayoutGrid className="h-4 w-4" />
                    Grid
                  </TabsTrigger>
                )}
                <TabsTrigger
                  value="list"
                  className={cn(
                    tabTriggerClass,
                    "gap-2 px-3 h-8 text-xs font-medium transition-all",
                    view === "list" && "bg-background text-foreground shadow-sm"
                  )}
                >
                  <List className="h-4 w-4" />
                  List
                </TabsTrigger>
                <TabsTrigger
                  value="table"
                  className={cn(
                    tabTriggerClass,
                    "gap-2 px-3 h-8 text-xs font-medium transition-all",
                    view === "table" &&
                    "bg-background text-foreground shadow-sm"
                  )}
                >
                  <TableIcon className="h-4 w-4" />
                  Table
                </TabsTrigger>
              </TabsList>
            </Tabs>
          )}
        </div>

        {/* Content Area */}
        <div className="flex-1 space-y-4 p-2 rounded-md">
          {loading ? (
            currentView === "table" ? (
              <GlobalTable
                columns={columns}
                data={[]}
                totalCount={0}
                currentPage={queryParams.currentPage}
                pageSize={queryParams.pageSize}
                onPaginationChange={handlePaginationChange}
                loading={true}
                isPaginationEnabled
                enableSorting
                getRowClassName={getRowClassName}
              />
            ) : currentView === "grid" ? (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 2xl:grid-cols-3">
                {skeletons}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <div className="min-w-[1150px] flex flex-col gap-0 border rounded-lg bg-card overflow-hidden">
                  <div className="flex items-center gap-4 px-6 py-3 bg-muted/50 border-b text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    <div className="w-1 shrink-0" />
                    <div className="flex-1 min-w-[250px]">Product</div>
                    <div className="w-32 shrink-0 text-center">Status</div>
                    <div className="w-28 shrink-0 text-center">Industry</div>
                    <div className="w-28 shrink-0 text-center">
                      Contact Person
                    </div>
                    <div className="w-28 shrink-0 text-center">
                      Inquiry Date
                    </div>
                    <div className="w-28 shrink-0 text-center">Demo Date</div>
                    <div className="w-26 shrink-0 text-center">
                      {" "}
                      Number of Users{" "}
                    </div>
                    <div className="w-26 shrink-0 text-center">
                      Attending Person
                    </div>
                    <div className="w-[68px] shrink-0" />
                  </div>
                  {skeletons}
                </div>
              </div>
            )
          ) : currentView === "table" ? (
            <GlobalTable
              columns={columns}
              data={(tableData as any)?.data ?? []}
              totalCount={(tableData as any)?.metadata?.totalCount ?? 0}
              currentPage={queryParams.currentPage}
              pageSize={queryParams.pageSize}
              onPaginationChange={handlePaginationChange}
              loading={loadingTable}
              isPaginationEnabled
              enableSorting
              getRowClassName={getRowClassName}
            />
          ) : currentView === "grid" ? (
            displayedInquiryList?.length ? (
              <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-4">
                {displayedInquiryList.map((inquiry: any) => (
                  <InquiryCard
                    key={inquiry.id}
                    inquiry={inquiry}
                    view="grid"
                    onProductClick={handleProductClick}
                  />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-muted-foreground bg-card border rounded-lg shadow-sm">
                <p className="text-sm">No product inquiries found.</p>
              </div>
            )
          ) : (
            <div className="overflow-x-auto">
              <div className="min-w-[1150px] flex flex-col gap-0 border rounded-lg bg-card overflow-hidden">
                {/* List Header */}
                <div className="flex items-center gap-4 px-6 py-3 bg-muted/50 border-b text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                  <div className="w-1 shrink-0" />
                  <div className="flex-1 min-w-[250px]">Product</div>
                  <div className="w-32 shrink-0 text-center">Status</div>
                  <div className="w-28 shrink-0 text-center">Industry</div>
                  <div className="w-28 shrink-0 text-center">
                    Contact Person
                  </div>
                  <div className="w-28 shrink-0 text-center">Inquiry Date</div>
                  <div className="w-28 shrink-0 text-center">Demo Date</div>
                  <div className="w-26 shrink-0 text-center">
                    {" "}
                    Number of Users{" "}
                  </div>
                  <div className="w-26 shrink-0 text-center">
                    Attending Person
                  </div>
                  {isSearchActive && (
                    <div className="w-[68px] shrink-0 text-right pr-4">
                      Actions
                    </div>
                  )}
                  {!isSearchActive && <div className="w-[68px] shrink-0" />}
                </div>
                {displayedInquiryList?.length ? (
                  displayedInquiryList.map((inquiry: any) => (
                    <InquiryCard
                      key={inquiry.id}
                      inquiry={inquiry}
                      view="list"
                      onProductClick={handleProductClick}
                    />
                  ))
                ) : (
                  <div className="flex items-center justify-center py-10 text-muted-foreground bg-card">
                    <p className="text-sm">No product inquiries found.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Infinite Scroll Trigger + Loading More Skeletons */}
          {isFetchingNextPage &&
            (currentView === "grid" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <ProjectCardSkeleton
                    key={`load-more-skeleton-${i}`}
                    view="grid"
                  />
                ))}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <div className="min-w-[1150px] flex flex-col gap-0">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <ProjectCardSkeleton
                      key={`load-more-skeleton-${i}`}
                      view="list"
                    />
                  ))}
                </div>
              </div>
            ))}

          {/* Sentinel for infinite scroll */}
          {currentView !== "table" && <div ref={loadMoreRef} className="h-1" />}
        </div>
      </div>

      <ActionFormModal />
    </PageLayout>
  );
};

export default ProductInquiryPage;
