/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useProjectsStore } from "../stores/useProjectsStore";
import CustomDropDownSearchable from "@/components/shared/custome-searchable-dropdown";
import { Form, FormProvider, useForm } from "react-hook-form";
import { useProjectStatusChange } from "@/features/kanban-board/services";

function StatusCell({ row }: any) {
  const { mutateAsync: ProjectStatusChange } = useProjectStatusChange();
  const form = useForm({
    defaultValues: { status: row.original.currentStatus },
  });
  const status = row.original.currentStatus;

  const handleChange = (value: string) => {
    console.log("🚀 ~ handleChange ~ value:", value);
    ProjectStatusChange({
      projectId: row.original.id,
      status: value,
      effectiveDate: new Date().toISOString(),
    });
  };

  if (!status)
    return <div className="text-muted-foreground text-sm italic">-</div>;

  return (
    <div className="w-[180px]">
      <FormProvider {...form}>
        <Form {...form}>
          <CustomDropDownSearchable
            form={form}
            name="status"
            label=""
            options={[
              { value: "active-discovery", label: "Active" },
              { value: "running", label: "Running" },
              { value: "slow", label: "Slow" },
              { value: "stop", label: "Stop" },
              { value: "completed", label: "Completed" },
            ]}
            placeholder="Select Status"
            searchEnabled={false}
            onChangeValue={handleChange}
            showClearButton={false}
          />
        </Form>
      </FormProvider>
    </div>
  );
}
function ActionsCell({ row }: any) {
  const operator = row.original;
  const { setOpen, setCurrentRow } = useProjectsStore();

  const handleEdit = () => {
    setOpen("edit");
    setCurrentRow(operator);
  };

  const handleDelete = () => {
    setOpen("delete");
    setCurrentRow(operator);
  };

  const handleView = () => {
    setOpen("view");
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
    accessorKey: "name",
    header: "Project Name",
  },
  {
    accessorKey: "description",
    header: "Description",
    cell: ({ row }) => {
      const description = row.original.description;
      if (!description) return "-";
      return (
        <div
          className="whitespace-pre-wrap break-words"
          style={{ maxWidth: "300px" }}
        >
          {description}
        </div>
      );
    },
  },
  {
    accessorKey: "client.name",
    header: "Client",
  },
  {
    accessorKey: "projectHandler.fullName",
    header: "Project Coordinator",
  },
  {
    accessorKey: "percentageComplete",
    header: "Progress (%)",
  },
  {
    accessorKey: "expectedCompletionDate",
    header: "Expected Completion",
    cell: ({ row }) => {
      const date = row.original.expectedCompletionDate;
      if (!date) return "-";
      return new Date(date).toLocaleDateString("en-GB");
    },
  },
  {
    accessorKey: "priority",
    header: "Priority",
  },
  {
    accessorKey: "currentStatus",
    header: "Project Status",
    cell: StatusCell,
  },
  {
    id: "actions",
    header: "Actions",
    cell: ActionsCell,
    enableSorting: false,
  },
];
