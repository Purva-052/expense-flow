"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ColumnDef } from "@tanstack/react-table";
import { GlobalTable } from "@/components/table/global-table";
import { CalendarIcon, Download, FileDown, Loader2 } from "lucide-react";
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
import {
  useDownloadMilestoneSample,
  useUploadMilestoneFile,
  useGetProjectMilestonesList,
  useGetMilestoneTasks,
} from "@/features/kanban-board/services";
import { ExcelImportPreview, ExcelPreviewData } from "./excel-import-preview";
import { AddManualMilestone } from "./add-manual-milestone";
import * as ExcelJS from "exceljs";
import { useQueryClient } from "@tanstack/react-query";
import API from "@/config/api/api";

/* =======================
   Types
======================= */
export interface MilestoneTask {
  id?: number;
  taskName: string;
  estimatedTime: string;
  actualTime: string;
}

export interface Milestone {
  id: number;
  name: string;
  estimatedTime: string;
  tasks: MilestoneTask[];
}

/* =======================
   Mock Data
======================= */

/* =======================
   Columns Factory
   ======================= */
const TaskActions = ({
  task,
  onViewLog,
}: {
  task: MilestoneTask;
  onViewLog: (task: MilestoneTask) => void;
}) => {
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState<Date | undefined>();
  const [hours, setHours] = useState("");

  const handleSave = () => {
    console.log("Task ID:", task.id);
    console.log("Date:", date);
    console.log("Hours:", hours);
    setOpen(false);
  };

  return (
    <div className="flex gap-2">
      {/* Add Hours Log */}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="default" size="sm">
            Add Hours Log
          </Button>
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
              <PopoverContent className="w-auto p-0 z-50">
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
      <Button variant="outline" size="sm" onClick={() => onViewLog(task)}>
        View Log
      </Button>
    </div>
  );
};

const getReportColumns = (
  onViewLog: (row: MilestoneTask) => void
): ColumnDef<MilestoneTask>[] => [
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
    accessorKey: "actualTime",
    header: "Actual Hours (hrs)",
    cell: ({ row }) => (
      <span className="font-semibold text-green-600">
        {row.original.actualTime}
      </span>
    ),
  },
  {
    id: "action",
    header: "Action",
    cell: ({ row }) => (
      <TaskActions task={row.original} onViewLog={onViewLog} />
    ),
  },
];

/* =======================
   Sub-components
   ======================= */
const ActiveMilestoneContent = ({
  milestoneId,
  onViewTaskLog,
}: {
  milestoneId: number;
  onViewTaskLog: (task: MilestoneTask) => void;
}) => {
  const { data: taskDataResponse, isLoading } =
    useGetMilestoneTasks(milestoneId);

  // The API returns the whole milestone object in .data or directly
  const milestone = taskDataResponse?.data || taskDataResponse;

  // Tasks could be in milestone.tasks or milestone.data.tasks or milestone itself if it is the tasks array
  const tasks = useMemo<MilestoneTask[]>(() => {
    if (Array.isArray(milestone?.tasks)) return milestone.tasks;
    if (Array.isArray(milestone?.data?.tasks)) return milestone.data.tasks;
    if (Array.isArray(milestone)) return milestone;
    return [];
  }, [milestone]);

  const actualMilestone = useMemo<any>(() => {
    if (milestone?.tasks) return milestone;
    if (milestone?.data?.tasks) return milestone.data;
    return milestone || {};
  }, [milestone]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <span className="ml-2">Loading tasks...</span>
      </div>
    );
  }

  return (
    <div>
      {/* Summary */}
      <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="rounded-xl border p-3">
          <p className="text-sm text-muted-foreground">Total Estimated Hours</p>
          <p className="text-3xl font-bold">
            {actualMilestone?.estimatedTime || "0"}
          </p>
        </div>
        <div className="rounded-xl border p-3">
          <p className="text-sm text-muted-foreground">Total Actual Hours</p>
          <p className="text-3xl font-bold">
            {tasks.reduce(
              (acc: number, task: MilestoneTask) =>
                acc + (parseFloat(task.actualTime || "0") || 0),
              0
            )}
          </p>
        </div>
      </div>

      {/* Table */}
      <GlobalTable<MilestoneTask>
        data={tasks}
        columns={getReportColumns(onViewTaskLog)}
        totalCount={tasks.length}
        currentPage={1}
        pageSize={100}
        onPaginationChange={() => {}}
        isPaginationEnabled={false}
        loading={false}
      />
    </div>
  );
};

