/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, SearchX } from "lucide-react";
import { useGetProjectServerList } from "../services";
import { useProjectServerStore } from "../stores/useProjectServerStore";
import { ProjectServerActionFormModal } from "./project-server-action";
import ServerDetailsCard from "./server-detail-card";

const ProjectServerComponent = ({ projectId, projectName }: any) => {
  const { data: projectServerList, isFetching: projectServerListFetched }: any =
    useGetProjectServerList({ pagination: false, projectId: projectId });
  const {
    setOpen: setOpenProjectServerModal,
    setCurrentRow: setProjectServerCurrentRow,
  } = useProjectServerStore();
  const handleAddServer = () => {
    setProjectServerCurrentRow(null);
    setOpenProjectServerModal("add");
  };
  return (
    <>
      <Card className="">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl">
              Server Details{" "}
              {projectName && (
                <span className="text-xl font-normal">({projectName})</span>
              )}
            </CardTitle>
            <Button onClick={handleAddServer}>
              {" "}
              <Plus /> Add Server
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center flex-wrap gap-6 max-h-[60dvh] overflow-y-auto w-full">
            {projectServerListFetched ? (
              <div className="flex flex-col justify-center items-center py-16 gap-3 w-full">
                <div className="w-10 h-10 border-4 border-dashed rounded-full animate-spin border-primary/50 border-t-primary" />
                <span className="text-sm text-muted-foreground font-medium">
                  Loading project history...
                </span>
              </div>
            ) : projectServerList?.data?.length > 0 ? (
              projectServerList?.data?.map((server: any) => (
                <ServerDetailsCard
                  key={server.serverId}
                  server={server}
                  setOpenProjectServerModal={setOpenProjectServerModal}
                  setProjectServerCurrentRow={setProjectServerCurrentRow}
                />
              ))
            ) : (
              <div className="flex justify-center w-full h-40 border rounded">
                <div className="flex flex-col items-center justify-center space-y-2 text-muted-foreground">
                  <SearchX className="h-8 w-8 text-muted-foreground/70" />
                  <span className="text-lg font-medium">No data found</span>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      <ProjectServerActionFormModal ProjectId={projectId} />
    </>
  );
};

export default ProjectServerComponent;
