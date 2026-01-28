"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ColumnDef } from "@tanstack/react-table";
import { GlobalTable } from "@/components/table/global-table";
import {
  CalendarIcon,
  Download,
  FileDown,
  Loader2,
  // MoreHorizontal,
  Pencil,
} from "lucide-react";
import {
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import HoursLogs from "@/features/daily-report/components/hours-logs";
import { CommonModal } from "@/components/common-modal";
import {
  useDownloadMilestoneSample,
  useUploadMilestoneFile,
  useGetProjectMilestonesList,
  useGetMilestoneTasks,
  useDeleteMilestone,
} from "@/features/kanban-board/services";
import { ExcelImportPreview, ExcelPreviewData } from "./excel-import-preview";
import { AddManualMilestone } from "./add-manual-milestone";
import * as ExcelJS from "exceljs";
import { useQueryClient } from "@tanstack/react-query";
import API from "@/config/api/api";
import { Trash2 } from "lucide-react";
import { DeleteModal } from "@/components/model/delete-model";
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuTrigger,
// } from "@/components/ui/dropdown-menu";
import { useAuthStore } from "@/stores/use-auth-store";
import { roles } from "@/utils/constant";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useCreateDailyReport } from "@/features/daily-report/services";

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

const TaskActions = ({
  task,
  onViewLog,
  onDeleteTask,
  projectId,
  milestoneId,
  onAddLogSuccess,
}: {
  task: MilestoneTask;
  onViewLog: (task: MilestoneTask) => void;
  onDeleteTask: (task: MilestoneTask) => void;
  projectId: string | number;
  milestoneId: number;
  onAddLogSuccess: () => void;
}) => {
  const { user } = useAuthStore();
  const Role = user?.user?.role;
  const isDeveloperView = Role === roles.DEVELOPER;
  const [addLogOpen, setAddLogOpen] = useState(false);

  return (
    <div className="flex items-center gap-2">
      <AddHoursLogDialog
        open={addLogOpen}
        onOpenChange={setAddLogOpen}
        projectId={projectId}
        milestoneId={milestoneId}
        taskId={task.id || ""}
        taskName={task.taskName}
        onSuccess={onAddLogSuccess}
      />

      <Button variant="outline" size="sm" onClick={() => onViewLog(task)}>
        View Log
      </Button>

      {!isDeveloperView && (
        <Button variant="outline" size="sm" onClick={() => onDeleteTask(task)}>
          Delete task
        </Button>
      )}
    </div>
  );
};

const getReportColumns = (
  onViewLog: (row: MilestoneTask) => void,
  onDeleteTask: (row: MilestoneTask) => void,
  projectId: string | number,
  milestoneId: number,
  onAddLogSuccess: () => void
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
      <span className="font-semibold">{row.original.estimatedTime || "0"}</span>
    ),
  },
  {
    accessorKey: "actualTime",
    header: "Actual Hours (hrs)",
    cell: ({ row }) => (
      <span className="font-semibold text-green-600">
        {row.original.actualTime || "0"}
      </span>
    ),
  },
  {
    id: "action",
    header: "Action",
    cell: ({ row }) => (
      <TaskActions
        task={row.original}
        onViewLog={onViewLog}
        onDeleteTask={onDeleteTask}
        projectId={projectId}
        milestoneId={milestoneId}
        onAddLogSuccess={onAddLogSuccess}
      />
    ),
  },
];

interface AddHoursLogDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string | number;
  milestoneId: string | number;
  taskId: string | number;
  taskName: string;
  onSuccess?: () => void;
}

