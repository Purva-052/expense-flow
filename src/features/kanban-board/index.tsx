import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import Board from "./components/Board";
import { Main } from "@/components/layout/main";
import ResourceTab from "./components/resourceTab";
import { useAuthStore } from "@/stores/use-auth-store";
import { useState } from "react";

const ProjectBoard = () => {
  const [activeTab, setActiveTab] = useState("board");
  const { user } = useAuthStore();
  const userRole = user?.user?.role;

            console.log("🚀 ~ ProjectBoard ~ Board:", Board)

  return (
    <Main>
      {userRole === "developer" ? (
        <Board />
      ) : (
        // 🧭 Others see tabbed layout
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          {/* Tab Headers */}
          <TabsList className="grid grid-cols-3 w-[430px] mb-2">
            <TabsTrigger value="board">Projects</TabsTrigger>
            <TabsTrigger value="resources">Resources</TabsTrigger>
            <TabsTrigger value="Project Coordinator">
              Project Coordinator
            </TabsTrigger>
          </TabsList>

          {/* Board Tab */}
          <TabsContent value="board">
            <Board />
          </TabsContent>

          {/* Resources Tab */}
          <TabsContent value="resources">
            <ResourceTab activeTab={activeTab} />
          </TabsContent>

          <TabsContent value="Project Coordinator">
            <ResourceTab activeTab={activeTab} />
          </TabsContent>
        </Tabs>
      )}
    </Main>
  );
};

export default ProjectBoard;