/* =======================
   Component
   ======================= */
const MilestoneList = ({ projectId }: { projectId?: string | number }) => {
  const queryClient = useQueryClient();
  const [openLogsModal, setOpenLogsModal] = useState(false);
  const [openAddMilestone, setOpenAddMilestone] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("");

  const [previewData, setPreviewData] = useState<ExcelPreviewData | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isParsingFile, setIsParsingFile] = useState(false);

  const { isDownloading, downloadSample } = useDownloadMilestoneSample();
  const { isUploading, uploadFile } = useUploadMilestoneFile();

  // Fetch Milestone List
  const { data: milestonesListResponse, isLoading: isFetchingMilestones } =
    useGetProjectMilestonesList(projectId);

  // Derive Milestone List
  const milestones = useMemo<any[]>(() => {
    const rawData = milestonesListResponse?.data;
    let list: any[] = [];

    if (Array.isArray(rawData)) {
      list = rawData;
    } else if (Array.isArray(rawData?.data)) {
      list = rawData.data;
    } else if (Array.isArray(milestonesListResponse)) {
      list = milestonesListResponse;
    } else if (
      rawData &&
      typeof rawData === "object" &&
      (rawData.id || rawData.name)
    ) {
      list = [rawData];
    } else if (
      rawData?.data &&
      typeof rawData.data === "object" &&
      (rawData.data.id || rawData.data.name)
    ) {
      list = [rawData.data];
    }
    return list;
  }, [milestonesListResponse]);

  useEffect(() => {
    if (milestones.length > 0) {
      if (!activeTab || !milestones.find((m) => String(m.id) === activeTab)) {
        setActiveTab(String(milestones[0].id));
      }
    }
  }, [milestones, activeTab]);

  // const handleViewLog = () => {
  //   setOpenLogsModal(true);
  // };

  const handleViewTaskLog = (task: MilestoneTask) => {
    console.log("Viewing log for Task ID:", task.id);
    setOpenLogsModal(true);
  };

  // Parse Excel file and show preview
  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const allowedTypes = [
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-excel",
      "text/csv",
    ];

    if (!allowedTypes.includes(file.type)) {
      alert("Please upload a valid Excel or CSV file.");
      event.target.value = "";
      return;
    }

    setIsParsingFile(true);
    setSelectedFile(file);

    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const arrayBuffer = e.target?.result as ArrayBuffer;
          const workbook = new ExcelJS.Workbook();

          if (file.name.endsWith(".csv")) {
            await workbook.csv.read(new Response(arrayBuffer).body! as any);
          } else {
            await workbook.xlsx.load(arrayBuffer);
          }

          const worksheet = workbook.worksheets[0];
          if (!worksheet) throw new Error("No worksheet found");

          const jsonData: any[][] = [];
          worksheet.eachRow({ includeEmpty: true }, (row: ExcelJS.Row) => {
            const values = Array.isArray(row.values) ? row.values.slice(1) : [];
            const cleanValues = values.map((v: any) => {
              if (v && typeof v === "object" && "richText" in v)
                return v.richText.map((t: any) => t.text).join("");
              if (v && typeof v === "object" && "result" in v) return v.result;
              return v;
            });
            jsonData.push(cleanValues);
          });

          if (jsonData.length > 0) {
            const headers = jsonData[0].map((h) => String(h || ""));
            const rows = jsonData.slice(1);
            setPreviewData({ headers, rows });
            setPreviewOpen(true);
          } else {
            alert("No data found in the Excel file.");
          }
        } catch (error) {
          console.error("Error parsing Excel file:", error);
          alert("Error parsing Excel file.");
        } finally {
          setIsParsingFile(false);
        }
      };
      reader.readAsArrayBuffer(file);
    } catch (error) {
      console.error("Error reading file:", error);
      setIsParsingFile(false);
    }
    event.target.value = "";
  };

  const handlePreviewConfirm = async () => {
    if (!selectedFile) return;
    const response = await uploadFile(selectedFile, projectId);
    // After upload, refetch the milestones list without reloading the page
    if (response?.statusCode === 200 || response?.statusCode === 201) {
      queryClient.invalidateQueries({
        queryKey: [API.dropdown_api.milestones, { projectId }],
      });
    }
    setPreviewOpen(false);
    setPreviewData(null);
    setSelectedFile(null);
  };

  return (
    <>
      <div className="mb-4 flex items-center justify-end gap-2 overflow-x-auto pb-2">
        <div className="flex items-center gap-2">
          {milestones.length === 0 && (
            <>
              <Button
                onClick={downloadSample}
                disabled={isDownloading}
                variant="default"
                size="default"
              >
                {isDownloading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Download className="mr-2 h-4 w-4" />
                )}
                Download Sample
              </Button>

              <input
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleFileUpload}
                disabled={isUploading}
                className="hidden"
                id="milestone-file-input"
              />

              <Button
                onClick={() =>
                  document.getElementById("milestone-file-input")?.click()
                }
                disabled={isUploading || isParsingFile}
                variant="default"
                size="default"
              >
                <FileDown className="mr-2 h-4 w-4" size={24} />
                Import Excel
              </Button>
            </>
          )}
        </div>

        {/* <Button onClick={handleViewLog} variant="outline" size="default">
          View Hours Log
        </Button> */}

        <Button
          onClick={() => setOpenAddMilestone(true)}
          variant="default"
          size="default"
        >
          Add Milestone
        </Button>
      </div>

      {isFetchingMilestones ? (
        <div className="flex items-center justify-center p-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <span className="ml-2">Loading milestones...</span>
        </div>
      ) : milestones.length > 0 ? (
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full border-t-2 p-2"
        >
          <TabsList className="mb-2">
            {milestones.map((m) => (
              <TabsTrigger key={m.id} value={String(m.id)}>
                {m.name || m.milestoneName}
              </TabsTrigger>
            ))}
          </TabsList>

          {milestones.map((m) => (
            <TabsContent key={m.id} value={String(m.id)}>
              <ActiveMilestoneContent
                milestoneId={m.id}
                onViewTaskLog={handleViewTaskLog}
              />
            </TabsContent>
          ))}
        </Tabs>
      ) : (
        <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed rounded-xl bg-muted/10 text-muted-foreground">
          <FileDown className="h-10 w-10 mb-4 opacity-20" />
          <p className="text-lg font-medium text-foreground">
            No milestones uploaded yet.
          </p>
          <p className="text-sm max-w-xs text-center">
            Upload an Excel or CSV file containing your project milestones to
            view them here.
          </p>
        </div>
      )}

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

      <ExcelImportPreview
        open={previewOpen}
        onOpenChange={setPreviewOpen}
        data={previewData}
        fileName={selectedFile?.name || ""}
        isLoading={isParsingFile}
        onConfirm={handlePreviewConfirm}
      />

      {/* Manual Milestone Addition Dialog */}
      {projectId && (
        <AddManualMilestone
          open={openAddMilestone}
          onOpenChange={setOpenAddMilestone}
          projectId={projectId}
        />
      )}
    </>
  );
};

export default MilestoneList;
