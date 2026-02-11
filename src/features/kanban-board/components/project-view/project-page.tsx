/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-explicit-any */

import GlobalFilterSection from "@/components/table/global-table-filter";
import { FilterConfig } from "@/components/table/table-toolbar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Switch } from "@/components/ui/switch";
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
} from "../../services";
import { DeveloperChip } from "../developer-chip";
import { DeveloperDialog } from "../developer-dialog";
import { ProjectCard } from "./projects-card";
import { Input } from "@/components/ui/input";
import useDebounce from "@/hooks/use-debaunce";
import { useGetProjectTypesDropdownList } from "@/features/Project-type/services";
import { useGetTechnologyDropdownList } from "@/features/technology/services";
import { cn } from "@/lib/utils";
import { capitalizeFirstLetter } from "@/utils/commonFunctions";
import { roles } from "@/utils/constant";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CustomMultiSelect } from "@/components/shared/custom-multiselect";
import { Skeleton } from "@/components/ui/skeleton";

type GroupedDevelopers = {
  technologyName: string;
  resources: Developer[];
  technologyColor?: string;
}[];

const ProjectPage = ({
  onTotalCountChange,
  activeTab: initialActiveTab = "project_details",
}: any) => {
  const [activeTab] = useState(initialActiveTab);
  const isInactiveTab = activeTab === "Archive Projects" ? true : false;

  const { user } = useAuthStore();
  const Role = user?.user?.role;
  const isDeveloperView = Role === roles.DEVELOPER;
  const isCoordinatorView =
    Role === roles.PROJECT_MANAGER || Role === roles.TEAM_LEAD;
  const currentUserId = user?.user?.id;
  const FILTER_STORAGE_KEY = "project_details_filters";
  const [searchTech, setSearchTech] = useState<string>("");
  const debouncedSearchTech = useDebounce(searchTech, 500);
  const [activeTabResource, setActiveTabResource] =
    useState<string>("available");

  const { data: ProjectType, isPending: LoadingProjectType }: any =
    useGetProjectTypesDropdownList();

  const isBdeView = Role === roles.BDE;

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
          handlerId:
            isCoordinatorView && !isInactiveTab ? currentUserId : undefined,
          technologyId: undefined,
          ...JSON.parse(saved),
        }
      : {
          pagination: true,
          clientId: null,
          status: isInactiveTab ? "inactive" : "active",
          handlerId:
            isCoordinatorView && !isInactiveTab ? currentUserId : undefined,
          technologyId: undefined,
          priority: isInactiveTab ? undefined : "high",
          projectTypeId: undefined,
          search: "",
        };
  };

  const [listParams, setListParams] = useState(getInitialFilters);
  const [showAllDevelopers, setShowAllDevelopers] = useState(false);
  const [openTechnology, setOpenTechnology] = useState<string>("");
  const scrollContainerRef = React.useRef<HTMLDivElement | null>(null);

  // State for the multi-select technology filter
  const [selectedTech, setSelectedTech] = useState<string[]>([]);

  // Update listParams when activeTab changes (to reset status if needed)
  useEffect(() => {
    setListParams(getInitialFilters());
  }, [activeTab]);

  useEffect(() => {
    const { clientId, managerId, priority, isPinned } = listParams;
    localStorage.setItem(
      FILTER_STORAGE_KEY,
      JSON.stringify({ clientId, managerId, priority, isPinned })
    );
  }, [listParams, FILTER_STORAGE_KEY]);

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
    return AllDevelopersResponse.data;
  }, [AllDevelopersResponse]);

  const allDeveloperIds = useMemo(() => {
    return groupedDevelopers.flatMap((group) =>
      group.resources.map((dev: any) => `available-${dev?.id}`)
    );
  }, [groupedDevelopers]);

  // -----------------------------------------------------------
  // CHANGE HERE: Spreading listParams and FORCING isPinned: true
  // -----------------------------------------------------------
  const {
    data: projectPages,
    isPending: projectListLoading,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  }: any = useGetProjectsData({
    ...listParams,
    isPinned: isBdeView ? undefined : true,
  });

  // Extract total count from pagination metadata and notify parent when it changes
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
    if (isDeveloperView || isBdeView) return;
    const developer = event.active.data.current?.developer as any;
    if (developer) {
      setActiveDeveloper(developer);
    }
  }

  async function onDragEnd(event: DragEndEvent) {
    if (isDeveloperView || isBdeView) return;
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
    if (
      (isDeveloperView && developer?.developer?.id !== currentUserId) ||
      isBdeView
    ) {
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

  const handleClientChange = (value: any) =>
    setListParams((prev: any) => ({ ...prev, clientId: value ?? null }));
  const handleProjectHandleChange = (value: any) => {
    setListParams({ ...listParams, handlerId: value ?? null, currentPage: 1 });
  };

  const handleProjectTypeChange = (value: any) => {
    setListParams({
      ...listParams,
      projectTypeId: value ?? undefined,
    });
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

  // useEffect(() => {
  //   if (
  //     !isInactiveTab &&
  //     !listParams.projectTypeId &&
  //     ProjectType?.data?.length
  //   ) {
  //     const fixedType = ProjectType.data.find(
  //       (type: any) => type.name === "Fixed"
  //     );
  //     if (fixedType) {
  //       setListParams((prev: any) => ({
  //         ...prev,
  //         projectTypeId: fixedType.id,
  //       }));
  //     }
  //   }
  // }, [ProjectType]);

  const { data: technologies, isPending: techLoading } =
    useGetTechnologyDropdownList(null, Role !== roles.BDE);

  const tabTriggerClass =
    "flex items-center gap-2 rounded-[50px] !px-3 !py-2  transition-all " +
    "data-[state=active]:bg-black data-[state=active]:text-white h-[35px]";

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
      options: (technologyList as any)?.data?.map((technology: any) => {
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
      options: (projecthandler as any)?.data?.map((value: any) => ({
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
      options: (PriorityList as any)?.data?.map((value: any) => ({
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
      options: (ProjectType as any)?.data?.map((value: any) => {
        return { label: value?.name, value: value?.id };
      }),
      value: listParams.projectTypeId,
      onChange: handleProjectTypeChange,
      isLoading: LoadingProjectType,
    },
  ];

  const techOptions = useMemo(() => {
    return (
      (technologies as any)?.data?.map((group: any) => ({
        value: group.id,
        label: group.name,
      })) ?? []
    );
  }, [technologies]);

  return (
    <div className="flex flex-col gap-4">
      {!isBdeView && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <GlobalFilterSection filters={filters ?? []} />
        </div>
      )}

      <div
        className={`${isDeveloperView || isBdeView ? "grid grid-cols-1 gap-4" : "grid grid-cols-1 gap-4 md:grid-cols-[1fr_320px] h-[75dvh]"}`}
      >
        <DndContext
          sensors={sensors}
          onDragStart={onDragStart}
          onDragEnd={onDragEnd}
          onDragCancel={() => setActiveDeveloper(null)}
        >
          <div
            ref={scrollContainerRef}
            className={`space-y-4 !h-full overflow-y-auto p-2 [scrollbar-gutter:stable] rounded-md `}
          >
            {projectListLoading || LoadingProjectType ? (
              <div className="flex flex-col justify-center items-center py-10 gap-3">
                <div className="w-8 h-8 border-4 border-dashed rounded-full animate-spin border-primary/50 border-t-primary"></div>
                <span className="text-sm text-muted-foreground">
                  Loading Projects...
                </span>
              </div>
            ) : projectList?.length ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 2xl:grid-cols-3 gap-6">
                {projectList?.map((p: any) => (
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
                        <div className="flex -space-x-2 mb-2 items-center">
                          {p?.developerAllocations
                            ?.slice(0, 6)
                            .map((allocation: any) => {
                              const isMyChip =
                                allocation.developer.id === currentUserId;
                              const canClick = !isDeveloperView || isMyChip;
                              return (
                                <DeveloperChip
                                  key={`project-${p.id}-${allocation.developer.id}`}
                                  developer={allocation.developer}
                                  containerId={p.id}
                                  endDate={allocation.endDate}
                                  variant="avatar"
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
                          {p?.developerAllocations?.length > 6 && (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div className="flex items-center justify-center h-10 w-10 rounded-full border-2 border-white bg-gray-100 text-[10px] font-bold text-gray-600 relative z-10 cursor-default hover:bg-gray-200 transition-colors">
                                    +{p.developerAllocations.length - 6}
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <div className="space-y-1">
                                    <p className="font-semibold text-xs border-b pb-1 mb-1">
                                      Additional Team Members:
                                    </p>
                                    {p.developerAllocations
                                      .slice(6)
                                      .map((allocation: any) => {
                                        const isMyChip =
                                          allocation.developer.id ===
                                          currentUserId;
                                        const canClick =
                                          !isDeveloperView || isMyChip;
                                        return (
                                          <div
                                            key={allocation.developer.id}
                                            className={cn(
                                              "flex flex-col py-1 border-b last:border-0",
                                              canClick &&
                                                "cursor-pointer hover:bg-muted/50 rounded px-1 -mx-1"
                                            )}
                                            onClick={
                                              canClick
                                                ? () =>
                                                    handleDeveloperClick(
                                                      allocation,
                                                      p.id
                                                    )
                                                : undefined
                                            }
                                          >
                                            <p className="text-[10px] font-medium text-foreground">
                                              {allocation.developer.fullName}
                                            </p>
                                            <p className="text-[9px] text-muted-foreground">
                                              {
                                                allocation.developer?.technology
                                                  ?.name
                                              }
                                            </p>
                                          </div>
                                        );
                                      })}
                                  </div>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          )}
                        </div>
                      </SortableContext>
                    )}
                  </ProjectCard>
                ))}
              </div>
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
              <div className="flex justify-center items-center py-4">
                <div className="w-8 h-8 border-4 border-dashed rounded-full animate-spin border-primary/50 border-t-primary"></div>
              </div>
            )}
            <div ref={loadMoreRef} className="h-2" />
          </div>

          {!isDeveloperView && !isBdeView && (
            <aside className="top-4 !h-full">
              <Card
                ref={availableDroppable.setNodeRef}
                className={cn(
                  "!h-full !gap-2 py-2",
                  availableDroppable.isOver && "ring-2 ring-pink-500"
                )}
              >
                <CardHeader className="flex flex-col gap-2">
                  <Tabs
                    value={activeTabResource}
                    onValueChange={setActiveTabResource}
                    className="!w-full my-1"
                  >
                    <TabsList className="flex flex-wrap bg-[#fdebef] rounded-full h-auto">
                      <TabsTrigger
                        value="available"
                        className={tabTriggerClass}
                      >
                        Available
                      </TabsTrigger>
                      <TabsTrigger
                        value="becomeAvailable"
                        className={tabTriggerClass}
                      >
                        Become Available
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>
                  <CardTitle className="w-full text-balance flex items-center justify-between">
                    {activeTabResource === "available" ? (
                      <span className="flex gap-2 justify-between w-full">
                        {showAllDevelopers
                          ? "All Developers"
                          : "Available Resources"}
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">
                            All
                          </span>
                          <Switch
                            checked={showAllDevelopers}
                            onCheckedChange={setShowAllDevelopers}
                          />
                        </div>
                      </span>
                    ) : (
                      <span>Become Available Resources</span>
                    )}
                  </CardTitle>

                  <Input
                    value={searchTech}
                    onChange={(e) => setSearchTech(e.target.value)}
                    placeholder="Search developers..."
                    className="w-full h-10"
                  />
                  <CustomMultiSelect
                    options={techOptions}
                    selected={selectedTech}
                    onChange={setSelectedTech}
                    loading={techLoading}
                    placeholder="Filter by technology..."
                    className="w-full"
                  />
                </CardHeader>

                <CardContent className="h-[50dvh] overflow-y-auto [scrollbar-gutter:stable] pr-2">
                  {AllDevelopersLoading ? (
                    <div className="space-y-4">
                      {Array.from({ length: 6 }).map((_, i) => (
                        <div
                          key={i}
                          className="flex items-center gap-3 p-2 border rounded-md"
                        >
                          <Skeleton className="h-10 w-10 rounded-full" />
                          <div className="flex-1 space-y-2">
                            <Skeleton className="h-4 w-3/4" />
                            <Skeleton className="h-3 w-1/2" />
                          </div>
                        </div>
                      ))}
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
                        Try adjusting your filters or check again later.
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
    </div>
  );
};

export default ProjectPage;
