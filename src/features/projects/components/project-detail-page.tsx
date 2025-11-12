/* eslint-disable @typescript-eslint/no-explicit-any */
import PageLayout from "@/components/layout/layout-provider";
import { GlobalTable } from "@/components/table/global-table";
import GlobalFilterSection from "@/components/table/global-table-filter";
import TablePageHeader from "@/components/table/table-page-header";
import { FilterConfig } from "@/components/table/table-toolbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useRouter } from "@tanstack/react-router";
import { Edit2, Plus, SearchX } from "lucide-react";
import { useState } from "react";
import { useGetProjectsDetailData, useGetProjectServerList } from "../services";
import { useProjectServerStore } from "../stores/useProjectServerStore";
import AddEditDocumentDialog from "./AddEditDocumentDialog";
import ProjectDetails from "./project-detail-card";
import { ProjectServerActionFormModal } from "./project-server-action";
import ServerDetailsCard from "./server-detail-card";

export default function ProjectDetailPage({
  projectId,
}: {
  projectId: string;
}) {
  const { data: projectDetails }: any = useGetProjectsDetailData(projectId);
  const { data: projectServerList, isFetching: projectServerListFetched }: any =
    useGetProjectServerList({ pagination: false });
  const router = useRouter();

  const {
    setOpen: setOpenProjectServerModal,
    setCurrentRow: setProjectServerCurrentRow,
  } = useProjectServerStore();

  // State for documents (mock — replace later with API)
  const [activeTab, setActiveTab] = useState("details");
  const [documents, setDocuments] = useState<any[]>([]);
  const [openDocument, setOpenDocument] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<any>(null);

  // Search + pagination state
  const [listParams, setListParams] = useState({
    pageSize: 10,
    currentPage: 1,
    search: "",
  });

  // Filter and pagination handlers
  const handleSearch = (search: string | undefined) => {
    setListParams({ ...listParams, search: search ?? "", currentPage: 1 });
  };

  const handlePaginationChange = (newPagination: {
    pageIndex: number;
    pageSize: number;
  }) => {
    setListParams({
      ...listParams,
      pageSize: newPagination.pageSize,
      currentPage: newPagination.pageIndex + 1,
    });
  };

  // Filter config (global filter section)
  const filters: FilterConfig[] = [
    {
      type: "search",
      placeholder: "Search by document name...",
      key: "search",
      value: listParams.search,
      onChange: handleSearch,
    },
  ];

  // Add/Edit logic
  const handleAddDocument = () => {
    setSelectedDoc(null);
    setOpenDocument(true);
  };

  const handleSave = (data: any) => {
    if (selectedDoc) {
      setDocuments((prev) =>
        prev.map((doc) =>
          doc.id === selectedDoc.id ? { ...doc, ...data } : doc
        )
      );
    } else {
      setDocuments((prev) => [...prev, { ...data, id: Date.now() }]);
    }
    setOpenDocument(false);
    setSelectedDoc(null);
  };

  const handleAddServer = () => {
    setProjectServerCurrentRow(null);
    setOpenProjectServerModal("add");
  };

  const handleBack = () => {
    router.navigate({ to: "/projects" });
  };

  const columns = [
    {
      header: "Document Name",
      accessorKey: "documentName",
      cell: ({ row }: any) =>
        row.original.documents[row.index].documentName || "-",
    },
    {
      header: "Notes",
      accessorKey: "notes",
      cell: ({ row }: any) => {
        const note = row.original.documents[row.index].notes;
        return note ? (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div
                  className="truncate max-w-[200px] cursor-pointer text-ellipsis"
                  title={note}
                >
                  {note}
                </div>
              </TooltipTrigger>
              <TooltipContent
                side="top"
                align="start"
                className="text-sm max-w-xs border shadow"
              >
                {note}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ) : (
          "-"
        );
      },
    },
    {
      header: "Link",
      accessorKey: "link",
      cell: ({ row }: any) => {
        const link = row.original.documents[row.index].link;
        return link ? (
          <a
            href={link}
            target="_blank"
            className="text-blue-500 underline truncate max-w-[200px] cursor-pointer block"
            title={link}
            rel="noopener noreferrer"
          >
            {link}
          </a>
        ) : (
          "-"
        );
      },
    },
    {
      header: "Actions",
      accessorKey: "actions",
      cell: ({ row }: any) => (
        <Button
          variant="outline"
          size="icon"
          onClick={() => {
            setSelectedDoc(row.original);
            setOpenDocument(true);
          }}
        >
          <Edit2 className="w-4 h-4" />
        </Button>
      ),
    },
  ];

  const totalCount = documents.length;

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
          <Card className="">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-2xl">
                  Server Details{" "}
                  {projectDetails?.data?.name && (
                    <span className="text-xl font-normal">
                      ({projectDetails?.data?.name})
                    </span>
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
        </TabsContent>
        <TabsContent value="document">
          {/* Documents Section */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-2xl">
                  Project Documents{" "}
                  {projectDetails?.data?.name && (
                    <span className="text-xl font-normal">
                      ({projectDetails?.data?.name})
                    </span>
                  )}
                </CardTitle>
                <Button onClick={handleAddDocument}>
                  {" "}
                  <Plus /> Add Document
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <GlobalFilterSection filters={filters} />
              <GlobalTable
                pageSize={listParams.pageSize}
                currentPage={listParams.currentPage}
                totalCount={totalCount}
                data={documents}
                onPaginationChange={handlePaginationChange}
                columns={columns}
                loading={false}
                isPaginationEnabled={true} // Recommended to enable pagination
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      {/* Add/Edit Modal */}
      {openDocument && (
        <AddEditDocumentDialog
          open={openDocument}
          setOpen={setOpenDocument}
          onSave={handleSave}
          defaultValues={selectedDoc}
        />
      )}
      <ProjectServerActionFormModal ProjectId={projectDetails?.data?.id} />
    </PageLayout>
  );
}
