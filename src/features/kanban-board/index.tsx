import { Main } from "@/components/layout/main";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuthStore } from "@/stores/use-auth-store";
import { roles } from "@/utils/constant";
import { useState } from "react";
import InquiryPage from "../Inquiry";
import { useGetTechnologyDropdownList } from "../technology/services";
import Board from "./components/Board";
import ResourceTab from "./components/resourceTab";
import InquiryTab from "./components/inquiryTab";

const ProjectBoard = () => {
  const [activeTab, setActiveTab] = useState("board");
  const user = useAuthStore((state) => state.user);
  const userRole = user?.user?.role;
  const { data: technologies, isPending: techLoading } =
    useGetTechnologyDropdownList(null, userRole !== roles.BDE);
  return (
    <>
      {userRole === roles.BDE ? (
        <InquiryPage />
      ) : (
        <Main className="h-screen overflow-auto  flex flex-col">
          {userRole === roles.DEVELOPER ? (
            <Board activeTab={activeTab} />
          ) : (
            // 🧭 Others see tabbed layout
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              {/* Tab Headers */}
              <TabsList className="flex flex-wrap w-[680px]  mb-2">
                <TabsTrigger value="board">Projects</TabsTrigger>
                <TabsTrigger value="resources">Resources</TabsTrigger>
                <TabsTrigger value="Project Coordinator">
                  Project Coordinator
                </TabsTrigger>
                <TabsTrigger value="Archive Projects">
                  Archive Projects
                </TabsTrigger>
                {(userRole === roles.ADMIN ||
                  userRole === roles.PROJECT_MANAGER) && (
                  <TabsTrigger value="inquiry">Inquiry</TabsTrigger>
                )}
              </TabsList>

              {/* Board Tab */}
              <TabsContent value="board">
                <Board
                  technologies={technologies}
                  techLoading={techLoading}
                  activeTab={activeTab}
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
                <Board activeTab={activeTab} />
              </TabsContent>
              {(userRole === roles.ADMIN ||
                userRole === roles.PROJECT_MANAGER) && (
                <TabsContent value="inquiry">
                  <InquiryTab />
                </TabsContent>
              )}
            </Tabs>
          )}
        </Main>
      )}
    </>
  );
};

export default ProjectBoard;