const AddHoursLogDialog = ({
  open,
  onOpenChange,
  projectId,
  milestoneId,
  taskId,
  // taskName,
  onSuccess,
}: AddHoursLogDialogProps) => {
  const { user } = useAuthStore();
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [hours, setHours] = useState("0");
  const [minutes, setMinutes] = useState("0");
  const [description, setDescription] = useState("");

  const { mutate: createReport, isPending } = useCreateDailyReport(() => {
    onSuccess?.();
    onOpenChange(false);
    // Reset form
    setDate(new Date());
    setHours("0");
    setMinutes("0");
    setDescription("");
  });

  const handleSave = () => {
    if (!date || !description || (hours === "0" && minutes === "0")) {
      return;
    }

    const payload = {
      reportingDate: format(date, "yyyy-MM-dd"),
      employeeId: Number(user?.user?.id),
      projectId: Number(projectId),
      projectMilestoneId: Number(milestoneId),
      taskId: Number(taskId),
      taskDescription: description,
      timeSpent: `${hours}h${minutes}m`,
    };

    createReport(payload);
  };

  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <Button
          size="sm"
          className="bg-[#e11d48] hover:bg-[#be123c] text-white"
        >
          Add Hours Log
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-80 space-y-4" align="end">
        {/* <div className="space-y-2 pb-2 border-b">
          <h4 className="font-medium leading-none">Add Hours Log</h4>
          <p className="text-xs text-muted-foreground line-clamp-1">
            {taskName}
          </p>
        </div> */}

        <div className="grid gap-4">
          {/* Date */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium">Date</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="justify-start text-left font-normal h-9"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Actual Hours (from screenshot) */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium">Actual Hours</label>
            <div className="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2">
              <Select value={hours} onValueChange={setHours}>
                <SelectTrigger className="h-9 w-full">
                  <SelectValue placeholder="Hrs" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 13 }).map((_, i) => (
                    <SelectItem key={i} value={String(i)}>
                      {String(i).padStart(2, "0")} hrs
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={minutes} onValueChange={setMinutes}>
                <SelectTrigger className="h-9 w-full">
                  <SelectValue placeholder="Min" />
                </SelectTrigger>
                <SelectContent>
                  {[0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55].map((m) => (
                    <SelectItem key={m} value={String(m)}>
                      {String(m).padStart(2, "0")} min
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Description */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium">Work Description</label>
            <Textarea
              placeholder="What did you work on?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="min-h-[80px] text-sm"
            />
          </div>

          <Button
            className="w-full bg-[#e11d48] hover:bg-[#be123c] text-white"
            onClick={handleSave}
            disabled={
              isPending || !description || (hours === "0" && minutes === "0")
            }
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Log"
            )}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
};

const ActiveMilestoneContent = ({
  projectId,
  milestoneId,
  onViewTaskLog,
  onEditMilestone,
  onDeleteMilestone,
}: {
  projectId: string | number;
  milestoneId: number;
  onViewTaskLog: (task: MilestoneTask) => void;
  onEditMilestone: () => void;
  onDeleteMilestone: () => void;
}) => {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const Role = user?.user?.role;
  const isDeveloperView = Role === roles.DEVELOPER;
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });

  const [itemToDelete, setItemToDelete] = useState<MilestoneTask | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Assuming useGetMilestoneTasks is defined in your codebase
  const { data: taskDataResponse, isLoading } = useGetMilestoneTasks(
    milestoneId,
    {
      page: pagination.pageIndex + 1,
      limit: pagination.pageSize,
    }
  );

  const { mutate: deleteMilestone, isPending: isDeleting } =
    useDeleteMilestone();

  const handleDeleteTask = (task: MilestoneTask) => {
    setItemToDelete(task);
    setShowDeleteModal(true);
  };

  const confirmDeleteTask = () => {
    if (!itemToDelete) return;

    deleteMilestone(
      { id: milestoneId, taskId: itemToDelete.id },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({
            queryKey: [`${API.projects.milestone_list}/${milestoneId}`],
          });
          setShowDeleteModal(false);
          setItemToDelete(null);
        },
      }
    );
  };

  const milestone = taskDataResponse?.data || taskDataResponse;
  const metadata = taskDataResponse?.metadata;

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
      {/* --- MODIFIED SECTION: Summary & Action Buttons --- */}
      <div className="mb-4 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        {/* Left Side: Stats Cards */}
        <div className="grid flex-1 grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="rounded-xl border p-3 bg-card text-card-foreground shadow-sm">
            <p className="text-sm text-muted-foreground">
              Total Estimated Hours
            </p>
            <p className="text-3xl font-bold">
              {actualMilestone?.estimatedTime || "0"}
            </p>
          </div>
          <div className="rounded-xl border p-3 bg-card text-card-foreground shadow-sm">
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

        {/* Right Side: Vertical Action Buttons */}
        {!isDeveloperView && (
          <div className="flex shrink-0 flex-col gap-2 min-w-[160px]">
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={onEditMilestone}
            >
              <Pencil className="mr-2 h-4 w-4" />
              Edit Milestone
            </Button>

            <Button
              variant="default"
              className="w-full justify-start"
              onClick={onDeleteMilestone}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Milestone
            </Button>
          </div>
        )}
      </div>
      {/* ------------------------------------------------ */}

      {/* Table */}
      <GlobalTable<MilestoneTask>
        data={tasks}
        columns={getReportColumns(
          onViewTaskLog,
          handleDeleteTask,
          projectId,
          milestoneId,
          () => {
            queryClient.invalidateQueries({
              queryKey: [`${API.projects.milestone_list}/${milestoneId}`],
            });
          }
        )}
        totalCount={metadata?.total || tasks.length}
        currentPage={metadata?.page || pagination.pageIndex + 1}
        pageSize={metadata?.limit || pagination.pageSize}
        onPaginationChange={setPagination}
        isPaginationEnabled={true}
        loading={isLoading || isDeleting}
      />

      <DeleteModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={confirmDeleteTask}
        itemName={itemToDelete?.taskName}
        loading={isDeleting}
      />
    </div>
  );
};

