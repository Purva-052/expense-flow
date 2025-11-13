/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import CustomDropDownSearchable from "@/components/shared/custome-searchable-dropdown";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuthStore } from "@/stores/use-auth-store";
import { INQUIRY_STATUS, roles } from "@/utils/constant";
import { zodResolver } from "@hookform/resolvers/zod"; // Import the zod resolver
import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal } from "lucide-react";
import { useState } from "react";
import { Form, FormProvider, useForm } from "react-hook-form";
import { z } from "zod"; // Import zod
import { useCreateInquiryStatus } from "../services";
import { useInquiryStore } from "../stores/useInquiryStore";

// 1. Define the validation schema using Zod
const statusUpdateSchema = z.object({
  notes: z.string().min(1, { message: "Notes are required." }),
});

// Modal component with validation
const StatusUpdateModal = ({
  isOpen,
  onClose,
  onSubmit,
  newStatusLabel,
  form,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (notes: string) => void;
  newStatusLabel: string;
  form: any;
}) => {
  const handleFormSubmit = (data: z.infer<typeof statusUpdateSchema>) => {
    onSubmit(data.notes);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <FormProvider {...form}>
          <form onSubmit={form.handleSubmit(handleFormSubmit)}>
            <DialogHeader>
              <DialogTitle>Update Status to "{newStatusLabel}"</DialogTitle>
            </DialogHeader>

            <div className="flex flex-col justify-center gap-4 my-4">
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <Label htmlFor="notes">Notes</Label>
                    <FormControl>
                      <Textarea
                        id="notes"
                        placeholder="Add your notes here..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit">Update Status</Button>
            </DialogFooter>
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
};

const StatusCell = ({ row }: any) => {
  const inquiry = row.original;
  const currentStatus = inquiry?.status;
  const formStatusNotes = useForm<z.infer<typeof statusUpdateSchema>>({
    resolver: zodResolver(statusUpdateSchema),
    defaultValues: {
      notes: "",
    },
  });

  const onSucessStatusChange = () => {
    handleModalClose();
  };

  const { mutateAsync: InquiryStatusChange } =
    useCreateInquiryStatus(onSucessStatusChange);

  const { user } = useAuthStore();
  const userRole = user?.user?.role;

  const form = useForm({
    defaultValues: { status: currentStatus },
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pendingStatus, setPendingStatus] = useState<string | null>(null);

  const statusOptions = [
    { value: INQUIRY_STATUS.NEW_INQUIRY, label: "New Inquiry" },
    { value: INQUIRY_STATUS.IN_DISCUSSION, label: "In Discussion" },
    { value: INQUIRY_STATUS.NEAR_TO_CLOSE, label: "Near to Close" },
    { value: INQUIRY_STATUS.CLOSED, label: "Closed" },
    { value: INQUIRY_STATUS.OPTED_OUT, label: "Opted Out" },
  ];

  const handleChange = (value: string) => {
    if (value === currentStatus) return;
    setPendingStatus(value);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    formStatusNotes.reset();
    form.setValue("status", currentStatus);
    setPendingStatus(null);
  };

  const handleModalSubmit = async (notes: string) => {
    if (!pendingStatus) return;

    try {
      await InquiryStatusChange({
        projectLeadId: inquiry.id,
        status: pendingStatus,
        effectiveDate: new Date().toISOString(),
        notes: notes,
      });
      // On success, we need to update the form's value to the new status
      form.setValue("status", pendingStatus);
    } catch (error) {
      // console.error("Failed to update status", error);
      // On failure, revert the dropdown to the original status
      form.setValue("status", currentStatus);
    } finally {
      setIsModalOpen(false);
      setPendingStatus(null);
    }
  };

  // --- Role & permission logic ---
  const canEditStatus = userRole === roles.BDE;

  const currentStatusLabel =
    statusOptions.find((s) => s.value === currentStatus)?.label || "";

  if (!currentStatus)
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
      <StatusUpdateModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onSubmit={handleModalSubmit}
        newStatusLabel={
          statusOptions.find((s) => s.value === pendingStatus)?.label || ""
        }
        form={formStatusNotes}
      />
    </>
  );
};

// ... (The rest of your columns definition remains unchanged)
export const columns: ColumnDef<any>[] = [
  {
    accessorKey: "clientName",
    header: "Client Name",
  },
  {
    accessorKey: "countryName",
    header: "Country",
  },
  {
    accessorKey: "modules",
    header: "Inquiry Type",
    cell: ({ row }) => {
      const modules = row.original?.modules;
      if (!modules || modules.length === 0) return "-";
      return (
        <span className="max-w-[400px] w-full flex !flex-wrap text-wrap">
          {modules.map((data: any, index: number) => (
            <span key={data.id || index}>
              {data.name}
              {index < modules.length - 1 ? ",\u00A0" : ""}
            </span>
          ))}
        </span>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: StatusCell,
  },
  {
    id: "actions",
    header: "Actions",
    cell: function Cell({ row }) {
      const inquiry = row.original;
      const { setOpen, setCurrentRow } = useInquiryStore();
      const user = useAuthStore((state) => state.user);
      const userRole = user?.user?.role;

      const handleEdit = () => {
        setOpen("edit");
        setCurrentRow(inquiry);
      };

      const handleDelete = () => {
        setOpen("delete");
        setCurrentRow(inquiry);
      };

      const handleView = () => {
        setOpen("view");
        setCurrentRow(inquiry);
      };
      const handleViewHistory = () => {
        setOpen("history");

        setCurrentRow(inquiry);
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
            <DropdownMenuItem onClick={handleView}>
              View Inquiry
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleViewHistory}>
              View history
            </DropdownMenuItem>
            {userRole === roles.BDE && (
              <>
                <DropdownMenuItem onClick={handleEdit}>
                  Edit Inquiry
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-red-600 focus:bg-red-50 focus:text-red-600"
                  onClick={handleDelete}
                >
                  Delete Inquiry
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
    enableSorting: false,
  },
];
