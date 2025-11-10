/* eslint-disable @typescript-eslint/no-explicit-any */
import PageLayout from '@/components/layout/layout-provider';
import { GlobalTable } from '@/components/table/global-table';
import GlobalFilterSection from '@/components/table/global-table-filter';
import TablePageHeader from '@/components/table/table-page-header';
import { FilterConfig } from '@/components/table/table-toolbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Edit2, Eye, Plus } from 'lucide-react';
import { useState } from 'react';
import AddEditDocumentDialog from './AddEditDocumentDialog';
import { useGetProjectsDetailData } from '../services';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export default function ProjectDetailPage({
  projectId,
}: {
  projectId: string;
}) {
  const { data: projectDetails }: any = useGetProjectsDetailData(projectId);

  // State for documents (mock — replace later with API)
  const [documents, setDocuments] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<any>(null);

  // Search + pagination state
  const [listParams, setListParams] = useState({
    pageSize: 10,
    currentPage: 1,
    search: '',
  });

  // Filter and pagination handlers
  const handleSearch = (search: string | undefined) => {
    setListParams({ ...listParams, search: search ?? '', currentPage: 1 });
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
      type: 'search',
      placeholder: 'Search by document name...',
      key: 'search',
      value: listParams.search,
      onChange: handleSearch,
    },
  ];

  // Add/Edit logic
  const handleAdd = () => {
    setSelectedDoc(null);
    setOpen(true);
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
    setOpen(false);
    setSelectedDoc(null);
  };

  const columns = [
    {
      header: 'Document Name',
      accessorKey: 'documentName',
      cell: ({ row }: any) =>
        row.original.documents[row.index].documentName || '-',
    },
    {
      header: 'Notes',
      accessorKey: 'notes',
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
                // side="top"
                className="text-sm max-w-xs border shadow"
              >
                {note}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ) : (
          '-'
        );
      },
    },
    {
      header: 'Link',
      accessorKey: 'link',
      cell: ({ row }: any) => {
        const link = row.original.documents[row.index].link;
        return link ? (
          <Button variant="outline" size="sm" asChild className="">
            <a href={link} target="_blank" rel="noopener noreferrer">
              <Eye className="w-4 h-4" />
            </a>
          </Button>
        ) : (
          '-'
        );
      },
    },
    {
      header: 'Actions',
      accessorKey: 'actions',
      cell: ({ row }: any) => (
        <Button
          variant="outline"
          size="icon"
          onClick={() => {
            setSelectedDoc(row.original);
            setOpen(true);
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
      <TablePageHeader showActionButton={false} title={`Project Details`}>
        View and manage project-related information, documents, and secrets.
      </TablePageHeader>

      {/* Project Info Section */}
      <Card className="mb-6 mt-4">
        <CardHeader>
          <CardTitle>Project Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Name */}
            <div>
              <h3 className="text-sm font-medium">Name</h3>
              <p className="text-sm text-gray-600 text-wrap">
                {projectDetails?.data?.name ?? '-'}
              </p>
            </div>

            {/* Client */}
            <div>
              <h3 className="text-sm font-medium">Client</h3>
              <p className="text-sm text-gray-600 text-wrap">
                {projectDetails?.data?.client?.name ?? '-'}
              </p>
            </div>

            {/* Project Type */}
            <div>
              <h3 className="text-sm font-medium">Project Type</h3>
              <p className="text-sm text-gray-600 text-wrap">
                {projectDetails?.data?.projectType?.name ?? '-'}
              </p>
            </div>

            {/* Project Coordinator */}
            <div>
              <h3 className="text-sm font-medium">Project Coordinator</h3>
              <p className="text-sm text-gray-600 text-wrap">
                {projectDetails?.data?.projectHandler?.fullName ?? '-'}
              </p>
            </div>

            {/* Start Date */}
            <div>
              <h3 className="text-sm font-medium">Start Date</h3>
              <p className="text-sm text-gray-600">
                {projectDetails?.data?.startDate?.split('T')?.[0] ?? '-'}
              </p>
            </div>

            {/* Expected Completion */}
            <div>
              <h3 className="text-sm font-medium">Expected Completion</h3>
              <p className="text-sm text-gray-600">
                {projectDetails?.data?.expectedCompletionDate?.split(
                  'T'
                )?.[0] ?? '-'}
              </p>
            </div>

            {/* Progress */}
            <div>
              <h3 className="text-sm font-medium">Progress</h3>
              <p className="text-sm text-gray-600">
                {projectDetails?.data?.percentageComplete ?? 0}%
              </p>
            </div>

            {/* Priority */}
            <div>
              <h3 className="text-sm font-medium">Priority</h3>
              <p className="text-sm text-gray-600 capitalize text-wrap">
                {projectDetails?.data?.priority ?? '-'}
              </p>
            </div>

            {/* Project Status */}
            <div>
              <h3 className="text-sm font-medium">Project Status</h3>
              <p className="text-sm text-gray-600 capitalize">
                {projectDetails?.data?.currentStatus || 'Not specified'}
              </p>
            </div>

            {/* Description */}
            <div className="lg:col-span-2">
              <h3 className="text-sm font-medium">Description</h3>
              <p className="text-sm max-w-[450px] text-gray-600 whitespace-pre-wrap break-words">
                {projectDetails?.data?.description || 'No description provided'}
              </p>
            </div>

            {/* Technologies */}
            <div className="lg:col-span-3">
              <h3 className="text-sm font-medium">Technologies</h3>
              {projectDetails?.data?.technologies &&
              projectDetails?.data?.technologies?.length > 0 ? (
                <div className="flex flex-wrap gap-2 mt-1">
                  {projectDetails?.data.technologies.map((tech: any) => (
                    <span
                      key={tech.id || tech}
                      className="px-2 py-1 text-xs rounded-md bg-gray-100 text-gray-700 border"
                    >
                      {tech.name ?? tech}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-600">No technologies listed</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Documents Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Project Documents</CardTitle>
            <Button onClick={handleAdd}>
              {' '}
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

      {/* Add/Edit Modal */}
      {open && (
        <AddEditDocumentDialog
          open={open}
          setOpen={setOpen}
          onSave={handleSave}
          defaultValues={selectedDoc}
        />
      )}
    </PageLayout>
  );
}
