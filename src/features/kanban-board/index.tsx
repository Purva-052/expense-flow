import { Main } from "@/components/layout/main";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuthStore } from "@/stores/use-auth-store";
import { roles } from "@/utils/constant";
import { useState } from "react";
import InquiryPage from "../Inquiry";
import { useGetTechnologyDropdownList } from "../technology/services";
import Board from "./components/Board";
import InquiryTab from "./components/inquiryTab";
import ProjectPage from "./components/project-view/project-page";
import ResourceTab from "./components/resourceTab";
import { HistoryProjectModal } from "../projects/components/history-modal";

const ProjectBoard = () => {
  const [activeTab, setActiveTab] = useState("project_details");
  const [projectCount, setProjectCount] = useState<number | null>(null);
  const user = useAuthStore((state) => state.user);
  const userRole = user?.user?.role;
  const userId = user?.user?.id;
  const { data: technologies, isPending: techLoading } =
    useGetTechnologyDropdownList(null, userRole !== roles.BDE);
  return (
    <>
      {userRole === roles.BDE ? (
        <InquiryPage />
      ) : (
        <Main className="h-screen overflow-auto  flex flex-col">
          {userRole === roles.DEVELOPER ? (
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              <TabsContent value="project_details">
                <ProjectPage onTotalCountChange={setProjectCount} />
              </TabsContent>
            </Tabs>
          ) : (
            // 🧭 Others see tabbed layout
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              {/* Tab Headers */}
              <TabsList className="flex flex-wrap w-[680px]  mb-2">
                <TabsTrigger value="project_details">
                  Project Details
                  {projectCount !== null && (
                    <span className="ml-1">({projectCount})</span>
                  )}
                </TabsTrigger>

                <TabsTrigger value="board">
                  Projects{" "}
                  {projectCount !== null && (
                    <span className="ml-1">({projectCount})</span>
                  )}
                </TabsTrigger>
                <TabsTrigger value="resources">Resources</TabsTrigger>
                <TabsTrigger value="Project Coordinator">
                  Project Coordinator
                </TabsTrigger>
                <TabsTrigger value="Archive Projects">
                  Archive Projects
                </TabsTrigger>
                {userId === 1 && (
                  <TabsTrigger value="inquiry">Inquiries</TabsTrigger>
                )}
                {userId === 1 && (
                  <TabsTrigger value="Archive inquiry">
                    Archive Inquiries
                  </TabsTrigger>
                )}
              </TabsList>

              {/* Board Tab */}
              <TabsContent value="project_details">
                <ProjectPage onTotalCountChange={setProjectCount} />
              </TabsContent>
              <TabsContent value="board">
                <Board
                  technologies={technologies}
                  techLoading={techLoading}
                  activeTab={activeTab}
                  onTotalCountChange={setProjectCount}
                />
              </TabsContent>

              {/* Resources Tab */}
              <TabsContent value="resources">
                <ResourceTab
                  technologies={technologies}
                  techLoading={techLoading}
                  activeTab={activeTab}
                />
              </TabsContent>

              <TabsContent value="Project Coordinator">
                <ResourceTab
                  technologies={technologies}
                  techLoading={techLoading}
                  activeTab={activeTab}
                />
              </TabsContent>

              <TabsContent value="Archive Projects">
                <Board
                  activeTab={activeTab}
                  onTotalCountChange={setProjectCount}
                />
              </TabsContent>
              {userId === 1 && (
                <TabsContent value="inquiry">
                  <InquiryTab />
                </TabsContent>
              )}
              {userId === 1 && (
                <TabsContent value="Archive inquiry">
                  <InquiryTab activeTab={activeTab} />
                </TabsContent>
              )}
            </Tabs>
          )}
        </Main>
      )}
      <HistoryProjectModal />
    </>
  );
};

export default ProjectBoard;