const MilestoneList = ({ projectId }: { projectId?: string | number }) => {
  const { user } = useAuthStore();
  const Role = user?.user?.role;
  const isDeveloperView = Role === roles.DEVELOPER;
  const queryClient = useQueryClient();
  const [openLogsModal, setOpenLogsModal] = useState(false);
  const [openAddMilestone, setOpenAddMilestone] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("");
  const [selectedTaskForLogs, setSelectedTaskForLogs] =
    useState<MilestoneTask | null>(null);
  const [totalTaskHours, setTotalTaskHours] = useState<number>(0);

  const [previewData, setPreviewData] = useState<ExcelPreviewData | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isParsingFile, setIsParsingFile] = useState(false);

  const [milestoneToEdit, setMilestoneToEdit] = useState<any | null>(null);

  const [milestoneToDelete, setMilestoneToDelete] = useState<any | null>(null);
  const [showMilestoneDeleteModal, setShowMilestoneDeleteModal] =
    useState(false);

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

  const { mutate: deleteMilestone, isPending: isDeletingMilestone } =
    useDeleteMilestone();

  const handleDeleteMilestone = (milestone: any) => {
    setMilestoneToDelete(milestone);
    setShowMilestoneDeleteModal(true);
  };

  // Handler for Editing Milestone
  const handleEditMilestone = (milestone: any) => {
    setMilestoneToEdit(milestone);
    setOpenAddMilestone(true);
  };

  const confirmDeleteMilestone = () => {
    if (!milestoneToDelete) return;

    deleteMilestone(
      { id: milestoneToDelete.id },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({
            queryKey: [API.dropdown_api.milestones, { projectId }],
          });
          if (activeTab === String(milestoneToDelete.id)) {
            setActiveTab("");
          }
          setShowMilestoneDeleteModal(false);
          setMilestoneToDelete(null);
        },
      }
    );
  };

  const handleViewTaskLog = (task: MilestoneTask) => {
    setSelectedTaskForLogs(task);
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
      <div className="mb-4 flex items-center gap-2 overflow-x-auto pb-2">
        <div className="flex items-center gap-2">
          {milestones.length === 0 && !isDeveloperView && (
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

        {!isDeveloperView && (
          <Button
            onClick={() => {
              setMilestoneToEdit(null);
              setOpenAddMilestone(true);
            }}
            variant="default"
            size="default"
          >
            Add Milestone
          </Button>
        )}
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
              /* MODIFIED: Removed the delete button from TabsTrigger */
              <TabsTrigger
                key={m.id}
                value={String(m.id)}
                className="px-4 py-2"
              >
                {m.name || m.milestoneName}
                <Badge
                  variant="secondary"
                  className="ml-2 bg-primary/10 text-primary hover:bg-primary/20 shrink-0"
                >
                  {m.taskCount || m.tasks?.length || 0}
                </Badge>
                <span
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteMilestone(m);
                  }}
                  className="absolute right-1 top-1/2 -translate-y-1/2 rounded-md p-1 opacity-0 group-hover:opacity-100 hover:bg-destructive/10 text-destructive transition-all cursor-pointer"
                  title="Delete Milestone"
                >
                  <Trash2 className="h-3 w-3" />
                </span>
              </TabsTrigger>
            ))}
          </TabsList>

          {milestones.map((m) => (
            <TabsContent key={m.id} value={String(m.id)}>
              <ActiveMilestoneContent
                projectId={projectId!}
                milestoneId={m.id}
                onViewTaskLog={handleViewTaskLog}
                /* MODIFIED: Passing action handlers down */
                onEditMilestone={() => handleEditMilestone(m)}
                onDeleteMilestone={() => handleDeleteMilestone(m)}
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
        className="sm:max-w-4xl overflow-hidden max-h-[90vh]"
      >
        <DialogHeader className="flex flex-row items-center justify-between pr-12">
          <div className="space-y-0.5">
            <DialogTitle>
              Hours Log - {selectedTaskForLogs?.taskName}
            </DialogTitle>
            <DialogDescription className="sr-only">
              List of hours logged for the task {selectedTaskForLogs?.taskName}
            </DialogDescription>
          </div>
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 shrink-0">
            <span className="text-[10px] font-bold text-primary uppercase tracking-wider">
              Total:
            </span>
            <span className="text-sm font-bold text-primary">
              {totalTaskHours.toFixed(2)} hrs
            </span>
          </div>
        </DialogHeader>
        <HoursLogs
          projectId={projectId}
          milestoneId={activeTab}
          taskId={selectedTaskForLogs?.id}
          onTotalHoursChange={setTotalTaskHours}
        />
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
          onOpenChange={(open) => {
            setOpenAddMilestone(open);
            if (!open) setMilestoneToEdit(null);
          }}
          projectId={projectId}
          initialData={milestoneToEdit}
        />
      )}

      <DeleteModal
        isOpen={showMilestoneDeleteModal}
        onClose={() => setShowMilestoneDeleteModal(false)}
        onConfirm={confirmDeleteMilestone}
        itemName={milestoneToDelete?.name || milestoneToDelete?.milestoneName}
        loading={isDeletingMilestone}
      />
    </>
  );
};

export default MilestoneList;
