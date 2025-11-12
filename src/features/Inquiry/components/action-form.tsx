/* eslint-disable @typescript-eslint/no-explicit-any */
import CustomButton from "@/components/shared/custom-button";
import { TextInputField } from "@/components/shared/custom-input-field";
import CustomDropDownSearchable from "@/components/shared/custome-searchable-dropdown";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { useGetInquiryType } from "@/features/Inquiry-type/services";
import { zodResolver } from "@hookform/resolvers/zod";
import { SubmitHandler, useForm } from "react-hook-form";
import { InquirySchema, TInquirySchema } from "../schema";
import { INQUIRY_STATUS } from "@/utils/constant";

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
      country: currentRow?.countryName ?? "",
      type: currentRow?.modules?.map((item: any) => item?.id) ?? [],
      status: currentRow?.status ?? "",
      notes: currentRow?.notes ?? "",
    },
  });

  const { data: typeList, isPending: loadingType }: any = useGetInquiryType({
    pagination: false,
  });
  const inquiryOptions =
    typeList?.data?.map((item: any) => ({
      value: item?.id,
      label: item?.name,
    })) || [];

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
                multiple
                options={inquiryOptions}
                placeholder="Select Inquiry Type"
                searchEnabled={false}
                isLoading={loadingType}
              />

              {!isEdit && (
                <>
                  <CustomDropDownSearchable
                    form={form}
                    name="status"
                    label="Status"
                    options={[
                      {
                        value: INQUIRY_STATUS.NEW_INQUIRY,
                        label: "New Inquiry",
                      },
                      {
                        value: INQUIRY_STATUS.IN_DISCUSSION,
                        label: "In Discussion",
                      },
                      {
                        value: INQUIRY_STATUS.NEAR_TO_CLOSE,
                        label: "Near to Close",
                      },
                      {
                        value: INQUIRY_STATUS.CLOSED,
                        label: "Closed",
                      },
                      {
                        value: INQUIRY_STATUS.OPTED_OUT,
                        label: "Opted Out",
                      },
                    ]}
                    // options={[
                    //   { value: "open", label: "Open" },
                    //   { value: "in-progress", label: "In Progress" },
                    //   { value: "closed", label: "Closed" },
                    //   { value: "pending", label: "Pending" },
                    // ]}
                    placeholder="Select Status"
                    searchEnabled={false}
                  />
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
                </>
              )}
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
