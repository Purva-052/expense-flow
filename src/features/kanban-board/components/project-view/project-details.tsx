"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileSpreadsheet, Flag, SquareCheckBig } from "lucide-react";
import MilestoneList from "./milestone-list";
import OverviewProject from "./overview-project";
import ProjectTaskList from "./project-task-list";

export const ProjectDetails = () => {
  return (
    <div>
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

        <TabsContent value="overview">
          <OverviewProject />
        </TabsContent>

        <TabsContent value="milestone">
          <MilestoneList />
        </TabsContent>
        <TabsContent value="analytics">
          <ProjectTaskList />
        </TabsContent>
      </Tabs>
    </div>
  );
};
