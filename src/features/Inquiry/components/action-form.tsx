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
import { InquirySchema, TInquirySchema } from "../schema";
import { INQUIRY_STATUS, roles } from "@/utils/constant";
import { PhoneInputField } from "@/components/shared/custom-phone-number-countrywise";
import { useGetCountryDropdownList } from "@/features/clients/services";
import { Input } from "@/components/ui/input";
// import { useGetInquiryType } from "@/features/inquiry-types/services";
import { useGetInquiryRequirement } from "@/features/Inquiry-requirements/services";
import { useGetInquiryCategoryDropdown } from "@/features/inquiry-channels/services";
import { useGetInboundSourceDropdown } from "@/features/inbound-sources/services";
import { useGetIndustryDropdownList } from "@/features/industry/services";
import { useGetInquiryDropdownList } from "@/features/inquiry-types/services";
import { useGetUserDropdownList } from "@/features/users/services";
import { useGetOutboundSourceDropdown } from "@/features/outbound-sources/services";
import { useGetDomainDropdownList } from "@/features/domain/services";
import { CustomDatePicker } from "@/components/shared/custome-datePicker";
import { cn } from "@/lib/utils";
import { useEffect, useMemo } from "react";

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

  const toNumberOrUndefined = (value: any): number | undefined => {
    if (value === null || value === undefined || value === "") return undefined;
    return Number(value);
  };

  const toNumberOrNull = (value: any) => {
    if (value === null || value === undefined || value === "") return null;
    return Number(value);
  };

  const getDefaultValues = (row?: any): Partial<TInquirySchema> => ({
    projectName: row?.projectName ?? "",
    clientName: row?.clientName ?? "",
    countryId: toNumberOrUndefined(row?.country?.id ?? row?.countryId),
    requirements: row?.modules?.map((item: any) => item?.id) ?? [],
    status: row?.status ?? "",
    notes: row?.notes ?? "",
    clientContactNo: row?.clientContactNo ?? null,
    clientCompanyName: row?.clientCompanyName ?? "",
    sourceOfInquiry: row?.sourceOfInquiry ?? "",
    clientEmailId: row?.clientEmailId ?? "",
    clientLinkedInProfile: row?.clientLinkedInProfile ?? "",
    inquirySourceId: toNumberOrUndefined(
      row?.inquirySource?.id ?? row?.inquirySourceId
    ),
    inboundSourceId: toNumberOrNull(
      row?.inboundSource?.id ?? row?.inboundSourceId
    ),
    outboundSourceId: toNumberOrNull(
      row?.outboundSource?.id ?? row?.outboundSourceId
    ),
    domainId: toNumberOrNull(row?.domain?.id ?? row?.domainId),
    industryId: toNumberOrNull(row?.industry?.id ?? row?.industryId),
    inquiryTypeId: toNumberOrUndefined(
      row?.inquiryType?.id ?? row?.inquiryTypeId
    ),
    salesPersonId: toNumberOrUndefined(
      row?.salesPerson?.id ?? row?.salesPersonId ?? row?.salesPerson?.userId
    ),
    coordinatorId: toNumberOrUndefined(
      row?.coordinator?.id ?? row?.coordinatorId ?? row?.coordinator?.userId
    ),
    inquiryDate: row?.inquiryDate ? new Date(row?.inquiryDate) : undefined,
  });

  const form = useForm<TInquirySchema>({
    resolver: zodResolver(InquirySchema) as any,
    defaultValues: getDefaultValues(currentRow),
  });

  // const onSubmit: SubmitHandler<TInquirySchema> = (values) => {
  //   console.log("FORM SUBMITTED ✅", values);
  //   onSubmitValues(values);
  // };

  useEffect(() => {
    if (isEdit && currentRow) {
      form.reset(getDefaultValues(currentRow));
    }
  }, [currentRow, form, isEdit]);

  const { data: typeList, isPending: loadingType }: any =
    useGetInquiryRequirement({
      pagination: false,
    });

  const { data: channelList, isPending: loadingChannel }: any =
    useGetInquiryCategoryDropdown();

  const { data: industryList, isPending: loadingIndustry }: any =
    useGetIndustryDropdownList();

  const { data: inboundList, isPending: loadingInbound }: any =
    useGetInboundSourceDropdown();

  const { data: outboundList, isPending: loadingOutbound }: any =
    useGetOutboundSourceDropdown();

  const { data: domainList, isPending: loadingDomain }: any =
    useGetDomainDropdownList();

  const { data: inquirytypeList, isPending: loadingInquiryType }: any =
    useGetInquiryDropdownList();

  const { data: salesPerson, isPending: salesPersonLoading }: any =
    useGetUserDropdownList({
      role: [roles.BDE],
      status: "active",
    });

  const inquiryChannelId = form.watch("inquirySourceId");

  const selectedChannel = channelList?.data?.find(
    (item: any) => item.id == inquiryChannelId
  );

  const { data: countryList, isPending: loadingCountry }: any =
    useGetCountryDropdownList();
  const inquiryOptions =
    typeList?.data?.map((item: any) => ({
      value: item?.id,
      label: item?.name,
    })) || [];
  useEffect(() => {
    if (loadingChannel || (inquiryChannelId && !selectedChannel)) return;

    if (selectedChannel?.name === "Inbound") {
      form.setValue("outboundSourceId", null);
    } else if (selectedChannel?.name === "Outbound") {
      form.setValue("inboundSourceId", null);
      form.setValue("domainId", null);
    } else if (!inquiryChannelId) {
      form.setValue("inboundSourceId", null);
      form.setValue("domainId", null);
      form.setValue("outboundSourceId", null);
    }
  }, [selectedChannel, form, loadingChannel, inquiryChannelId]);

  const onSubmit: SubmitHandler<TInquirySchema> = (values) => {
    if (selectedChannel?.name === "Inbound") {
      if (!values.inboundSourceId) {
        form.setError("inboundSourceId", {
          message: "Inbound source is required",
        });
        return;
      }
      // if (!values.domainId) {
      //   form.setError("domainId", {
      //     message: "Domain is required",
      //   });
      //   return;
      // }
    }
    if (selectedChannel?.name === "Outbound" && !values.outboundSourceId) {
      form.setError("outboundSourceId", {
        message: "Outbound source is required",
      });
      return;
    }
    onSubmitValues(values);
  };

  const coordinatorOptions = useMemo(() => {
    if (!salesPerson?.data) return [];

    const baseUsers = salesPerson.data.map((s: any) => ({
      value: s.id,
      label: s.fullName,
    }));

    const extraUsers = [
      { value: 134, label: "Piyush Patel" },
      { value: 1, label: "Jatin Vaghela" },
    ];

    return [...extraUsers, ...baseUsers];
  }, [salesPerson]);

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

              <TextInputField
                control={form.control}
                name="clientLinkedInProfile"
                label="Client LinkedIn Profile"
                placeholder="Enter client linkedIn profile"
              />

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
              {/* <TextInputField
                control={form.control}
                name="sourceOfInquiry"
                label="Source of Inquiry"
                placeholder="Enter source of inquiry"
              /> */}

              <FormField
                control={form.control}
                name="inquirySourceId"
                render={() => (
                  <FormItem>
                    <FormLabel>
                      Inquiry Channel <span className="text-red-500">*</span>
                    </FormLabel>
                    <CustomDropDownSearchable
                      form={form}
                      name="inquirySourceId"
                      label=""
                      // multiple
                      options={channelList?.data?.map((d: any) => ({
                        value: d.id,
                        label: d.name,
                      }))}
                      placeholder="Select Inquiry Channel"
                      searchEnabled={false}
                      isLoading={loadingChannel}
                    />
                  </FormItem>
                )}
              />

              {selectedChannel?.name === "Inbound" && (
                <>
                  <FormField
                    control={form.control}
                    name="inboundSourceId"
                    render={() => (
                      <FormItem>
                        <FormLabel>
                          Inbound Source
                          {/* <span className="text-red-500">*</span> */}
                        </FormLabel>
                        <CustomDropDownSearchable
                          form={form}
                          name="inboundSourceId"
                          label=""
                          // multiple
                          options={inboundList?.data?.map((i: any) => ({
                            value: i?.id,
                            label: i?.name,
                          }))}
                          placeholder="Select Inbound Source"
                          searchEnabled={false}
                          isLoading={loadingInbound}
                        />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="domainId"
                    render={() => (
                      <FormItem>
                        <FormLabel>
                          Domain
                          {/* <span className="text-red-500">*</span> */}
                        </FormLabel>
                        <CustomDropDownSearchable
                          form={form}
                          name="domainId"
                          label=""
                          // multiple
                          options={domainList?.data?.map((dm: any) => ({
                            value: dm?.id,
                            label: dm?.name,
                          }))}
                          placeholder="Select Domain"
                          searchEnabled={false}
                          isLoading={loadingDomain}
                        />
                      </FormItem>
                    )}
                  />
                </>
              )}

              {selectedChannel?.name === "Outbound" && (
                <FormField
                  control={form.control}
                  name="outboundSourceId"
                  render={() => (
                    <FormItem>
                      <FormLabel>
                        Outbound Source
                        {/* <span className="text-red-500">*</span> */}
                      </FormLabel>
                      <CustomDropDownSearchable
                        form={form}
                        name="outboundSourceId"
                        label=""
                        // multiple
                        options={outboundList?.data?.map((i: any) => ({
                          value: i?.id,
                          label: i?.name,
                        }))}
                        placeholder="Select Outbound Source"
                        searchEnabled={false}
                        isLoading={loadingOutbound}
                      />
                    </FormItem>
                  )}
                />
              )}

              <FormField
                control={form.control}
                name="industryId"
                render={() => (
                  <FormItem>
                    <FormLabel>
                      Industry Type
                      {/* <span className="text-red-500">*</span> */}
                    </FormLabel>
                    <CustomDropDownSearchable
                      form={form}
                      name="industryId"
                      label=""
                      // multiple
                      options={industryList?.data?.map((ind: any) => ({
                        value: ind.id,
                        label: ind.name,
                      }))}
                      placeholder="Select Industry Type"
                      searchEnabled={false}
                      isLoading={loadingIndustry}
                    />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="inquiryTypeId"
                render={() => (
                  <FormItem>
                    <FormLabel>
                      Inquiry Type<span className="text-red-500">*</span>
                    </FormLabel>
                    <CustomDropDownSearchable
                      form={form}
                      name="inquiryTypeId"
                      label=""
                      // multiple
                      options={inquirytypeList?.data?.map((iq: any) => ({
                        value: iq.id,
                        label: iq.name,
                      }))}
                      placeholder="Select Inquiry Type"
                      searchEnabled={false}
                      isLoading={loadingInquiryType}
                    />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="salesPersonId"
                render={() => (
                  <FormItem>
                    <FormLabel>
                      Sales person<span className="text-red-500">*</span>
                    </FormLabel>
                    <CustomDropDownSearchable
                      form={form}
                      name="salesPersonId"
                      label=""
                      // multiple
                      options={salesPerson?.data?.map((s: any) => ({
                        value: s.id,
                        label: s.fullName,
                      }))}
                      placeholder="Select Sales person"
                      searchEnabled={false}
                      isLoading={salesPersonLoading}
                    />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="coordinatorId"
                render={() => (
                  <FormItem>
                    <FormLabel>
                      Coordinator<span className="text-red-500">*</span>
                    </FormLabel>
                    <CustomDropDownSearchable
                      form={form}
                      name="coordinatorId"
                      label=""
                      // multiple
                      options={coordinatorOptions}
                      placeholder="Select Coordinator"
                      searchEnabled={false}
                      isLoading={salesPersonLoading}
                    />
                  </FormItem>
                )}
              />

              {/* Type Dropdown */}
              {/* </div> */}
              <FormField
                control={form.control}
                name="requirements"
                render={() => (
                  <FormItem>
                    <FormLabel>
                      Inquiry Requirement{" "}
                      <span className="text-red-500">*</span>
                    </FormLabel>
                    <CustomDropDownSearchable
                      form={form}
                      name="requirements"
                      label=""
                      multiple
                      options={inquiryOptions}
                      placeholder="Select Inquiry Requirement"
                      searchEnabled={false}
                      isLoading={loadingType}
                    />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="inquiryDate"
                render={({ fieldState }) => (
                  <FormItem>
                    <FormLabel
                      className={cn(
                        "flex items-center gap-1",
                        fieldState.error && "text-red-500"
                      )}
                    >
                      Inquiry Date
                      <span className="text-red-500">*</span>
                    </FormLabel>
                    <CustomDatePicker
                      control={form.control}
                      name="inquiryDate"
                      label=""
                      // disabled={!canEdit}
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
