/* eslint-disable @typescript-eslint/no-explicit-any */
import { DeleteModal } from "@/components/model/delete-model";
import { GlobalTable } from "@/components/table/global-table";
import GlobalFilterSection from "@/components/table/global-table-filter";
import { FilterConfig } from "@/components/table/table-toolbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
import { format } from "date-fns";
import { useGetUserDropdownList } from "@/features/users/services";
// import { useAuthStore } from "@/stores/use-auth-store";
// import { roles } from "@/utils/constant";

const ProjectDocumentComponent = ({ projectId }: any) => {
  const [documentListParams, setDocumentListParams] = useState<any>({
    limit: 10,
    page: 1,
    search: "",
    pagination: true,
    projectId: projectId,
    createdBy: undefined,
    fromDate: undefined,
    toDate: undefined,
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

  const { data: usersResponse, isLoading: usersLoading } =
    useGetUserDropdownList();

  // const { user } = useAuthStore();
  // const Role = user?.user?.role;
  // const isDeveloperView = Role === roles.DEVELOPER;

  const userOptions = [
    ...((usersResponse as any)?.data?.map((u: any) => ({
      label: u.fullName,
      value: String(u.id),
    })) || []),
  ];

  // Filter and pagination handlers
  const handleSearch = (search: string | undefined) => {
    setDocumentListParams({
      ...documentListParams,
      search: search ?? "",
      page: 1,
    });
  };

  const handleUserChange = (userId?: string | null) => {
    setDocumentListParams((prev: any) => ({
      ...prev,
      createdBy: userId || undefined,
      page: 1,
    }));
  };

  const handleDateRangeChange = (
    range: { from: Date; to?: Date } | undefined
  ) => {
    setDocumentListParams({
      ...documentListParams,
      fromDate: range?.from ? format(range.from, "yyyy-MM-dd") : undefined,
      toDate: range?.to ? format(range.to, "yyyy-MM-dd") : undefined,
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
      placeholder: "Search by document name and notes",
      key: "search",
      value: documentListParams.search,
      onChange: handleSearch,
      className: "w-[280px] rounded-full",
    },
    {
      type: "select",
      placeholder: "Created By",
      key: "createdBy",
      value: documentListParams.createdBy,
      options: userOptions,
      onChange: handleUserChange,
      isLoading: usersLoading,
    },
    {
      type: "dateRange",
      placeholder: "Filter by date range",
      key: "dateRange",
      onChange: handleDateRangeChange,
      disable: { after: new Date() },
      className: "rounded-full h-10",
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
      cell: ({ row }: any) => {
        const documentName = row.original?.documentName;
        return documentName ? (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="truncate max-w-[200px] cursor-pointer text-ellipsis">
                  {documentName}
                </div>
              </TooltipTrigger>
              <TooltipContent
                side="top"
                align="start"
                className="text-sm max-w-sm border shadow break-all"
              >
                {documentName}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ) : (
          "-"
        );
      },
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
                <div className="truncate max-w-[200px] cursor-pointer text-ellipsis">
                  {note}
                </div>
              </TooltipTrigger>
              <TooltipContent
                side="top"
                align="start"
                className="text-sm max-w-sm border shadow break-all"
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
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <a
                  href={link}
                  target="_blank"
                  className="text-blue-500 underline truncate max-w-[200px] cursor-pointer block"
                  rel="noopener noreferrer"
                >
                  {link}
                </a>
              </TooltipTrigger>
              <TooltipContent
                side="top"
                align="start"
                className="text-sm max-w-sm border shadow break-all"
              >
                {link}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ) : (
          "-"
        );
      },
    },
    {
      header: "Created Date",
      accessorKey: "createdAt",
      cell: ({ row }: any) =>
        row.original.createdAt
          ? format(new Date(row.original.createdAt), "dd/MM/yyyy")
          : "-",
    },
    {
      header: "Created By",
      accessorKey: "createdBy",
      cell: ({ row }: any) => row.original?.createdBy?.name || "-",
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
      <Card className="gap-3">
        <CardContent className="px-0 gap-0">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
            <GlobalFilterSection filters={filters} className="mb-0" />
            {/* {!isDeveloperView && ( */}
            <Button onClick={handleAddDocument} className="shrink-0">
              <Plus className="mr-2 h-4 w-4" /> Add Document
            </Button>
            {/* )} */}
          </div>
          <GlobalTable
            pageSize={documentListParams.limit}
            currentPage={documentListParams.page}
            totalCount={totalCount}
            data={projectDocumentList?.data}
            onPaginationChange={handlePaginationChange}
            columns={columns}
            loading={projectDocumentListFetched}
            isPaginationEnabled={true}
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
