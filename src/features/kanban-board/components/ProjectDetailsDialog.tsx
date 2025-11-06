/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useGetProjectHistoryData } from "../services";
import { GlobalTable } from "@/components/table/global-table";
import { useState } from "react";
import { ProjectDetailsColumn } from "./ProjectDetailsColumn";
import GlobalFilterSection from "@/components/table/global-table-filter";
import { FilterConfig } from "@/components/table/table-toolbar";

interface ProjectDetailsDialogProps {
  projectId: string;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  project: any;
}

export function ProjectDetailsDialog({
  projectId,
  isOpen,
  project,
  onOpenChange,
}: ProjectDetailsDialogProps) {
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
    useGetProjectHistoryData(projectId, isOpen, apiParams);

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
        <DialogHeader className="shrink-0">
          <DialogTitle>Developers Details</DialogTitle>
          <DialogDescription>
            Detailed information about the Assigned developers in this project.
          </DialogDescription>

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
        </DialogHeader>

        <div className="flex-1 mt-3 border-t pt-3">
          {projectDetailsLoading ? (
            <div className="flex flex-col justify-center items-center py-10 gap-3 h-full">
              <div className="w-10 h-10 border-4 border-dashed rounded-full animate-spin border-primary/50 border-t-primary"></div>
              <span className="text-sm text-muted-foreground">Loading ...</span>
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
              rowsToShow={7}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
