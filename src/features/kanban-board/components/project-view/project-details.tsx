"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileSpreadsheet, Flag, SquareCheckBig } from "lucide-react";
import MilestoneList from "./milestone-list";
import OverviewProject from "./overview-project";
import ProjectTaskList from "./project-task-list";
import {
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";

export const ProjectDetails = () => {
  return (
    <div>
      <DrawerContent className="h-full w-full !max-w-[1024px] ml-auto">
        <DrawerHeader>
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="overview">
                <FileSpreadsheet /> Overview
              </TabsTrigger>
              <TabsTrigger value="milestone">
                <Flag /> Milestone
              </TabsTrigger>

              <TabsTrigger value="analytics">
                {" "}
                <SquareCheckBig /> Report
              </TabsTrigger>
            </TabsList>
            <div className="overflow-y-auto h-[calc(100vh-64px)]">
              <TabsContent value="overview">
                <OverviewProject />
              </TabsContent>

              <TabsContent value="milestone">
                <MilestoneList />
              </TabsContent>
              <TabsContent value="analytics">
                <ProjectTaskList />
              </TabsContent>
            </div>
          </Tabs>
        </DrawerHeader>
      </DrawerContent>
    </div>
  );
};
