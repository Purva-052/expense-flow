/* eslint-disable @typescript-eslint/no-explicit-any */
import PageLayout from '@/components/layout/layout-provider';
import { GlobalTable } from '@/components/table/global-table';
import GlobalFilterSection from '@/components/table/global-table-filter';
import TablePageHeader from '@/components/table/table-page-header';
import { FilterConfig } from '@/components/table/table-toolbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Edit2, Plus } from 'lucide-react';
import { useState } from 'react';
import { useGetProjectsDetailData } from '../services';
import AddEditDocumentDialog from './AddEditDocumentDialog';
import ProjectDetails from './project-detail-card';
import ServerDetailsCard from './server-detail-card';

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
                side="top"
                align="start"
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
  const serverDetails = [
    {
      ipUrl: '192.168.1.1',
      type: 'Frontend',
      owner: 'Devstree',
      serverId: 'server-001',
      status: 'Active',
      ssl: 'Yes',
    },
    {
      ipUrl: 'api.example.com',
      type: 'Backend',
      owner: 'Client',
      serverId: 'server-002',
      status: 'Inactive',
      ssl: 'No',
    },
    {
      ipUrl: 'dev.myservice.io',
      type: 'Backend',
      owner: 'Devstree',
      serverId: 'server-003',
      status: 'Active',
      ssl: 'Yes',
    },
    {
      ipUrl: '203.0.113.45',
      type: 'Database',
      owner: 'Client',
      serverId: 'server-004',
      status: 'Active',
      ssl: 'N/A',
    },
  ];

  return (
    <PageLayout>
      {/* Page Header */}
      <TablePageHeader showActionButton={false} title={`Project Details`}>
        View and manage project-related information, documents, and secrets.
      </TablePageHeader>
      <ProjectDetails projectDetails={projectDetails} />
      <Card className="my-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl">Server Details</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {serverDetails.map((server) => (
              <ServerDetailsCard key={server.serverId} server={server} />
            ))}
          </div>
        </CardContent>
      </Card>
      {/* Documents Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl">Project Documents</CardTitle>
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
