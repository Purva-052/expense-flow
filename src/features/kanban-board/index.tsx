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
import { useAssignDeveloper, useGetAvailableDeveloperList } from "./services";
import type { Developer } from "@/lib/types"; // Make sure this import path is correct
import { useGetProjectsData } from "../projects/services";

const Board = () => {
  const {
    data: AvailableDevelopers,
    isPending: AvaliableDevelopersLoading,
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

  // State to hold the full Developer object being dragged
  const [activeDeveloper, setActiveDeveloper] =
    React.useState<Developer | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const availableDroppable = useDroppable({ id: "available" });

  // When a drag starts, find the developer object and store it in state.
  function onDragStart(event: DragStartEvent) {
    const developer = event.active.data.current?.developer as Developer;
    if (developer) {
      setActiveDeveloper(developer);
    }
  }

  // When a drag ends, clear the active developer state and handle the logic.
  async function onDragEnd(event: DragEndEvent) {
    setActiveDeveloper(null); // Always clear the active developer to hide the overlay

    const { active, over } = event;

    const developerID = active?.id;
    const projectID = over?.id;

    if (developerID && projectID) {
      assignProject({
        developerId: developerID,
        projectId: projectID,
        assignedBy: 2,
        startDate: new Date().toISOString(), // sets current date & time
      });
    }
  }

  return (
    <Main>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-[1fr_320px]">
        {/* The single, top-level DndContext provides context for the entire board */}
        <DndContext
          sensors={sensors}
          onDragStart={onDragStart}
          onDragEnd={onDragEnd}
          onDragCancel={() => setActiveDeveloper(null)} // Clear on cancel as well
        >
          {projectListLoading ? (
            "...loading"
          ) : (
            <div className="space-y-4">
              {projectList?.data?.map((p: any) => (
                <ProjectCard key={p?.id} project={p}>
                  <SortableContext
                    items={p?.developerAllocations}
                    strategy={rectSortingStrategy}
                  >
                    <div className="flex flex-wrap gap-2">
                      {p?.developerAllocations?.map((developer: any) => {
                        return (
                          <DeveloperChip
                            key={developer.id}
                            developer={developer?.developer}
                            containerId={developer.id}
                          />
                        );
                      })}
                    </div>
                  </SortableContext>
                </ProjectCard>
              ))}
            </div>
          )}

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
                {AvaliableDevelopersLoading ? (
                  <div className="flex flex-col justify-center items-center py-10 gap-3">
                    <div className="w-10 h-10 border-4 border-dashed rounded-full animate-spin border-primary/50 border-t-primary"></div>
                    <span className="text-sm text-muted-foreground">
                      Loading Resources...
                    </span>
                  </div>
                ) : (
                  <SortableContext
                    items={
                      AvailableDevelopers?.data?.map((d: any) => d.id) ?? []
                    }
                    strategy={rectSortingStrategy}
                  >
                    <div className="flex flex-col gap-2">
                      {AvailableDevelopers?.data?.map((dev: any) => (
                        <DeveloperChip
                          key={dev.id}
                          developer={dev}
                          containerId="available"
                        />
                      ))}
                    </div>
                  </SortableContext>
                )}
              </CardContent>
            </Card>
          </aside>
          <DragOverlay>
            {activeDeveloper ? (
              // This is the component that will be rendered while dragging
              <div
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
    </Main>
  );
};

export default Board;
