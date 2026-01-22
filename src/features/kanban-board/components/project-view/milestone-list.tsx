"use client";

import React, { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ColumnDef, PaginationState } from "@tanstack/react-table";
import { GlobalTable } from "@/components/table/global-table";
import { Target } from "lucide-react";

/* =======================
   Types
======================= */
export interface ProjectReport {
  id: number;
  reportDate: string;
  employeeName: string;
  taskName: string;
  estimatedTime: number; // hours
  description: string;

  actualHours: number;
}

/* =======================
   Mock Data
======================= */
const reportData: ProjectReport[] = [
  {
    id: 1,
    reportDate: "12 Jan 2026",
    employeeName: "Zubin",
    taskName: "UI Components",
    estimatedTime: 8,
    description: "Worked on UI components and layout",
    actualHours: 6,
  },
  {
    id: 2,
    reportDate: "13 Jan 2026",
    employeeName: "Zubin",
    taskName: "API Integration",
    estimatedTime: 5,
    description: "Integrated task management APIs",
    actualHours: 4,
  },
  {
    id: 3,
    reportDate: "14 Jan 2026",
    employeeName: "Zubin",
    taskName: "QA Testing",
    estimatedTime: 4,
    description: "Bug fixes and QA testing",
    actualHours: 3.5,
  },
];

/* =======================
   Table Columns
======================= */
const reportColumns: ColumnDef<ProjectReport>[] = [
  {
    accessorKey: "taskName",
    header: "Functionality Name",
    cell: ({ row }) => (
      <span className="font-medium">{row.original.taskName}</span>
    ),
  },

  {
    accessorKey: "estimatedTime",
    header: "Estimated Time (hrs)",
    cell: ({ row }) => (
      <span className="font-semibold">{row.original.estimatedTime}</span>
    ),
  },
  {
    accessorKey: "actualHours",
    header: "Actual Hours Time (hrs)",
    cell: ({ row }) => (
      <span className="font-semibold text-green-600">
        {row.original.actualHours}
      </span>
    ),
  },
  {
    id: "action",
    header: "Action",
    cell: ({ row }) => (
      <Button
        size="sm"
        onClick={() => {
          console.log("Add clicked:", row.original);
        }}
      >
        Hours Log
      </Button>
    ),
  },
];

/* =======================
   Component
======================= */
const MilestoneList = () => {
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
    <Tabs defaultValue="milestone1" className="w-full border-t-2 p-2">
      <TabsList className="mb-2">
        <TabsTrigger value="milestone1">Milestone 1</TabsTrigger>
        <TabsTrigger value="milestone2">Milestone 2</TabsTrigger>
        <TabsTrigger value="milestone3">Milestone 3</TabsTrigger>
      </TabsList>

      <TabsContent value="milestone1">
        <div className="mb-2 grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="rounded-xl border p-3 px-3">
            <div className="relative flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">
                  Total Estimated Hours
                </p>
                <p className="text-3xl font-bold text-primary">17</p>
              </div>
            </div>
          </div>
          <div className="rounded-xl border p-3 px-3">
            <div className="relative flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">
                  Total Actual Hours
                </p>
                <p className="text-3xl font-bold text-primary">50</p>
              </div>
            </div>
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
      </TabsContent>

      <TabsContent value="milestone2">
        <div className="p-4 border rounded-md text-muted-foreground">
          Milestone 2 tasks will appear here
        </div>
      </TabsContent>

      <TabsContent value="milestone3">
        <div className="p-4 border rounded-md text-muted-foreground">
          Milestone 3 tasks will appear here
        </div>
      </TabsContent>
    </Tabs>
  );
};

export default MilestoneList;
