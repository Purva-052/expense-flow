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
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
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
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { z } from "zod";
import { CustomDatePicker } from "@/components/shared/custome-datePicker";
import { TextInputField } from "@/components/shared/custom-input-field";
import { Calendar } from "@/components/ui/calendar";
import useDebounce from "@/hooks/use-debaunce";
// import CustomDropDownSearchable from "@/components/shared/custome-searchable-dropdown";
import { ColumnDef } from "@tanstack/react-table";
import { GlobalTable } from "@/components/table/global-table";
import { format } from "date-fns";
import {
  useGetClientMeetings,
  createClientMeeting,
  useUpdateClientMeeting,
  useDeleteClientMeeting,
} from "@/features/kanban-board/services";
import {
  ExternalLink,
  Loader2,
  Eye,
  Pencil,
  Trash2,
  Calendar as CalendarIcon,
  Plus,
} from "lucide-react";
import { ConfirmDialog } from "@/components/confirm-dialog";

// Schema validation
const ClientMeetingSchema = z.object({
  meetingName: z.string().min(1, "Meeting name is required"),
  description: z.string().min(1, "Description is required"),
  projectId: z.number({ required_error: "Project is required" }),
  clientId: z.number().optional().nullable(),
  startDate: z.date({ required_error: "Start date is required" }),
  link: z.string().url("Invalid URL").optional().or(z.literal("")),
});

type TClientMeetingSchema = z.infer<typeof ClientMeetingSchema>;

interface ClientMeetingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  onSubmit?: (values: any) => void;
  loading?: boolean;
  isViewOnly?: boolean;
  currentData?: Partial<TClientMeetingSchema> & {
    id?: number;
    clientName?: string;
  };
  title?: string;
  descriptionLabel?: string;
  clientsList?: Array<{ id: string | number; name: string }>;
  clientListLoading?: boolean;
  projectId?: string | number;
  clientId?: string | number;
}

