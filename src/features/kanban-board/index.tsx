import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import Board from "./components/Board";
import { Main } from "@/components/layout/main";
import ResourceTab from "./components/resourceTab";
import { useAuthStore } from "@/stores/use-auth-store";

const ProjectBoard = () => {
  const { user } = useAuthStore();
  const userRole = user?.user?.role;
  return (
    <Main>
      {userRole === "developer" ? (
        <Board />
      ) : (
        // 🧭 Others see tabbed layout
        <Tabs defaultValue="board" className="w-full">
          {/* Tab Headers */}
          <TabsList className="grid grid-cols-2 w-[300px] mb-2">
            <TabsTrigger value="board">Projects</TabsTrigger>
            <TabsTrigger value="resources">Resources</TabsTrigger>
          </TabsList>

          {/* Board Tab */}
          <TabsContent value="board">
            <Board />
          </TabsContent>

          {/* Resources Tab */}
          <TabsContent value="resources">
            <ResourceTab />
          </TabsContent>
        </Tabs>
      )}
    </Main>
  );
};

export default ProjectBoard;
