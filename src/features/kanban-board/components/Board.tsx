/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable no-console */
// src/pages/board.tsx
/* eslint-disable @typescript-eslint/no-explicit-any */

import GlobalFilterSection from "@/components/table/global-table-filter";
import { ProjectCardSkeleton } from "@/components/layout/project-card-skeleton";
import { FilterConfig } from "@/components/table/table-toolbar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetClientsDropdownList } from "@/features/clients/services";
import {
  useGetProjectPriorityDropdownList,
  useGetProjectsData,
} from "@/features/projects/services";
import { useGetUserDropdownList } from "@/features/users/services";
import type { Developer } from "@/lib/types";
import { useAuthStore } from "@/stores/use-auth-store";
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
import { ChevronDown, Users } from "lucide-react";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useInView } from "react-intersection-observer";
import {
  useAssignDeveloper,
  useGetAllBecomingAvailableDevelopers,
  useGetAllDevelopers,
} from "../services";
import { DeveloperChip } from "./developer-chip";
import { DeveloperDialog } from "./developer-dialog";
import { ProjectCard } from "./project-card";
import { Input } from "@/components/ui/input";
import useDebounce from "@/hooks/use-debaunce";
import { useGetProjectTypesDropdownList } from "@/features/Project-type/services";
import { useGetTechnologyDropdownList } from "@/features/technology/services";
import { cn } from "@/lib/utils";
import { capitalizeFirstLetter } from "@/utils/commonFunctions";
import { ACCOUNTANT_USER_IDS, roles } from "@/utils/constant";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CustomMultiSelect } from "@/components/shared/custom-multiselect";

type GroupedDevelopers = {
  technologyName: string;
  resources: Developer[];
  technologyColor?: string;
}[];

// type GroupedDevelopers = {
//   technologyName: string;
//   resources: Developer[];
//   technologyColor?: string;
// }[];

