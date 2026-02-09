import { Main } from "@/components/layout/main";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuthStore } from "@/stores/use-auth-store";
import { roles } from "@/utils/constant";
import { useState, useEffect } from "react";
import { useGetProjectsData } from "../projects/services";
import InquiryPage from "../Inquiry";
import { useGetTechnologyDropdownList } from "../technology/services";
import Board from "./components/Board";
import InquiryTab from "./components/inquiryTab";
import ProjectPage from "./components/project-view/project-page";
import ResourceTab from "./components/resourceTab";
import { HistoryProjectModal } from "../projects/components/history-modal";
import { useProjectsStore } from "../projects/stores/useProjectsStore";
import { useGetProjectTypesDropdownList } from "../Project-type/services";
import { useGetUserDropdownList } from "../users/services";
import { useGetClientsDropdownList } from "../clients/services";
import TablePageHeader from "@/components/table/table-page-header";
import { ActionFormModal } from "../projects/components/action";
import { Badge } from "@/components/ui/badge";
// import { Badge } from "@/components/ui/badge";

const ProjectBoard = () => {
  const [activeTab, setActiveTab] = useState("project_details");
  const { open, setOpen } = useProjectsStore();
  const [activeProjectCount, setActiveProjectCount] = useState<number | null>(
    null
  );
  const [archiveProjectCount, setArchiveProjectCount] = useState<number | null>(
    null
  );
  const user = useAuthStore((state) => state.user);
  const userRole = user?.user?.role;
  const userId = user?.user?.id;

  if (userRole === roles.BDE) {
    return <InquiryPage />;
  }

  const { data: technologies, isPending: techLoading } =
    useGetTechnologyDropdownList(null, userRole !== roles.BDE);

  // Fetch archive count on initial load
  const { data: archiveProjectsData } = useGetProjectsData({
    status: "inactive",
    page: 1,
    limit: 1,
  });

  // Update archive count when data is fetched
  useEffect(() => {
    if (archiveProjectsData?.pages?.[0]?.metadata?.totalCount !== undefined) {
      setArchiveProjectCount(archiveProjectsData.pages[0].metadata.totalCount);
    }
  }, [archiveProjectsData]);

  const { data: ProjectType, isPending: LoadingProjectType }: any =
    useGetProjectTypesDropdownList();
  const { data: projecthandler, isPending: projecthandlerLoading }: any =
    useGetUserDropdownList({
      role: [roles.TEAM_LEAD, roles.PROJECT_MANAGER],
      status: "active",
    });
  const { data: technologyList, isPending: technologyListLoading }: any =
    useGetTechnologyDropdownList();

  const { data: clientsList, isPending: clientListLoading }: any =
    useGetClientsDropdownList();

  const handleAdd = () => {
    setOpen("add");
  };
  const tabTriggerClass =
    "flex items-center gap-2 rounded-[50px] !px-3 !py-2  transition-all " +
    "data-[state=active]:bg-black data-[state=active]:text-white h-[35px]";

  return (
    <>
      {userRole === roles.BDE ? (
        <InquiryPage />
      ) : (
        <Main className="h-screen overflow-auto  flex flex-col bg-[#f9fafb]">
          <div className="flex gap-4">
            {userRole === roles.DEVELOPER ? (
              <Tabs
                value={activeTab}
                onValueChange={setActiveTab}
                className="w-full"
              >
                <TabsContent value="project_details">
                  <ProjectPage onTotalCountChange={setActiveProjectCount} />
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

                <div className="flex items-center justify-between ">
                  <TabsList className="flex flex-wrap bg-[#fdebef] rounded-full h-auto">
                    <TabsTrigger
                      value="project_details"
                      className={tabTriggerClass}
                    >
                      Projects
                      {activeProjectCount !== null && (
                        <Badge className="ml-1">{activeProjectCount}</Badge>
                      )}
                    </TabsTrigger>

                    {/* <TabsTrigger value="board">
                      Projects{" "}
                      {projectCount !== null && (
                        <span className="ml-1">({projectCount})</span>
                      )}
                    </TabsTrigger> */}
                    <TabsTrigger value="resources" className={tabTriggerClass}>
                      Resources
                    </TabsTrigger>
                    <TabsTrigger
                      value="Project Coordinator"
                      className={tabTriggerClass}
                    >
                      Project Coordinator
                    </TabsTrigger>
                    <TabsTrigger
                      value="Archive Projects"
                      className={tabTriggerClass}
                    >
                      Archive Projects
                      {archiveProjectCount !== null && (
                        <Badge className="ml-1">{archiveProjectCount}</Badge>
                      )}
                    </TabsTrigger>
                    {userId === 1 && (
                      <TabsTrigger value="inquiry" className={tabTriggerClass}>
                        Inquiries
                      </TabsTrigger>
                    )}
                    {userId === 1 && (
                      <TabsTrigger
                        value="Archive inquiry"
                        className={tabTriggerClass}
                      >
                        Archive Inquiries
                      </TabsTrigger>
                    )}
                  </TabsList>

                  {activeTab === "project_details" && (
                    <TablePageHeader
                      // title="Projects"
                      buttonText="Add Project"
                      onButtonClick={handleAdd}
                    >
                      {open && (
                        <ActionFormModal
                          clientsList={clientsList}
                          clientListLoading={clientListLoading}
                          projectTypes={ProjectType?.data}
                          projectTypesLoading={LoadingProjectType}
                          projecthandler={projecthandler}
                          projecthandlerLoading={projecthandlerLoading}
                          technologyList={technologyList}
                          technologyListLoading={technologyListLoading}
                        />
                      )}
                    </TablePageHeader>
                  )}
                </div>

                {/* Board Tab */}
                <TabsContent value="project_details">
                  <ProjectPage onTotalCountChange={setActiveProjectCount} />
                </TabsContent>
                <TabsContent value="board">
                  <Board
                    technologies={technologies}
                    techLoading={techLoading}
                    activeTab={activeTab}
                    onTotalCountChange={setActiveProjectCount}
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
                  <ProjectPage
                    activeTab="Archive Projects"
                    onTotalCountChange={setArchiveProjectCount}
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
          </div>
        </Main>
      )}
      <HistoryProjectModal />
    </>
  );
};

export default ProjectBoard;
