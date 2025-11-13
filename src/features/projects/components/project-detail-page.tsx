/* eslint-disable @typescript-eslint/no-explicit-any */
import PageLayout from "@/components/layout/layout-provider";
import TablePageHeader from "@/components/table/table-page-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { useGetProjectsDetailData } from "../services";
import ProjectDetails from "./project-detail-card-component";
import ProjectDocumentComponent from "./project-document-component";
import ProjectServerComponent from "./project-server-component";

export default function ProjectDetailPage({
  projectId,
}: {
  projectId: string;
}) {
  const { data: projectDetails }: any = useGetProjectsDetailData(projectId);
  const router = useRouter();

  // State for documents (mock — replace later with API)
  const [activeTab, setActiveTab] = useState("details");

  const handleBack = () => {
    router.navigate({ to: "/projects" });
  };

  return (
    <PageLayout>
      {/* Page Header */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TablePageHeader
          showActionButton={true}
          buttonText="Back"
          onButtonClick={handleBack}
          showActionButtonIcon={false}
        >
          <TabsList className=" !w-fit">
            <TabsTrigger value="details">Project Details</TabsTrigger>
            <TabsTrigger value="document">Project Documents</TabsTrigger>
            <TabsTrigger value="server">Project Server</TabsTrigger>
          </TabsList>
        </TablePageHeader>

        <TabsContent value="details">
          <ProjectDetails projectDetails={projectDetails} />
        </TabsContent>
        <TabsContent value="server">
          <ProjectServerComponent
            projectName={projectDetails?.data?.name}
            projectId={projectId}
          />
        </TabsContent>
        <TabsContent value="document">
          <ProjectDocumentComponent
            projectName={projectDetails?.data?.name}
            projectId={projectId}
          />
        </TabsContent>
      </Tabs>
    </PageLayout>
  );
}
