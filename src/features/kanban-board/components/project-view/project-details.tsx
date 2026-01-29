"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  File,
  FileSpreadsheet,
  Flag,
  Server,
  SquareCheckBig,
  Users,
  Plus,
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
import { useAuthStore } from "@/stores/use-auth-store";
import { roles } from "@/utils/constant";
import { StickyNotesTab } from "@/features/sticky-notes/components/sticky-notes-tab";

export const ProjectDetails = ({ projectId }: { projectId?: any }) => {
  const { user } = useAuthStore();
  const Role = user?.user?.role;
  const isDeveloperView = Role === roles.DEVELOPER;
  const { data: projectDetailsResponse } = useGetProjectsDetailData(
    projectId?.toString()
  );
  const project = (projectDetailsResponse as any)?.data;

  return (
    <DrawerContent className="h-full w-full !max-w-[1024px] ml-auto">
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

        {isDeveloperView ? (
          <Tabs defaultValue="milestone" className="w-full">
            <TabsList className="mb-4 flex flex-wrap h-auto gap-2">
              <TabsTrigger
                value="milestone"
                className="flex items-center gap-2"
              >
                <Flag className="w-4 h-4" /> Milestone
              </TabsTrigger>
            </TabsList>

            <div className="overflow-y-auto h-[calc(100vh-131px)] pr-2">
              <TabsContent value="milestone">
                <MilestoneList projectId={projectId} />
              </TabsContent>
            </div>
          </Tabs>
        ) : (
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="mb-4 flex flex-wrap h-auto gap-2">
              <TabsTrigger value="overview" className="flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4" /> Overview
              </TabsTrigger>
              <TabsTrigger
                value="milestone"
                className="flex items-center gap-2"
              >
                <Flag className="w-4 h-4" /> Milestone
              </TabsTrigger>
              <TabsTrigger value="report" className="flex items-center gap-2">
                <SquareCheckBig className="w-4 h-4" /> Report
              </TabsTrigger>
              <TabsTrigger value="doc" className="flex items-center gap-2">
                <File className="w-4 h-4" /> Documents
              </TabsTrigger>
              <TabsTrigger value="server" className="flex items-center gap-2">
                <Server className="w-4 h-4" /> Server
              </TabsTrigger>
              <TabsTrigger value="client" className="flex items-center gap-2">
                <IconUserStar className="w-4 h-4" /> Client Meeting
              </TabsTrigger>
              <TabsTrigger
                value="internal_meeting"
                className="flex items-center gap-2"
              >
                <Users className="w-4 h-4" /> Internal Meeting
              </TabsTrigger>
              <TabsTrigger
                value="sticky_notes"
                className="flex items-center gap-2"
              >
                <Plus className="w-4 h-4" /> Sticky Notes
              </TabsTrigger>
            </TabsList>

            <div className="overflow-y-auto h-[calc(100vh-131px)] pr-2">
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
            </div>
          </Tabs>
        )}
      </DrawerHeader>
    </DrawerContent>
  );
};
