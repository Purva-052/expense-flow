"use client";

import React, { useState } from "react";
import { ColumnDef, PaginationState } from "@tanstack/react-table";
import { GlobalTable } from "@/components/table/global-table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";

/* =======================
   Types
======================= */
export interface ProjectReport {
  id: number;
  reportDate: string;
  employeeName: string; // ✅ FIXED
  milestone: string;
  description: string;
  hours: number;
}

/* =======================
   Mock Data
======================= */
const reportData: ProjectReport[] = [
  {
    id: 1,
    reportDate: "12 Jan 2026",
    employeeName: "Zubin",
    milestone: "2",
    description: "Worked on UI components and layout",
    hours: 6,
  },
  {
    id: 2,
    reportDate: "13 Jan 2026",
    employeeName: "Zubin",
    milestone: "1",
    description: "Integrated task management APIs",
    hours: 4,
  },
  {
    id: 3,
    reportDate: "14 Jan 2026",
    employeeName: "Zubin",
    milestone: "3",
    description: "Bug fixes and QA testing",
    hours: 3.5,
  },
];

/* =======================
   Columns
======================= */
const reportColumns: ColumnDef<ProjectReport>[] = [
  {
    accessorKey: "reportDate",
    header: "Report Date",
  },
  {
    accessorKey: "employeeName",
    header: "Employee Name",
  },

  {
    accessorKey: "description",
    header: "Description",
    cell: ({ row }) => (
      <span className="line-clamp-2 text-muted-foreground">
        {row.original.description}
      </span>
    ),
  },
  {
    accessorKey: "milestone",
    header: "Milestone",
    cell: ({ row }) => (
      <span className="font-medium">{row.original.milestone}</span>
    ),
  },
  {
    accessorKey: "hours",
    header: "Hours",
    cell: ({ row }) => (
      <span className="font-semibold">{row.original.hours}</span>
    ),
  },
];

/* =======================
   Component
======================= */
const ProjectReportTable = () => {
  const [listParams, setListParams] = useState({
    currentPage: 1,
    pageSize: 10,
  });

  const handlePaginationChange = (pagination: PaginationState) => {
    setListParams({
      currentPage: pagination.pageIndex + 1,
      pageSize: pagination.pageSize,
    });
  };

  return (
    <>
      <div className="flex flex-wrap gap-4 items-center mb-4">
        {/* Task Search */}
        <div className="flex-1 ">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Search Task
          </label>
          <Input placeholder="Search description..." />
        </div>
      </div>
      <GlobalTable<ProjectReport>
        data={reportData}
        columns={reportColumns}
        totalCount={reportData.length}
        currentPage={listParams.currentPage}
        pageSize={listParams.pageSize}
        onPaginationChange={handlePaginationChange}
        isPaginationEnabled
        loading={false}
      />
    </>
  );
};

export default ProjectReportTable;
