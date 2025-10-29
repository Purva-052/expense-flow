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

// --- Props for the Dialog Component ---
interface ProjectDetailsDialogProps {
  projectId: string;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

export function ProjectDetailsDialog({
  projectId,
  isOpen,
  onOpenChange,
}: ProjectDetailsDialogProps) {
  const [listParams, setListParams] = useState({
    pageSize: 10,
    currentPage: 1,
  });

  const apiParams = {
    page: listParams.currentPage,
    limit: listParams.pageSize,
    pagination: true,
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

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl lg:max-w-5xl w-full">
        <DialogHeader>
          <DialogTitle>Developers Details</DialogTitle>
          <DialogDescription>
            Detailed information about the Assigned developers in this project.
          </DialogDescription>
        </DialogHeader>
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
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
