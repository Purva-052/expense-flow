/* eslint-disable @typescript-eslint/no-explicit-any */
import { Users } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useInView } from "react-intersection-observer";

import GlobalFilterSection from "@/components/table/global-table-filter";
import { FilterConfig } from "@/components/table/table-toolbar";
import { useGetInquiryDashboardData } from "../services";
import { InquiryLeadCard } from "./inquiry-lead-card";

const InquiryTab = () => {
  const [listParams, setListParams] = useState({
    pagination: true,
    search: "",
    status: "active",
  });

  // Create the ref for the scrollable container
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  // Fetch data using the infinite query hook
  const {
    data: inquiryDataPages,
    isPending: isInitialLoading, // Use a more descriptive name for the initial load
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useGetInquiryDashboardData(listParams);

  // Flatten the pages of data into a single list
  const inquiryGroups = useMemo(
    () => inquiryDataPages?.pages?.flatMap((page: any) => page.data) ?? [],
    [inquiryDataPages]
  );

  // This ref is used to prevent multiple fetch calls while one is already in progress
  const fetchingLock = useRef(false);

  // The intersection observer hook to trigger fetching more data
  const { ref: loadMoreRef } = useInView({
    root: scrollContainerRef.current,
    threshold: 0,
    rootMargin: "300px", // Load more data when the trigger is 300px away from the viewport
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

  // Release the lock once fetching is complete
  useEffect(() => {
    if (!isFetchingNextPage) {
      fetchingLock.current = false;
    }
  }, [isFetchingNextPage]);

  // Handler for the search filter
  const handleSearch = (search: string | undefined) => {
    // When searching, we want to reset to the first page
    setListParams((prev: any) => ({ ...prev, search: search ?? "" }));
  };

  const filters: FilterConfig[] = [
    {
      type: "search",
      placeholder: "Search by client, creator, etc...",
      key: "search",
      value: listParams.search,
      onChange: handleSearch,
    },
  ];

  return (
    <>
      <div className="mb-4">
        <GlobalFilterSection filters={filters} />
      </div>

      {/* Attach the scroll container ref here */}
      <div
        ref={scrollContainerRef}
        className="max-h-[75dvh] overflow-auto p-2 space-y-4 rounded-md border [scrollbar-gutter:stable]"
      >
        {/* Use the actual initial loading state from the hook */}
        {isInitialLoading ? (
          <div className="flex flex-col justify-center items-center py-10 gap-3 h-full">
            <div className="w-10 h-10 border-4 border-dashed rounded-full animate-spin border-primary/50 border-t-primary"></div>
            <span className="text-sm text-muted-foreground">
              Loading Inquiries...
            </span>
          </div>
        ) : inquiryGroups.length > 0 ? (
          <>
            {/* Map over the flattened list from the API */}
            {inquiryGroups.map((group: any) => (
              <InquiryLeadCard key={group.generatedById} group={group} />
            ))}

            {/* Show a spinner at the bottom while fetching the next page */}
            {isFetchingNextPage && (
              <div className="flex justify-center items-center py-4 gap-2 flex-col">
                <div className="w-8 h-8 border-4 border-dashed rounded-full animate-spin border-primary/50 border-t-primary"></div>
                <span className="text-sm text-muted-foreground">
                  Loading Inquiries...
                </span>
              </div>
            )}

            {/* This is the invisible element that will trigger loading more data */}
            <div ref={loadMoreRef} className="h-2" />
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-10 text-center border border-dashed rounded-lg mt-4">
            <div className="mb-3 p-3 rounded-full bg-muted">
              <Users className="h-10 w-10 text-muted-foreground/70" />
            </div>
            <h3 className="text-lg font-semibold text-muted-foreground">
              No Inquiries Found
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              There are currently no active inquiries to display.
            </p>
          </div>
        )}
      </div>
    </>
  );
};

export default InquiryTab;
