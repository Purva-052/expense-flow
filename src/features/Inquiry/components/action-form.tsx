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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { useGetInquiryType } from "@/features/Inquiry-type/services";
import { zodResolver } from "@hookform/resolvers/zod";
import { SubmitHandler, useForm } from "react-hook-form";
import { InquirySchema, TInquirySchema } from "../schema";
import { INQUIRY_STATUS } from "@/utils/constant";
import { PhoneInputField } from "@/components/shared/custom-phone-number-countrywise";
import { useGetCountryDropdownList } from "@/features/clients/services";
import { Input } from "@/components/ui/input";

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
      projectName: currentRow?.projectName ?? "",
      clientName: currentRow?.clientName ?? "",
      countryId: currentRow?.country?.id ?? "",
      requirements: currentRow?.modules?.map((item: any) => item?.id) ?? [],
      status: currentRow?.status ?? "",
      notes: currentRow?.notes ?? "",
      clientContactNo: currentRow?.clientContactNo ?? null,
      clientCompanyName: currentRow?.clientCompanyName ?? "",
      sourceOfInquiry: currentRow?.sourceOfInquiry ?? "",
      clientEmailId: currentRow?.clientEmailId ?? "",
    },
  });

  const { data: typeList, isPending: loadingType }: any = useGetInquiryType({
    pagination: false,
  });
  const { data: countryList, isPending: loadingCountry }: any =
    useGetCountryDropdownList();
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
        onOpenChange(state);
        if (!state) {
          form.reset();
        }
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
                name="projectName"
                label="Project Name"
                placeholder="Enter project name"
              />

              <div className="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2">
                {/* Client Name */}
                <FormField
                  control={form.control}
                  name="clientName"
                  render={({ field }: any) => (
                    <FormItem>
                      <FormLabel>
                        Client Name
                        <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter client name"
                          {...field}
                          // disabled={loading || isViewOnly}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {/* Client Company Name. */}
                <TextInputField
                  control={form.control}
                  name="clientCompanyName"
                  label="Client Company Name"
                  placeholder="Enter client company name"
                />
              </div>

              <div className="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2">
                {/* Client Email */}
                <TextInputField
                  control={form.control}
                  name="clientEmailId"
                  label="Client Email"
                  placeholder="Enter client email"
                />

                {/* Client Contact No. */}
                {/* <TextInputField
                control={form.control}
                name="clientContactNo"
                label="Client Contact No."
                placeholder="Enter client contact no."
              /> */}
                <FormField
                  control={form.control}
                  name="countryId"
                  render={() => (
                    <FormItem>
                      <FormLabel>
                        Country <span className="text-red-500">*</span>
                      </FormLabel>
                      <CustomDropDownSearchable
                        form={form}
                        name="countryId"
                        label=""
                        placeholder="Select country"
                        sortOptions={false}
                        isLoading={loadingCountry}
                        options={countryList?.data?.map((opt: any) => {
                          return { value: opt.id, label: opt.name };
                        })}
                      />
                    </FormItem>
                  )}
                />
              </div>

              <PhoneInputField
                form={form}
                name="clientContactNo"
                label="Client Contact No."
              />

              {/* Country */}
              {/* <TextInputField
                control={form.control}
                name="countryId"
                label="Country"
                placeholder="Enter country name"
              /> */}

              {/* Source of Inquiry */}
              {/* <div className="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2"> */}
              <TextInputField
                control={form.control}
                name="sourceOfInquiry"
                label="Source of Inquiry"
                placeholder="Enter source of inquiry"
              />

              {/* Type Dropdown */}
              {/* </div> */}
              <FormField
                control={form.control}
                name="requirements"
                render={() => (
                  <FormItem>
                    <FormLabel>
                      Inquiry Type <span className="text-red-500">*</span>
                    </FormLabel>
                    <CustomDropDownSearchable
                      form={form}
                      name="requirements"
                      label=""
                      multiple
                      options={inquiryOptions}
                      placeholder="Select Inquiry Type"
                      searchEnabled={false}
                      isLoading={loadingType}
                    />
                  </FormItem>
                )}
              />

              {!isEdit && (
                <>
                  <FormField
                    control={form.control}
                    name="status"
                    render={() => (
                      <FormItem>
                        <FormLabel>
                          Status <span className="text-red-500">*</span>
                        </FormLabel>
                        <CustomDropDownSearchable
                          form={form}
                          name="status"
                          label=""
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
                          placeholder="Select Status"
                          searchEnabled={false}
                        />
                      </FormItem>
                    )}
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
