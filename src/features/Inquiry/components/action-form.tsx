/* eslint-disable @typescript-eslint/no-explicit-any */
import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import CustomButton from "@/components/shared/custom-button";
import { TextInputField } from "@/components/shared/custom-input-field";
import { Textarea } from "@/components/ui/textarea";
import CustomDropDownSearchable from "@/components/shared/custome-searchable-dropdown";
import { InquirySchema, TInquirySchema } from "../schema";

interface Props {
  currentRow?: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  loading?: boolean;
  onSubmit: (values: TInquirySchema) => void;
}

export function InquiryActionForm({
  currentRow,
  open,
  onOpenChange,
  onSubmit: onSubmitValues,
  loading,
}: Readonly<Props>) {
  const isEdit = !!currentRow;

  const form = useForm<TInquirySchema>({
    resolver: zodResolver(InquirySchema) as any,
    defaultValues: {
      clientName: currentRow?.clientName ?? "",
      country: currentRow?.country ?? "",
      type: currentRow?.type ?? "",
      status: currentRow?.status ?? "",
      notes: currentRow?.notes ?? "",
    },
  });

  const onSubmit: SubmitHandler<TInquirySchema> = (values) => {
    onSubmitValues(values);
  };

  return (
    <Dialog
      open={open}
      modal
      onOpenChange={(state) => {
        form.reset();
        onOpenChange(state);
      }}
    >
      <DialogContent className="sm:max-w-lg max-h-[80vh] overflow-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Inquiry" : "Add Inquiry"}</DialogTitle>
        </DialogHeader>

        <div className="h-fit w-full overflow-y-auto py-1">
          <Form {...form}>
            <form
              id="inquiry-form"
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-4 p-0.5"
            >
              {/* Client Name */}
              <TextInputField
                control={form.control}
                name="clientName"
                label="Client Name"
                placeholder="Enter client name"
              />

              {/* Country */}
              <TextInputField
                control={form.control}
                name="country"
                label="Country"
                placeholder="Enter country name"
              />

              {/* Type Dropdown */}
              <CustomDropDownSearchable
                form={form}
                name="type"
                label="Inquiry Type"
                options={[
                  { value: "general", label: "General" },
                  { value: "technical", label: "Technical" },
                  { value: "support", label: "Support" },
                  { value: "sales", label: "Sales" },
                ]}
                placeholder="Select Inquiry Type"
                searchEnabled={false}
              />

              {/* Status Dropdown */}
              <CustomDropDownSearchable
                form={form}
                name="status"
                label="Status"
                options={[
                  { value: "open", label: "Open" },
                  { value: "in-progress", label: "In Progress" },
                  { value: "closed", label: "Closed" },
                  { value: "pending", label: "Pending" },
                ]}
                placeholder="Select Status"
                searchEnabled={false}
              />

              {/* Notes */}
              <div className="flex flex-col space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Notes
                </label>
                <Textarea
                  {...form.register("notes")}
                  placeholder="Enter additional notes"
                  rows={3}
                  className="resize-none"
                />
              </div>
            </form>
          </Form>
        </div>

        <DialogFooter>
          <CustomButton type="submit" form="inquiry-form" loading={loading}>
            Save Changes
          </CustomButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
