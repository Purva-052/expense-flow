/* eslint-disable @typescript-eslint/no-explicit-any */
import GlobalFilterSection from "@/components/table/global-table-filter";
import { FilterConfig } from "@/components/table/table-toolbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useGetProjectsData } from "@/features/projects/services";
import { useGetUsersList } from "@/features/users/services";
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
import { Users } from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import { useInView } from "react-intersection-observer";
import {
  useAssignDeveloper,
  useGetProjectHandlerProjectsAPI,
} from "../services";
import { DraggableProjectChip } from "./drragable-projectChip";
import { ProjectChip } from "./project-chip";
import { ResourceCard } from "./resource-card";

const ResourceTab = ({ technologies, activeTab, techLoading }: any) => {
  const isProjectHandler = activeTab === "Project Coordinator";
  const [selectedTech, setSelectedTech] = useState<string | null>(null);

  // Separate search states for resources and projects
  const [resourceSearch, setResourceSearch] = useState<string | undefined>();
  const [projectSearch, setProjectSearch] = useState<string | undefined>();

  const [listParams, setListParams] = useState<any>({
    technologyId: null,
    search: undefined,
  });

  const [activeProject, setActiveProject] = useState<any | null>(null);
  const scrollContainerRef = React.useRef<HTMLDivElement | null>(null);

  const apiParams = {
    pagination: false,
    technologyId: listParams.technologyId,
    search: resourceSearch,
  };

  const {
    data: projectPages,
    isPending: projectListLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  }: any = useGetProjectsData({
    pagination: false,
    search: projectSearch, // 👈 separate search for project list
  });

  const projectList = useMemo(
    () => projectPages?.pages?.flatMap((page: any) => page.data) ?? [],
    [projectPages]
  );

  const { ref: loadMoreRef, inView } = useInView({
    root: scrollContainerRef.current,
    rootMargin: "500px",
    threshold: 0,
  });

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage]);

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

  // Separate search handlers
  const handleResourceSearch = (search: string | undefined) => {
    setResourceSearch(search ?? undefined);
  };

  const handleProjectSearch = (search: string | undefined) => {
    setProjectSearch(search ?? undefined);
  };

  const resourceFilters: FilterConfig[] = [
    {
      type: "search",
      placeholder: "Search by name ...",
      key: "search",
      value: resourceSearch,
      onChange: handleResourceSearch,
    },
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

  const projectFilters: FilterConfig[] = [
    {
      type: "search",
      placeholder: "Search by project name ...",
      key: "search",
      value: projectSearch,
      onChange: handleProjectSearch,
      className: "w-[292px]",
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

  const headingFilter = isProjectHandler ? [] : resourceFilters;
  const isLoading =
    techLoading ||
    (isProjectHandler ? handledProjectsLoading : usersListLoading);

  return (
    <DndContext
      sensors={sensors}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
    >
      <GlobalFilterSection filters={headingFilter} />
      {isLoading ? (
        <div className="flex flex-col justify-center items-center py-10 gap-3 h-full">
          <div className="w-10 h-10 border-4 border-dashed rounded-full animate-spin border-primary/50 border-t-primary"></div>
          <span className="text-sm text-muted-foreground">Loading ...</span>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
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

              {/* Project List Sidebar */}
              {!isProjectHandler && (
                <aside className="top-4 h-fit">
                  <Card className="!gap-0">
                    <CardHeader className="!ps-2 ">
                      <CardTitle className="w-full text-balance flex items-center justify-between ps-2">
                        Project List
                      </CardTitle>
                      <GlobalFilterSection filters={projectFilters} />
                    </CardHeader>
                    <CardContent className="max-h-[62dvh] overflow-auto p-2 space-y-2">
                      {projectListLoading ? (
                        <div className="flex flex-col justify-center items-center py-10 gap-3">
                          <div className="w-8 h-8 border-4 border-dashed rounded-full animate-spin border-primary/50 border-t-primary"></div>
                          <span className="text-sm text-muted-foreground">
                            Loading Projects...
                          </span>
                        </div>
                      ) : projectList?.length > 0 ? (
                        projectList.map((project: any) => (
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
                      <div ref={loadMoreRef} className="h-2" />
                      {isFetchingNextPage && (
                        <div className="flex justify-center items-center py-4">
                          <div className="w-8 h-8 border-4 border-dashed rounded-full animate-spin border-primary/50 border-t-primary"></div>
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
