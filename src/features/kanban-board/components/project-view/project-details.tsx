"use client";

import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import {
  FileSpreadsheet,
  Flag,
  Server,
  SquareCheckBig,
  Users,
  StickyNote,
  Files,
} from "lucide-react";
import MilestoneList from "./milestone-list";
import OverviewProject from "./overview-project";
import ProjectReport from "./project-report";
import {
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { IconUserStar } from "@tabler/icons-react";
import { ClientMeetingTab } from "./client-meeting";
import { InternalMeetingTab } from "./internal-meeting";
import ProjectServerComponent from "@/features/projects/components/project-server-component";
import ProjectDocumentComponent from "@/features/projects/components/project-document-component";
import { useGetProjectsDetailData } from "@/features/projects/services";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
} from "@/components/ui/tooltip";
// import { useAuthStore } from "@/stores/use-auth-store";
// import { roles } from "@/utils/constant";
import { StickyNotesTab } from "@/features/sticky-notes/components/sticky-notes-tab";
import { useHoursLogStore } from "../../stores/useHoursLogStore";
import { AddHoursLogDialog } from "./milestone-list/add-hours-log-dialog";

// Skeleton Components for each tab
const OverviewSkeleton = () => (
  <div className="space-y-6 pt-4">
    {/* Info Grid */}
    <div className="border rounded-lg p-4 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-8">
        {Array.from({ length: 9 }).map((_, i) => (
          <div key={i} className="flex flex-col gap-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-6 w-32" />
          </div>
        ))}
      </div>
    </div>

    {/* Developers Section */}
    <div className="border rounded-lg p-4 space-y-4">
      <Skeleton className="h-6 w-48" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-48 w-full rounded-lg" />
        ))}
      </div>
    </div>
  </div>
);

const MilestoneSkeleton = () => (
  <div className="space-y-6 pt-4">
    {/* Action Buttons */}
    <div className="flex gap-2 flex-wrap">
      <Skeleton className="h-10 w-32" />
      <Skeleton className="h-10 w-32" />
      <Skeleton className="h-10 w-32" />
    </div>

    {/* Milestone Tabs */}
    <div className="border-t-2 p-2">
      <div className="flex gap-2 pb-4 overflow-x-auto">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-8 w-24 rounded-full" />
        ))}
      </div>

      {/* Milestone Content */}
      <div className="space-y-4 mt-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full rounded-lg" />
        ))}
      </div>
    </div>
  </div>
);

const ReportSkeleton = () => (
  <div className="space-y-6 pt-4">
    {/* Filters Row */}
    <div className="flex gap-2 flex-wrap">
      <Skeleton className="h-10 w-48 rounded-full" />
      <Skeleton className="h-10 w-32 rounded-full" />
      <Skeleton className="h-10 w-40 rounded-full" />
    </div>

    {/* Table Skeleton */}
    <div className="border rounded-lg overflow-hidden">
      {/* Table Header */}
      <div className="bg-gray-50 p-4 grid grid-cols-5 gap-4 border-b">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-4 w-24" />
        ))}
      </div>

      {/* Table Rows */}
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          className="p-4 grid grid-cols-5 gap-4 border-b last:border-b-0"
        >
          {Array.from({ length: 5 }).map((_, j) => (
            <Skeleton key={j} className="h-4 w-20" />
          ))}
        </div>
      ))}
    </div>
  </div>
);

const DocumentSkeleton = () => (
  <div className="space-y-6 pt-4">
    {/* Filters Row */}
    <div className="flex gap-2 flex-wrap">
      <Skeleton className="h-10 w-64 rounded-full" />
      <Skeleton className="h-10 w-32 rounded-full" />
      <Skeleton className="h-10 w-40 rounded-full" />
    </div>

    {/* Documents List/Table */}
    <div className="space-y-2">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="border rounded-lg p-4 flex justify-between items-center"
        >
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-3 w-32" />
          </div>
          <Skeleton className="h-6 w-6" />
        </div>
      ))}
    </div>
  </div>
);

const ServerSkeleton = () => (
  <div className="space-y-4 pt-4">
    {/* Header with Add Button */}
    <div className="flex justify-between items-center mb-4">
      <Skeleton className="h-6 w-32" />
      <Skeleton className="h-10 w-24" />
    </div>

    {/* Server Cards Grid */}
    <div className="flex gap-6 flex-wrap">
      {Array.from({ length: 3 }).map((_, i) => (
        <Skeleton key={i} className="h-56 w-80 rounded-lg" />
      ))}
    </div>
  </div>
);

const MeetingSkeleton = () => (
  <div className="space-y-6 pt-4">
    {/* Filters Row */}
    <div className="flex gap-2 flex-wrap">
      <Skeleton className="h-10 w-48 rounded-full" />
      <Skeleton className="h-10 w-32 rounded-full" />
      <Skeleton className="h-10 w-32" />
    </div>

    {/* Meetings Table/List */}
    <div className="border rounded-lg overflow-hidden">
      {/* Table Header */}
      <div className="bg-gray-50 p-4 grid grid-cols-4 gap-4 border-b">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-4 w-24" />
        ))}
      </div>

      {/* Table Rows */}
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="p-4 grid grid-cols-4 gap-4 border-b last:border-b-0"
        >
          {Array.from({ length: 4 }).map((_, j) => (
            <Skeleton key={j} className="h-4 w-20" />
          ))}
        </div>
      ))}
    </div>
  </div>
);

const StickyNotesSkeleton = () => (
  <div className="space-y-4 pt-4">
    {/* Filters/Header */}
    <div className="flex gap-2 flex-wrap mb-4">
      <Skeleton className="h-10 w-48 rounded-full" />
      <Skeleton className="h-10 w-24" />
    </div>

    {/* Sticky Notes Grid */}
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <Skeleton key={i} className="h-48 w-full rounded-lg" />
      ))}
    </div>
  </div>
);

