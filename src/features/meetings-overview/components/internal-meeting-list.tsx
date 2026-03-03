import React, { useMemo, useEffect } from "react";
import { useInView } from "react-intersection-observer";
import { format } from "date-fns";
import { Calendar, Users, FileText } from "lucide-react";
import { useInfiniteQuery } from "@tanstack/react-query"; // Assuming you have this
import { Card, CardContent, CardHeader } from "@/components/ui/card";

import axios from "axios"; // Or your custom axios instance
import API from "@/config/api/api";

// Helper to strip HTML
const stripHtml = (html: string) => {
  if (typeof window === "undefined") return html;
  const tmp = document.createElement("DIV");
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || "";
};

const InfiniteMeetingList = ({ projectId }: { projectId: number | null }) => {
  const scrollContainerRef = React.useRef<HTMLDivElement | null>(null);

  // Custom fetcher for infinite query since the hook provided was simple
  const fetchMeetings = async ({ pageParam = 1 }) => {
    // Replace with your actual axios instance
    const res = await axios.get(API.internal_meetings.list, {
      params: {
        projectId,
        page: pageParam,
        limit: 10, // Adjust batch size
      },
    });
    return res.data;
  };

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    status,
  } = useInfiniteQuery({
    queryKey: ["internal-meetings-infinite", projectId],
    queryFn: fetchMeetings,
    initialPageParam: 1,
    getNextPageParam: (lastPage: any) => {
      const { page, totalPages } = lastPage.metadata;
      return page < totalPages ? page + 1 : undefined;
    },
    enabled: !!projectId,
  });

  const meetings = useMemo(
    () => data?.pages?.flatMap((page: any) => page.data) ?? [],
    [data]
  );

  const { ref: loadMoreRef, inView } = useInView({
    root: scrollContainerRef.current,
    threshold: 0,
  });

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage]);

  if (!projectId) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
        <FileText className="w-12 h-12 mb-2 opacity-20" />
        <p>Select a project to view meetings</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <div className="w-8 h-8 border-4 border-dashed rounded-full animate-spin border-primary/50 border-t-primary"></div>
      </div>
    );
  }

  if (meetings.length === 0 && status === "success") {
    return (
      <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-8">
        <p>No internal meetings found for this project.</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 overflow-y-auto p-4 space-y-4 [scrollbar-gutter:stable]">
        {meetings.map((meeting: any) => (
          <Card key={meeting.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    <span className="font-medium text-foreground">
                      {format(new Date(meeting.startDate), "EEE, d MMM yyyy")}
                    </span>
                  </div>
                </div>
                {/* View Icon (Optional if you want to open full details modal) */}
                <div className="text-muted-foreground">
                  {/* Add onClick handler here if you want a detailed modal */}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {/* Attendees */}
                <div className="flex items-start gap-2">
                  <Users className="w-4 h-4 mt-1 text-muted-foreground shrink-0" />
                  <div className="flex flex-wrap gap-1">
                    {meeting.employees?.map((emp: any) => (
                      <span
                        key={emp.id}
                        className="px-2 py-0.5 bg-muted rounded-full text-xs"
                      >
                        {emp.name}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Description Preview */}
                <div className="bg-muted/30 p-3 rounded-md text-sm text-muted-foreground line-clamp-3">
                  {stripHtml(meeting.description)}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {/* Loading trigger for infinite scroll */}
        <div ref={loadMoreRef} className="h-4 flex justify-center">
          {isFetchingNextPage && (
            <span className="text-xs text-muted-foreground">
              Loading more...
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default InfiniteMeetingList;
