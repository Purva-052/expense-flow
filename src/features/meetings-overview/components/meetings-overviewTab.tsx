/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { format } from "date-fns";
import { Briefcase, User, Loader2, CalendarIcon } from "lucide-react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useGetProjectsData } from "@/features/projects/services";
import { useGetProjectHandlerProjectsAPI } from "@/features/kanban-board/services";
import GlobalFilterSection from "@/components/table/global-table-filter";
import { FilterConfig } from "@/components/table/table-toolbar";
import useDebounce from "@/hooks/use-debaunce";
import useFetchData from "@/hooks/use-fetch-data";
import API from "@/config/api/api";

// --- Helper: Clean HTML for description display ---
const stripHtml = (html: string) => {
  if (typeof window === "undefined") return html;
  const tmp = document.createElement("DIV");
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || "";
};

const MeetingsOverviewListing = ({
  projectId,
  coordinatorId,
  emptyMessage,
}: {
  projectId?: number | null;
  coordinatorId?: number | null;
  emptyMessage: string;
}) => {
  const [meetings, setMeetings] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [searchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery, 500);
  const [dateRange, setDateRange] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({
    from: undefined,
    to: undefined,
  });
  const [viewDescription, setViewDescription] = useState<string | null>(null);
  // const [projectHandlerSearch, setProjectHandlerSearch] = useState<
  //   string | undefined
  // >();
  const listRef = useRef<HTMLDivElement | null>(null);
  const pageSize = 10;

  useEffect(() => {
    setMeetings([]);
    setPage(1);
    setHasMore(true);
  }, [
    debouncedSearchQuery,
    dateRange.from,
    dateRange.to,
    projectId,
    coordinatorId,
  ]);
  const [activeTab, _] = useState("projects");
  const isSelectionMissing = !projectId && !coordinatorId;
  const queryParams = {
    page,
    limit: pageSize,
    search: debouncedSearchQuery,
    pagination: true,
    startDate: dateRange.from
      ? format(dateRange.from, "yyyy-MM-dd")
      : undefined,
    endDate: dateRange.to ? format(dateRange.to, "yyyy-MM-dd") : undefined,
    ...(projectId ? { projectId } : {}),
    ...(coordinatorId ? { employeeId: coordinatorId } : {}),
  };

  const {
    data: meetingsResponse,
    isLoading,
    isFetching,
  } = useFetchData({
    url: API.internal_meetings.list,
    params: queryParams,
    enabled: !isSelectionMissing,
  }) as any;

  useEffect(() => {
    if (!meetingsResponse) return;

    const fetchedMeetings =
      meetingsResponse?.data?.data ||
      meetingsResponse?.data ||
      meetingsResponse ||
      [];

    const filteredBatch = coordinatorId
      ? fetchedMeetings.filter((meeting: any) =>
          meeting?.employees?.some(
            (emp: any) => Number(emp.id) === Number(coordinatorId)
          )
        )
      : fetchedMeetings;

    setMeetings((prev) => {
      if (page === 1) return filteredBatch;
      const merged = [...prev, ...filteredBatch];
      return merged.filter(
        (meeting, index, self) =>
          index === self.findIndex((item) => item.id === meeting.id)
      );
    });

    const metadata = meetingsResponse?.metadata || {};
    if (
      (metadata.totalPages && page >= metadata.totalPages) ||
      fetchedMeetings.length < pageSize
    ) {
      setHasMore(false);
    }
  }, [meetingsResponse, page, coordinatorId]);

  const handleListScroll = useCallback(
    (event: React.UIEvent<HTMLDivElement>) => {
      const target = event.currentTarget;
      const reachedBottom =
        target.scrollTop + target.clientHeight >= target.scrollHeight - 120;

      if (reachedBottom && hasMore && !isFetching && !isLoading) {
        setPage((prev) => prev + 1);
      }
    },
    [hasMore, isFetching, isLoading]
  );

  const filters: FilterConfig[] = [
    // {
    //   type: "search",
    //   placeholder: "Search meetings...",
    //   key: "search",
    //   value: searchQuery,
    //   onChange: setSearchQuery,
    //   className: "w-full sm:w-[280px] rounded-full",
    // },
    // {
    //   type: "search",
    //   placeholder: "Search by project name ...",
    //   key: "search",
    //   value: projectSearch,
    //   onChange: handleProjectSearch,
    //   className: "w-[292px]",
    // },
    {
      type: "dateRange",
      placeholder: "Filter by date range",
      key: "dateRange",
      onChange: (range: any) =>
        setDateRange({ from: range?.from, to: range?.to }),
      className: "rounded-full h-9",
    },
  ];

  if (isSelectionMissing) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-muted-foreground bg-muted/10 m-2 rounded border border-dashed">
        <CalendarIcon className="w-10 h-10 mb-2 opacity-20" />
        <p className="text-sm">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-0 overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4 p-2">
        {/* <h2 className="text-sm font-semibold">
          {meetingsResponse?.metadata?.total || meetings.length} Internal
          Meetings
        </h2> */}
        <GlobalFilterSection filters={filters} className="mb-0" />
      </div>
      {isLoading && page === 1 ? (
        <div className="flex items-center justify-center p-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <span className="ml-2">Loading meetings...</span>
        </div>
      ) : meetings.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 text-center border rounded-lg bg-muted/10">
          <div className="rounded-full bg-muted p-3 mb-4">
            <CalendarIcon className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-1">
            {searchQuery || dateRange.from
              ? "No matching meetings found"
              : "No meetings yet"}
          </h3>
          <p className="text-sm text-muted-foreground">
            {searchQuery || dateRange.from
              ? "Try adjusting your search or filters"
              : "No meetings found for this selection"}
          </p>
        </div>
      ) : (
        <div
          ref={listRef}
          onScroll={handleListScroll}
          className="min-h-0 max-h-[58vh] overflow-auto"
        >
          <table className="w-full caption-bottom text-sm">
            <thead className="[&_tr]:border-b">
              <tr className="border-b transition-colors hover:bg-muted/50">
                <th className="h-12 bg-gray-100! text-black z-50 border-b px-4 text-left align-middle font-medium sticky top-0 w-[150px]">
                  Start Date
                </th>
                <th className="h-12 bg-gray-100! text-black z-50 border-b px-4 text-left align-middle font-medium sticky top-0 w-[40%]">
                  Coordinator(s)
                </th>
                {activeTab === "project_coordinator" && (
                  <th className="h-12 bg-gray-100! text-black z-50 border-b px-4 text-left align-middle font-medium sticky top-0 w-[20%]">
                    Project
                  </th>
                )}
                <th className="h-12 bg-gray-100! text-black z-50 border-b px-4 text-left align-middle font-medium sticky top-0">
                  Description
                </th>
              </tr>
            </thead>
            <tbody className="[&_tr:last-child]:border-0">
              {meetings.map((meeting: any) => {
                const employees = meeting?.employees || [];
                const visibleEmployees = employees.slice(0, 5);
                const remainingCount = employees.length - 5;

                return (
                  <tr
                    key={meeting.id}
                    className="border-b transition-colors hover:bg-muted/50"
                  >
                    <td className="p-4 align-middle">
                      {meeting.startDate
                        ? format(new Date(meeting.startDate), "EEE, d MMM yyyy")
                        : "-"}
                    </td>
                    <td className="p-4 align-middle">
                      {employees.length === 0 ? (
                        "-"
                      ) : (
                        <div className="flex flex-wrap gap-1 items-center">
                          {visibleEmployees.map((emp: any) => (
                            <span
                              key={emp.id}
                              className="px-2 py-0.5 bg-muted rounded-full text-sm"
                            >
                              {emp.name}
                            </span>
                          ))}
                          {remainingCount > 0 && (
                            <span className="px-2 py-0.5 bg-muted rounded-full text-sm font-medium">
                              +{remainingCount} more
                            </span>
                          )}
                        </div>
                      )}
                    </td>

                    {activeTab === "project_coordinator" && (
                      <td className="p-4 align-middle">
                        <div className="min-w-[200px]">
                          {meeting.projectName ? (
                            <span className="px-2 py-0.5 bg-muted rounded-full text-sm">
                              {meeting.projectName}
                            </span>
                          ) : (
                            "-"
                          )}
                        </div>
                      </td>
                    )}
                    <td className="p-4 align-middle">
                      <div className="min-w-[300px]">
                        <p className="text-muted-foreground line-clamp-4 break-words whitespace-normal">
                          {stripHtml(meeting.description || "-")}
                        </p>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {isFetching && page > 1 && (
            <div className="flex justify-center py-3 border-t bg-background/80">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          )}
        </div>
      )}
      <Dialog
        open={!!viewDescription}
        onOpenChange={(open) => !open && setViewDescription(null)}
      >
        <DialogContent className="max-w-[95vw] sm:max-w-2xl overflow-hidden text-black">
          <DialogHeader>
            <DialogTitle>Meeting Description</DialogTitle>
          </DialogHeader>
          <div
            className="py-4 whitespace-normal leading-relaxed text-muted-foreground break-words overflow-y-auto max-h-[70vh] w-full ck-content"
            dangerouslySetInnerHTML={{ __html: viewDescription || "" }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

// --- Main Tab Component ---
interface MeetingsOverviewTabProps {
  search: string;
  // technologyIds: (string | number)[];
}

const MeetingsOverviewTab = ({
  search,
  // technologyIds,
}: MeetingsOverviewTabProps) => {
  const [activeTab, setActiveTab] = useState("projects");
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(
    null
  );
  const [selectedCoordinatorId, setSelectedCoordinatorId] = useState<
    number | null
  >(null);
  const [projectSearch, setProjectSearch] = useState<string | undefined>();
  const [projectHandlerSearch, setProjectHandlerSearch] = useState<
    string | undefined
  >();
  const debouncedProjectSearch = useDebounce(projectSearch, 500);

  const handleProjectSearch = (search: string | undefined) => {
    setProjectSearch(search ?? undefined);
  };

  const handleCoordinatorSearch = (search: string | undefined) => {
    setProjectHandlerSearch(search ?? undefined);
  };

  const projectFilters: FilterConfig[] = [
    {
      type: "search",
      placeholder: "Search by project name ...",
      key: "search",
      value: projectSearch,
      onChange: handleProjectSearch,
      className: "w-[250px]",
    },
  ];

  const coordinatorFilters: FilterConfig[] = [
    {
      type: "search",
      placeholder: "Search by coordinator name ...",
      key: "search",
      value: projectHandlerSearch,
      onChange: handleCoordinatorSearch,
      className: "w-[250px]",
    },
  ];
  // const [projectSearch, setProjectSearch] = useState<string | undefined>();

  // const handleProjectSearch = (search: string | undefined) => {
  //   setProjectSearch(search ?? undefined);
  // };

  // 1. Fetch Projects (Left Side)
  const { data: projectData, isPending: projectsLoading }: any =
    useGetProjectsData({
      pagination: false,
      search: debouncedProjectSearch || search,
      // technologyId: technologyIds.length > 0 ? technologyIds : undefined,
      status: "active",
    });

  const projectList = useMemo(
    () =>
      projectData?.pages?.flatMap((page: any) => page.data) ||
      projectData?.data ||
      [],
    [projectData]
  );

  // 2. Fetch Coordinators (Tab 2)
  const { data: coordinatorsData, isPending: coordinatorsLoading }: any =
    useGetProjectHandlerProjectsAPI({
      search: projectHandlerSearch || search,
      enabled: activeTab === "Project Coordinator",
    });

  const coordinatorsList = useMemo(
    () => coordinatorsData?.data || [],
    [coordinatorsData]
  );

  useEffect(() => {
    if (!projectList.length) {
      setSelectedProjectId(null);
      return;
    }

    const selectedStillExists = projectList.some(
      (project: any) => project.id === selectedProjectId
    );

    if (!selectedStillExists) {
      setSelectedProjectId(projectList[0].id);
    }
  }, [projectList, selectedProjectId]);

  useEffect(() => {
    if (!coordinatorsList.length) {
      setSelectedCoordinatorId(null);
      return;
    }

    const selectedStillExists = coordinatorsList.some(
      (coordinator: any) => coordinator.id === selectedCoordinatorId
    );

    if (!selectedStillExists) {
      setSelectedCoordinatorId(coordinatorsList[0].id);
    }
  }, [coordinatorsList, selectedCoordinatorId]);

  const tabTriggerClass =
    "flex items-center gap-2 rounded-[50px] px-3 py-2  transition-all " +
    "data-[state=active]:bg-black data-[state=active]:text-white";
  const activeListItemClass =
    "bg-gradient-to-r from-[#f43f5e] to-[#e11d48] text-white border-[#fb7185]";
  const inactiveListItemClass = "hover:bg-[#fff4f7] border-transparent";

  return (
    <div className="flex flex-col h-full min-h-0 gap-4 overflow-hidden">
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full my-1 flex-1 min-h-0 flex flex-col overflow-hidden"
      >
        <TabsList className="bg-[#fdebef] rounded-full shrink-0">
          <TabsTrigger value="projects" className={tabTriggerClass}>
            Projects
          </TabsTrigger>
          <TabsTrigger value="Project Coordinator" className={tabTriggerClass}>
            Coordinator
          </TabsTrigger>
        </TabsList>

        {/* --- TAB 1: PROJECTS --- */}
        <TabsContent
          value="projects"
          className="flex-1 min-h-0 mt-0 overflow-hidden"
        >
          <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-4 h-full min-h-0 overflow-hidden">
            {/* Left: Project List */}
            <Card className="flex flex-col h-full min-h-0 overflow-hidden">
              <CardHeader className="pb-0! justify-center border-b bg-muted/10">
                {/* <CardTitle className="text-sm font-medium">
                  Projects List
                </CardTitle> */}
                <GlobalFilterSection
                  filters={projectFilters}
                  className="my-2"
                />
              </CardHeader>
              <CardContent className="flex-1 min-h-0 overflow-y-auto p-2 space-y-1">
                {projectsLoading ? (
                  <div className="text-center p-4">
                    <Loader2 className="animate-spin mx-auto" />
                  </div>
                ) : projectList.length > 0 ? (
                  projectList.map((project: any) => (
                    <div
                      key={project.id}
                      onClick={() => setSelectedProjectId(project.id)}
                      className={`p-2.5 rounded-md cursor-pointer text-sm font-medium flex items-center gap-2 transition-colors border
                        ${
                          selectedProjectId === project.id
                            ? activeListItemClass
                            : inactiveListItemClass
                        }`}
                    >
                      <Briefcase className="w-4 h-4 shrink-0" />
                      <span className="truncate">{project.name}</span>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-xs text-muted-foreground">
                    No projects found.
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Right: Detailed Infinite Scroll Meetings */}
            <Card className="flex flex-col h-full min-h-0 overflow-hidden border-dashed">
              <CardHeader className="p-3 border-b flex justify-between items-center bg-muted/5">
                <CardTitle className="text-sm font-medium">
                  {selectedProjectId ? (
                    <>
                      <span className="font-bold">
                        {projectList.find(
                          (p: any) => p.id === selectedProjectId
                        )?.name || "Unknown Project"}
                      </span>{" "}
                      - Internal Meetings
                    </>
                  ) : (
                    "Internal Meetings"
                  )}
                </CardTitle>
                {/* {selectedProjectId && (
                  <Badge variant="outline">
                    Project ID: {selectedProjectId}
                  </Badge>
                )} */}
              </CardHeader>
              <div className="flex-1 min-h-0 overflow-hidden">
                <MeetingsOverviewListing
                  projectId={selectedProjectId}
                  emptyMessage="Select a project to view meetings"
                />
              </div>
            </Card>
          </div>
        </TabsContent>

        {/* --- TAB 2: PROJECT COORDINATOR --- */}
        <TabsContent
          value="Project Coordinator"
          className="flex-1 min-h-0 mt-0 overflow-hidden"
        >
          <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-4 h-full min-h-0 overflow-hidden">
            <Card className="flex flex-col h-full min-h-0 overflow-hidden">
              <CardHeader className="border-b bg-muted/10 pb-0! justify-center">
                {/* <CardTitle className="text-sm font-medium">
                  Project Coordinator List
                </CardTitle> */}
                <GlobalFilterSection
                  filters={coordinatorFilters}
                  className="my-2"
                />
              </CardHeader>
              <CardContent className="flex-1 min-h-0 overflow-y-auto p-2 space-y-1">
                {coordinatorsLoading ? (
                  <div className="text-center p-4">
                    <Loader2 className="animate-spin mx-auto" />
                  </div>
                ) : coordinatorsList.length > 0 ? (
                  coordinatorsList.map((coordinator: any) => (
                    <div
                      key={coordinator.id}
                      onClick={() => setSelectedCoordinatorId(coordinator.id)}
                      className={`p-2.5 rounded-md cursor-pointer text-sm font-medium flex items-center gap-2 transition-colors border
                        ${
                          selectedCoordinatorId === coordinator.id
                            ? activeListItemClass
                            : inactiveListItemClass
                        }`}
                    >
                      <User className="w-4 h-4 shrink-0" />
                      <span className="truncate">{coordinator.fullName}</span>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-xs text-muted-foreground">
                    No coordinators found.
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="flex flex-col h-full min-h-0 overflow-hidden border-dashed">
              <CardHeader className="p-3 border-b flex justify-between items-center bg-muted/5">
                <CardTitle className="text-sm font-medium">
                  {selectedCoordinatorId ? (
                    <>
                      <span className="font-bold">
                        {coordinatorsList.find(
                          (c: any) => c.id === selectedCoordinatorId
                        )?.fullName || "Unknown Coordinator"}
                      </span>{" "}
                      - Internal Meetings
                    </>
                  ) : (
                    "Internal Meetings"
                  )}
                </CardTitle>
              </CardHeader>
              <div className="flex-1 min-h-0 overflow-hidden">
                <MeetingsOverviewListing
                  coordinatorId={selectedCoordinatorId}
                  emptyMessage="Select a coordinator to view meetings"
                />
              </div>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MeetingsOverviewTab;
