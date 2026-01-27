"use client";

import { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ColumnDef, PaginationState } from "@tanstack/react-table";
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
} from "@/features/kanban-board/services";
import { ExcelImportPreview, ExcelPreviewData } from "./excel-import-preview";
import * as XLSX from "xlsx";

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
const MilestoneList = ({ projectId }: { projectId?: string | number }) => {
  const [openLogsModal, setOpenLogsModal] = useState(false);
  // const [_, setSelectedRow] = useState<ProjectReport | null>(null);
  const [previewData, setPreviewData] = useState<ExcelPreviewData | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isParsingFile, setIsParsingFile] = useState(false);
  const { isDownloading, downloadSample } = useDownloadMilestoneSample();
  const { isUploading, uploadFile } = useUploadMilestoneFile();

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

  // Parse Excel file and show preview
  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
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
      // Read file
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = e.target?.result;
          const workbook = XLSX.read(data, { type: "binary" });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];

          // Convert to JSON to get headers and rows
          const jsonData = XLSX.utils.sheet_to_json(worksheet, {
            header: 1,
          }) as (string | number | boolean | null)[][];

          if (jsonData.length > 0) {
            const headers = jsonData[0].map((h) => String(h || ""));
            const rows = jsonData.slice(1);

            setPreviewData({
              headers,
              rows,
            });
            setPreviewOpen(true);
          } else {
            alert("No data found in the Excel file.");
          }
        } catch (error) {
          console.error("Error parsing Excel file:", error);
          alert("Error parsing Excel file. Please check the format.");
        } finally {
          setIsParsingFile(false);
        }
      };

      reader.readAsBinaryString(file);
    } catch (error) {
      console.error("Error reading file:", error);
      alert("Error reading file.");
      setIsParsingFile(false);
    }

    // Reset input
    event.target.value = "";
  };

  // Handle preview confirmation and upload
  const handlePreviewConfirm = async () => {
    if (!selectedFile) return;
    await uploadFile(selectedFile, projectId);
    setPreviewOpen(false);
    setPreviewData(null);
    setSelectedFile(null);
  };

  return (
    <>
      {/* Download Sample & Upload Buttons */}
      <div className="mb-4 flex gap-2">
        <Button
          onClick={downloadSample}
          disabled={isDownloading}
          variant="default"
          size="default"
        >
          {isDownloading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Downloading...
            </>
          ) : (
            <>
              <Download className="mr-2 h-4 w-4" />
              Download Sample
            </>
          )}
        </Button>

        {/* File input for upload */}
        <input
          type="file"
          accept=".xlsx,.xls,.csv"
          onChange={handleFileUpload}
          disabled={isUploading}
          className="hidden"
          id="milestone-file-input"
        />

        {/* {reportData.length === 0 && ( */}
        <Button
          onClick={() =>
            document.getElementById("milestone-file-input")?.click()
          }
          disabled={isUploading || isParsingFile}
          variant="outline"
          size="default"
        >
          {isUploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Uploading...
            </>
          ) : isParsingFile ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Parsing...
            </>
          ) : (
            <>
              <FileDown className="mr-2 h-4 w-4" size={24} />
              Import Excel
            </>
          )}
        </Button>

        <div className="justify-end">
          <Button onClick={handleViewLog} variant="outline" size="default">
            View Hours Log
          </Button>
        </div>
        {/* )} */}
      </div>

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

      {/* Excel Import Preview Modal */}
      <ExcelImportPreview
        open={previewOpen}
        onOpenChange={setPreviewOpen}
        data={previewData}
        fileName={selectedFile?.name || ""}
        isLoading={isParsingFile}
        onConfirm={handlePreviewConfirm}
      />
    </>
  );
};

export default MilestoneList;
