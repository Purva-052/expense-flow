"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Download, FileDown, Loader2 } from "lucide-react";
import {
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import HoursLogs from "@/features/daily-report/components/hours-logs";
import { CommonModal } from "@/components/common-modal";
import {
  useDownloadMilestoneSample,
  useUploadMilestoneFile,
  useGetProjectMilestonesList,
  useGetProjectHandlerProjectsAPI,
  useGetMilestoneTasks,
} from "@/features/kanban-board/services";
import { ExcelImportPreview, ExcelPreviewData } from "./excel-import-preview";
import { AddManualMilestone } from "./add-manual-milestone";
import * as ExcelJS from "exceljs";
import { useQueryClient } from "@tanstack/react-query";
import API from "@/config/api/api";
import { useAuthStore } from "@/stores/use-auth-store";
import { roles } from "@/utils/constant";

import { MilestoneTask } from "./milestone-list/types";
import { ActiveMilestoneContent } from "./milestone-list/active-milestone-content";
import { toast } from "sonner";

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
  const justCreatedMilestoneIdRef = useRef<string | null>(null);

  const { isDownloading, downloadSample } = useDownloadMilestoneSample();
  const { isUploading, uploadFile } = useUploadMilestoneFile();

  const { data: milestonesListResponse, isLoading: isFetchingMilestones } =
    useGetProjectMilestonesList(projectId);

  const { data: handledProjectsResponse } = useGetProjectHandlerProjectsAPI({
    enabled: !!user && !isDeveloperView,
  }) as any;

  const { data: activeMilestoneDetail } = useGetMilestoneTasks(activeTab, {
    enabled: !!activeTab,
  });

  const activeMilestone = activeMilestoneDetail?.data || activeMilestoneDetail;
  const isExcelUploaded = activeMilestone?.isExcelUploaded === true;

  const isCurrentUserProjectHandler = useMemo(() => {
    const users = handledProjectsResponse?.data || [];

    return users.some((user: any) => {
      return user.handledProjects?.some((project: any) => {
        const isMatch = String(project.id) === String(projectId);

        return isMatch;
      });
    });
  }, [handledProjectsResponse, projectId]);

  const isAdmin = Role === roles.ADMIN;
  const isProjectManager = Role === roles.PROJECT_MANAGER;
  const canModifyMilestones =
    isAdmin || isProjectManager || isCurrentUserProjectHandler;

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
      const isPresent = milestones.some((m) => String(m.id) === activeTab);

      if (
        !activeTab ||
        (!isPresent && justCreatedMilestoneIdRef.current !== activeTab)
      ) {
        setActiveTab(String(milestones[0].id));
      }

      if (isPresent) {
        justCreatedMilestoneIdRef.current = null;
      }
    }
  }, [milestones, activeTab]);

  const handleEditMilestone = (milestone: any) => {
    setMilestoneToEdit(milestone);
    setOpenAddMilestone(true);
  };

  const handleViewTaskLog = (task: MilestoneTask) => {
    setSelectedTaskForLogs(task);
    setOpenLogsModal(true);
  };

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
            toast.error("No data found in the Excel file.");
          }
        } catch (error) {
          console.error("Error parsing Excel file:", error);
          toast.error("Please check the file format.");
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
    if (response?.statusCode === 200 || response?.statusCode === 201) {
      queryClient.invalidateQueries({
        queryKey: [API.dropdown_api.milestones, { projectId }],
      });
    }
    setPreviewOpen(false);
    setPreviewData(null);
    setSelectedFile(null);
  };

  const tabTriggerClass =
    "group flex items-center gap-2 rounded-[50px] px-3 py-2 transition-all h-[35px] " +
    "data-[state=active]:bg-black data-[state=active]:text-white whitespace-nowrap min-w-fit";
  return (
    <>
      <div className="mb-4 flex items-center gap-2 overflow-x-auto pb-2">
        <div className="flex items-center gap-2">
          {canModifyMilestones && !isExcelUploaded && (
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
        {canModifyMilestones && (
          <div className="flex items-center gap-2">
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
          </div>
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
          <div className="w-full overflow-x-auto scrollbar-hide pb-1">
            <TabsList
              className="
      mb-2
      h-auto
      bg-[#fdebef]
      rounded-full
      inline-flex
      gap-1
      w-max
    "
            >
              {milestones.map((m) => (
                <TabsTrigger
                  key={m.id}
                  value={String(m.id)}
                  className={`
          ${tabTriggerClass}
          max-w-[300px]
          flex
          items-center
          gap-1
        `}
                  title={m.name || m.milestoneName}
                >
                  <span className="truncate max-w-[200px] inline-block">
                    {m.name || m.milestoneName}
                  </span>

                  <Badge className="shrink-0">
                    {m.taskCount || m.tasks?.length || 0}
                  </Badge>
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          {milestones.map((m) => (
            <TabsContent key={m.id} value={String(m.id)}>
              <ActiveMilestoneContent
                projectId={projectId!}
                milestoneId={m.id}
                onViewTaskLog={handleViewTaskLog}
                onEditMilestone={(data) => handleEditMilestone(data)}
                isCurrentUserProjectHandler={isCurrentUserProjectHandler}
              />
            </TabsContent>
          ))}
        </Tabs>
      ) : (
        <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed rounded-xl bg-muted/10 text-muted-foreground">
          <FileDown className="h-10 w-10 mb-4 opacity-20" />

          <p className="text-lg font-medium text-foreground">
            No milestones uploaded yet
          </p>

          <p className="text-sm max-w-sm text-center mt-1">
            Upload an Excel file containing your project milestones to get
            started.
          </p>

          <div className="mt-6 w-full max-w-md rounded-lg bg-background border p-4 text-sm">
            <p className="font-medium text-foreground mb-2">
              Milestone naming tips
            </p>

            <ul className="space-y-1 list-disc list-inside text-muted-foreground">
              <li>
                Use clear names like{" "}
                <span className="font-medium">Milestone 1</span>,{" "}
                <span className="font-medium">Milestone 2</span>, etc{" "}
              </li>
              <li>Minimum 2 characters required</li>
              <li>Maximum 20 characters allowed</li>
            </ul>
          </div>
        </div>
      )}

      <CommonModal
        open={openLogsModal}
        onOpenChange={setOpenLogsModal}
        className="sm:max-w-4xl overflow-hidden max-h-[90vh]"
      >
        <DialogHeader className="flex flex-row items-center justify-between pr-12">
          <div className="space-y-0.5">
            <DialogTitle>{selectedTaskForLogs?.taskName}</DialogTitle>
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

      {projectId && (
        <AddManualMilestone
          open={openAddMilestone}
          onOpenChange={(open) => {
            setOpenAddMilestone(open);
            if (!open) setMilestoneToEdit(null);
          }}
          projectId={projectId}
          initialData={milestoneToEdit}
          onMilestoneCreated={(milestone) => {
            if (milestone?.id) {
              justCreatedMilestoneIdRef.current = String(milestone.id);
              setActiveTab(String(milestone.id));
            }
          }}
        />
      )}
    </>
  );
};

export default MilestoneList;