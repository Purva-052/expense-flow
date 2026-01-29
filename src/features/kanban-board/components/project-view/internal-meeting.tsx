import { useEffect, useState, useMemo, useCallback } from "react";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import {
  ClassicEditor,
  Bold,
  Essentials,
  Paragraph,
  Undo,
  Heading,
  List,
  TodoList,
  BlockQuote,
} from "ckeditor5";

import "ckeditor5/ckeditor5.css";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import CustomButton from "@/components/shared/custom-button";
import { z } from "zod";
import { CustomDatePicker } from "@/components/shared/custome-datePicker";
import { TextInputField } from "@/components/shared/custom-input-field";
import { ColumnDef } from "@tanstack/react-table";
import { GlobalTable } from "@/components/table/global-table";
import { format } from "date-fns";
import {
  useGetInternalMeetings,
  createInternalMeeting,
  useUpdateInternalMeeting,
  useDeleteInternalMeeting,
} from "@/features/kanban-board/services";
import { ExternalLink, Loader2, Eye, Pencil, Trash2 } from "lucide-react";
import { ConfirmDialog } from "@/components/confirm-dialog";

// Schema validation
const InternalMeetingSchema = z.object({
  meetingName: z.string().min(1, "Meeting name is required"),
  description: z.string().min(1, "Description is required"),
  projectId: z.number({ required_error: "Project is required" }),
  startDate: z.date({ required_error: "Start date is required" }),
  // endDate is removed as per requirement
  link: z.string().url("Invalid URL").optional().or(z.literal("")),
});

type TInternalMeetingSchema = z.infer<typeof InternalMeetingSchema>;

interface InternalMeetingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  onSubmit?: (values: any) => void;
  loading?: boolean;
  isViewOnly?: boolean;
  currentData?: Partial<TInternalMeetingSchema> & {
    id?: number;
  };
  title?: string;
  descriptionLabel?: string;
  projectId?: string | number;
}