export function ClientMeetingDialog({
  open,
  onOpenChange,
  onSubmit: onSubmitValues,
  loading: externalLoading = false,
  isViewOnly = false,
  currentData,
  title = "Client Meeting Details",
  descriptionLabel = "Description or Discussion Points",
  projectId,
  clientId,
  onSuccess,
}: ClientMeetingDialogProps) {
  const [editorReady, setEditorReady] = useState(false);

  const form = useForm<TClientMeetingSchema>({
    resolver: zodResolver(ClientMeetingSchema),
    defaultValues: {
      meetingName: currentData?.meetingName ?? "",
      description: currentData?.description ?? "",
      link: currentData?.link ?? "",
      projectId:
        Number(projectId ?? currentData?.projectId) || (undefined as any),
      clientId: Number(clientId ?? currentData?.clientId) || (undefined as any),
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
    createClientMeeting(closeDialog);

  const { mutate: updateMeeting, isPending: isUpdating } =
    useUpdateClientMeeting(String(currentData?.id), closeDialog);

  const loading = externalLoading || isCreating || isUpdating;

  useEffect(() => {
    if (open) {
      form.reset({
        meetingName: currentData?.meetingName ?? "",
        description: currentData?.description ?? "",
        link: currentData?.link ?? "",
        projectId:
          Number(projectId ?? currentData?.projectId) || (undefined as any),
        clientId:
          Number(clientId ?? currentData?.clientId) || (undefined as any),
        startDate: currentData?.startDate
          ? new Date(currentData.startDate)
          : undefined,
      });
    }
  }, [open, currentData, projectId, clientId, form]);

  const onSubmit = (values: TClientMeetingSchema) => {
    const payload = {
      ...values,
      id: currentData?.id,
      startDate: values.startDate.toISOString(),
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
    if (!isOpen && !loading) {
      form.reset();
    }
    onOpenChange(isOpen);
  };

  return (
    <Dialog modal open={open} onOpenChange={handleDialogOpenChange}>
      <DialogContent className="max-h-[90vh] w-full max-w-2xl overflow-hidden">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription className="sr-only">
            {currentData?.clientName
              ? `Client: ${currentData.clientName}`
              : "Client meeting form"}
          </DialogDescription>
        </DialogHeader>

        <div className="overflow-y-auto max-h-[calc(90vh-8rem)] px-1">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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

              {/* Start Date - Full Width */}
              <CustomDatePicker
                control={form.control}
                name="startDate"
                label="Meeting Date"
                placeholder="Select Meeting Date"
                disabled={loading || isViewOnly}
              />

              {/* Link Field - Full Width */}
              <FormField
                control={form.control}
                name="link"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Meeting Link (Optional)</FormLabel>
                    <FormControl>
                      <Input
                        type="url"
                        placeholder="https://example.com/meeting"
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
                      <div className="rounded-md border border-input bg-background overflow-hidden">
                        <CKEditor
                          //@ts-ignore
                          editor={ClassicEditor}
                          data={field.value}
                          onChange={(_, editor) => {
                            if (!isViewOnly && !loading) {
                              const data = editor.getData();
                              field.onChange(data);
                            }
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
              <DialogFooter className="gap-2 pt-4">
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

export function ClientMeetingListing({
  projectId,
  clientsList = [],
}: {
  projectId: string | number;
  clientsList?: Array<{ id: string | number; name: string }>;
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

  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery, 500);
  const [dateRange, setDateRange] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({
    from: undefined,
    to: undefined,
  });

  useEffect(() => {
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  }, [debouncedSearchQuery]);

  const { data: meetingsResponse, isLoading } = useGetClientMeetings(
    projectId,
    {
      page: pagination.pageIndex + 1,
      limit: pagination.pageSize,
      search: debouncedSearchQuery,
      startDate: dateRange.from
        ? format(dateRange.from, "yyyy-MM-dd")
        : undefined,
      endDate: dateRange.to ? format(dateRange.to, "yyyy-MM-dd") : undefined,
    }
  ) as any;

  const { mutate: deleteMeeting, isPending: isDeleting } =
    useDeleteClientMeeting(() => {
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

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    // Reset after animation completes
    setTimeout(() => {
      setSelectedMeeting(null);
      setIsViewOnly(false);
    }, 200);
  };

  const columns = useMemo<ColumnDef<any>[]>(
    () => [
      {
        accessorKey: "meetingName",
        header: "Meeting Name",
        cell: ({ row }) => (
          <div className="font-medium">{row.original.meetingName}</div>
        ),
      },
      {
        accessorKey: "startDate",
        header: "Meeting Date",
        cell: ({ row }) => {
          const date = row.original.startDate;
          return date ? (
            <div className="text-sm">{format(new Date(date), "PPP")}</div>
          ) : (
            <span className="text-muted-foreground">-</span>
          );
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
              className="flex items-center gap-1 text-blue-600 hover:underline text-sm"
              onClick={(e) => e.stopPropagation()}
            >
              View Link <ExternalLink className="h-3 w-3" />
            </a>
          ) : (
            <span className="text-muted-foreground">-</span>
          ),
      },
      {
        id: "actions",
        header: () => <div className="text-right">Actions</div>,
        cell: ({ row }) => (
          <div className="flex items-center justify-end gap-1">
            <button
              onClick={() => handleAction("view", row.original)}
              className="p-2 hover:bg-muted rounded-md text-muted-foreground hover:text-primary transition-colors"
              title="View Details"
              aria-label="View meeting details"
            >
              <Eye className="h-4 w-4" />
            </button>
            <button
              onClick={() => handleAction("edit", row.original)}
              className="p-2 hover:bg-muted rounded-md text-muted-foreground hover:text-primary transition-colors"
              title="Edit Meeting"
              aria-label="Edit meeting"
            >
              <Pencil className="h-4 w-4" />
            </button>
            <button
              onClick={() => handleAction("delete", row.original)}
              className="p-2 hover:bg-muted rounded-md text-muted-foreground hover:text-destructive transition-colors"
              title="Delete Meeting"
              aria-label="Delete meeting"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ),
      },
    ],
    []
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:flex-start">
        <div className="flex items-center gap-2 max-w-md">
          <Input
            placeholder="Search meetings..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-9"
          />
        </div>
        <div className="flex items-center gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className={cn(
                  "justify-start text-left font-normal h-9",
                  !dateRange.from && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateRange.from ? (
                  dateRange.to ? (
                    <>
                      {format(dateRange.from, "LLL dd, y")} -{" "}
                      {format(dateRange.to, "LLL dd, y")}
                    </>
                  ) : (
                    format(dateRange.from, "LLL dd, y")
                  )
                ) : (
                  <span>Pick a date range</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={dateRange.from}
                selected={{
                  from: dateRange.from,
                  to: dateRange.to,
                }}
                onSelect={(range: any) => {
                  setDateRange({
                    from: range?.from,
                    to: range?.to,
                  });
                }}
                numberOfMonths={2}
              />
              <div className="flex items-center justify-end border-t p-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    setDateRange({ from: undefined, to: undefined })
                  }
                >
                  Clear
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center p-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <span className="ml-3 text-muted-foreground">
            Loading meetings...
          </span>
        </div>
      ) : meetings.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 text-center border rounded-lg bg-muted/10">
          <div className="rounded-full bg-muted p-3 mb-4">
            <CalendarIcon className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-1">
            {searchQuery || dateRange.from
              ? "No matching meetings found"
              : "No meetings yet"}
          </h3>
          <p className="text-sm text-muted-foreground">
            {searchQuery || dateRange.from
              ? "Try adjusting your search or filters"
              : "Create your first client meeting to get started"}
          </p>
        </div>
      ) : (
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
      )}

      <ClientMeetingDialog
        open={isDialogOpen}
        onOpenChange={handleDialogClose}
        isViewOnly={isViewOnly}
        currentData={selectedMeeting}
        projectId={projectId}
        clientsList={clientsList}
        title={
          isViewOnly
            ? "View Meeting Details"
            : selectedMeeting?.id
              ? "Edit Meeting"
              : "Create Meeting"
        }
      />

      <ConfirmDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        handleConfirm={() => {
          if (meetingToDelete?.id) {
            deleteMeeting(meetingToDelete.id);
          }
        }}
        isLoading={isDeleting}
        title="Delete Client Meeting"
        desc={
          meetingToDelete
            ? `Are you sure you want to delete the meeting "${meetingToDelete.meetingName}"? This action cannot be undone.`
            : "Are you sure you want to delete this meeting?"
        }
      />
    </div>
  );
}
export function ClientMeetingTab({
  projectId,
  project,
}: {
  projectId: string | number;
  project?: any;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Card className="gap-3">
      <CardHeader className="px-0 gap-0">
        <div className="flex items-center justify-end">
          <Button
            onClick={() => {
              setOpen(true);
            }}
          >
            <Plus className="w-4 h-4 mr-2" /> Add Meeting
          </Button>
        </div>
      </CardHeader>
      <div className="px-6 pb-6">
        <ClientMeetingListing
          projectId={projectId!}
          clientsList={
            project?.client
              ? [
                  {
                    id: project.clientId,
                    name: project.client.name,
                  },
                ]
              : []
          }
        />
      </div>

      <ClientMeetingDialog
        open={open}
        onOpenChange={setOpen}
        projectId={projectId}
        clientId={project?.clientId}
        clientsList={
          project?.client
            ? [{ id: project.clientId, name: project.client.name }]
            : []
        }
        title="Client Meeting Details"
        descriptionLabel="Description or Discussion Points"
      />
    </Card>
  );
}
