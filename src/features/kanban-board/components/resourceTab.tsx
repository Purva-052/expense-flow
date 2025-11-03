// src/components/resource-tab.tsx
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { Users } from "lucide-react";
import { useGetTechnologyData } from "@/features/technology/services";
import { ResourceCard } from "./resource-card";
import GlobalFilterSection from "@/components/table/global-table-filter";
import { FilterConfig } from "@/components/table/table-toolbar";
import { useGetUsersList } from "@/features/users/services";
import {
  useAssignDeveloper,
  useGetProjectHandlerProjectsAPI,
} from "../services";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { useGetProjectsData } from "@/features/projects/services";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProjectChip } from "./project-chip";
import { DraggableProjectChip } from "./drragable-projectChip";

const ResourceTab = ({ activeTab }: any) => {
  const isProjectHandler = activeTab === "Project Coordinator" ? true : false;
  const [selectedTech, setSelectedTech] = useState<string | null>(null);
  const [listParams, setListParams] = useState({ technologyId: null });
  const [activeProject, setActiveProject] = useState<any | null>(null);

  const apiParams = {
    pagination: false,
    technologyId: listParams.technologyId,
  };

  const { data: projectList, isPending: projectListLoading }: any =
    useGetProjectsData({ pagination: false });

  const {
    data: usersList,
    isPending: usersListLoading,
    refetch,
  }: any = useGetUsersList(apiParams);

  const { data: handledProjects, isPending: handledProjectsLoading }: any =
    useGetProjectHandlerProjectsAPI(isProjectHandler);

  const userDetails = isProjectHandler
    ? (handledProjects?.data ?? [])
    : (usersList?.data ?? []);

  const { data: technologies, isPending: techLoading }: any =
    useGetTechnologyData({ pagination: false });

  const handleTechnologyChange = (value: any) => {
    setSelectedTech(value ?? null);
    setListParams({ ...listParams, technologyId: value ?? null });
  };

  const onsuccessAssignDeveloper = () => {
    refetch();
  };

  const { mutateAsync: assignProject } = useAssignDeveloper(
    onsuccessAssignDeveloper
  );

  const filters: FilterConfig[] = [
    {
      type: "select",
      key: "technologyId",
      placeholder: "Filter by Technology",
      options: technologies?.data?.map((technology: any) => ({
        value: technology.id,
        label: technology.name,
      })),
      value: selectedTech,
      onChange: handleTechnologyChange,
      isLoading: techLoading,
    },
  ];

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor)
  );

  function onDragStart(event: DragStartEvent) {
    if (event.active.data.current?.project) {
      setActiveProject(event.active.data.current.project);
    }
  }

  async function onDragEnd(event: DragEndEvent) {
    setActiveProject(null);
    const { active, over } = event;

    if (over) {
      const projectId = active.id;
      const developerId = over.id;

      if (projectId && developerId) {
        await assignProject({
          developerId,
          projectId,
          startDate: new Date().toISOString(),
        });
      }
    }
  }

  const headingFilter = isProjectHandler ? [] : filters;
  const isLoading =
    techLoading ||
    (isProjectHandler ? handledProjectsLoading : usersListLoading);

  return (
    <DndContext
      sensors={sensors}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
    >
      {isLoading ? (
        <div className="flex flex-col justify-center items-center py-10 gap-3 h-full">
          <div className="w-10 h-10 border-4 border-dashed rounded-full animate-spin border-primary/50 border-t-primary"></div>
          <span className="text-sm text-muted-foreground">Loading ...</span>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <GlobalFilterSection filters={headingFilter} />
          {!isProjectHandler && !selectedTech ? (
            <div className="flex flex-col items-center justify-center py-10 text-center border border-dashed rounded-lg mt-4">
              <div className="mb-3 p-3 rounded-full bg-muted">
                <Users className="h-10 w-10 text-muted-foreground/70" />
              </div>
              <h3 className="text-lg font-semibold text-muted-foreground">
                Please select a technology
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                Choose a technology from the dropdown to view available
                resources.
              </p>
            </div>
          ) : userDetails?.length > 0 ? (
            <div
              className={`grid grid-cols-1 gap-4 ${
                !isProjectHandler ? "md:grid-cols-[1fr_320px]" : ""
              }`}
            >
              {/* Developer List */}
              <div className="space-y-4 max-h-[72dvh] overflow-auto p-2">
                {userDetails.map((dev: any) => (
                  <ResourceCard key={dev.id} developer={dev} />
                ))}
              </div>

              {/* Project List Sidebar — hidden when isProjectHandler is true */}
              {!isProjectHandler && (
                <aside className="top-4 h-fit">
                  <Card>
                    <CardHeader>
                      <CardTitle className="w-full text-balance flex items-center justify-between">
                        Project List
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="max-h-[62dvh] overflow-auto p-2 space-y-2">
                      {projectListLoading ? (
                        <div className="flex flex-col justify-center items-center py-10 gap-3">
                          <div className="w-8 h-8 border-4 border-dashed rounded-full animate-spin border-primary/50 border-t-primary"></div>
                          <span className="text-sm text-muted-foreground">
                            Loading Projects...
                          </span>
                        </div>
                      ) : projectList?.data?.length > 0 ? (
                        projectList.data.map((project: any) => (
                          <DraggableProjectChip
                            key={`draggable-${project.id}`}
                            project={project}
                          />
                        ))
                      ) : (
                        <div className="flex flex-col items-center justify-center py-10 text-center transition-all duration-300 hover:bg-muted/30">
                          <div className="mb-3 p-3 rounded-full bg-muted">
                            <Users className="h-8 w-8 text-muted-foreground/70" />
                          </div>
                          <h3 className="text-lg font-semibold text-muted-foreground">
                            No projects found
                          </h3>
                          <p className="text-sm text-muted-foreground/70 mt-1">
                            There are currently no projects to display.
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </aside>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-10 text-center border border-dashed rounded-lg mt-4">
              <h3 className="text-lg font-semibold text-muted-foreground">
                {isProjectHandler ? "No Handler found" : "No resources found"}
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                {isProjectHandler
                  ? "There are no Handlers available"
                  : "There are no developers available for the selected technology."}
              </p>
            </div>
          )}
        </div>
      )}
      <DragOverlay dropAnimation={null}>
        {activeProject ? <ProjectChip project={activeProject} /> : null}
      </DragOverlay>
    </DndContext>
  );
};

export default ResourceTab;