export const ProjectDetails = ({ projectId }: { projectId?: any }) => {
  // const { user } = useAuthStore();
  // const Role = user?.user?.role;
  // const isDeveloperView = Role === roles.DEVELOPER;
  const { data: projectDetailsResponse, refetch: refetchProjectDetails } =
    useGetProjectsDetailData(projectId?.toString());
  const project = (projectDetailsResponse as any)?.data;
  const [activeMainTab, setActiveMainTab] = useState("overview");
  const [isChangingTab, setIsChangingTab] = useState(false);
  const hoursLogStore = useHoursLogStore();

  useEffect(() => {
    setIsChangingTab(true);
    const timer = setTimeout(() => setIsChangingTab(false), 500);
    return () => clearTimeout(timer);
  }, [activeMainTab]);

  const tabTriggerClass =
    "flex items-center gap-2 rounded-[50px] px-3 py-2  transition-all " +
    "data-[state=active]:bg-black data-[state=active]:text-white";

  const getSkeletonForTab = (tabName: string) => {
    switch (tabName) {
      case "overview":
        return <OverviewSkeleton />;
      case "milestone":
        return <MilestoneSkeleton />;
      case "report":
        return <ReportSkeleton />;
      case "doc":
        return <DocumentSkeleton />;
      case "server":
        return <ServerSkeleton />;
      case "client":
        return <MeetingSkeleton />;
      case "internal_meeting":
        return <MeetingSkeleton />;
      case "sticky_notes":
        return <StickyNotesSkeleton />;
      default:
        return <OverviewSkeleton />;
    }
  };

  return (
    <DrawerContent className="h-full w-full !max-w-[1100px] overflow-y-auto overflow-x-hidden ml-auto">
      <DrawerHeader>
        <div className="flex items-center justify-between mb-4 px-1">
          <div className="flex items-center gap-3">
            <DrawerTitle className="text-xl font-bold truncate max-w-[600px]">
              {project?.name || "Project Details"}
            </DrawerTitle>
            <DrawerDescription className="sr-only">
              Project details and management tabs
            </DrawerDescription>
            <TooltipProvider>
              <Tooltip>
                <TooltipContent side="right">
                  {project?.isPinned ? "Unpin Project" : "Pin Project"}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>

        <Tabs
          value={activeMainTab}
          onValueChange={setActiveMainTab}
          className="w-full "
        >
          <TabsList
            className="
      flex gap-2
      bg-[#fdebef]
      rounded-full
      px-2 py-1
      w-full sm:w-max
      max-w-full
      overflow-x-auto
      no-scrollbar
      justify-start
      flex-nowrap
    "
          >
            <TabsTrigger value="overview" className={tabTriggerClass}>
              <FileSpreadsheet className="w-4 h-4" /> Overview
            </TabsTrigger>
            <TabsTrigger value="milestone" className={tabTriggerClass}>
              <Flag className="w-4 h-4" /> Milestone
            </TabsTrigger>
            <TabsTrigger value="report" className={tabTriggerClass}>
              <SquareCheckBig className="w-4 h-4" /> Report
            </TabsTrigger>
            <TabsTrigger value="doc" className={tabTriggerClass}>
              <Files className="w-4 h-4" /> Documents
            </TabsTrigger>
            <TabsTrigger value="server" className={tabTriggerClass}>
              <Server className="w-4 h-4" /> Server
            </TabsTrigger>
            <TabsTrigger value="client" className={tabTriggerClass}>
              <IconUserStar className="w-4 h-4" /> Client Meeting
            </TabsTrigger>
            <TabsTrigger value="internal_meeting" className={tabTriggerClass}>
              <Users className="w-4 h-4" /> Internal Meeting
            </TabsTrigger>
            <TabsTrigger value="sticky_notes" className={tabTriggerClass}>
              <StickyNote className="w-4 h-4" /> Sticky Notes
            </TabsTrigger>
          </TabsList>

          <div className="overflow-y-auto h-[calc(100vh-160px)] sm:h-[calc(100vh-131px)] pr-2">
            {isChangingTab ? (
              getSkeletonForTab(activeMainTab)
            ) : (
              <>
                <TabsContent value="overview">
                  <OverviewProject
                    projectId={projectId}
                    onProjectUpdated={refetchProjectDetails}
                  />
                </TabsContent>

                <TabsContent value="milestone">
                  <MilestoneList projectId={projectId} />
                </TabsContent>

                <TabsContent value="report">
                  <ProjectReport projectId={projectId} />
                </TabsContent>

                <TabsContent value="doc">
                  <ProjectDocumentComponent projectId={projectId} />
                </TabsContent>

                <TabsContent value="server">
                  <ProjectServerComponent projectId={projectId} />
                </TabsContent>

                <TabsContent value="client">
                  <ClientMeetingTab projectId={projectId} project={project} />
                </TabsContent>

                <TabsContent value="internal_meeting">
                  <InternalMeetingTab projectId={projectId} />
                </TabsContent>

                <TabsContent value="sticky_notes">
                  <StickyNotesTab projectId={projectId} />
                </TabsContent>
              </>
            )}
          </div>
        </Tabs>
        {hoursLogStore.isOpen && hoursLogStore.props && (
          <AddHoursLogDialog
            {...hoursLogStore.props}
            open={hoursLogStore.isOpen}
            onOpenChange={(open) => {
              if (!open) hoursLogStore.closeDialog();
            }}
            hideTrigger
          />
        )}
      </DrawerHeader>
    </DrawerContent>
  );
};