const Board = ({
  technologies,
  techLoading,
  activeTab,
  onTotalCountChange,
}: any) => {
  const projectSkeletonCount = 4;
  const resourceSkeletonCount = 4;
  const isInactiveTab = activeTab === "Archive Projects" ? true : false;

  const { user } = useAuthStore();
  const Role = user?.user?.role;
  const isDeveloperView = Role === roles.DEVELOPER;
  const currentUserId = user?.user?.id;
  const FILTER_STORAGE_KEY = "board_filters";
  const [searchTech, setSearchTech] = useState<string>("");
  const debouncedSearchTech = useDebounce(searchTech, 500);
  const [activeTabResource, setActiveTabResource] =
    useState<string>("available");

  const { data: ProjectType, isPending: LoadingProjectType }: any =
    useGetProjectTypesDropdownList();

  // ... (Keep your existing getInitialFilters and state logic)
  const getInitialFilters = () => {
    if (typeof window === "undefined")
      return {
        pagination: true,
        clientId: null,
        handlerId: undefined,
        priority: undefined,
        Search: "",
        projectTypeId: undefined,
        status: isInactiveTab ? "inactive" : "active",
        technologyId: undefined,
      };
    const saved = localStorage.getItem(FILTER_STORAGE_KEY);
    return saved
      ? {
          search: "",
          pagination: true,
          status: isInactiveTab ? "inactive" : "active",
          projectTypeId: undefined,
          handlerId: undefined,
          technologyId: undefined,
          ...JSON.parse(saved),
        }
      : {
          pagination: true,
          clientId: null,
          status: isInactiveTab ? "inactive" : "active",
          handlerId: undefined,
          technologyId: undefined,
          priority: undefined,
          projectTypeId: undefined,
          search: "",
        };
  };

  const [listParams, setListParams] = useState(getInitialFilters);
  const [showAllDevelopers, setShowAllDevelopers] = useState(false);
  const [openTechnology, setOpenTechnology] = useState<string>("");
  const scrollContainerRef = React.useRef<HTMLDivElement | null>(null);
  const [selectedTech, setSelectedTech] = useState<string[]>([]);

  useEffect(() => {
    const { clientId, managerId, priority } = listParams;
    localStorage.setItem(
      FILTER_STORAGE_KEY,
      JSON.stringify({ clientId, managerId, priority })
    );
  }, [listParams]);

  const resourcePayload = {
    ...(activeTabResource === "available"
      ? { available: showAllDevelopers ? undefined : true }
      : {}),
    search: debouncedSearchTech,
    technologyId: selectedTech.length > 0 ? selectedTech : undefined,
  };

  const {
    data: AllDevelopersResponse,
    isPending: AllDevelopersLoading,
    refetch: AllDevelopersRefetch,
  }: any = activeTabResource !== "available"
    ? useGetAllBecomingAvailableDevelopers(resourcePayload)
    : useGetAllDevelopers(resourcePayload);

  const groupedDevelopers: GroupedDevelopers = useMemo(() => {
    if (!AllDevelopersResponse?.data) return [];
    return AllDevelopersResponse.data
      .map((group: any) => ({
        ...group,
        resources: (group.resources ?? []).filter(
          (dev: any) => !ACCOUNTANT_USER_IDS.includes(Number(dev?.id))
        ),
      }))
      .filter((group: any) => group.resources.length > 0);
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
  }: any = useGetProjectsData(listParams);

  const totalCount =
    projectPages?.pages?.[0]?.metadata?.totalCount ??
    projectPages?.pages?.[projectPages.pages.length - 1]?.metadata
      ?.totalCount ??
    0;

  useEffect(() => {
    if (onTotalCountChange) onTotalCountChange(totalCount);
  }, [totalCount, onTotalCountChange]);

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
    }

    if (!developerId || !projectId || isNaN(developerId) || isNaN(projectId)) {
      return;
    }

    try {
      await assignProject({
        developerId,
        projectId,
        startDate: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Error assigning developer:", error);
    }
  }

  const handleDeveloperClick = (developer: any, projectId: string) => {
    if (isDeveloperView && developer?.developer?.id !== currentUserId) {
      return;
    }
    setSelectedDeveloper(developer);
    setSelectedProjectId(projectId);
    setIsDialogOpen(true);
  };

  const { data: projecthandler, isPending: projecthandlerLoading }: any =
    useGetUserDropdownList({
      role: [roles.TEAM_LEAD, roles.PROJECT_MANAGER],
      status: "active",
    });

  const { data: PriorityList, isPending: PriorityListLoading }: any =
    useGetProjectPriorityDropdownList();

  const { data: clientsList, isPending: clientListLoading }: any =
    useGetClientsDropdownList();

  const { data: technologyList, isPending: technologyListLoading }: any =
    useGetTechnologyDropdownList();

  // ... (Keep existing handlers: handleClientChange, etc.)
  const handleClientChange = (value: any) =>
    setListParams((prev: any) => ({ ...prev, clientId: value ?? null }));
  const handleProjectHandleChange = (value: any) => {
    setListParams({ ...listParams, handlerId: value ?? null, currentPage: 1 });
  };
  const handleProjectTypeChange = (value: any) => {
    setListParams({ ...listParams, projectTypeId: value ?? undefined });
  };
  const handleTechnologyChange = (value: any) => {
    setListParams({
      ...listParams,
      technologyId: value ?? null,
      currentPage: 1,
    });
  };
  const handlePriorityChange = (value: any) =>
    setListParams((prev: any) => ({ ...prev, priority: value ?? undefined }));
  const handleSearch = (search: string | undefined) => {
    setListParams((prev: any) => ({ ...prev, search: search ?? "" }));
  };

  useEffect(() => {
    if (!listParams.projectTypeId && ProjectType?.data?.length) {
      const fixedType = ProjectType.data.find(
        (type: any) => type.name === "Fixed"
      );
      if (fixedType) {
        setListParams((prev: any) => ({
          ...prev,
          projectTypeId: fixedType.id,
        }));
      }
    }
  }, [ProjectType]);

  const filters: FilterConfig[] = [
    {
      type: "search",
      placeholder: "Search by project name ...",
      key: "search",
      value: listParams.search,
      onChange: handleSearch,
    },
    ...(!isDeveloperView
      ? [
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
        ]
      : []),

    {
      type: "select",
      key: "technologyId",
      placeholder: "Filter by Technology",
      options: technologyList?.data?.map((technology: any) => {
        return { value: technology.id, label: technology.name };
      }),
      value: listParams.technologyId,
      onChange: handleTechnologyChange,
      isLoading: technologyListLoading,
      multiple: true,
    },
    {
      type: "select",
      key: "handlerId",
      placeholder: "Filter by Coordinator",
      options: projecthandler?.data?.map((value: any) => ({
        label: value?.fullName,
        value: value?.id,
      })),
      value: listParams.handlerId,
      onChange: handleProjectHandleChange,
      isLoading: projecthandlerLoading,
    },
    {
      type: "select",
      key: "priority",
      placeholder: "Filter by Priority",
      options: PriorityList?.data?.map((value: any) => ({
        label: capitalizeFirstLetter(value),
        value: value,
      })),
      value: listParams.priority,
      onChange: handlePriorityChange,
      isLoading: PriorityListLoading,
    },
    {
      type: "select",
      key: "projectTypeId",
      placeholder: "Filter by Project Type",
      options: ProjectType?.data?.map((value: any) => {
        return { label: value?.name, value: value?.id };
      }),
      value: listParams.projectTypeId,
      onChange: handleProjectTypeChange,
      isLoading: LoadingProjectType,
    },
  ];

  const techOptions = useMemo(() => {
    return (
      technologies?.data.map((group: any) => ({
        value: group.id,
        label: group.name,
      })) ?? []
    );
  }, [technologies]);

  return (
    <>
      <div className="flex-1 min-h-0 flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <GlobalFilterSection filters={filters ?? []} />
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-orange-500"></span>
              <span className="text-sm font-medium">High</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-yellow-500"></span>
              <span className="text-sm font-medium">Medium</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-teal-500"></span>
              <span className="text-sm font-medium">Low</span>
            </div>
          </div>
        </div>

        <div className="flex-1 min-h-0 grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
          <DndContext
            sensors={sensors}
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
            onDragCancel={() => setActiveDeveloper(null)}
          >
            {/* LEFT COLUMN: PROJECTS */}
            <div
              ref={scrollContainerRef}
              className="min-h-[18rem] lg:min-h-0 lg:h-full space-y-4 overflow-y-auto overflow-x-hidden p-2 [scrollbar-gutter:stable] rounded-md border"
            >
              {projectListLoading || LoadingProjectType ? (
                <div className="space-y-4">
                  {Array.from({ length: projectSkeletonCount }).map(
                    (_, index) => (
                      <ProjectCardSkeleton
                        key={`project-skeleton-${index}`}
                        view="board"
                      />
                    )
                  )}
                </div>
              ) : projectList?.length ? (
                projectList?.map((p: any) => (
                  <ProjectCard
                    key={p?.id}
                    project={p}
                    onStatusChanged={refetch}
                  >
                    {p?.developerAllocations?.length !== 0 && (
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
                    )}
                  </ProjectCard>
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
              {isFetchingNextPage && (
                <div className="space-y-4 py-2">
                  {Array.from({ length: 2 }).map((_, index) => (
                    <ProjectCardSkeleton
                      key={`project-fetch-skeleton-${index}`}
                      view="board"
                    />
                  ))}
                </div>
              )}
              <div ref={loadMoreRef} className="h-2" />
            </div>

            {/* RIGHT COLUMN: RESOURCES */}
            {!isDeveloperView && (
              <aside className="min-h-[18rem] lg:min-h-0 lg:h-full overflow-hidden">
                <Card
                  ref={availableDroppable.setNodeRef}
                  className={cn(
                    // FLEXBOX FIX: Forces card to manage internal space
                    "flex flex-col h-full py-2 gap-2 overflow-hidden",
                    availableDroppable.isOver && "ring-2 ring-pink-500"
                  )}
                >
                  {/* Header: Fixed height (flex-none) */}
                  <CardHeader className="flex-none flex flex-col gap-2 pb-2">
                    <Tabs
                      value={activeTabResource}
                      onValueChange={setActiveTabResource}
                      className="w-full my-1"
                    >
                      <TabsList>
                        <TabsTrigger value="available">Available</TabsTrigger>
                        <TabsTrigger value="becomeAvailable">
                          Become Available
                        </TabsTrigger>
                      </TabsList>
                    </Tabs>
                    <CardTitle className="w-full flex items-center justify-between">
                      {activeTabResource === "available" ? (
                        <span className="flex gap-2 justify-between w-full items-center">
                          {showAllDevelopers
                            ? "All Developers"
                            : "Available Resources"}
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground font-normal">
                              All
                            </span>
                            <Switch
                              checked={showAllDevelopers}
                              onCheckedChange={setShowAllDevelopers}
                            />
                          </div>
                        </span>
                      ) : (
                        <span>Become Available</span>
                      )}
                    </CardTitle>

                    {/* REDUCED HEIGHT INPUT: h-10 instead of h-16 */}
                    <Input
                      value={searchTech}
                      onChange={(e) => setSearchTech(e.target.value)}
                      placeholder="Search Developers..."
                      className="w-full h-10"
                    />
                    <CustomMultiSelect
                      options={techOptions}
                      selected={selectedTech}
                      onChange={setSelectedTech}
                      loading={techLoading}
                      placeholder="Filter by Technology..."
                      className="w-full"
                    />
                  </CardHeader>

                  {/* Content: Takes remaining space (flex-1) and scrolls (overflow-y-auto) */}
                  <CardContent className="flex-1 min-h-0 overflow-y-auto pr-2 [scrollbar-gutter:stable]">
                    {AllDevelopersLoading ? (
                      <div className="space-y-2">
                        {Array.from({ length: resourceSkeletonCount }).map(
                          (_, index) => (
                            <div
                              key={`resource-skeleton-${index}`}
                              className="rounded-md border bg-secondary/50 px-2 py-3"
                            >
                              <div className="flex items-center justify-between p-2">
                                <div className="flex items-center gap-3">
                                  <Skeleton className="h-4 w-28" />
                                  <Skeleton className="h-5 w-8 rounded-full" />
                                </div>
                                <Skeleton className="h-5 w-5 rounded-full" />
                              </div>
                            </div>
                          )
                        )}
                      </div>
                    ) : groupedDevelopers?.length > 0 ? (
                      <SortableContext
                        items={allDeveloperIds}
                        strategy={rectSortingStrategy}
                      >
                        <div className="space-y-2">
                          {groupedDevelopers?.map((group) => (
                            <Collapsible
                              key={group.technologyName}
                              open={openTechnology === group.technologyName}
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
                                    <span className="font-semibold text-sm">
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
                                      variant="compact"
                                    />
                                  ))}
                                </div>
                              </CollapsibleContent>
                            </Collapsible>
                          ))}
                        </div>
                      </SortableContext>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-10 text-center transition-all duration-300">
                        <div className="mb-3 p-3 rounded-full bg-muted">
                          <Users className="h-8 w-8 text-muted-foreground/70" />
                        </div>
                        <h3 className="text-lg font-semibold text-muted-foreground">
                          No developers found
                        </h3>
                        <p className="text-sm text-muted-foreground/70 mt-1">
                          Try adjusting your filters.
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
