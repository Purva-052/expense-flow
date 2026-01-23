"use client";

import { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ColumnDef, PaginationState } from "@tanstack/react-table";
import { GlobalTable } from "@/components/table/global-table";
import { CalendarIcon } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";
import { DialogHeader, DialogTitle } from "@/components/ui/dialog";
import HoursLogs from "./hours-logs";
import { CommonModal } from "@/components/common-modal";

/* =======================
   Types
======================= */
export interface ProjectReport {
  id: number;
  reportDate: string;
  employeeName: string;
  taskName: string;
  estimatedTime: number;
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
   Columns Factory
======================= */
const getReportColumns = (
  onViewLog: (row: ProjectReport) => void
): ColumnDef<ProjectReport>[] => [
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
    header: "Actual Hours (hrs)",
    cell: ({ row }) => (
      <span className="font-semibold text-green-600">
        {row.original.actualHours}
      </span>
    ),
  },
  {
    id: "action",
    header: "Action",
    cell: ({ row }) => {
      const [open, setOpen] = useState(false);
      const [date, setDate] = useState<Date | undefined>();
      const [hours, setHours] = useState("");

      const handleSave = () => {
        console.log("Row:", row.original);
        console.log("Date:", date);
        console.log("Hours:", hours);
        setOpen(false);
      };

      return (
        <div className="flex gap-2">
          {/* Add Hours Log */}
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button size="sm">Add Hours Log</Button>
            </PopoverTrigger>

            <PopoverContent className="w-80 space-y-4">
              {/* Date */}
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium">Date</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date ? format(date, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={setDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Hours */}
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium">Actual Hours</label>
                <Input
                  type="number"
                  placeholder="Enter hours"
                  value={hours}
                  onChange={(e) => setHours(e.target.value)}
                />
              </div>

              <Button className="w-full" onClick={handleSave}>
                Save Log
              </Button>
            </PopoverContent>
          </Popover>

          {/* View Log */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => onViewLog(row.original)}
          >
            View Log
          </Button>
        </div>
      );
    },
  },
];

/* =======================
   Component
======================= */
const MilestoneList = () => {
  const [openLogsModal, setOpenLogsModal] = useState(false);

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

  const handleViewLog = () => {
    setOpenLogsModal(true);
  };

  return (
    <>
      <Tabs defaultValue="milestone1" className="w-full border-t-2 p-2">
        <TabsList className="mb-2">
          <TabsTrigger value="milestone1">Milestone 1</TabsTrigger>
          <TabsTrigger value="milestone2">Milestone 2</TabsTrigger>
          <TabsTrigger value="milestone3">Milestone 3</TabsTrigger>
        </TabsList>

        <TabsContent value="milestone1">
          {/* Summary */}
          <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="rounded-xl border p-3">
              <p className="text-sm text-muted-foreground">
                Total Estimated Hours
              </p>
              <p className="text-3xl font-bold">17</p>
            </div>
            <div className="rounded-xl border p-3">
              <p className="text-sm text-muted-foreground">
                Total Actual Hours
              </p>
              <p className="text-3xl font-bold">50</p>
            </div>
          </div>

          {/* Table */}
          <GlobalTable<ProjectReport>
            data={reportData}
            columns={getReportColumns(handleViewLog)}
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

      {/* View Log Modal */}

      <CommonModal
        open={openLogsModal}
        onOpenChange={setOpenLogsModal}
        className="w-full  overflow-auto max-h-[70vh]"
      >
        <DialogHeader>
          <DialogTitle>Hours Log</DialogTitle>
        </DialogHeader>
        <HoursLogs />
      </CommonModal>
    </>
  );
};

export default MilestoneList;
