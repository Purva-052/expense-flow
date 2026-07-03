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
import { zodResolver } from "@hookform/resolvers/zod";
import { SubmitHandler, useForm } from "react-hook-form";
import { ProductInquirySchema, TProductInquirySchema } from "../schema";
import {
  PRODUCT_INQUIRY_STATUS,
  PRODUCT_INQUIRY_STATUS_OPTIONS,
  roles,
} from "@/utils/constant";
import { PhoneInputField } from "@/components/shared/custom-phone-number-countrywise";
import { Input } from "@/components/ui/input";
import { useGetIndustryDropdownList } from "@/features/industry/services";
import { CustomDatePicker } from "@/components/shared/custome-datePicker";
import { useCallback, useEffect, useMemo } from "react";
import { startOfDay } from "date-fns";
import { useGetProductDropdown } from "../services";
import { useGetUserDropdownList } from "@/features/users/services";

interface Props {
  currentRow?: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  loading?: boolean;
  onSubmit: (values: TProductInquirySchema) => void;
}

export function ProductInquiryActionForm({
  currentRow,
  open,
  onOpenChange,
  onSubmit: onSubmitValues,
  loading,
}: Readonly<Props>) {
  const isEdit = !!currentRow;

  const toNumberOrNull = (value: any): number | null => {
    if (value === null || value === undefined || value === "") return null;
    return Number(value);
  };

  const getDefaultValues = useCallback(
    (row?: any): Partial<TProductInquirySchema> => ({
      companyName: row?.companyName ?? "",
      contactPerson:
        row?.contactPerson?.fullName ?? row?.contactPerson ?? "",
      attendingPerson:
        toNumberOrNull(
          row?.attendingPerson?.id ??
            row?.attendingPersonId ??
            row?.attendingPerson
        ) ?? undefined,
      phoneNumber: row?.phoneNumber ?? "",
      emailId: row?.emailId ?? "",
      demoDate: row?.demoDate ? new Date(row?.demoDate) : new Date(),
      city: row?.city ?? "",
      industryId: toNumberOrNull(row?.industry?.id ?? row?.industryId),
      productId: row?.product?.id ?? toNumberOrNull(row?.productId),
      numberOfUsers: toNumberOrNull(row?.numberOfUsers),
      requirements: row?.requirements ?? "",
      status: row?.status ?? PRODUCT_INQUIRY_STATUS.CONTACTED,
      others: row?.others ?? "",
      notes: row?.notes ?? "",
      trialStartDate: row?.trialStartDate
        ? new Date(row?.trialStartDate)
        : undefined,
      trialEndDate: row?.trialEndDate ? new Date(row?.trialEndDate) : undefined,
      inquiryDate: row?.inquiryDate ? new Date(row?.inquiryDate) : undefined,
    }),
    []
  );

  const form = useForm<TProductInquirySchema>({
    resolver: zodResolver(ProductInquirySchema) as any,
    defaultValues: getDefaultValues(currentRow),
  });

  useEffect(() => {
    if (open) {
      form.reset(getDefaultValues(currentRow));
      return;
    }

    if (!isEdit) {
      form.reset(getDefaultValues());
    }
  }, [currentRow, form, getDefaultValues, isEdit, open]);

  const { data: industryList, isPending: loadingIndustry }: any =
    useGetIndustryDropdownList();
  const { data: productDropdownList, isPending: loadingProductDropdown }: any =
    useGetProductDropdown();
  const { data: salesPerson, isPending: salesPersonLoading }: any =
    useGetUserDropdownList({
      role: [roles.BDE, roles.ADMIN],
      status: "active",
    });
  const selectedStatus = form.watch("status");
  const trialStartDate = form.watch("trialStartDate");
  const trialEndDate = form.watch("trialEndDate");

  const today = startOfDay(new Date());

  const salesPersonOptions = useMemo(() => {
    if (!salesPerson?.data) return [];

    const baseUsers = salesPerson.data.map((s: any) => ({
      value: s.id,
      label: s.fullName,
    }));

    const extraUsers = [
      { value: 134, label: "Piyush Patel" },
      { value: 86, label: "Bhavdeep Devmurari" },
    ];

    return [...extraUsers, ...baseUsers];
  }, [salesPerson]);

  useEffect(() => {
    if (selectedStatus !== PRODUCT_INQUIRY_STATUS.OTHERS) {
      form.setValue("others", "", {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: true,
      });
    }
  }, [form, selectedStatus]);

  useEffect(() => {
    if (
      trialStartDate &&
      trialEndDate &&
      startOfDay(trialEndDate) < startOfDay(trialStartDate)
    ) {
      form.setValue("trialEndDate", null, {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: true,
      });
    }
  }, [form, trialEndDate, trialStartDate]);

  const onSubmit: SubmitHandler<TProductInquirySchema> = (values) => {
    onSubmitValues({
      ...values,
      others:
        values.status === PRODUCT_INQUIRY_STATUS.OTHERS
          ? values.others?.trim() || ""
          : "",
    });
  };

  return (
    <Dialog
      open={open}
      modal
      onOpenChange={(state) => {
        onOpenChange(state);
        if (!state) {
          form.reset(getDefaultValues(currentRow));
        }
      }}
    >
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Edit Product Inquiry" : "Add Product Inquiry"}
          </DialogTitle>
        </DialogHeader>

        <div className="h-fit w-full overflow-y-auto py-1">
          <Form {...form}>
            <form
              id="product-inquiry-form"
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-4 p-0.5"
            >
              <div className="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2">
                <TextInputField
                  control={form.control}
                  name="companyName"
                  label="Company Name"
                  placeholder="Enter company name"
                />

                <TextInputField
                  control={form.control}
                  name="contactPerson"
                  label="Contact Person"
                  placeholder="Enter contact person name"
                />
              </div>

              <div className="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2">
                <CustomDropDownSearchable
                  form={form}
                  name="attendingPerson"
                  label={
                    <span className="flex items-center gap-1">
                      Attending Person
                      <span className="text-red-500">*</span>
                    </span>
                  }
                  options={salesPersonOptions}
                  placeholder="Select Attending person"
                  searchEnabled={false}
                  isLoading={salesPersonLoading}
                />
                <TextInputField
                  control={form.control}
                  name="emailId"
                  label="Email ID"
                  placeholder="Enter email address"
                />
              </div>

              <PhoneInputField
                form={form}
                name="phoneNumber"
                label="Phone Number"
              />

              {isEdit ? (
                <div className="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2">
                  <CustomDropDownSearchable
                    form={form}
                    name="industryId"
                    label="Industry"
                    placeholder="Select industry"
                    isLoading={loadingIndustry}
                    options={industryList?.data?.map((opt: any) => ({
                      value: opt.id,
                      label: opt.name,
                    }))}
                  />

                  <CustomDropDownSearchable
                    form={form}
                    name="productId"
                    label={
                      <span className="flex items-center gap-1">
                        Product
                        <span className="text-red-500">*</span>
                      </span>
                    }
                    placeholder="Select Product"
                    isLoading={loadingProductDropdown}
                    options={productDropdownList?.data?.map((opt: any) => ({
                      value: opt.id,
                      label: opt.name,
                    }))}
                  />
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2">
                    <CustomDatePicker
                      control={form.control}
                      name="demoDate"
                      label="Demo Date"
                    />

                    <CustomDropDownSearchable
                      form={form}
                      name="industryId"
                      label="Industry"
                      placeholder="Select industry"
                      isLoading={loadingIndustry}
                      options={industryList?.data?.map((opt: any) => ({
                        value: opt.id,
                        label: opt.name,
                      }))}
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2">
                    <CustomDropDownSearchable
                      form={form}
                      name="status"
                      label="Status"
                      placeholder="Select Status"
                      options={PRODUCT_INQUIRY_STATUS_OPTIONS}
                    />

                    <CustomDropDownSearchable
                      form={form}
                      name="productId"
                      label={
                        <span className="flex items-center gap-1">
                          Product
                          <span className="text-red-500">*</span>
                        </span>
                      }
                      placeholder="Select Product"
                      isLoading={loadingProductDropdown}
                      options={productDropdownList?.data?.map((opt: any) => ({
                        value: opt.id,
                        label: opt.name,
                      }))}
                    />
                  </div>
                </>
              )}

              <div className="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="numberOfUsers"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Number of Users</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="Enter number of users"
                          {...field}
                          value={field.value ?? ""}
                          onChange={(e) => {
                            const val = e.target.value;
                            field.onChange(val === "" ? null : Number(val));
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <TextInputField
                  control={form.control}
                  name="city"
                  label="City"
                  placeholder="Enter city"
                />
              </div>

              <div className="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2">
                <CustomDatePicker
                  control={form.control}
                  name="trialStartDate"
                  label="Trial Start Date"
                />

                <CustomDatePicker
                  control={form.control}
                  name="trialEndDate"
                  label="Trial End Date"
                  disabledDays={(date: Date) => {
                    const currentDate = startOfDay(date);
                    const minimumEndDate = startOfDay(trialStartDate ?? today);

                    return currentDate < minimumEndDate;
                  }}
                />
              </div>

              <CustomDatePicker
                control={form.control}
                name="inquiryDate"
                label={
                  <span className="flex items-center gap-1">
                    Inquiry Date
                    <span className="text-red-500">*</span>
                  </span>
                }
              />

              {selectedStatus === PRODUCT_INQUIRY_STATUS.OTHERS && (
                <div className="flex flex-col space-y-2">
                  {/* <FormLabel>Additional Notes for Others</FormLabel> */}
                  {/* <Textarea
                    {...form.register("others")}
                    placeholder="Add details for the selected status"
                    rows={3}
                    className="resize-none"
                  /> */}
                  <Input
                    type="text"
                    placeholder="Add details for the selected status"
                    {...form.register("others")}
                    className="resize-none"
                  />
                  {form.formState.errors.others?.message && (
                    <p className="text-sm font-medium text-destructive">
                      {form.formState.errors.others.message}
                    </p>
                  )}
                </div>
              )}

              <div className="flex flex-col space-y-2">
                <FormLabel>Requirements</FormLabel>
                <Textarea
                  {...form.register("requirements")}
                  placeholder="Enter requirements"
                  rows={3}
                  className="resize-none"
                />
              </div>

              <div className="flex flex-col space-y-2">
                <FormLabel>Notes</FormLabel>
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
          <CustomButton
            type="submit"
            form="product-inquiry-form"
            loading={loading}
          >
            {isEdit ? "Update Inquiry" : "Create Inquiry"}
          </CustomButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
