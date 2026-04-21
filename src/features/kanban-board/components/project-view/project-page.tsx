/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-explicit-any */

import GlobalFilterSection from "@/components/table/global-table-filter";
import { ProjectCardSkeleton } from "@/components/layout/project-card-skeleton";
import { FilterConfig } from "@/components/table/table-toolbar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Skeleton } from "@/components/ui/skeleton";
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
import { ChevronDown, Users, LayoutGrid, List } from "lucide-react";
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
import { roles, PROJECT_DETAILS_FILTER_STORAGE_KEY } from "@/utils/constant";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CustomMultiSelect } from "@/components/shared/custom-multiselect";
// import { Skeleton } from "@/components/ui/skeleton";

type GroupedDevelopers = {
  technologyName: string;
  resources: Developer[];
  technologyColor?: string;
}[];

const ProjectPage = ({
  onTotalCountChange,
  activeTab: initialActiveTab = "project_details",
}: any) => {
  const projectSkeletonCount = 6;
  const resourceSkeletonCount = 4;
  const [activeTab] = useState(initialActiveTab);
  const isInactiveTab = activeTab === "Archive Projects" ? true : false;

  const { user } = useAuthStore();
  const Role = user?.user?.role;
  const isDeveloperView = Role === roles.DEVELOPER;
  // const isCoordinatorView =
  //   Role === roles.PROJECT_MANAGER || Role === roles.TEAM_LEAD;
  const currentUserId = user?.user?.id;
  const FILTER_STORAGE_KEY = PROJECT_DETAILS_FILTER_STORAGE_KEY;
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
        isProduct: undefined,
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
  const [view, setView] = useState<"grid" | "list">(() => {
    const storedView = localStorage.getItem("projectViewType") as
      | "grid"
      | "list"
      | null;
    return storedView || "grid";
  });
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
    const {
      clientId,
      handlerId,
      priority,
      search,
      projectTypeId,
      technologyId,
      isProduct,
      isPinned,
    } = listParams;

    localStorage.setItem(
      FILTER_STORAGE_KEY,
      JSON.stringify({
        clientId,
        handlerId,
        managerId: handlerId,
        priority,
        search,
        projectTypeId,
        technologyId,
        isProduct,
        isPinned,
      })
    );
  }, [listParams, FILTER_STORAGE_KEY]);

  const resourcePayload = {
    pagination: false,
    ...(activeTabResource === "available"
      ? { available: showAllDevelopers ? undefined : true }
      : {}),
    search: debouncedSearchTech,
    technologyId: selectedTech.length > 0 ? selectedTech : undefined,
  };

  const availableDevelopers = useGetAllDevelopers(
    resourcePayload,
    activeTabResource === "available" && !isDeveloperView && !isBdeView
  );

  const becomingAvailableDevelopers = useGetAllBecomingAvailableDevelopers(
    resourcePayload,
    activeTabResource !== "available" && !isDeveloperView && !isBdeView
  );

  const AllDevelopersResponse =
    activeTabResource === "available"
      ? availableDevelopers.data
      : becomingAvailableDevelopers.data;
  const AllDevelopersLoading =
    activeTabResource === "available"
      ? availableDevelopers.isPending
      : becomingAvailableDevelopers.isPending;
  const AllDevelopersRefetch =
    activeTabResource === "available"
      ? availableDevelopers.refetch
      : becomingAvailableDevelopers.refetch;

  const groupedDevelopers: GroupedDevelopers = useMemo(() => {
    const developersResponse = Array.isArray(AllDevelopersResponse)
      ? AllDevelopersResponse
      : Array.isArray((AllDevelopersResponse as any)?.data)
        ? (AllDevelopersResponse as any).data
        : Array.isArray((AllDevelopersResponse as any)?.data?.data)
          ? (AllDevelopersResponse as any).data.data
          : [];

    if (!developersResponse.length) return [];

    const isGroupedResponse = developersResponse.some((item: any) =>
      Array.isArray(item?.resources)
    );

    if (isGroupedResponse) {
      return developersResponse
        .map((group: any) => ({
          ...group,
          technologyName:
            group.technologyName ?? group.technology?.name ?? "Other",
          technologyColor: group.technologyColor ?? group.technology?.color,
          resources: group.resources ?? [],
        }))
        .filter((group: any) => group.resources.length > 0);
    }

    const groupedByTechnology = developersResponse.reduce(
      (groups: Record<string, any>, developer: any) => {
        const technologyName = developer?.technology?.name ?? "Other";

        if (!groups[technologyName]) {
          groups[technologyName] = {
            technologyName,
            technologyColor: developer?.technology?.color,
            resources: [],
          };
        }

        groups[technologyName].resources.push(developer);
        return groups;
      },
      {}
    );

    return Object.values(groupedByTechnology);
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
    if (!projectListLoading && onTotalCountChange) {
      onTotalCountChange(totalCount);
    }
  }, [totalCount, projectListLoading, onTotalCountChange]);

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
  const handleIsProductChange = (value: any) => {
    let isProduct: boolean | undefined;
    if (typeof value === "boolean") {
      isProduct = value;
    } else if (value === "true") {
      isProduct = true;
    } else if (value === "false") {
      isProduct = false;
    } else {
      isProduct = undefined;
    }
    setListParams((prev: any) => ({ ...prev, isProduct }));
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
    {
      type: "select",
      key: "isProduct",
      placeholder: "Filter by Project Nature",
      options: [
        { value: false, label: "Project" },
        { value: true, label: "Product" },
      ],
      value: listParams.isProduct,
      onChange: handleIsProductChange,
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

  const projectSkeletons = Array.from({ length: projectSkeletonCount }).map(
    (_, index) => (
      <ProjectCardSkeleton
        key={`project-skeleton-${view}-${index}`}
        view={view}
      />
    )
  );

  return (
    <div className="flex-1 min-h-0 flex flex-col gap-4">
      {!isBdeView && (
        <div className="flex flex-wrap items-start gap-3">
          <div className="flex-1 min-w-0">
            <GlobalFilterSection filters={filters ?? []} className="" />
          </div>
          <Tabs
            value={view}
            onValueChange={(v: any) => setView(v)}
            className="flex-none"
          >
            <TabsList className="bg-[#fdebef] rounded-full">
              <TabsTrigger
                value="grid"
                className={cn(
                  tabTriggerClass,
                  "gap-2 px-3 h-8 text-xs font-medium transition-all",
                  view === "grid" && "bg-white text-black shadow-sm"
                )}
              >
                <LayoutGrid className="h-4 w-4" />
                Grid
              </TabsTrigger>
              <TabsTrigger
                value="list"
                className={cn(
                  tabTriggerClass,
                  "gap-2 px-3 h-8 text-xs font-medium transition-all",
                  view === "list" && "bg-white text-black shadow-sm"
                )}
              >
                <List className="h-4 w-4" />
                List
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      )}

      <div
        className={`${isDeveloperView || isBdeView ? "flex-1 min-h-0 flex flex-col gap-4" : "flex-1 min-h-0 grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_320px]"}`}
      >
        <DndContext
          sensors={sensors}
          onDragStart={onDragStart}
          onDragEnd={onDragEnd}
          onDragCancel={() => setActiveDeveloper(null)}
        >
          <div
            ref={scrollContainerRef}
            className={`space-y-4 !h-full overflow-y-auto overflow-x-hidden p-2 [scrollbar-gutter:stable] rounded-md`}
          >
            {projectListLoading || LoadingProjectType ? (
              view === "grid" ? (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 2xl:grid-cols-3">
                  {projectSkeletons}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <div className="min-w-[860px] flex flex-col gap-0 border rounded-lg bg-white overflow-hidden">
                    <div className="flex items-center gap-4 px-6 py-3 bg-gray-50 border-b text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                      <div className="w-1 shrink-0" />
                      <div className="flex-1 min-w-0">Project</div>
                      <div className="w-32 shrink-0 text-center">Status</div>
                      <div className="w-48 shrink-0">Progress</div>
                      <div className="w-28 shrink-0">Deadline</div>
                      <div className="w-24 shrink-0">Team</div>
                      <div className="w-[64px] shrink-0 text-right pr-4">
                        Actions
                      </div>
                    </div>
                    {projectSkeletons}
                  </div>
                </div>
              )
            ) : projectList?.length ? (
              view === "grid" ? (
                <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-4">
                  {projectList?.map((p: any) => (
                    <ProjectCard
                      key={p?.id}
                      project={p}
                      onStatusChanged={refetch}
                      isArchiveTab={isInactiveTab}
                      view={view}
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
                              ?.slice(0, view === "grid" ? 6 : 3)
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
                                            handleDeveloperClick(
                                              allocation,
                                              p.id
                                            )
                                        : undefined
                                    }
                                    disabled={isDeveloperView}
                                  />
                                );
                              })}
                            {p?.developerAllocations?.length >
                              (view === "grid" ? 6 : 3) && (
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <div className="flex items-center justify-center h-10 w-10 rounded-full border-2 border-white bg-gray-100 text-[10px] font-bold text-gray-600 relative z-10 cursor-default hover:bg-gray-200 transition-colors">
                                      +
                                      {p.developerAllocations.length -
                                        (view === "grid" ? 6 : 3)}
                                    </div>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <div className="space-y-1">
                                      <p className="font-semibold text-xs border-b pb-1 mb-1">
                                        Additional Team Members:
                                      </p>
                                      {p.developerAllocations
                                        .slice(view === "grid" ? 6 : 3)
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
                                                  allocation.developer
                                                    ?.technology?.name
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
                <div className="overflow-x-auto">
                  <div className="min-w-[860px] flex flex-col gap-0 border rounded-lg bg-white overflow-hidden">
                    <div className="flex items-center gap-4 px-6 py-3 bg-gray-50 border-b text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                      <div className="w-1 shrink-0" />
                      <div className="flex-1 min-w-0">Project</div>

                      <div className="w-32 shrink-0 text-center">Status</div>

                      <div className="w-48 shrink-0">Progress</div>

                      <div className="w-28 shrink-0">Deadline</div>
                      <div className="w-24 shrink-0">Team</div>
                      <div className="w-[64px] shrink-0 text-right pr-4">
                        Actions
                      </div>
                    </div>
                    {projectList?.map((p: any) => (
                      <ProjectCard
                        key={p?.id}
                        project={p}
                        onStatusChanged={refetch}
                        isArchiveTab={isInactiveTab}
                        view={view}
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
                                ?.slice(0, 3)
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
                                              handleDeveloperClick(
                                                allocation,
                                                p.id
                                              )
                                          : undefined
                                      }
                                      disabled={isDeveloperView}
                                    />
                                  );
                                })}
                              {p?.developerAllocations?.length > 3 && (
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <div className="flex items-center justify-center h-10 w-10 rounded-full border-2 border-white bg-gray-100 text-[10px] font-bold text-gray-600 relative z-10 cursor-default hover:bg-gray-200 transition-colors">
                                        +{p.developerAllocations.length - 3}
                                      </div>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <div className="space-y-1">
                                        <p className="font-semibold text-xs border-b pb-1 mb-1">
                                          Additional Team Members:
                                        </p>
                                        {p.developerAllocations
                                          .slice(3)
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
                                                  {
                                                    allocation.developer
                                                      .fullName
                                                  }
                                                </p>
                                                <p className="text-[9px] text-muted-foreground">
                                                  {
                                                    allocation.developer
                                                      ?.technology?.name
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
                </div>
              )
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
            {isFetchingNextPage &&
              (view === "grid" ? (
                <div className="grid grid-cols-1 gap-4 py-2 md:grid-cols-2 2xl:grid-cols-3">
                  {Array.from({ length: 3 }).map((_, index) => (
                    <ProjectCardSkeleton
                      key={`project-fetch-skeleton-grid-${index}`}
                      view="grid"
                    />
                  ))}
                </div>
              ) : (
                <div className="overflow-x-auto py-2">
                  <div className="min-w-[860px] flex flex-col gap-0 border rounded-lg bg-white overflow-hidden">
                    {Array.from({ length: 3 }).map((_, index) => (
                      <ProjectCardSkeleton
                        key={`project-fetch-skeleton-list-${index}`}
                        view="list"
                      />
                    ))}
                  </div>
                </div>
              ))}
            <div ref={loadMoreRef} className="h-2" />
          </div>

          {!isDeveloperView && !isBdeView && (
            <aside className="top-4 h-full overflow-hidden">
              <Card
                ref={availableDroppable.setNodeRef}
                className={cn(
                  // FIX 1: 'flex flex-col h-full' forces the card to fill the parent and stack children
                  "flex flex-col h-full py-2 gap-2 overflow-hidden",
                  availableDroppable.isOver && "ring-2 ring-pink-500"
                )}
              >
                {/* FIX 2: 'flex-none' ensures the header never shrinks or gets cut off */}
                <CardHeader className="flex-none flex flex-col gap-2 pb-2">
                  <Tabs
                    value={activeTabResource}
                    onValueChange={setActiveTabResource}
                    className="w-full my-1"
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

                  {/* FIX 3: Changed 'h-16' to 'h-10'. h-16 is too tall (64px) and eats up space at 150% zoom */}
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

                {/* FIX 4: 'flex-1' fills remaining space. 'min-h-0' is REQUIRED for scrolling in nested flex. Removed fixed 'h-[50dvh]' */}
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
                        No developers
                      </h3>
                      <p className="text-sm text-muted-foreground/70 mt-1">
                        Check filters.
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
