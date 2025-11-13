/* eslint-disable @typescript-eslint/no-explicit-any */
import { DeleteModal } from "@/components/model/delete-model";
import { GlobalTable } from "@/components/table/global-table";
import GlobalFilterSection from "@/components/table/global-table-filter";
import { FilterConfig } from "@/components/table/table-toolbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { MoreHorizontal, Plus } from "lucide-react";
import { useState } from "react";
import { useDeleteProjectDocument, useGetProjectsDocument } from "../services";
import { useProjectDocumentStore } from "../stores/useProjectDocumentStore";
import AddEditDocumentDialog from "./AddEditDocumentDialog";

const ProjectDocumentComponent = ({ projectId, projectName }: any) => {
  const [documentListParams, setDocumentListParams] = useState<any>({
    limit: 10,
    page: 1,
    search: "",
    pagination: true,
  });

  const {
    open,
    setOpen: setOpenDocumentModal,
    setCurrentRow: setDocumentCurrentRow,
    currentRow,
  } = useProjectDocumentStore();
  const {
    data: projectDocumentList,
    isFetching: projectDocumentListFetched,
  }: any = useGetProjectsDocument(documentListParams);
  const {
    mutateAsync: deleteProjectDocument,
    isPending: deleteProjectDocumentPending,
  } = useDeleteProjectDocument(currentRow?.id);

  const handleCloseDialog = () => {
    setOpenDocumentModal(null);
    setDocumentCurrentRow(null);
  };
  const handleDeleteDocument = () => {
    deleteProjectDocument();
  };

  const deleteDocument = (row: any) => {
    setDocumentCurrentRow(row);
    setOpenDocumentModal("delete");
  };

  // Filter and pagination handlers
  const handleSearch = (search: string | undefined) => {
    setDocumentListParams({
      ...documentListParams,
      search: search ?? "",
      page: 1,
    });
  };

  const handlePaginationChange = (newPagination: {
    pageIndex: number;
    pageSize: number;
  }) => {
    setDocumentListParams({
      ...documentListParams,
      limit: newPagination.pageSize,
      page: newPagination.pageIndex + 1,
    });
  };
  // Filter config (global filter section)
  const filters: FilterConfig[] = [
    {
      type: "search",
      placeholder: "Search by document name...",
      key: "search",
      value: documentListParams.search,
      onChange: handleSearch,
    },
  ];
  // Add/Edit logic
  const handleAddDocument = () => {
    setOpenDocumentModal("add");
    setDocumentCurrentRow(null);
  };

  const handleEditDocument = (row: any) => {
    setOpenDocumentModal("edit");
    setDocumentCurrentRow(row);
  };

  const columns = [
    {
      header: "Document Name",
      accessorKey: "documentName",
      cell: ({ row }: any) => row.original?.documentName || "-",
    },
    {
      header: "Notes",
      accessorKey: "notes",
      cell: ({ row }: any) => {
        const note = row.original?.notes;
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
        const link = row.original?.link;
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
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuSeparator />

            <DropdownMenuItem onClick={() => handleEditDocument(row.original)}>
              Edit Document
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-red-600 focus:bg-red-50 focus:text-red-600"
              onClick={() => deleteDocument(row.original)}
            >
              Delete Document
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  const totalCount = (projectDocumentList as any)?.metadata?.totalCount;
  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl">
              Project Documents{" "}
              {projectName && (
                <span className="text-xl font-normal">({projectName})</span>
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
            pageSize={documentListParams.limit}
            currentPage={documentListParams.page}
            totalCount={totalCount}
            data={projectDocumentList?.data}
            onPaginationChange={handlePaginationChange}
            columns={columns}
            loading={projectDocumentListFetched}
            isPaginationEnabled={true} // Recommended to enable pagination
          />
        </CardContent>
      </Card>
      <DeleteModal
        onConfirm={handleDeleteDocument}
        key={`project-document-delete-${currentRow?.id}`}
        isOpen={open === "delete"}
        onClose={handleCloseDialog}
        itemName={currentRow?.documentName}
        loading={deleteProjectDocumentPending}
      />
      <AddEditDocumentDialog ProjectId={projectId} />
    </>
  );
};

export default ProjectDocumentComponent;
