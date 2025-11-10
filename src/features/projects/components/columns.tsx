/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useProjectsStore } from '../stores/useProjectsStore';
import CustomDropDownSearchable from '@/components/shared/custome-searchable-dropdown';
import { Form, FormProvider, useForm } from 'react-hook-form';
import { useProjectStatusChange } from '@/features/kanban-board/services';
import { useAuthStore } from '@/stores/use-auth-store';
import { useState } from 'react';
import { ReasonDialog } from '@/features/kanban-board/components/status-reason-dialog';
import { roles } from '@/utils/constant';
import { useNavigate } from '@tanstack/react-router';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

function StatusCell({ row }: any) {
  const [isReasonDialogOpen, setReasonDialogOpen] = useState(false);
  const [pendingStatus, setPendingStatus] = useState<string | null>(null);

  const { mutateAsync: ProjectStatusChange } = useProjectStatusChange();
  const { user } = useAuthStore();
  const userRole = user?.user?.role;

  const project = row.original;
  const form = useForm({
    defaultValues: { status: project.currentStatus },
  });

  const statusOptions = [
    { value: 'active-discovery', label: 'Active Discovery' },
    { value: 'running', label: 'Running' },
    { value: 'slow', label: 'Slow' },
    { value: 'stop', label: 'Stop' },
    { value: 'completed', label: 'Completed' },
  ];

  const handleChange = async (value: string) => {
    if (value === 'slow') {
      setPendingStatus(value);
      setReasonDialogOpen(true);
    } else {
      await ProjectStatusChange({
        projectId: project.id,
        status: value,
        effectiveDate: new Date().toISOString(),
      });
      form.setValue('status', value);
    }
  };

  const handleStatusChangeWithReason = async (reason: string) => {
    if (pendingStatus) {
      await ProjectStatusChange({
        projectId: project.id,
        status: pendingStatus,
        reason: reason,
        effectiveDate: new Date().toISOString(),
      });
      form.setValue('status', pendingStatus);
      setPendingStatus(null);
      setReasonDialogOpen(false);
    }
  };

  const handleReasonDialogChange = (isOpen: boolean) => {
    // If the dialog is closing and a status change was pending
    if (!isOpen && pendingStatus) {
      // Revert the form state to the original project status
      form.setValue('status', project.currentStatus);
      setPendingStatus(null); // Clear the pending state
    }
    setReasonDialogOpen(isOpen);
  };

  // --- Role & permission logic (same as ProjectCard) ---
  const isAdmin = userRole === roles.ADMIN;
  const isProjectHandler =
    userRole === roles.PROJECT_MANAGER || userRole === roles.TEAM_LEAD;

  const isHandlerAssigned = !!project?.projectHandler?.id;
  const isCurrentUserAssignedHandler =
    isHandlerAssigned && project?.projectHandler?.id === user?.user?.id;

  const canEditStatus =
    isAdmin ||
    (!isHandlerAssigned && isProjectHandler) ||
    (isHandlerAssigned && isCurrentUserAssignedHandler);

  const currentStatusLabel =
    statusOptions.find((o) => o.value === project.currentStatus)?.label ||
    project.currentStatus;

  if (!project.currentStatus)
    return <div className="text-muted-foreground text-sm italic">-</div>;

  return (
    <>
      <div className="w-[180px]">
        {canEditStatus ? (
          <FormProvider {...form}>
            <Form {...form}>
              <CustomDropDownSearchable
                form={form}
                name="status"
                label=""
                options={statusOptions}
                placeholder="Select Status"
                searchEnabled={false}
                onChangeValue={handleChange}
                showClearButton={false}
              />
            </Form>
          </FormProvider>
        ) : (
          <div className="text-sm text-muted-foreground">
            <span>{currentStatusLabel}</span>
          </div>
        )}
      </div>
      <ReasonDialog
        isOpen={isReasonDialogOpen}
        onOpenChange={handleReasonDialogChange} // <-- USE THE NEW HANDLER
        onSubmit={handleStatusChangeWithReason}
      />
    </>
  );
}

function ActionsCell({ row }: any) {
  const operator = row.original;
  const navigate = useNavigate();
  const { setOpen, setCurrentRow } = useProjectsStore();

  const handleEdit = () => {
    setOpen('edit');
    setCurrentRow(operator);
  };

  const handleDelete = () => {
    setOpen('delete');
    setCurrentRow(operator);
  };

  const handleView = () => {
    // setOpen("view");
    navigate({
      to: '/projects/detail/$id',
      params: { id: operator.id },
    });
    setCurrentRow(operator);
  };
  const handleViewHistory = () => {
    setOpen('history');

    setCurrentRow(operator);
  };

  return (
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
        <DropdownMenuItem onClick={handleView}>View project</DropdownMenuItem>
        <DropdownMenuItem onClick={handleViewHistory}>
          View history
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleEdit}>Edit project</DropdownMenuItem>
        <DropdownMenuItem
          className="text-red-600 focus:bg-red-50 focus:text-red-600"
          onClick={handleDelete}
        >
          Delete project
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export const columns: ColumnDef<any>[] = [
  {
    accessorKey: 'name',
    header: 'Project Name',
  },
  {
    accessorKey: 'description',
    header: 'Description',
    cell: ({ row }) => {
      const description = row.original.description;
      if (!description) return '-';
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div
                className="truncate max-w-[200px] cursor-pointer text-ellipsis"
                title={description}
              >
                {description}
              </div>
            </TooltipTrigger>
            <TooltipContent
              // side="top"
              className="text-sm max-w-xs border shadow"
            >
              {description}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    },
  },
  {
    accessorKey: 'client.name',
    header: 'Client',
  },
  {
    accessorKey: 'projectHandler.fullName',
    header: 'Project Coordinator',
  },
  {
    accessorKey: 'percentageComplete',
    header: 'Progress (%)',
  },
  {
    accessorKey: 'expectedCompletionDate',
    header: 'Expected Completion',
    cell: ({ row }) => {
      const date = row.original.expectedCompletionDate;
      if (!date) return '-';
      return new Date(date).toLocaleDateString('en-GB');
    },
  },
  {
    accessorKey: 'priority',
    header: 'Priority',
  },
  {
    accessorKey: 'currentStatus',
    header: 'Project Status',
    cell: StatusCell,
  },
  {
    id: 'actions',
    header: 'Actions',
    cell: ActionsCell,
    enableSorting: false,
  },
];
