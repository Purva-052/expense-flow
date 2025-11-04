/* eslint-disable no-console */
// src/pages/board.tsx
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useInView } from "react-intersection-observer";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  KeyboardSensor,
  PointerSensor,
  useDroppable,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  rectSortingStrategy,
  SortableContext,
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Developer } from "@/lib/types";
import { useAuthStore } from "@/stores/use-auth-store";
import GlobalFilterSection from "@/components/table/global-table-filter";
import { FilterConfig } from "@/components/table/table-toolbar";
import { ChevronDown, Users } from "lucide-react";
import { useGetProjectsData } from "@/features/projects/services";
import { useAssignDeveloper, useGetAllDevelopers } from "../services";
import { useGetUsersList } from "@/features/users/services";
import { useGetClientsData } from "@/features/clients/services";
import { ProjectCard } from "./project-card";
import { DeveloperChip } from "./developer-chip";
import { DeveloperDialog } from "./developer-dialog";
import { Switch } from "@/components/ui/switch";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

type GroupedDevelopers = {
  technologyName: string;
  resources: Developer[];
  technologyColor?: string;
}[];

const Board = ({ activeTab }: any) => {
  const isInactiveTab = activeTab === "Inactive Projects" ? true : false;

  const { user } = useAuthStore();
  const isDeveloperView = user?.user?.role === "developer";
  const currentUserId = user?.user?.id;
  const FILTER_STORAGE_KEY = "board_filters";

  const getInitialFilters = () => {
    if (typeof window === "undefined")
      return {
        pagination: true,
        clientId: null,
        handlerId: undefined,
        priority: undefined,
        Search: "",
      };
    const saved = localStorage.getItem(FILTER_STORAGE_KEY);
    return saved
      ? { pagination: true, ...JSON.parse(saved) }
      : {
          pagination: true,
          clientId: null,
          handlerId: undefined,
          priority: undefined,
          search: "",
        };
  };

  const [listParams, setListParams] = useState(getInitialFilters);
  const [showAllDevelopers, setShowAllDevelopers] = useState(false);
  const [openTechnology, setOpenTechnology] = useState<string>("");
  const scrollContainerRef = React.useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const { clientId, managerId, priority } = listParams;
    localStorage.setItem(
      FILTER_STORAGE_KEY,
      JSON.stringify({ clientId, managerId, priority })
    );
  }, [listParams]);

  const apiParams = {
    pagination: true,
    clientId: listParams.clientId,
    handlerId: listParams.handlerId,
    priority: listParams.priority,
    status: isInactiveTab ? "inactive" : "active",
    search: listParams.search,
  };

  const {
    data: AllDevelopersResponse,
    isPending: AllDevelopersLoading,
    refetch: AllDevelopersRefetch,
  }: any = useGetAllDevelopers({
    available: showAllDevelopers ? undefined : true,
  });

  const groupedDevelopers: GroupedDevelopers = useMemo(() => {
    if (!AllDevelopersResponse?.data) return [];
    return AllDevelopersResponse.data;
  }, [AllDevelopersResponse]);

  const allDeveloperIds = useMemo(() => {
    return groupedDevelopers.flatMap((group) =>
      group.resources.map((dev: any) => `available-${dev?.id}`)
    );
  }, [groupedDevelopers]);

  const {
    data: projectPages,
    isPending: projectListLoading,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  }: any = useGetProjectsData(apiParams);

  // 👇 2. FLATTEN the pages into a single project list
  const projectList = useMemo(
    () => projectPages?.pages?.flatMap((page: any) => page.data) ?? [],
    [projectPages]
  );
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

  useEffect(() => {
    if (!isFetchingNextPage) {
      fetchingLock.current = false;
    }
  }, [isFetchingNextPage]);
  const onsuccessAssignDeveloper = () => {
    refetch();
  };

  const { mutateAsync: assignProject } = useAssignDeveloper(
    onsuccessAssignDeveloper
  );

  const [activeDeveloper, setActiveDeveloper] = React.useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [selectedDeveloper, setSelectedDeveloper] =
    React.useState<Developer | null>(null);
  const [selectedProjectId, setSelectedProjectId] = React.useState<string>("");

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const availableDroppable = useDroppable({ id: "available" });

  function onDragStart(event: DragStartEvent) {
    if (isDeveloperView) return;
    const developer = event.active.data.current?.developer as any;
    if (developer) {
      setActiveDeveloper(developer);
    }
  }

  async function onDragEnd(event: DragEndEvent) {
    if (isDeveloperView) return;
    setActiveDeveloper(null);

    const { active, over } = event;
    if (!active || !over) return;

    const developerKey = String(active.id);
    const developerId = Number(developerKey.split("-").pop());
    let projectId: number | null = null;

    if (
      over.data.current?.containerId &&
      over.data.current.containerId !== "available"
    ) {
      projectId = Number(over.data.current.containerId);
    } else if (typeof over.id === "number") {
      projectId = over.id;
    } else if (over.id === "available") {
      console.log("⚠️ Dropped on available list — no assignment made.");
      return;
    }

    if (!developerId || !projectId || isNaN(developerId) || isNaN(projectId)) {
      console.warn("Invalid IDs:", { developerKey, overId: over.id });
      return;
    }

    try {
      await assignProject({
        developerId,
        projectId,
        startDate: new Date().toISOString(),
      });
      console.log("✅ Developer assigned successfully!");
    } catch (error) {
      console.error("❌ Error assigning developer:", error);
    }
  }

  function handleDeveloperClick(developer: any, projectId: string) {
    if (isDeveloperView && developer?.developer?.id !== currentUserId) {
      return;
    }
    setSelectedDeveloper(developer);
    setSelectedProjectId(projectId);
    setIsDialogOpen(true);
  }

  const { data: projecthandler, isPending: projecthandlerLoading }: any =
    useGetUsersList({
      role: ["project_manager", "team_lead"],
      pagination: false,
    });

  const { data: clientsList, isPending: clientListLoading }: any =
    useGetClientsData({
      pagination: false,
    });

  const handleClientChange = (value: any) =>
    setListParams((prev: any) => ({ ...prev, clientId: value ?? null }));
  const handleProjectHandleChange = (value: any) => {
    setListParams({ ...listParams, handlerId: value ?? null, currentPage: 1 });
  };
  const handlePriorityChange = (value: any) =>
    setListParams((prev: any) => ({ ...prev, priority: value ?? undefined }));

  const handleSearch = (search: string | undefined) => {
    setListParams((prev: any) => ({ ...prev, search: search ?? "" }));
  };

  const filters: FilterConfig[] = [
    {
      type: "search",
      placeholder: "Search by Project name ...",
      key: "search",
      value: listParams.search,
      onChange: handleSearch,
    },
    {
      type: "select",
      key: "clientId",
      placeholder: "Filter by Client",
      options: clientsList?.data?.map((value: any) => ({
        label: value?.name,
        value: value?.id,
      })),
      value: listParams.clientId,
      onChange: handleClientChange,
      isLoading: clientListLoading,
    },
    {
      type: "select",
      key: "handlerId",
      placeholder: "Filter by  Coordinator",
      options: projecthandler?.data?.map((value: any) => {
        return { label: value?.fullName, value: value?.id };
      }),
      value: listParams.handlerId, // 👈 pre-selects if set
      onChange: handleProjectHandleChange,
      isLoading: projecthandlerLoading,
    },
    {
      type: "select",
      key: "priority",
      placeholder: "Filter by Priority",
      options: [
        { label: "Low", value: "low" },
        { label: "Medium", value: "medium" },
        { label: "High", value: "high" },
      ],
      value: listParams.priority,
      onChange: handlePriorityChange,
    },
  ];

  return projectListLoading ? (
    <div className="flex flex-col justify-center items-center py-10 gap-3 h-full">
      <div className="w-10 h-10 border-4 border-dashed rounded-full animate-spin border-primary/50 border-t-primary"></div>
      <span className="text-sm text-muted-foreground">Loading ...</span>
    </div>
  ) : (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <GlobalFilterSection filters={filters ?? []} />
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-orange-500"></span>
            <span className="text-sm font-medium">High </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-yellow-500"></span>
            <span className="text-sm font-medium">Medium </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-teal-500"></span>
            <span className="text-sm font-medium">Low </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-[1fr_320px] ">
        <DndContext
          sensors={sensors}
          onDragStart={onDragStart}
          onDragEnd={onDragEnd}
          onDragCancel={() => setActiveDeveloper(null)}
        >
          <div
            ref={scrollContainerRef}
            className="space-y-4 max-h-[74dvh] overflow-auto p-2"
          >
            {projectList?.length ? (
              projectList?.map((p: any) => (
                <>
                  <ProjectCard key={p?.id} project={p}>
                    {p?.developerAllocations?.length !== 0 ? (
                      <SortableContext
                        id={`project-${p.id}`}
                        items={
                          p?.developerAllocations?.map(
                            (da: any) => `${p.id}-${da.developer.id}`
                          ) ?? []
                        }
                        strategy={rectSortingStrategy}
                      >
                        <div className="flex flex-wrap gap-2">
                          {p?.developerAllocations?.map((allocation: any) => {
                            const isMyChip =
                              allocation.developer.id === currentUserId;
                            const canClick = !isDeveloperView || isMyChip;

                            return (
                              <DeveloperChip
                                key={`project-${p.id}-${allocation.developer.id}`}
                                developer={allocation.developer}
                                containerId={p.id}
                                endDate={allocation.endDate}
                                onClick={
                                  canClick
                                    ? () =>
                                        handleDeveloperClick(allocation, p.id)
                                    : undefined
                                }
                                disabled={isDeveloperView}
                              />
                            );
                          })}
                        </div>
                      </SortableContext>
                    ) : null}
                  </ProjectCard>
                </>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-10 text-center border border-dashed rounded-lg">
                <h3 className="text-lg font-semibold text-muted-foreground">
                  No projects available
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Try adjusting your filters or check back later.
                </p>
              </div>
            )}
            <div ref={loadMoreRef} className="h-2" />
            {isFetchingNextPage && (
              <div className="flex justify-center items-center py-4">
                <div className="w-8 h-8 border-4 border-dashed rounded-full animate-spin border-primary/50 border-t-primary"></div>
              </div>
            )}
          </div>

          {!isDeveloperView && (
            <aside className="top-4 h-fit">
              <Card
                ref={availableDroppable.setNodeRef}
                className={
                  availableDroppable.isOver ? "ring-2 ring-pink-500" : ""
                }
              >
                <CardHeader className="flex flex-col gap-3">
                  <CardTitle className="w-full text-balance flex items-center justify-between">
                    {showAllDevelopers
                      ? "All Developers"
                      : "Available Resources"}
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">All</span>
                      <Switch
                        checked={showAllDevelopers}
                        onCheckedChange={setShowAllDevelopers}
                      />
                    </div>
                  </CardTitle>
                </CardHeader>

                <CardContent className=" max-h-[62dvh] overflow-auto p-2">
                  {AllDevelopersLoading ? (
                    <div className="flex flex-col justify-center items-center py-10 gap-3">
                      <div className="w-8 h-8 border-4 border-dashed rounded-full animate-spin border-primary/50 border-t-primary"></div>
                      <span className="text-sm text-muted-foreground">
                        Loading developers...
                      </span>
                    </div>
                  ) : groupedDevelopers.length > 0 ? (
                    <SortableContext
                      items={allDeveloperIds}
                      strategy={rectSortingStrategy}
                    >
                      <div className="space-y-2">
                        {groupedDevelopers.map((group) => (
                          <Collapsible
                            key={group.technologyName}
                            // ✅ Check against the single open technology string
                            open={openTechnology === group.technologyName}
                            // ✅ Update state to show only one at a time
                            onOpenChange={(isOpen) => {
                              setOpenTechnology(
                                isOpen ? group.technologyName : ""
                              );
                            }}
                            className="rounded-md border px-2 py-2 bg-secondary/50"
                          >
                            <CollapsibleTrigger asChild>
                              <div className="flex w-full cursor-pointer items-center justify-between p-2 hover:bg-muted/50 rounded-sm">
                                <div className="flex items-center gap-3">
                                  <span className="font-semibold">
                                    {group.technologyName}
                                  </span>
                                  <Badge
                                    variant="secondary"
                                    style={{
                                      backgroundColor:
                                        group.technologyColor || "#e2e8f0",
                                      color: "#fff",
                                    }}
                                  >
                                    {group.resources.length}
                                  </Badge>
                                </div>
                                <ChevronDown
                                  className={`h-5 w-5 transform transition-transform duration-200 ${
                                    // ✅ Update chevron rotation check
                                    openTechnology === group.technologyName
                                      ? "rotate-180"
                                      : ""
                                  }`}
                                />
                              </div>
                            </CollapsibleTrigger>
                            <CollapsibleContent>
                              <div className="flex flex-col gap-2 pt-2">
                                {group.resources.map((dev: any) => (
                                  <DeveloperChip
                                    key={`available-${dev.id}`}
                                    developer={dev}
                                    containerId="available"
                                    disabled={isDeveloperView}
                                    variant="compact" // ✅ ADD THIS PROP
                                  />
                                ))}
                              </div>
                            </CollapsibleContent>
                          </Collapsible>
                        ))}
                      </div>
                    </SortableContext>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-10 text-center transition-all duration-300 hover:bg-muted/30">
                      <div className="mb-3 p-3 rounded-full bg-muted">
                        <Users className="h-8 w-8 text-muted-foreground/70" />
                      </div>
                      <h3 className="text-lg font-semibold text-muted-foreground">
                        No developers found
                      </h3>
                      <p className="text-sm text-muted-foreground/70 mt-1">
                        Try switching the toggle or check again later!
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </aside>
          )}

          <DragOverlay dropAnimation={null}>
            {activeDeveloper ? (
              <div
                key={`overlay-${activeDeveloper.id}`}
                className="pointer-events-none flex items-center justify-between gap-2 rounded-md border bg-card px-3 py-2 text-sm shadow-lg backdrop-blur-sm scale-105 opacity-95 transition-transform duration-150"
                style={{
                  backgroundColor:
                    (activeDeveloper.technology?.color || "#e2e8f0") + "1A",
                  borderColor: activeDeveloper.technology?.color || "#e2e8f0",
                }}
              >
                <div className="flex flex-col gap-0.5 truncate">
                  <span className="truncate font-medium">
                    {activeDeveloper.fullName}
                  </span>
                  <span className="truncate text-xs text-gray-500">
                    {activeDeveloper.role}
                  </span>
                </div>
                <Badge
                  variant="secondary"
                  className="text-xs"
                  style={{
                    backgroundColor:
                      activeDeveloper.technology?.color || "#e2e8f0",
                    color: "#fff",
                  }}
                >
                  {activeDeveloper.technology?.name}
                </Badge>
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>

      <DeveloperDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        developer={selectedDeveloper}
        projectId={selectedProjectId}
        afterChange={() => {
          refetch();
        }}
        refetchAvailableDevelopers={AllDevelopersRefetch}
      />
    </>
  );
};

export default Board;
