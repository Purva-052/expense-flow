import { Main } from "@/components/layout/main";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuthStore } from "@/stores/use-auth-store";
import { PROJECT_DETAILS_FILTER_STORAGE_KEY, roles } from "@/utils/constant";
import { useState, useEffect, useMemo } from "react";
import { useGetProjectsData } from "../projects/services";
import InquiryPage from "../Inquiry";
import { useGetTechnologyDropdownList } from "../technology/services";
import Board from "./components/Board";
import InquiryTab from "./components/inquiryTab";
import ProjectPage from "./components/project-view/project-page";
import ResourceTab from "./components/resourceTab";
import CertificateTab from "./components/certificateTab";
import { HistoryProjectModal } from "../projects/components/history-modal";
import { useProjectsStore } from "../projects/stores/useProjectsStore";
import { useGetProjectTypesDropdownList } from "../Project-type/services";
import { useGetUserDropdownList } from "../users/services";
import { useGetClientsDropdownList } from "../clients/services";
import TablePageHeader from "@/components/table/table-page-header";
import { ActionFormModal } from "../projects/components/action";
import { Badge } from "@/components/ui/badge";

const ProjectBoard = () => {
  const [activeTab, setActiveTab] = useState("project_details");
  const { open, setOpen } = useProjectsStore();
  const [activeProjectCount, setActiveProjectCount] = useState<number | null>(
    null
  );
  const [archiveProjectCount, setArchiveProjectCount] = useState<number | null>(
    null
  );
  const [certificateCount, _] = useState<number | null>(null);
  const user = useAuthStore((state) => state.user);
  const userRole = user?.user?.role;
  const userId = user?.user?.id;

  // if (userRole === roles.BDE) {
  //   return <InquiryPage />;
  // }

  const { data: technologies, isPending: techLoading } =
    useGetTechnologyDropdownList(null, userRole !== roles.BDE);

  // Keep initial top-badge counts aligned with ProjectPage list filters
  const initialProjectFilters = useMemo(() => {
    if (typeof window === "undefined") return {};
    const saved = localStorage.getItem(PROJECT_DETAILS_FILTER_STORAGE_KEY);
    if (!saved) return {};

    try {
      const parsed = JSON.parse(saved);
      return {
        clientId: parsed?.clientId ?? undefined,
        managerId: parsed?.managerId ?? undefined,
        priority: parsed?.priority ?? undefined,
      };
    } catch {
      return {};
    }
  }, []);

  const commonCountParams = useMemo(
    () => ({
      ...initialProjectFilters,
      page: 1,
      limit: 1,
      isPinned: userRole === roles.BDE ? undefined : true,
    }),
    [initialProjectFilters, userRole]
  );

  // Fetch active projects count
  const { data: activeProjectsData } = useGetProjectsData({
    status: "active",
    ...commonCountParams,
  });

  // Fetch archive count
  const { data: archiveProjectsData } = useGetProjectsData({
    status: "inactive",
    ...commonCountParams,
  });

  // Update counts when data is fetched
  useEffect(() => {
    if (activeProjectsData?.pages?.[0]?.metadata?.totalCount !== undefined) {
      setActiveProjectCount(activeProjectsData.pages[0].metadata.totalCount);
    }
  }, [activeProjectsData]);

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
      {/* {userRole === roles.BDE ? (
        <InquiryPage />
      ) : ( */}
      <Main className="h-[100dvh] min-h-0 overflow-hidden flex flex-col bg-[#f9fafb]">
        <div className="flex-1 min-h-0 flex flex-col gap-4">
          {userRole === roles.DEVELOPER ? (
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="flex-1 min-h-0 "
            >
              <TabsContent value="project_details" className="flex-1 min-h-0 flex flex-col">
                <ProjectPage onTotalCountChange={setActiveProjectCount} />
              </TabsContent>
            </Tabs>
          ) : (
            // 🧭 Others see tabbed layout
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="flex-1 min-h-0"
            >
              {/* Tab Headers */}

              <div className="flex flex-wrap items-start justify-between gap-3 min-w-0">
                <div className="min-w-0 max-w-full overflow-x-auto">
                  <TabsList className="flex w-max min-w-max flex-nowrap bg-[#fdebef] rounded-full h-auto">
                    <TabsTrigger
                      value="project_details"
                      className={tabTriggerClass}
                    >
                      {userRole === roles.BDE ? "Dashboard" : "Projects"}
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
                    {userRole !== roles.BDE && (
                      <TabsTrigger value="resources" className={tabTriggerClass}>
                        Resources
                      </TabsTrigger>
                    )}
                    {userRole !== roles.BDE && (
                      <TabsTrigger
                        value="Project Coordinator"
                        className={tabTriggerClass}
                      >
                        Project Coordinator
                      </TabsTrigger>
                    )}
                    {userRole !== roles.BDE && (
                      <TabsTrigger
                        value="Archive Projects"
                        className={tabTriggerClass}
                      >
                        Archive Projects
                        {archiveProjectCount !== null && (
                          <Badge className="ml-1">{archiveProjectCount}</Badge>
                        )}
                      </TabsTrigger>
                    )}
                    {userRole !== roles.BDE && (
                      <TabsTrigger
                        value="Certificates"
                        className={tabTriggerClass}
                      >
                        Certificates
                        {certificateCount !== null && (
                          <Badge className="ml-1">{certificateCount}</Badge>
                        )}
                      </TabsTrigger>
                    )}
                    {(userId === 1 || userRole === roles.BDE) && (
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
                </div>

                {activeTab === "project_details" && userRole !== roles.BDE && (
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
              <TabsContent value="project_details" className="flex-1 min-h-0 flex flex-col">
                <ProjectPage onTotalCountChange={setActiveProjectCount} />
              </TabsContent>
              <TabsContent value="board" className="flex-1 min-h-0 flex flex-col">
                <Board
                  technologies={technologies}
                  techLoading={techLoading}
                  activeTab={activeTab}
                  onTotalCountChange={setActiveProjectCount}
                />
              </TabsContent>

              {/* Resources Tab */}
              <TabsContent value="resources" className="flex-1 min-h-0 flex flex-col">
                <ResourceTab
                  technologies={technologies}
                  techLoading={techLoading}
                  activeTab={activeTab}
                />
              </TabsContent>

              <TabsContent value="Project Coordinator" className="flex-1 min-h-0 flex flex-col">
                <ResourceTab
                  technologies={technologies}
                  techLoading={techLoading}
                  activeTab={activeTab}
                />
              </TabsContent>

              <TabsContent value="Archive Projects" className="flex-1 min-h-0 flex flex-col">
                <ProjectPage
                  activeTab="Archive Projects"
                  onTotalCountChange={setArchiveProjectCount}
                />
              </TabsContent>
              <TabsContent value="Certificates" className="flex-1 min-h-0 flex flex-col">
                <CertificateTab />
              </TabsContent>
              {userId === 1 || userRole === roles.BDE ? (
                <TabsContent value="inquiry" className="flex-1 min-h-0 flex flex-col">
                  {userRole === roles.BDE ? <InquiryPage /> : <InquiryTab />}
                </TabsContent>
              ) : null}
              {userId === 1 && (
                <TabsContent value="Archive inquiry" className="flex-1 min-h-0 flex flex-col">
                  <InquiryTab activeTab={activeTab} />
                </TabsContent>
              )}
            </Tabs>
          )}
        </div>
      </Main>
      <HistoryProjectModal />
    </>
  );
};

export default ProjectBoard;
