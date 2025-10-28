/* eslint-disable no-console */
// src/pages/board.tsx
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
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
import { Main } from "@/components/layout/main";
import { ProjectCard } from "./components/project-card";
import { DeveloperChip } from "./components/developer-chip";
import { DeveloperDialog } from "./components/developer-dialog"; 
import { useAssignDeveloper, useGetAvailableDeveloperList } from "./services";
import type { Developer } from "@/lib/types";
import { useGetProjectsData } from "../projects/services";
import { useAuthStore } from "@/stores/use-auth-store";
import GlobalFilterSection from "@/components/table/global-table-filter";
import { FilterConfig } from "@/components/table/table-toolbar";
import { useGetUsersList } from "../users/services";
import { useGetClientsData } from "../clients/services";
import { Users } from "lucide-react";

const Board = () => {
  const { user } = useAuthStore();
  const isDeveloperView = user?.user?.role === "developer"; 
  const currentUserId = user?.user?.id; // ✅ Get the logged-in user ID
  const FILTER_STORAGE_KEY = "board_filters"; 
  
  const getInitialFilters = () => {
    if (typeof window === "undefined")
      return {
        pagination: false,
        clientId: null,
        managerId: null,
        priority: undefined,
      };
    const saved = localStorage.getItem(FILTER_STORAGE_KEY);
    return saved
      ? { pagination: false, ...JSON.parse(saved) }
      : {
          pagination: false,
          clientId: null,
          managerId: null,
          priority: undefined,
        };
  };

  const [listParams, setListParams] = useState(getInitialFilters);
  
  useEffect(() => {
    const { clientId, managerId, priority } = listParams;
    localStorage.setItem(
      FILTER_STORAGE_KEY,
      JSON.stringify({ clientId, managerId, priority })
    );
  }, [listParams]);

  const apiParams = {
    pagination: false,
    clientId: listParams.clientId,
    managerId: listParams.managerId,
    priority: listParams.priority,
  };

  const {
    data: AvailableDevelopers,
    isPending: AvaliableDevelopersLoading,
    refetch: refetchAvailableDevelopers,
  }: any = useGetAvailableDeveloperList();

  const {
    data: projectList,
    isPending: projectListLoading,
    refetch,
  }: any = useGetProjectsData(apiParams);

  const onsuccessAssignDeveloper = () => {
    refetch();
  };

  const { mutateAsync: assignProject } = useAssignDeveloper(
    onsuccessAssignDeveloper
  );

  // State for the dragged item
  const [activeDeveloper, setActiveDeveloper] =
    React.useState<Developer | null>(null);

  // State for the dialog
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
    if (isDeveloperView) return; // Disable drag for developers
    const developer = event.active.data.current?.developer as Developer;
    if (developer) {
      setActiveDeveloper(developer);
    }
  }

  async function onDragEnd(event: DragEndEvent) {
    if (isDeveloperView) return; // Disable drop for developers
    setActiveDeveloper(null);

    const { active, over } = event;
    if (!active || !over) return;

    const developerKey = String(active.id);
    const developerId = Number(developerKey.split("-").pop());

    let projectId: number | null = null;

    // Case 1: Dropped onto a DeveloperChip inside a project.
    if (
      over.data.current?.containerId &&
      over.data.current.containerId !== "available"
    ) {
      projectId = Number(over.data.current.containerId);
    }
    // Case 2: Dropped directly onto a ProjectCard (which is a droppable).
    else if (typeof over.id === "number") {
      projectId = over.id;
    }
    // Case 3: Dropped onto the "Available Resources" droppable area.
    else if (over.id === "available") {
      console.log("⚠️ Dropped on available list — no assignment made.");
      return;
    }

    console.log("🧩 Developer ID:", developerId);
    console.log("🏗️ Project ID:", projectId);

    // Validate extracted IDs before making the API call
    if (!developerId || !projectId || isNaN(developerId) || isNaN(projectId)) {
      console.warn("Invalid IDs:", { developerKey, overId: over.id });
      return;
    }

    // Safe API call
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

  // Handler to open the dialog with the correct developer and project context
  function handleDeveloperClick(developer: Developer, projectId: string) {
    // ✅ NEW CHECK: Only allow click if not a developer, OR if it's the logged-in developer's chip.
    if (isDeveloperView && developer.id !== currentUserId) {
      return;
    }

    setSelectedDeveloper(developer);
    setSelectedProjectId(projectId);
    setIsDialogOpen(true);
  }

  // filter section
  const { data: managerList, isPending: managerListLoading }: any =
    useGetUsersList({
      pagination: false,
      role: "project_manager",
    });

  const { data: clientsList, isPending: clientListLoading }: any =
    useGetClientsData({
      pagination: false,
    });

  const handleClientChange = (value: any) =>
    setListParams((prev: any) => ({ ...prev, clientId: value ?? null }));

  const handleManagerChange = (value: any) =>
    setListParams((prev: any) => ({ ...prev, managerId: value ?? null }));

  const handlePriorityChange = (value: any) =>
    setListParams((prev: any) => ({ ...prev, priority: value ?? undefined }));
  const filters: FilterConfig[] = [
    {
      type: "select",
      key: "clientId",
      placeholder: "Filter by Client",
      options: clientsList?.data?.map((value: any) => {
        return { label: value?.name, value: value?.id };
      }),
      value: listParams.clientId, 
      onChange: handleClientChange,
      isLoading: clientListLoading,
    },
    {
      type: "select",
      key: "managerId",
      placeholder: "Filter by Manager",
      options: managerList?.data?.map((value: any) => {
        return { label: value?.fullName, value: value?.id };
      }),
      value: listParams.managerId, 
      onChange: handleManagerChange,
      isLoading: managerListLoading,
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

  return projectListLoading || AvaliableDevelopersLoading ? (
    <div className="flex flex-col justify-center items-center py-10 gap-3 h-full">
      <div className="w-10 h-10 border-4 border-dashed rounded-full animate-spin border-primary/50 border-t-primary"></div>
      <span className="text-sm text-muted-foreground">Loading ...</span>
    </div>
  ) : (
    <Main>
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        {/* Filters */}
        <GlobalFilterSection filters={filters ?? []} />

        {/* Priority legend */}
        <div className="flex flex-wrap items-center gap-3">
          {/* High */}
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-orange-500"></span>
            <span className="text-sm font-medium">High </span>
          </div>
          {/* Medium */}
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-yellow-500"></span>
            <span className="text-sm font-medium">Medium </span>
          </div>
          {/* Low */}
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-teal-500"></span>
            <span className="text-sm font-medium">Low </span>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-[1fr_320px]">
        <DndContext
          sensors={sensors}
          onDragStart={onDragStart}
          onDragEnd={onDragEnd}
          onDragCancel={() => setActiveDeveloper(null)}
        >
          {/* Project List */}
          <div className="space-y-4">
            {projectList?.data?.length ? (
              projectList?.data?.map((p: any) => (
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
                          const isMyChip = allocation.developer.id === currentUserId;
                          // Allow click if not developer OR if it's the developer's own chip
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
                                      handleDeveloperClick(
                                        allocation.developer,
                                        p.id
                                      )
                                  : undefined
                              }
                              // DND is still disabled for all developers
                              disabled={isDeveloperView}
                            />
                          );
                        })}
                      </div>
                    </SortableContext>
                  ) : null}
                </ProjectCard>
              ))
            ) : (
              // 🧩 Fallback UI when there are no projects
              <div className="flex flex-col items-center justify-center py-10 text-center border border-dashed rounded-lg">
                <h3 className="text-lg font-semibold text-muted-foreground">
                  No projects available
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Try adjusting your filters or check back later.
                </p>
              </div>
            )}
          </div>

          {/* Available Developers */}
          {!isDeveloperView && (
            <aside className="sticky top-4 h-fit">
              <Card
                ref={availableDroppable.setNodeRef}
                className={
                  availableDroppable.isOver ? "ring-2 ring-pink-500" : ""
                }
              >
                <CardHeader>
                  <CardTitle className="text-balance">
                    Available Resources
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {AvailableDevelopers?.data?.length ? (
                    <SortableContext
                      items={
                        AvailableDevelopers.data.map(
                          (d: any) => `available-${d.id}`
                        ) ?? []
                      }
                      strategy={rectSortingStrategy}
                    >
                      <div className="flex flex-col gap-2">
                        {AvailableDevelopers.data.map((dev: any) => (
                          <DeveloperChip
                            key={`available-${dev.id}`}
                            developer={dev}
                            containerId="available"
                            disabled={isDeveloperView}
                          />
                        ))}
                      </div>
                    </SortableContext>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-10 text-center transition-all duration-300 hover:bg-muted/30">
                      <div className="mb-3 p-3 rounded-full bg-muted">
                        <Users className="h-8 w-8 text-muted-foreground/70" />
                      </div>
                      <h3 className="text-lg font-semibold text-muted-foreground">
                        No developers available
                      </h3>
                      <p className="text-sm text-muted-foreground/70 mt-1">
                        Looks like everyone’s busy right now. Try again later!
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </aside>
          )}

          {/* Drag Overlay */}
          <DragOverlay>
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

      {/* Developer Dialog */}
      <DeveloperDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        developer={selectedDeveloper}
        projectId={selectedProjectId}
        afterChange={() => {
          refetch();
        }}
        refetchAvailableDevelopers={refetchAvailableDevelopers}
      />
    </Main>
  );
};

export default Board;