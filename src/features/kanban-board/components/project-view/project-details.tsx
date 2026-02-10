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

export const ProjectDetails = ({ projectId }: { projectId?: any }) => {
  // const { user } = useAuthStore();
  // const Role = user?.user?.role;
  // const isDeveloperView = Role === roles.DEVELOPER;
  const { data: projectDetailsResponse } = useGetProjectsDetailData(
    projectId?.toString()
  );
  const project = (projectDetailsResponse as any)?.data;
  const [activeMainTab, setActiveMainTab] = useState("overview");
  const [isChangingTab, setIsChangingTab] = useState(false);

  useEffect(() => {
    setIsChangingTab(true);
    const timer = setTimeout(() => setIsChangingTab(false), 500);
    return () => clearTimeout(timer);
  }, [activeMainTab]);

  const TabContentSkeleton = () => (
    <div className="space-y-6 pt-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Skeleton className="h-32 w-full rounded-xl" />
        <Skeleton className="h-32 w-full rounded-xl" />
        <Skeleton className="h-32 w-full rounded-xl" />
      </div>
      <div className="space-y-4">
        <Skeleton className="h-8 w-1/4" />
        <div className="rounded-md border p-6 space-y-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex gap-4">
              <Skeleton className="h-4 flex-1" />
              <Skeleton className="h-4 flex-1" />
              <Skeleton className="h-4 w-20" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const tabTriggerClass =
    "flex items-center gap-2 rounded-[50px] px-3 py-2  transition-all " +
    "data-[state=active]:bg-black data-[state=active]:text-white";

  return (
    <DrawerContent className="h-full w-full !max-w-[1100px] ml-auto">
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
          <TabsList className="mb-4 flex flex-wrap h-auto gap-2 bg-[#fdebef] rounded-full">
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

          <div className="overflow-y-auto h-[calc(100vh-131px)] pr-2">
            {isChangingTab ? (
              <TabContentSkeleton />
            ) : (
              <>
                <TabsContent value="overview">
                  <OverviewProject projectId={projectId} />
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
      </DrawerHeader>
    </DrawerContent>
  );
};
