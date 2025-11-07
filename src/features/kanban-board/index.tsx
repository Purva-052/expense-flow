import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import Board from "./components/Board";
import { Main } from "@/components/layout/main";
import ResourceTab from "./components/resourceTab";
import { useAuthStore } from "@/stores/use-auth-store";
import { useState } from "react";
import { useGetTechnologyData } from "../technology/services";

const ProjectBoard = () => {
  const [activeTab, setActiveTab] = useState("board");
  const { user } = useAuthStore();
  const userRole = user?.user?.role;
  const { data: technologies, isPending: techLoading } = useGetTechnologyData({
    pagination: false,
  });
  return (
    <Main className="h-screen overflow-auto  flex flex-col">
      {userRole === "developer" ? (
        <Board activeTab={activeTab} />
      ) : (
        // 🧭 Others see tabbed layout
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          {/* Tab Headers */}
          <TabsList className="grid grid-cols-4 w-[570px] mb-2">
            <TabsTrigger value="board">Projects</TabsTrigger>
            <TabsTrigger value="resources">Resources</TabsTrigger>
            <TabsTrigger value="Project Coordinator">
              Project Coordinator
            </TabsTrigger>
            <TabsTrigger value="Archive Projects">Archive Projects</TabsTrigger>
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
        </Tabs>
      )}
    </Main>
  );
};

export default ProjectBoard;
