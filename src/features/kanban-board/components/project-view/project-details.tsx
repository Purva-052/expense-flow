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
  // Pin,
} from "lucide-react";
import MilestoneList from "./milestone-list";
import OverviewProject from "./overview-project";
import ProjectTaskList from "./project-task-list";
import {
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Card } from "@/components/ui/card";
import { IconUserStar } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { ClientMeetingDialog } from "./client-meeting";
import { useState } from "react";
import ProjectServerComponent from "@/features/projects/components/project-server-component";
import ProjectDocumentComponent from "@/features/projects/components/project-document-component";
import {
  useGetProjectsDetailData,
  usePinProject,
  useUnpinProject,
} from "@/features/projects/services";
import { useQueryClient } from "@tanstack/react-query";
import { ConfirmDialog } from "@/components/confirm-dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  // TooltipTrigger,
} from "@/components/ui/tooltip";
import { useAuthStore } from "@/stores/use-auth-store";
import { roles } from "@/utils/constant";

export const ProjectDetails = ({ projectId }: { projectId?: any }) => {
  const { user } = useAuthStore();
  const Role = user?.user?.role;
  const isDeveloperView = Role === roles.DEVELOPER;

  const [open, setOpen] = useState(false);
  const [meetingType, setMeetingType] = useState<"client" | "internal">(
    "client"
  );
  const [isPinConfirmOpen, setIsPinConfirmOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();

  const { data: projectDetailsResponse } = useGetProjectsDetailData(
    projectId?.toString()
  );
  const project = (projectDetailsResponse as any)?.data;

  const { mutateAsync: pinProject } = usePinProject(projectId?.toString());
  const { mutateAsync: unpinProject } = useUnpinProject(projectId?.toString());

  // const handlePinToggle = () => {
  //   setIsPinConfirmOpen(true);
  // };

  const handleConfirmPin = async () => {
    try {
      setIsSubmitting(true);
      if (project?.isPinned) {
        await unpinProject();
      } else {
        await pinProject();
      }
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      setIsPinConfirmOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getMeetingDialogProps = () => {
    if (meetingType === "internal") {
      return {
        title: "Internal Meeting Details",
        description: "Internal Discussion Points & Notes",
      };
    }
    return {
      title: "Client Meeting Details",
      description: "Description or Discussion Points",
    };
  };

  const handleMeetingSubmit = (data: any) => {
    console.log(data);
  };

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
                {/* <TooltipTrigger asChild>
                  {project?.isPinned ? (
                    <Pin
                      className="h-5 w-5 cursor-pointer text-[#E80339] fill-[#E80339] transition-colors duration-200"
                      onClick={handlePinToggle}
                    />
                  ) : (
                    <Pin
                      className="h-5 w-5 cursor-pointer text-muted-foreground transition-colors duration-200 hover:text-[#E80339]"
                      onClick={handlePinToggle}
                    />
                  )}
                </TooltipTrigger> */}
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
              {/* <TabsTrigger value="overview" className="flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4" /> Overview
              </TabsTrigger> */}
              <TabsTrigger
                value="milestone"
                className="flex items-center gap-2"
              >
                <Flag className="w-4 h-4" /> Milestone
              </TabsTrigger>
              {/* <TabsTrigger
                value="analytics"
                className="flex items-center gap-2"
              >
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
              </TabsTrigger> */}
            </TabsList>

            <div className="overflow-y-auto h-[calc(100vh-131px)] pr-2">
              <TabsContent value="overview">
                <OverviewProject projectId={projectId} />
              </TabsContent>

              <TabsContent value="milestone">
                <MilestoneList projectId={projectId} />
              </TabsContent>

              <TabsContent value="analytics">
                <ProjectTaskList projectId={projectId} />
              </TabsContent>

              <TabsContent value="doc">
                <Card className="p-4">
                  <ProjectDocumentComponent projectId={projectId} />
                </Card>
              </TabsContent>

              <TabsContent value="server">
                <div className="border p-4 rounded-2xl bg-white shadow-sm">
                  <ProjectServerComponent projectId={projectId} />
                </div>
              </TabsContent>

              {/* CLIENT MEETING */}
              <TabsContent value="client">
                <Card>
                  <div className="flex justify-between p-6">
                    <div>
                      <h2 className="text-2xl font-semibold">
                        Client Meetings
                      </h2>
                      <p className="text-sm text-muted-foreground">
                        Track and manage all client meetings
                      </p>
                    </div>
                    <Button
                      onClick={() => {
                        setMeetingType("client");
                        setOpen(true);
                      }}
                    >
                      <Plus className="w-4 h-4 mr-2" /> Add Meeting
                    </Button>
                  </div>
                </Card>
              </TabsContent>

              {/* INTERNAL MEETING */}
              <TabsContent value="internal_meeting">
                <Card>
                  <div className="flex justify-between p-6">
                    <div>
                      <h2 className="text-2xl font-semibold">
                        Internal Meetings
                      </h2>
                      <p className="text-sm text-muted-foreground">
                        Track and manage internal team meetings
                      </p>
                    </div>
                    <Button
                      onClick={() => {
                        setMeetingType("internal");
                        setOpen(true);
                      }}
                    >
                      <Plus className="w-4 h-4 mr-2" /> Add Meeting
                    </Button>
                  </div>
                </Card>
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
              <TabsTrigger
                value="analytics"
                className="flex items-center gap-2"
              >
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
            </TabsList>

            <div className="overflow-y-auto h-[calc(100vh-131px)] pr-2">
              <TabsContent value="overview">
                <OverviewProject projectId={projectId} />
              </TabsContent>

              <TabsContent value="milestone">
                <MilestoneList projectId={projectId} />
              </TabsContent>

              <TabsContent value="analytics">
                <ProjectTaskList projectId={projectId} />
              </TabsContent>

              <TabsContent value="doc">
                <Card className="p-4">
                  <ProjectDocumentComponent projectId={projectId} />
                </Card>
              </TabsContent>

              <TabsContent value="server">
                <div className="border p-4 rounded-2xl bg-white shadow-sm">
                  <ProjectServerComponent projectId={projectId} />
                </div>
              </TabsContent>

              {/* CLIENT MEETING */}
              <TabsContent value="client">
                <Card>
                  <div className="flex justify-between p-6">
                    <div>
                      <h2 className="text-2xl font-semibold">
                        Client Meetings
                      </h2>
                      <p className="text-sm text-muted-foreground">
                        Track and manage all client meetings
                      </p>
                    </div>
                    <Button
                      onClick={() => {
                        setMeetingType("client");
                        setOpen(true);
                      }}
                    >
                      <Plus className="w-4 h-4 mr-2" /> Add Meeting
                    </Button>
                  </div>
                </Card>
              </TabsContent>

              {/* INTERNAL MEETING */}
              <TabsContent value="internal_meeting">
                <Card>
                  <div className="flex justify-between p-6">
                    <div>
                      <h2 className="text-2xl font-semibold">
                        Internal Meetings
                      </h2>
                      <p className="text-sm text-muted-foreground">
                        Track and manage internal team meetings
                      </p>
                    </div>
                    <Button
                      onClick={() => {
                        setMeetingType("internal");
                        setOpen(true);
                      }}
                    >
                      <Plus className="w-4 h-4 mr-2" /> Add Meeting
                    </Button>
                  </div>
                </Card>
              </TabsContent>
            </div>
          </Tabs>
        )}
      </DrawerHeader>

      <ClientMeetingDialog
        open={open}
        onOpenChange={setOpen}
        onSubmit={(data) => handleMeetingSubmit(data)}
        loading={false}
        {...getMeetingDialogProps()}
      />

      <ConfirmDialog
        open={isPinConfirmOpen}
        onOpenChange={setIsPinConfirmOpen}
        title={project?.isPinned ? "Unpin Project" : "Pin Project"}
        desc={
          project?.isPinned
            ? `Are you sure you want to unpin ${project?.name || "this"} project?`
            : `Are you sure you want to pin ${project?.name || "this"} project?`
        }
        confirmText={project?.isPinned ? "Unpin" : "Pin"}
        destructive={false}
        handleConfirm={handleConfirmPin}
        isLoading={isSubmitting}
      />
    </DrawerContent>
  );
};
