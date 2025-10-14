/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-console */
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { DeveloperChip } from "./components/developer-chip";
import React from "react";
import {
  rectSortingStrategy,
  SortableContext,
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";
import { ProjectCard } from "./components/project-card";
import { DeveloperDialog } from "./components/developer-dialog";
import { Main } from "@/components/layout/main";

// --- Static Data Definition ---
const staticData = {
  projects: [
    {
      id: "proj-1",
      name: "E-commerce Platform Relaunch",
      description: "Building the next generation of our online store.",
      assignedDeveloperIds: ["dev-1", "dev-3"],
    },
    {
      id: "proj-2",
      name: "Mobile Banking App",
      description: "A new native app for iOS and Android.",
      assignedDeveloperIds: ["dev-2"],
    },
    {
      id: "proj-3",
      name: "Internal CRM Tool",
      description: "A tool for managing customer relationships.",
      assignedDeveloperIds: [],
    },
  ],
  developers: [
    {
      id: "dev-1",
      name: "Alice Johnson",
      technology: "React",
      assignedProjectIds: ["proj-1"],
    },
    {
      id: "dev-2",
      name: "Bob Williams",
      technology: "Angular",
      assignedProjectIds: ["proj-2"],
    },
    {
      id: "dev-3",
      name: "Charlie Brown",
      technology: "Vue.js",
      assignedProjectIds: ["proj-1"],
    },
    {
      id: "dev-4",
      name: "Diana Miller",
      technology: "Node.js",
      assignedProjectIds: [],
    },
    {
      id: "dev-5",
      name: "Ethan Davis",
      technology: "Python",
      assignedProjectIds: [],
    },
  ],
};

const Board = () => {
  // Use the static data directly
  const data = staticData;
  // Assume user has permission to manage for this static example
  const canManage = true;

  const [activeDevId, setActiveDevId] = React.useState<string | null>(null);
  const [dialogProjectId, setDialogProjectId] = React.useState<string | null>(
    null
  );
  const [draggingDevId, setDraggingDevId] = React.useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const availableDroppable = useDroppable({ id: "available" });

  // Loading state is no longer needed with static data
  // if (!data) return <div className="text-muted-foreground">Loading…</div>

  const available = data.developers.filter(
    (d: any) => d.assignedProjectIds.length === 0
  );

  function onDragStart(event: DragStartEvent) {
    const id = event.active.id?.toString();
    if (id) setDraggingDevId(id);
  }

  async function onDragEnd(event: DragEndEvent) {
    setDraggingDevId(null);
    if (!canManage) return;
    const { active, over } = event;
    if (!over) return;
    const devId = active.id.toString();

    const toContainerId =
      (over.data?.current?.containerId as string | undefined) ??
      over.id?.toString() ??
      "";

    let target = toContainerId;

    if (over.id === "available") {
      target = "available";
    }

    const sourceContainerId = active.data.current?.containerId as
      | string
      | undefined;
    if (!sourceContainerId && target !== "available") {
      // dragged from available to project; ok
    }

    if (target === sourceContainerId) return;

    // NOTE: The data mutation logic for drag-and-drop would go here.
    // For this example, we'll just log the action.
    console.log(
      `Developer ${devId} moved from ${sourceContainerId || "available"} to ${target}`
    );
  }

  const openDialog = (developerId: string, projectId: string) => {
    setActiveDevId(developerId);
    setDialogProjectId(projectId);
  };

  const closeDialog = () => {
    setActiveDevId(null);
    setDialogProjectId(null);
  };

  return (
    <Main>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-[1fr_320px]">
        <DndContext
          sensors={sensors}
          onDragStart={onDragStart}
          onDragEnd={onDragEnd}
        >
          <div className="space-y-4">
            {data.projects.map((p: any) => (
              <ProjectCard key={p.id} project={p}>
                <SortableContext
                  items={p.assignedDeveloperIds}
                  strategy={rectSortingStrategy}
                >
                  <div className="flex flex-wrap gap-2">
                    {p.assignedDeveloperIds.map((devId: any) => {
                      const dev = data.developers.find((d) => d.id === devId);
                      if (!dev) return null;
                      return (
                        <DeveloperChip
                          key={dev.id + "-" + p.id}
                          developer={dev}
                          containerId={p.id}
                          onClick={() => openDialog(dev.id, p.id)}
                        />
                      );
                    })}
                  </div>
                </SortableContext>
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
                  items={available.map((d) => d.id)}
                  strategy={rectSortingStrategy}
                >
                  <div className="flex flex-col gap-2">
                    {available.map((dev) => (
                      <DeveloperChip
                        key={dev.id}
                        developer={dev}
                        containerId="available"
                        onClick={() => openDialog(dev.id, "available")}
                      />
                    ))}
                  </div>
                </SortableContext>
              </CardContent>
            </Card>
          </aside>

          <DragOverlay>
            {draggingDevId
              ? (() => {
                  const dev = data.developers.find(
                    (d) => d.id === draggingDevId
                  );
                  if (!dev) return null;
                  return (
                    <div className="pointer-events-none rounded-md border bg-card px-3 py-2 text-sm shadow-lg">
                      {dev.name} —{" "}
                      <span className="opacity-80">{dev.technology}</span>
                    </div>
                  );
                })()
              : null}
          </DragOverlay>
        </DndContext>

        <DeveloperDialog
          open={!!activeDevId}
          onOpenChange={(o) => !o && closeDialog()}
          developer={data.developers.find((d) => d.id === activeDevId) || null}
          projectId={dialogProjectId || "available"}
          // The mutate() function is removed as we are not fetching data
          afterChange={() => console.log("Data changed")}
        />
      </div>
    </Main>
  );
};

export default Board;
