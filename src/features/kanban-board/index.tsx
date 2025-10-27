/* eslint-disable no-console */
// src/pages/board.tsx
/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
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
import { DeveloperDialog } from "./components/developer-dialog"; // Import the dialog
import { useAssignDeveloper, useGetAvailableDeveloperList } from "./services";
import type { Developer } from "@/lib/types";
import { useGetProjectsData } from "../projects/services";
import { useAuthStore } from "@/stores/use-auth-store";

const Board = () => {
  const { user } = useAuthStore();
  const isDeveloperView = user?.user?.role === "developer"; // Check if the user is a developer

  const {
    data: AvailableDevelopers,
    isPending: AvaliableDevelopersLoading,
    refetch: refetchAvailableDevelopers,
  }: any = useGetAvailableDeveloperList();

  const {
    data: projectList,
    isPending: projectListLoading,
    refetch,
  }: any = useGetProjectsData({
    pagination: false,
  });

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
    const projectKey = String(over.id);

    // 🧩 Extract numeric IDs safely
    const developerId = Number(developerKey.split("-").pop());
    const projectId = Number(projectKey.split("-").pop());

    console.log("🧩 Developer ID:", developerId);
    console.log("🏗️ Project Key:", projectKey);

    // 🛑 1. Don't call API if dropped on 'available' column
    if (projectKey.startsWith("available")) {
      console.log("⚠️ Dropped on available list — no assignment made.");
      return;
    }

    // 🛑 2. Validate extracted IDs
    if (!developerId || !projectId || isNaN(developerId) || isNaN(projectId)) {
      console.warn("Invalid IDs:", { developerKey, projectKey });
      return;
    }

    // ✅ 3. Safe API call only when dropped on project card
    try {
      await assignProject({
        developerId,
        projectId,
        assignedBy: 2,
        startDate: new Date().toISOString(),
      });
      console.log("✅ Developer assigned successfully!");
    } catch (error) {
      console.error("❌ Error assigning developer:", error);
    }
  }

  // Handler to open the dialog with the correct developer and project context
  function handleDeveloperClick(developer: Developer, projectId: string) {
    setSelectedDeveloper(developer);
    setSelectedProjectId(projectId);
    setIsDialogOpen(true);
  }

  return (
    <Main>
      {projectListLoading || AvaliableDevelopersLoading ? (
        <div className="flex flex-col justify-center items-center py-10 gap-3 h-full">
          <div className="w-10 h-10 border-4 border-dashed rounded-full animate-spin border-primary/50 border-t-primary"></div>
          <span className="text-sm text-muted-foreground">Loading ...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-[1fr_320px]">
          <DndContext
            sensors={sensors}
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
            onDragCancel={() => setActiveDeveloper(null)}
          >
            <div className="space-y-4">
              {projectList?.data?.map((p: any) => (
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
                          return (
                            <DeveloperChip
                              key={`project-${p.id}-${allocation.developer.id}`}
                              developer={allocation.developer}
                              containerId={p.id}
                              endDate={allocation.endDate}
                              // Add the onClick handler ONLY for developers in projects
                              onClick={
                                !isDeveloperView
                                  ? () =>
                                      handleDeveloperClick(
                                        allocation.developer,
                                        p.id
                                      )
                                  : undefined
                              }
                              disabled={isDeveloperView} // Disable DeveloperChip for developers
                            />
                          );
                        })}
                      </div>
                    </SortableContext>
                  ) : null}
                </ProjectCard>
              ))}
            </div>

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
                  <SortableContext
                    items={
                      AvailableDevelopers?.data?.map(
                        (d: any) => `available-${d.id}`
                      ) ?? []
                    }
                    strategy={rectSortingStrategy}
                  >
                    <div className="flex flex-col gap-2">
                      {AvailableDevelopers?.data?.map((dev: any) => (
                        // No onClick handler for available developers
                        <DeveloperChip
                          key={`available-${dev.id}`}
                          developer={dev}
                          containerId="available"
                          disabled={isDeveloperView} // Disable DeveloperChip for developers
                        />
                      ))}
                    </div>
                  </SortableContext>
                </CardContent>
              </Card>
            </aside>
            <DragOverlay>
              {activeDeveloper ? (
                <div
                  key={`overlay-${activeDeveloper.id}`} // 👈 unique overlay key
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
      )}

      {/* Render the Dialog here, controlled by the Board's state */}
      <DeveloperDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        developer={selectedDeveloper}
        projectId={selectedProjectId}
        afterChange={() => {
          refetch(); // Refetch project data after a change is made
        }}
        refetchAvailableDevelopers={refetchAvailableDevelopers}
      />
    </Main>
  );
};

export default Board;
