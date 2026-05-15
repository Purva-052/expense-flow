/* eslint-disable @typescript-eslint/no-explicit-any */
import PageLayout from "@/components/layout/layout-provider";
import GlobalFilterSection from "@/components/table/global-table-filter";
import TablePageHeader from "@/components/table/table-page-header";
import { FilterConfig } from "@/components/table/table-toolbar";
import { parseAsInteger, parseAsString, useQueryStates } from "nuqs";
import { useProductInquiryStore } from "./stores/useProductInquiry";
import { useExportCSV, useGetProductInquiryListInfinite } from "./services";
import { ActionFormModal } from "./components/actions";
import React, { useEffect, useMemo, useRef, useState } from "react";
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
import { useGetProductInquiryList } from "./services";

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
    pageSize: parseAsInteger.withDefault(10),
    currentPage: parseAsInteger.withDefault(1),
  });

  const apiParams = {
    search: queryParams.search,
    industryId: queryParams.industryId || undefined,
    status: queryParams.status || undefined,
    pagination: true,
  };

  const {
    data: inquiryPages,
    isPending: loading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useGetProductInquiryListInfinite(apiParams);

  const { mutate: exportCSV, isPending: exportCSVLoading } = useExportCSV();
  const { data: industryDropdownData, isPending: loadingIndustry }: any =
    useGetIndustryDropdownList();

  // Table view data — only fetched when in table mode to avoid duplicate API calls
  const { data: tableData, isPending: loadingTable } = useGetProductInquiryList(
    view === "table"
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

  // Compute early so it can be used inside the memo below
  const isSearchActive = !!(queryParams.search || queryParams.industryId);

  const getRowClassName = (row: any) => {
    if (!row?.demoDate) return "";
    const todayLocal = new Date();
    todayLocal.setHours(0, 0, 0, 0);
    const demoLocal = new Date(row.demoDate);
    demoLocal.setHours(0, 0, 0, 0);
    const isDemoToday = todayLocal.getTime() === demoLocal.getTime();
    const isBlinkingEnabled = !silencedInquiries.includes(row.id || row._id);
    return isDemoToday && isBlinkingEnabled ? "demo-reminder-blink" : "";
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
      if (inquiry?.demoDate) {
        const todayLocal = new Date();
        todayLocal.setHours(0, 0, 0, 0);
        const demoLocal = new Date(inquiry.demoDate);
        demoLocal.setHours(0, 0, 0, 0);
        if (todayLocal.getTime() === demoLocal.getTime()) {
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

  const scrollContainerRef = React.useRef<HTMLDivElement | null>(null);
  const fetchingLock = useRef(false);

  const { ref: loadMoreRef } = useInView({
    root: scrollContainerRef.current,
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
    setQueryParams({ search: search ?? "" });
  };

  const handleIndustryFilter = (industryId?: string) => {
    setQueryParams({ industryId: industryId ?? "" });
  };

  const handleStatusFilter = (status?: string) => {
    setQueryParams({ status: status ?? "" });
  };

  const handleProductClick = (productName: string) => {
    setQueryParams({ search: productName });
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
    // Status filter: only shown for table view
    ...(view === "table"
      ? [
          {
            type: "select" as const,
            key: "status",
            placeholder: "Filter by status",
            value: queryParams.status || undefined,
            onChange: handleStatusFilter,
            options: PRODUCT_INQUIRY_STATUS_OPTIONS,
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
      key={`inquiry-skeleton-${view}-${index}`}
      view={view}
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
        Manage your product inquiries and trial requests here.
      </TablePageHeader>

      <div className="flex-1 min-h-0 flex flex-col gap-4 py-2">
        {/* Back navigation when drilled into a product */}
        {isSearchActive && (
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground px-2 h-8"
              onClick={() => {
                setQueryParams({ search: "", status: "" });
                setView("grid");
              }}
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="text-sm font-medium">All Products</span>
            </Button>
            <span className="text-muted-foreground/40 text-sm">/</span>
            <span className="text-sm font-semibold text-foreground">
              {queryParams.search}
            </span>
          </div>
        )}
        {/* Filters + View Toggle */}
        <div className="flex flex-wrap items-start gap-3">
          <div className="flex-1 min-w-0">
            <GlobalFilterSection filters={filters} className="" />
          </div>
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
                    view === "grid" && "bg-background text-foreground shadow-sm"
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
                  view === "table" && "bg-background text-foreground shadow-sm"
                )}
              >
                <TableIcon className="h-4 w-4" />
                Table
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Scrollable Content Area */}
        <div
          ref={scrollContainerRef}
          className="space-y-4 !h-full overflow-y-auto overflow-x-hidden p-2 [scrollbar-gutter:stable] rounded-md"
        >
          {loading ? (
            view === "table" ? (
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
            ) : view === "grid" ? (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 2xl:grid-cols-3">
                {skeletons}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <div className="min-w-[860px] flex flex-col gap-0 border rounded-lg bg-card overflow-hidden">
                  <div className="flex items-center gap-4 px-6 py-3 bg-muted/50 border-b text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    <div className="w-1 shrink-0" />
                    <div className="flex-1 min-w-0">Product</div>
                    <div className="w-32 shrink-0 text-center">Status</div>
                    <div className="w-28 shrink-0 text-center">Industry</div>
                    <div className="w-28 shrink-0">Demo Date</div>
                    <div className="w-24 shrink-0">Contact</div>
                    <div className="w-[64px] shrink-0" />
                  </div>
                  {skeletons}
                </div>
              </div>
            )
          ) : view === "table" ? (
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
          ) : displayedInquiryList?.length ? (
            view === "grid" ? (
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
              <div className="overflow-x-auto">
                <div className="min-w-[860px] flex flex-col gap-0 border rounded-lg bg-card overflow-hidden">
                  {/* List Header */}
                  <div className="flex items-center gap-4 px-6 py-3 bg-muted/50 border-b text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    <div className="w-1 shrink-0" />
                    <div className="flex-1 min-w-0">Product</div>
                    <div className="w-32 shrink-0 text-center">Status</div>
                    <div className="w-28 shrink-0 text-center">Industry</div>
                    <div className="w-28 shrink-0">Demo Date</div>
                    <div className="w-24 shrink-0">Contact</div>
                    {isSearchActive && (
                      <div className="w-[64px] shrink-0 text-right pr-4">
                        Actions
                      </div>
                    )}
                    {!isSearchActive && <div className="w-[64px] shrink-0" />}
                  </div>
                  {displayedInquiryList.map((inquiry: any) => (
                    <InquiryCard
                      key={inquiry.id}
                      inquiry={inquiry}
                      view="list"
                      onProductClick={handleProductClick}
                    />
                  ))}
                </div>
              </div>
            )
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
              <p className="text-sm">No product inquiries found.</p>
            </div>
          )}

          {/* Infinite Scroll Trigger + Loading More Skeletons */}
          {isFetchingNextPage &&
            (view === "grid" ? (
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
                <div className="min-w-[860px] flex flex-col gap-0">
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
          {view !== "table" && <div ref={loadMoreRef} className="h-1" />}
        </div>
      </div>

      <ActionFormModal />
    </PageLayout>
  );
};

export default ProductInquiryPage;
