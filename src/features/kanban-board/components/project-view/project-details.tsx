"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  File,
  FileSpreadsheet,
  Flag,
  Server,
  SquareCheckBig,
  Users,
} from "lucide-react";
import MilestoneList from "./milestone-list";
import OverviewProject from "./overview-project";
import ProjectTaskList from "./project-task-list";
import {
  DrawerContent,
  DrawerHeader,
} from "@/components/ui/drawer";
import { Card } from "@/components/ui/card";
import { IconUserStar } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { ClientMeetingDialog } from "./client-meeting";
import { useState } from "react";
import { Plus } from "lucide-react";
import ProjectServerComponent from "@/features/projects/components/project-server-component";
import ProjectDocumentComponent from "@/features/projects/components/project-document-component";

export const ProjectDetails = ({ projectId }: { projectId?: string | number }) => {
  const [open, setOpen] = useState(false);
  const [meetingType, setMeetingType] = useState<"client" | "internal">(
    "client"
  );

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

  return (
    <DrawerContent className="h-full w-full !max-w-[1024px] ml-auto">
      <DrawerHeader>
        <Tabs defaultValue="milestone" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="milestone">
              <Flag /> Milestone
            </TabsTrigger>
            <TabsTrigger value="overview">
              <FileSpreadsheet /> Overview
            </TabsTrigger>
            <TabsTrigger value="analytics">
              <SquareCheckBig /> Report
            </TabsTrigger>
            <TabsTrigger value="doc">
              <File /> Project Documents
            </TabsTrigger>
            <TabsTrigger value="server">
              <Server /> Project Server
            </TabsTrigger>
            <TabsTrigger value="client">
              <IconUserStar /> Client Meeting
            </TabsTrigger>
            <TabsTrigger value="internal_meeting">
              <Users /> Internal Meeting
            </TabsTrigger>
          </TabsList>

          <div className="overflow-y-auto h-[calc(100vh-64px)]">
            <TabsContent value="milestone">
              <MilestoneList projectId={projectId} />
            </TabsContent>

            <TabsContent value="overview">
              <OverviewProject projectId={projectId} />
            </TabsContent>

            <TabsContent value="analytics">
              <ProjectTaskList projectId={projectId} />
            </TabsContent>

            <TabsContent value="doc">
              <Card>
                <ProjectDocumentComponent />
              </Card>
            </TabsContent>

            <TabsContent value="server">
              <div className="border p-4 rounded-2xl">
                <ProjectServerComponent />
              </div>
            </TabsContent>

            {/* CLIENT MEETING */}
            <TabsContent value="client">
              <Card>
                <div className="flex justify-between p-6">
                  <div>
                    <h2 className="text-2xl font-semibold">Client Meetings</h2>
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
                    <Plus className="w-4 h-4" /> Add Meeting
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
                    <Plus className="w-4 h-4" /> Add Meeting
                  </Button>
                </div>
              </Card>
            </TabsContent>
          </div>
        </Tabs>
      </DrawerHeader>

      <ClientMeetingDialog
        open={open}
        onOpenChange={setOpen}
        onSubmit={(data) => console.log(data)}
        loading={false}
        {...getMeetingDialogProps()}
      />
    </DrawerContent>
  );
};
