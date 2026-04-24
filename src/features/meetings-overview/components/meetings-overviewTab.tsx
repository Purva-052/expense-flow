/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { format } from "date-fns";
import {
  Briefcase,
  User,
  Loader2,
  CalendarIcon,
  Pencil,
  Trash2,
  Info,
  Plus,
} from "lucide-react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { ConfirmDialog } from "@/components/confirm-dialog";
import { InternalMeetingDialog } from "@/features/kanban-board/components/project-view/internal-meeting";
import { useDeleteInternalMeeting } from "@/features/kanban-board/services";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import DateRangeFilter from "@/components/table/custome-dateRange";
import { Button } from "@/components/ui/button";

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
  dateRange,
  refreshTick,
  isCoordinatorContext = false,
  projectOptions = [],
  onSuccess,
}: {
  projectId?: number | null;
  coordinatorId?: number | null;
  emptyMessage: string;
  dateRange: {
    from: Date | undefined;
    to: Date | undefined;
  };
  refreshTick: number;
  isCoordinatorContext?: boolean;
  projectOptions?: { value: string | number; label: string }[];
  onSuccess?: () => void;
}) => {
  const [meetings, setMeetings] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [searchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery, 500);
  const [viewDescription, setViewDescription] = useState<string | null>(null);
  const [selectedMeeting, setSelectedMeeting] = useState<any>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [meetingToDelete, setMeetingToDelete] = useState<any>(null);
  const showProjectColumn = !!coordinatorId;
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
  const isSelectionMissing = !projectId && !coordinatorId;
  const queryParams = {
    page,
    limit: pageSize,
    search: debouncedSearchQuery,
    pagination: true,
    fromDate: dateRange.from ? format(dateRange.from, "yyyy-MM-dd") : undefined,
    toDate: dateRange.to ? format(dateRange.to, "yyyy-MM-dd") : undefined,
    ...(projectId ? { projectId } : {}),
    ...(coordinatorId ? { employeeId: coordinatorId } : {}),
  };

  const {
    data: meetingsResponse,
    isLoading,
    isFetching,
    refetch,
  } = useFetchData({
    url: API.internal_meetings.list,
    params: queryParams,
    enabled: !isSelectionMissing,
  }) as any;

  const handleRefresh = useCallback(() => {
    setMeetings([]);
    setPage(1);
    setHasMore(true);
    refetch();
  }, [refetch]);

  const { mutate: deleteMeeting, isPending: isDeleting } =
    useDeleteInternalMeeting(() => {
      setIsDeleteDialogOpen(false);
      setMeetingToDelete(null);
      setMeetings((prev) =>
        prev.filter((meeting) => meeting.id !== meetingToDelete?.id)
      );
      if (onSuccess) onSuccess();
    });

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

  const handleMeetingUpdated = useCallback(() => {
    handleRefresh();
    if (onSuccess) onSuccess();
  }, [handleRefresh, onSuccess]);

  const resolveMeetingProjectId = useCallback(
    (meeting: any) => {
      const resolved =
        meeting?.projectId ??
        meeting?.project?.id ??
        meeting?.projectID ??
        meeting?.project_id ??
        projectId;

      return resolved ? Number(resolved) : undefined;
    },
    [projectId]
  );

  const handleAction = useCallback(
    (type: "edit" | "delete", meeting: any) => {
      if (type === "delete") {
        setMeetingToDelete(meeting);
        setIsDeleteDialogOpen(true);
        return;
      }

      setSelectedMeeting({
        ...meeting,
        projectId: resolveMeetingProjectId(meeting),
      });
      setIsEditDialogOpen(true);
    },
    [resolveMeetingProjectId]
  );

  useEffect(() => {
    if (!refreshTick || isSelectionMissing) return;
    handleRefresh();
  }, [refreshTick, handleRefresh, isSelectionMissing]);

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
      {isLoading && page === 1 ? (
        <div className="flex items-center justify-center p-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <span className="ml-2">Loading meetings...</span>
        </div>
      ) : meetings.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 text-center border bg-muted/10">
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
                <th className="h-12 bg-muted text-foreground z-50 border-b px-4 text-left align-middle font-medium sticky top-0 whitespace-nowrap">
                  Start Date
                </th>
                <th className="h-12 bg-muted text-foreground z-50 border-b px-4 text-left align-middle font-medium sticky top-0">
                  Coordinator's Name
                </th>
                {showProjectColumn && (
                  <th className="h-12 bg-muted text-foreground z-50 border-b px-4 text-left align-middle font-medium sticky top-0">
                    Project
                  </th>
                )}
                <th className="h-12 bg-muted text-foreground z-50 border-b px-4 text-left align-middle font-medium sticky top-0">
                  Description
                </th>
                <th className="h-12 bg-muted text-foreground z-50 border-b px-4 text-left align-middle font-medium sticky top-0">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="[&_tr:last-child]:border-0">
              {meetings.map((meeting: any) => {
                const employees = meeting?.employees || [];
                const visibleEmployees = employees.slice(0, 3);
                const remainingCount = employees.length - 3;

                return (
                  <tr
                    key={meeting.id}
                    className="border-b transition-colors hover:bg-muted/50"
                  >
                    <td className="p-4 align-middle w-50 whitespace-nowrap">
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
                            <Popover>
                              <PopoverTrigger asChild>
                                <button
                                  type="button"
                                  className="px-2 py-0.5 bg-muted rounded-full text-sm font-medium hover:bg-muted/80 cursor-pointer"
                                >
                                  +{remainingCount} more
                                </button>
                              </PopoverTrigger>
                              <PopoverContent
                                align="start"
                                className="w-[280px] p-3"
                              >
                                <p className="text-xs font-medium mb-2 text-muted-foreground">
                                  Coordinators
                                </p>
                                <div className="flex flex-wrap gap-1">
                                  {employees.map((emp: any) => (
                                    <span
                                      key={`popover-${meeting.id}-${emp.id}`}
                                      className="px-2 py-0.5 bg-muted rounded-full text-sm"
                                    >
                                      {emp.name}
                                    </span>
                                  ))}
                                </div>
                              </PopoverContent>
                            </Popover>
                          )}
                        </div>
                      )}
                    </td>

                    {showProjectColumn && (
                      <td className="p-4 align-middle">
                        <div className="min-w-[200px]">
                          {meeting.project.name ? (
                            <span className="px-2 py-0.5 bg-muted rounded-full text-sm">
                              {meeting.project.name}
                            </span>
                          ) : (
                            "-"
                          )}
                        </div>
                      </td>
                    )}
                    <td className="p-4 align-middle">
                      <div className="min-w-[250px]">
                        <p className="text-muted-foreground line-clamp-4 break-words whitespace-normal">
                          {stripHtml(meeting.description || "-")}
                        </p>
                      </div>
                    </td>
                    <td className="p-4 align-middle">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleAction("edit", meeting)}
                          className="p-1 hover:bg-muted rounded text-muted-foreground hover:text-primary transition-colors"
                          title="Edit Meeting"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleAction("delete", meeting)}
                          className="p-1 hover:bg-muted rounded text-muted-foreground hover:text-destructive transition-colors"
                          title="Delete Meeting"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
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

      <InternalMeetingDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        currentData={selectedMeeting}
        projectId={resolveMeetingProjectId(selectedMeeting)}
        title="Edit Internal Meeting Details"
        onSuccess={handleMeetingUpdated}
        projectDisplayName={
          isCoordinatorContext
            ? (selectedMeeting?.project?.name ?? undefined)
            : undefined
        }
        projectOptions={isCoordinatorContext ? projectOptions : []}
      />

      <ConfirmDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        handleConfirm={() => deleteMeeting(meetingToDelete?.id)}
        isLoading={isDeleting}
        title="Delete Internal Meeting"
        desc={`Are you sure you want to delete the meeting "${meetingToDelete?.meetingName}"? This action cannot be undone.`}
      />
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
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [meetingsRefreshTick, setMeetingsRefreshTick] = useState(0);
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(
    null
  );
  const [selectedCoordinatorId, setSelectedCoordinatorId] = useState<
    number | null
  >(null);
  const [projectDateRange, setProjectDateRange] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({
    from: undefined,
    to: undefined,
  });
  const [coordinatorDateRange, setCoordinatorDateRange] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({
    from: undefined,
    to: undefined,
  });
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

  // 1. Fetch Projects (Left Side)
  const {
    data: projectData,
    isPending: projectsLoading,
    refetch: refetchProjects,
  }: any = useGetProjectsData({
    pagination: false,
    search: debouncedProjectSearch || search,
    sortByMeeting: true,
    // technologyId: technologyIds.length > 0 ? technologyIds : undefined,
    status: "active",
  });
  const { data: allProjectsData, refetch: refetchAllProjects }: any =
    useGetProjectsData({
      pagination: false,
      status: "active",
    });

  const handleCreateMeetingSuccess = useCallback(() => {
    setMeetingsRefreshTick((prev) => prev + 1);
    refetchProjects();
    refetchAllProjects();
  }, [refetchProjects, refetchAllProjects]);

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

  const projectList = useMemo(
    () =>
      projectData?.pages?.flatMap((page: any) => page.data) ||
      projectData?.data ||
      [],
    [projectData]
  );
  const allProjectsList = useMemo(
    () =>
      allProjectsData?.pages?.flatMap((page: any) => page.data) ||
      allProjectsData?.data ||
      [],
    [allProjectsData]
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
    "flex items-center gap-2 rounded-[50px] !px-3 !py-2 transition-all h-[35px] " +
    "text-foreground/70 hover:text-foreground " +
    // Light: active tab = deep brand-adjacent dark bg with white text
    "data-[state=active]:bg-foreground data-[state=active]:text-background data-[state=active]:shadow-sm " +
    // Dark: active tab = primary red accent with white text for maximum contrast
    "dark:text-muted-foreground dark:hover:text-foreground " +
    "dark:data-[state=active]:bg-primary dark:data-[state=active]:text-white dark:data-[state=active]:shadow-[0_2px_8px_oklch(0_0_0/0.5)]";
  const activeListItemClass =
    "bg-gradient-to-r from-[#f43f5e] to-[#e11d48] text-white border-[#fb7185]";
  const inactiveListItemClass =
    "hover:bg-rose-50 dark:hover:bg-secondary/40 border-transparent transition-colors";
  const selectedProject = projectList.find(
    (project: any) => project.id === selectedProjectId
  );
  const selectedProjectDescription = selectedProject?.description || "";
  const hasLongProjectDescription = selectedProjectDescription.length > 500;
  const coordinatorProjectOptions = useMemo(() => {
    const uniqueProjects = new Map<number, any>();
    allProjectsList.forEach((project: any) => {
      const projectId = Number(project?.id);
      if (!projectId || uniqueProjects.has(projectId)) return;
      uniqueProjects.set(projectId, project);
    });

    return Array.from(uniqueProjects.values()).map((project: any) => ({
      value: Number(project.id),
      label: project?.name ? `${project.name}` : `Project ID: ${project.id}`,
    }));
  }, [allProjectsList]);
  const canOpenCreateDialog =
    activeTab === "projects"
      ? !!selectedProjectId
      : !!selectedCoordinatorId && coordinatorProjectOptions.length > 0;

  return (
    <div className="flex flex-col h-full min-h-0 gap-2 overflow-hidden">
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full flex-1 min-h-0 flex flex-col overflow-hidden px-4"
      >
        <div className="flex items-center justify-between gap-2 mt-2">
          <TabsList className="bg-rose-50 border border-rose-100 dark:bg-secondary dark:border-white/10 rounded-full shrink-0">
            <TabsTrigger value="projects" className={tabTriggerClass}>
              Projects
            </TabsTrigger>
            <TabsTrigger
              value="Project Coordinator"
              className={tabTriggerClass}
            >
              Coordinator
            </TabsTrigger>
          </TabsList>
          <Button
            type="button"
            size="sm"
            onClick={() => setIsCreateDialogOpen(true)}
            disabled={!canOpenCreateDialog}
          >
            <Plus className="h-4 w-4" />
            Add
          </Button>
        </div>

        {/* --- TAB 1: PROJECTS --- */}
        <TabsContent
          value="projects"
          className="flex-1 min-h-0 mt-0 overflow-hidden"
        >
          <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-4 h-full min-h-0 overflow-hidden">
            {/* Left: Project List */}
            <Card className="flex flex-col h-full min-h-0 overflow-hidden gap-0 py-0 px-0">
              <CardHeader className="px-6 py-3 border-b bg-muted/10 pb-0!">
                {/* <CardTitle className="text-sm font-medium">
                  Projects List
                </CardTitle> */}
                <GlobalFilterSection
                  filters={projectFilters}
                  className="my-0"
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
            <Card className="flex flex-col h-full min-h-0 overflow-hidden border-dashed gap-0 py-0 px-0">
              <CardHeader className="border-b bg-muted/5 pb-0!">
                <div className="flex items-center gap-2 py-2">
                  <div className="flex flex-col gap-0.5 min-w-0 flex-1">
                    <CardTitle className="text-sm font-medium">
                      {selectedProjectId ? (
                        <>
                          <span className="font-bold">
                            {selectedProject?.name || "Unknown Project"}
                          </span>{" "}
                          - Internal Meetings
                          {hasLongProjectDescription && (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Info className="inline-block h-4 w-4 mx-1 cursor-pointer opacity-70 hover:opacity-100 transition" />
                                </TooltipTrigger>
                                <TooltipContent className="max-w-xs text-xs">
                                  {selectedProjectDescription}
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          )}
                        </>
                      ) : (
                        "Internal Meetings"
                      )}
                    </CardTitle>

                    {selectedProjectId &&
                      selectedProjectDescription &&
                      !hasLongProjectDescription && (
                        <CardDescription className="text-muted-foreground text-[13px] flex items-center gap-1">
                          {selectedProjectDescription}
                        </CardDescription>
                      )}
                  </div>

                  <div className="ml-auto shrink-0">
                    <DateRangeFilter
                      placeholder="Filter by date range"
                      onChange={(range: any) =>
                        setProjectDateRange({
                          from: range?.from,
                          to: range?.to,
                        })
                      }
                      className="rounded-full h-8"
                    />
                  </div>
                </div>
              </CardHeader>
              <div className="flex-1 min-h-0 overflow-hidden">
                <MeetingsOverviewListing
                  projectId={selectedProjectId}
                  emptyMessage="Select a project to view meetings"
                  dateRange={projectDateRange}
                  refreshTick={meetingsRefreshTick}
                  onSuccess={handleCreateMeetingSuccess}
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
            <Card className="flex flex-col h-full min-h-0 overflow-hidden gap-0 py-0 px-0">
              <CardHeader className="px-6 py-3 border-b bg-muted/10 pb-0!">
                {/* <CardTitle className="text-sm font-medium">
                  Project Coordinator List
                </CardTitle> */}
                <GlobalFilterSection
                  filters={coordinatorFilters}
                  className="my-0"
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

            <Card className="flex flex-col h-full min-h-0 overflow-hidden border-dashed gap-0 py-0 px-0">
              <CardHeader className="border-b bg-muted/5 pb-0!">
                <div className="flex items-center justify-between gap-3 py-2">
                  <CardTitle className="text-sm font-medium truncate">
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

                  <DateRangeFilter
                    placeholder="Filter by date range"
                    onChange={(range: any) =>
                      setCoordinatorDateRange({
                        from: range?.from,
                        to: range?.to,
                      })
                    }
                    className="rounded-full h-8 shrink-0"
                  />
                </div>
              </CardHeader>
              <div className="flex-1 min-h-0 overflow-hidden">
                <MeetingsOverviewListing
                  coordinatorId={selectedCoordinatorId}
                  emptyMessage="Select a coordinator to view meetings"
                  dateRange={coordinatorDateRange}
                  refreshTick={meetingsRefreshTick}
                  isCoordinatorContext={true}
                  projectOptions={coordinatorProjectOptions}
                  onSuccess={handleCreateMeetingSuccess}
                />
              </div>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      <InternalMeetingDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        projectId={
          activeTab === "projects"
            ? (selectedProjectId ?? undefined)
            : undefined
        }
        showProjectSelect={activeTab === "Project Coordinator"}
        hideCoordinatorSelect={activeTab === "Project Coordinator"}
        defaultEmployeeId={
          activeTab === "Project Coordinator"
            ? (selectedCoordinatorId ?? undefined)
            : undefined
        }
        projectOptions={
          activeTab === "Project Coordinator" ? coordinatorProjectOptions : []
        }
        title="Add Internal Meeting"
        onSuccess={handleCreateMeetingSuccess}
      />
    </div>
  );
};

export default MeetingsOverviewTab;
