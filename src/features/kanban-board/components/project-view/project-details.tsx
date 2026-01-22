"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Download,
  File,
  FileSpreadsheet,
  Flag,
  Server,
  SquareCheckBig,
  User,
} from "lucide-react";
import MilestoneList from "./milestone-list";
import OverviewProject from "./overview-project";
import ProjectTaskList from "./project-task-list";
import {
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Card } from "@/components/ui/card";
import { IconFileTextFilled } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";

export const ProjectDetails = () => {
  return (
    <div>
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
                {" "}
                <SquareCheckBig /> Report
              </TabsTrigger>
              <TabsTrigger value="doc">
                {" "}
                <File /> Project Documents
              </TabsTrigger>
              <TabsTrigger value="server">
                <Server /> Project Server
              </TabsTrigger>
              <TabsTrigger value="client">
                <User /> Client Meeting
              </TabsTrigger>
            </TabsList>
            <div className="overflow-y-auto h-[calc(100vh-64px)]">
              <TabsContent value="milestone">
                <MilestoneList />
              </TabsContent>
              <TabsContent value="overview">
                <OverviewProject />
              </TabsContent>

              <TabsContent value="analytics">
                <ProjectTaskList />
              </TabsContent>
              <TabsContent value="doc">
                <Card>
                  <div className="flex flex-col space-y-1.5 p-2 ">
                    <div className="text-2xl font-semibold leading-none tracking-tight">
                      Files
                    </div>
                    <div className="text-sm text-muted-foreground">
                      <div className="space-y-4 mt-3">
                        <div className="flex items-center space-x-3 ">
                          <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
                            <IconFileTextFilled className="text-red-500" />
                          </div>
                          <div>
                            <p className="text-sm font-medium">
                              Design System Components
                            </p>
                            <p className="text-xs text-muted-foreground">
                              1.2 MB • PDF
                            </p>
                          </div>
                          <Button className="w-8 h-8">
                            <Download className="w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              </TabsContent>
              <TabsContent value="server">server</TabsContent>
            </div>
          </Tabs>
        </DrawerHeader>
      </DrawerContent>
    </div>
  );
};
