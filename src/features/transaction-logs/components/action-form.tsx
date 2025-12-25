/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
import CustomButton from "@/components/shared/custom-button";
import { TextInputField } from "@/components/shared/custom-input-field";
import { transactionLogSchema, TTransactionFormSchema } from "../schema";
import CustomDropDownSearchable from "@/components/shared/custome-searchable-dropdown";
import {
  SubscriptionTypeOptions,
  TransactionTypeOptions,
} from "@/utils/constant";
import { Textarea } from "@/components/ui/textarea";
import { CustomDatePicker } from "@/components/shared/custome-datePicker";
import {
  preventNegativeInput,
  preventNegativePaste,
} from "@/utils/commonFunctions";
import { FileUpload } from "@/components/shared/custome-file-upload";
import { useUploadTransactionFile } from "../services";
// import { useTimezoneSelect, allTimezones } from "react-timezone-select";
// import CustomDropDownSearchable from "@/components/shared/custome-searchable-dropdown";
// import { useGetCountryDropdownList } from "../services";

interface Props {
  currentRow?: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectsList: any;
  projectsListLoading: boolean;
  loading?: boolean;
  onSubmit: (values: TTransactionFormSchema) => void;
}

export function TransactionLogsActionForm({
  currentRow,
  open,
  onOpenChange,
  projectsList,
  projectsListLoading,
  onSubmit: onSubmitValues,
  loading,
}: Readonly<Props>) {
  const isEdit = !!currentRow;

  const form = useForm<TTransactionFormSchema>({
    resolver: zodResolver(transactionLogSchema) as any,
    mode: "onSubmit", // or "onChange" / "onBlur" / "onTouched"
    reValidateMode: "onChange",
    defaultValues: isEdit
      ? {
          reason: currentRow?.reason ?? "",
          projectId: currentRow?.projectId ? String(currentRow.projectId) : "",
          amount: currentRow?.amount ?? "",
          cardLast4: currentRow?.cardLast4 ?? "",
          transactionDate: currentRow?.transactionDate
            ? new Date(currentRow.transactionDate)
            : undefined,
          transactionType: currentRow?.transactionType ?? "",
          subscriptionCycle: currentRow?.subscriptionCycle ?? "",
          subscriptionEndDate: currentRow?.subscriptionEndDate
            ? new Date(currentRow.subscriptionEndDate)
            : undefined,
          referenceFileS3Key: currentRow?.referenceFileLink ?? "",
          file: null,
        }
      : {
          reason: "",
          projectId: "",
          amount: "",
          cardLast4: "",
          transactionDate: undefined,
          transactionType: "",
          subscriptionCycle: "",
          subscriptionEndDate: undefined,
          referenceFileS3Key: "",
          file: null,
        },
  });
  const [uploadedFileKey, setUploadedFileKey] = useState<string>("");
  const [hasExistingFile, setHasExistingFile] = useState(false);
  const { mutateAsync: uploadFile } = useUploadTransactionFile();

  const transactionType = form.watch("transactionType");

  useEffect(() => {
    if (currentRow && open) {
      setUploadedFileKey(currentRow.referenceFileLink || "");
      setHasExistingFile(!!currentRow.referenceFileLink);
    }
  }, [currentRow, open]);

  useEffect(() => {
    if (transactionType === "subscription") {
      form.trigger(["subscriptionCycle", "subscriptionEndDate"]);
    } else {
      form.clearErrors(["subscriptionCycle", "subscriptionEndDate"]);
    }
  }, [transactionType, form]);

  const handleFileRemove = () => {
    setUploadedFileKey("");
    setHasExistingFile(false);

    form.setValue("file", null, { shouldValidate: true });
    form.setValue("referenceFileS3Key", "", { shouldValidate: true });

    form.clearErrors("file");
    form.clearErrors("referenceFileS3Key");
  };

  const onSubmit: SubmitHandler<TTransactionFormSchema> = async (values) => {
    let finalFileKey = uploadedFileKey || values.referenceFileS3Key || "";

    const fileToUpload = values.file;
    if (fileToUpload instanceof File) {
      const formData = new FormData();
      formData.append("file", fileToUpload);
      formData.append("folder", "transaction-documents");

      try {
        const response: any = await uploadFile(formData);
        if (response?.key) {
          finalFileKey = response.key;
        }
      } catch (error) {
        console.error("Upload failed", error);
        return;
      }
    }

    const payload: any = {
      ...values,
      referenceFileS3Key: finalFileKey,
      transactionDate: new Date(values.transactionDate).toISOString(),
      subscriptionEndDate:
        values.transactionType === "subscription" && values.subscriptionEndDate
          ? new Date(values.subscriptionEndDate).toISOString()
          : undefined,
      subscriptionCycle:
        values.transactionType === "subscription"
          ? values.subscriptionCycle
          : undefined,
      // Convert empty projectId to undefined
      projectId: values.projectId || undefined,
    };

    if (payload.transactionType !== "subscription") {
      delete payload.subscriptionCycle;
      delete payload.subscriptionEndDate;
    }

    onSubmitValues(payload);
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
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Edit Transaction" : "Add Transaction"}
          </DialogTitle>
        </DialogHeader>

        <div className="h-fit w-full overflow-y-auto py-1">
          <Form {...form}>
            <form
              id="company-form"
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-4 p-0.5"
            >
              <CustomDropDownSearchable
                form={form}
                name="projectId"
                label="Project"
                options={projectsList?.data?.map((project: any) => {
                  return { value: project.id, label: project.name };
                })}
                placeholder="Select project"
                isLoading={projectsListLoading}
                sortOptions={false}
              />
              <div className="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2">
                <CustomDropDownSearchable
                  form={form}
                  name="transactionType"
                  label="Transaction Type"
                  options={TransactionTypeOptions}
                  placeholder="Select Transaction Type"
                  searchEnabled={false}
                />

                {transactionType === "subscription" && (
                  <CustomDropDownSearchable
                    form={form}
                    name="subscriptionCycle"
                    label="Subscription Cycle"
                    options={SubscriptionTypeOptions}
                    placeholder="Select cycle"
                    searchEnabled={false}
                  />
                )}

                {transactionType === "subscription" && (
                  <CustomDatePicker
                    control={form.control}
                    name="subscriptionEndDate"
                    label="Subscription End Date"
                    placeholder="Select end date"
                  />
                )}

                <TextInputField
                  control={form.control}
                  name="amount"
                  type="number"
                  label="Transaction Amount"
                  placeholder="Enter amount"
                  min={0}
                  onKeyDown={preventNegativeInput}
                  onPaste={preventNegativePaste}
                />
              </div>

              <div className="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2">
                <TextInputField
                  control={form.control}
                  name="cardLast4"
                  label="Card Last 4 Digits"
                  placeholder="Enter card last 4 digits"
                />
                <CustomDatePicker
                  control={form.control}
                  name="transactionDate"
                  label="Transaction Date"
                />
              </div>

              <FileUpload
                name="file"
                label="Transaction Receipt"
                onFileSelect={undefined}
                onFileRemove={handleFileRemove}
                existingFileUrl={
                  hasExistingFile && currentRow?.referenceFileLink
                    ? currentRow.referenceFileLink
                    : undefined
                }
                existingFileName={
                  hasExistingFile && currentRow?.referenceFileLink
                    ? `Transaction Reference File`
                    : undefined
                }
              />

              <FormField
                control={form.control}
                name="reason"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Reason</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Any additional notes about the transaction..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
          </Form>
        </div>

        <DialogFooter>
          <CustomButton type="submit" form="company-form" loading={loading}>
            Save Changes
          </CustomButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
