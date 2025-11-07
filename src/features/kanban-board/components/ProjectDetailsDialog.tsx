/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { GlobalTable } from "@/components/table/global-table";
import GlobalFilterSection from "@/components/table/global-table-filter";
import { FilterConfig } from "@/components/table/table-toolbar";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"; // ✅ IMPORT TABS
import {
  Timeline,
  TimelineDescription,
  TimelineHeader,
  TimelineItem,
  TimelineTime,
  TimelineTitle,
} from "@/components/ui/timeline";
import { useGetProjectsHistoryData } from "@/features/projects/services";
import { capitalizeFirstLetter } from "@/utils/commonFunctions";
import { format } from "date-fns";
import { useState } from "react";
import { useGetProjectHistoryData } from "../services";
import { ProjectDetailsColumn } from "./ProjectDetailsColumn";

interface ProjectDetailsDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  project: any;
}

const ProjectDetailsDialog = ({
  isOpen,
  project,
  onOpenChange,
}: ProjectDetailsDialogProps) => {
  const [listParams, setListParams] = useState({
    pageSize: 10,
    currentPage: 1,
    search: "",
  });

  const apiParams = {
    page: listParams.currentPage,
    limit: listParams.pageSize,
    pagination: true,
    search: listParams.search,
  };

  const { data: projectDetails, isLoading: projectDetailsLoading }: any =
    useGetProjectHistoryData(project?.id, isOpen, apiParams);

  const { data: projectHistory, isFetching: projectHistoryLoading }: any =
    useGetProjectsHistoryData(isOpen ? project?.id : undefined);

  const timelineData =
    projectHistory?.data?.map((item: any) => ({
      id: item?.id,
      title: item?.status ? capitalizeFirstLetter(item?.status) : "No Status",
      description: item.reason,
      time: item?.effectiveDate
        ? format(new Date(item.effectiveDate), "do MMMM yyyy")
        : "No Date",
    })) ?? [];

  const totalCount = (projectDetails as any)?.metadata?.totalCount;

  const handlePaginationChange = (newPagination: {
    pageIndex: number;
    pageSize: number;
  }) => {
    setListParams({
      ...listParams,
      pageSize: newPagination.pageSize,
      currentPage: newPagination.pageIndex + 1,
    });
  };

  const handleSearch = (search: string | undefined) => {
    setListParams({ ...listParams, search: search ?? "", currentPage: 1 });
  };

  const filters: FilterConfig[] = [
    {
      type: "search",
      placeholder: "Search by name ...",
      key: "search",
      value: listParams.search,
      onChange: handleSearch,
    },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl lg:max-w-5xl w-full max-h-[85dvh] overflow-hidden flex flex-col">
        {/* --- Main Dialog Header (Stays on top) --- */}
        <DialogHeader className="shrink-0">
          <DialogTitle>Project Details: {project?.name}</DialogTitle>
          <DialogDescription>
            View developer assignments or the project's historical timeline.
          </DialogDescription>
        </DialogHeader>

        {/* --- Tab Navigation --- */}
        <Tabs defaultValue="developers" className="w-full flex-1 flex flex-col">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="developers">Assigned Developers</TabsTrigger>
            <TabsTrigger value="history">Project History</TabsTrigger>
          </TabsList>

          {/* --- TAB 1: Assigned Developers (Your Original Code) --- */}
          <TabsContent value="developers" className="flex-1 flex flex-col mt-2">
            <div className="shrink-0">
              {/* Search Filter */}
              <GlobalFilterSection filters={filters ?? []} className="my-0" />

              {/* Technologies */}
              {project?.technologies && project.technologies.length > 0 ? (
                <div className="mt-3">
                  <h3 className="text-sm font-medium mb-1 text-foreground">
                    Technologies Used
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {project.technologies.map((tech: any) => (
                      <span
                        key={tech.id || tech}
                        className="px-2 py-1 text-xs rounded-md bg-gray-100 border text-gray-700"
                      >
                        {tech.name ?? tech}
                      </span>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground mt-3">
                  No technologies listed.
                </p>
              )}
            </div>

            <div className="flex-1 mt-3 border-t pt-3">
              {projectDetailsLoading ? (
                <div className="flex flex-col justify-center items-center py-10 gap-3 h-full">
                  <div className="w-10 h-10 border-4 border-dashed rounded-full animate-spin border-primary/50 border-t-primary"></div>
                  <span className="text-sm text-muted-foreground">
                    Loading ...
                  </span>
                </div>
              ) : (
                <GlobalTable
                  pageSize={listParams.pageSize}
                  currentPage={listParams.currentPage}
                  totalCount={totalCount ?? 0}
                  data={(projectDetails as any)?.data ?? []}
                  onPaginationChange={handlePaginationChange}
                  columns={ProjectDetailsColumn}
                  loading={projectDetailsLoading}
                  isPaginationEnabled
                  scrollY="39dvh"
                />
              )}
            </div>
          </TabsContent>

          {/* --- TAB 2: Project History --- */}
          <TabsContent value="history" className="flex-1 mt-2 overflow-y-auto">
            <div className="rounded-xl p-2">
              <DialogHeader className="border-b pb-3 mb-4">
                <DialogTitle className="text-lg font-semibold flex items-center gap-2">
                  Project History
                  {project?.name && (
                    <span className="text-muted-foreground text-base">
                      ({project.name})
                    </span>
                  )}
                </DialogTitle>
                <DialogDescription className="text-sm text-muted-foreground mt-1">
                  {project?.description ?? "No project description available."}
                </DialogDescription>
                <div className="mt-3 flex items-center justify-between text-sm text-muted-foreground">
                  <div>
                    <span className="font-medium text-foreground">
                      Coordinator:
                    </span>{" "}
                    {project?.projectHandler?.fullName ?? "-"}
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="font-medium text-foreground">
                      Progress:
                    </span>
                    {project?.percentageComplete ? (
                      <Badge variant="secondary">
                        {project.percentageComplete}%
                      </Badge>
                    ) : (
                      "-"
                    )}
                  </div>
                </div>
              </DialogHeader>

              {projectHistoryLoading ? (
                <div className="flex flex-col justify-center items-center py-16 gap-3 h-[55dvh]">
                  <div className="w-10 h-10 border-4 border-dashed rounded-full animate-spin border-primary/50 border-t-primary" />
                  <span className="text-sm text-muted-foreground font-medium">
                    Loading project history...
                  </span>
                </div>
              ) : timelineData?.length > 0 ? (
                <div className="ml-10">
                  <Timeline className="mt-3  overflow-y-auto max-h-[55dvh] h-full pb-14 px-2">
                    {timelineData?.map((item: any) => (
                      <TimelineItem key={item.id}>
                        <TimelineHeader>
                          <TimelineTime
                            variant="default"
                            className="text-xs bg-black px-2 py-0.5 rounded-md text-white"
                          >
                            {item.time}
                          </TimelineTime>
                          <TimelineTitle className="text-base font-medium text-foreground">
                            {item.title}
                          </TimelineTitle>
                        </TimelineHeader>
                        {item.description && (
                          <TimelineDescription className="text-sm mt-1 leading-relaxed">
                            {item.description}
                          </TimelineDescription>
                        )}
                      </TimelineItem>
                    ))}
                  </Timeline>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground h-[55dvh]">
                  <div className="bg-muted/50 rounded-full p-4 mb-4">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-10 w-10 text-muted-foreground"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <p className="text-lg font-medium text-foreground">
                    No history found
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Once there’s activity, project history will appear here.
                  </p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default ProjectDetailsDialog;