export function InternalMeetingDialog({
  open,
  onOpenChange,
  onSubmit: onSubmitValues,
  loading: externalLoading = false,
  isViewOnly = false,
  currentData,
  title = "Internal Meeting Details",
  descriptionLabel = "Description or Discussion Points",
  projectId,
  onSuccess,
}: InternalMeetingDialogProps) {
  const [editorReady, setEditorReady] = useState(false);

  const form = useForm<TInternalMeetingSchema>({
    resolver: zodResolver(InternalMeetingSchema),
    defaultValues: {
      meetingName: currentData?.meetingName ?? "",
      description: currentData?.description ?? "",
      link: currentData?.link ?? "",
      projectId:
        Number(projectId ?? currentData?.projectId) || (undefined as any),
      startDate: currentData?.startDate
        ? new Date(currentData.startDate)
        : undefined,
    },
  });

  const closeDialog = useCallback(() => {
    form.reset();
    onOpenChange(false);
    if (onSuccess) onSuccess();
  }, [form, onOpenChange, onSuccess]);

  const { mutate: createMeeting, isPending: isCreating } =
    createInternalMeeting(() => {
      onOpenChange(false);
      form.reset();
      if (onSuccess) onSuccess();
    });

  const { mutate: updateMeeting, isPending: isUpdating } =
    useUpdateInternalMeeting(String(currentData?.id), closeDialog);

  const loading = externalLoading || isCreating || isUpdating;

  useEffect(() => {
    if (open) {
      form.reset({
        meetingName: currentData?.meetingName ?? "",
        description: currentData?.description ?? "",
        link: currentData?.link ?? "",
        projectId:
          Number(projectId ?? currentData?.projectId) || (undefined as any),
        startDate: currentData?.startDate
          ? new Date(currentData.startDate)
          : undefined,
      });
    }
  }, [open, currentData, projectId, form]);

  const onSubmit = (values: TInternalMeetingSchema) => {
    const payload = {
      ...values,
      id: currentData?.id,
      startDate: values.startDate.toISOString(),
      // endDate is removed
    };

    if (onSubmitValues) {
      onSubmitValues(payload);
    } else if (currentData?.id) {
      updateMeeting(payload);
    } else {
      createMeeting(payload);
    }
  };

  const handleDialogOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      form.reset();
    }
    onOpenChange(isOpen);
  };

  return (
    <Dialog modal open={open} onOpenChange={handleDialogOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription className="sr-only">
            Internal Meeting
          </DialogDescription>
        </DialogHeader>

        <div className="h-fit w-full overflow-y-auto py-1">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-4 p-0.5"
            >
              {/* Meeting Name - Full Width */}
              <TextInputField
                control={form.control}
                name="meetingName"
                label="Meeting Name"
                placeholder="Enter Meeting Name"
                disabled={loading || isViewOnly}
              />

              {/* Hidden Project ID */}
              <div className="hidden">
                <TextInputField
                  control={form.control}
                  name="projectId"
                  label="Project ID"
                  placeholder="Project ID"
                />
              </div>

              {/* Start Date */}
              {/* <div className="grid grid-cols-1 gap-4 sm:grid-cols-2"> */}
              <CustomDatePicker
                control={form.control}
                name="startDate"
                label="Meeting Date"
                placeholder="Select Meeting Date"
                disabled={loading || isViewOnly}
              />
              {/* </div> */}

              {/* Link Field - Full Width */}
              <FormField
                control={form.control}
                name="link"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Link (Optional)</FormLabel>
                    <FormControl>
                      <Input
                        type="url"
                        placeholder="https://example.com"
                        {...field}
                        disabled={loading || isViewOnly}
                        className="w-full"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Description Field with CKEditor - Full Width */}
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{descriptionLabel}</FormLabel>
                    <FormControl>
                      <div className="rounded-md border border-input bg-background">
                        <CKEditor
                          //@ts-ignore
                          editor={ClassicEditor}
                          data={field.value}
                          onChange={(_, editor) => {
                            const data = editor.getData();
                            field.onChange(data);
                          }}
                          onReady={() => {
                            setEditorReady(true);
                          }}
                          disabled={loading || !editorReady || isViewOnly}
                          config={{
                            plugins: [
                              Essentials,
                              Paragraph,
                              Heading,
                              Bold,
                              List,
                              TodoList,
                              Undo,
                              BlockQuote,
                            ],
                            toolbar: [
                              "heading",
                              "|",
                              "bold",
                              "|",
                              "bulletedList",
                              "numberedList",
                              "todoList",
                              "|",
                              "blockQuote",
                              "|",
                              "undo",
                              "redo",
                            ],
                            heading: {
                              options: [
                                {
                                  model: "paragraph",
                                  title: "Paragraph",
                                  class: "ck-heading_paragraph",
                                },
                                {
                                  model: "heading1",
                                  view: "h1",
                                  title: "Heading 1",
                                  class: "ck-heading_heading1",
                                },
                                {
                                  model: "heading2",
                                  view: "h2",
                                  title: "Heading 2",
                                  class: "ck-heading_heading2",
                                },
                              ],
                            },
                            licenseKey: "GPL",
                          }}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Dialog Footer */}
              <DialogFooter className="gap-2">
                <CustomButton
                  type="button"
                  variant="outline"
                  onClick={() => handleDialogOpenChange(false)}
                  disabled={loading}
                >
                  {isViewOnly ? "Close" : "Cancel"}
                </CustomButton>
                {!isViewOnly && (
                  <CustomButton
                    type="submit"
                    disabled={loading}
                    isLoading={loading}
                  >
                    {loading
                      ? "Saving..."
                      : currentData?.id
                        ? "Update Meeting"
                        : "Save Meeting"}
                  </CustomButton>
                )}
              </DialogFooter>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function InternalMeetingListing({
  projectId,
}: {
  projectId: string | number;
}) {
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedMeeting, setSelectedMeeting] = useState<any>(null);
  const [isViewOnly, setIsViewOnly] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [meetingToDelete, setMeetingToDelete] = useState<any>(null);

  const { data: meetingsResponse, isLoading } = useGetInternalMeetings(
    projectId
  ) as any;
  const { mutate: deleteMeeting, isPending: isDeleting } =
    useDeleteInternalMeeting(() => {
      setIsDeleteDialogOpen(false);
      setMeetingToDelete(null);
    });

  const meetings = useMemo(() => {
    return (
      meetingsResponse?.data?.data ||
      meetingsResponse?.data ||
      meetingsResponse ||
      []
    );
  }, [meetingsResponse]);

  const metadata = meetingsResponse?.metadata;

  const handleAction = (type: "view" | "edit" | "delete", meeting: any) => {
    if (type === "delete") {
      setMeetingToDelete(meeting);
      setIsDeleteDialogOpen(true);
    } else {
      setSelectedMeeting(meeting);
      setIsViewOnly(type === "view");
      setIsDialogOpen(true);
    }
  };

  const columns = useMemo<ColumnDef<any>[]>(
    () => [
      {
        accessorKey: "meetingName",
        header: "Meeting Name",
      },
      {
        accessorKey: "startDate",
        header: "Start Date",
        cell: ({ row }) => {
          const date = row.original.startDate;
          return date ? format(new Date(date), "PPP") : "-";
        },
      },
      {
        accessorKey: "link",
        header: "Link",
        cell: ({ row }) =>
          row.original.link ? (
            <a
              href={row.original.link}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center text-blue-600 hover:underline gap-1"
            >
              Link <ExternalLink className="w-3 h-3" />
            </a>
          ) : (
            "-"
          ),
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleAction("view", row.original)}
              className="p-1 hover:bg-muted rounded text-muted-foreground hover:text-primary transition-colors"
              title="View"
            >
              <Eye className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleAction("edit", row.original)}
              className="p-1 hover:bg-muted rounded text-muted-foreground hover:text-primary transition-colors"
              title="Edit"
            >
              <Pencil className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleAction("delete", row.original)}
              className="p-1 hover:bg-muted rounded text-muted-foreground hover:text-destructive transition-colors"
              title="Delete"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ),
      },
    ],
    []
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <span className="ml-2">Loading meetings...</span>
      </div>
    );
  }

  return (
    <div className="mt-4">
      <GlobalTable
        data={meetings}
        columns={columns}
        totalCount={metadata?.total || meetings.length}
        currentPage={metadata?.page || pagination.pageIndex + 1}
        pageSize={metadata?.limit || pagination.pageSize}
        onPaginationChange={setPagination}
        isPaginationEnabled={true}
        loading={isLoading}
      />

      <InternalMeetingDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        isViewOnly={isViewOnly}
        currentData={selectedMeeting}
        projectId={projectId}
        title={
          isViewOnly
            ? "View Internal Meeting Details"
            : "Edit Internal Meeting Details"
        }
      />

      <ConfirmDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        handleConfirm={() => deleteMeeting(meetingToDelete?.id)}
        isLoading={isDeleting}
        title="Delete Internal Meeting"
        desc={`Are you sure you want to delete the meeting "${meetingToDelete?.meetingName}"? This action cannot be undone.`}
      />
    </div>
  );
}
