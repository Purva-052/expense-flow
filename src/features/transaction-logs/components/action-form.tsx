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
import { transactionLogSchema, TTransactionFormSchema } from "../schema";
import CustomDropDownSearchable from "@/components/shared/custome-searchable-dropdown";
import {
  CurrencyType,
  roles,
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
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { BadgeDollarSign } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/use-auth-store";
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
          currency: currentRow?.currency ?? "usd",
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
          currency: "usd",
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

  const user = useAuthStore((state) => state.user);
  const userRole = user?.role || user?.user?.role;
  const currentUserId = user?.user_id;

  const isAdmin = userRole === roles.ADMIN;
  const creatorId = currentRow?.user?.id || currentRow?.user?._id || currentRow?.userId;
  const isCreator = String(creatorId) === String(currentUserId);
  const isPMorTL =
    userRole === roles.PROJECT_MANAGER || userRole === roles.TEAM_LEAD;

  const canEdit = !isEdit || isAdmin || (isPMorTL && isCreator);

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
      <DialogContent className="sm:max-w-lg max-h-[80vh] overflow-auto">
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
              {/* 1️⃣ Project */}
              <CustomDropDownSearchable
                form={form}
                name="projectId"
                label="Project"
                options={projectsList?.data?.map((project: any) => ({
                  value: project.id,
                  label: project.name,
                }))}
                placeholder="Select project"
                isLoading={projectsListLoading}
                sortOptions={false}
                disabled={!canEdit}
              />

              {/* 2️⃣ Transaction Details */}
              <div className="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="transactionType"
                  render={({ fieldState }) => (
                    <FormItem>
                      <FormLabel
                        className={cn(
                          "flex items-center gap-1",
                          fieldState.error && "text-red-500"
                        )}
                      >
                        Transaction Type
                        <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <CustomDropDownSearchable
                          form={form}
                          name="transactionType"
                          label=""
                          options={TransactionTypeOptions}
                          placeholder="Select transaction type"
                          searchEnabled={false}
                          disabled={!canEdit}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <FormLabel
                        className={cn(
                          "flex items-center gap-1",
                          fieldState.error && "text-red-500"
                        )}
                      >
                        Amount
                        <span className="text-red-500">*</span>
                      </FormLabel>

                      <FormControl>
                        <div className="flex items-center w-full h-fit">
                          {/* Currency dropdown – same as before */}
                          <FormField
                            control={form.control}
                            name="currency"
                            render={({ field: currencyField }) => {
                              const selectedCurrency = CurrencyType.find(
                                (c) => c.value === currencyField.value
                              );
                              const IconComponent =
                                selectedCurrency?.icon || BadgeDollarSign;

                              return (
                                <Select
                                  onValueChange={currencyField.onChange}
                                  value={currencyField.value}
                                  disabled={!canEdit}
                                >
                                  <SelectTrigger className="h-10 w-[95px] rounded-r-none border-r-0 bg-muted/50">
                                    <div className="flex items-center gap-2">
                                      <IconComponent
                                        className={`h-4 w-4 ${selectedCurrency?.color}`}
                                      />
                                      <span className="font-medium">
                                        {selectedCurrency?.label}
                                      </span>
                                    </div>
                                  </SelectTrigger>
                                  <SelectContent>
                                    {CurrencyType.map((item) => (
                                      <SelectItem
                                        key={item.value}
                                        value={item.value}
                                      >
                                        <div className="flex items-center gap-2">
                                          <item.icon
                                            className={`h-4 w-4 ${item.color}`}
                                          />
                                          <span>{item.label}</span>
                                        </div>
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              );
                            }}
                          />

                          <Input
                            {...field}
                            type="text"
                            placeholder="0.00"
                            className={cn(
                              "flex-1 rounded-l-none -ml-px",
                              fieldState.error && "border-red-500"
                            )}
                            onKeyDown={preventNegativeInput}
                            onPaste={preventNegativePaste}
                            disabled={!canEdit}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="transactionDate"
                  render={({ fieldState }) => (
                    <FormItem>
                      <FormLabel
                        className={cn(
                          "flex items-center gap-1",
                          fieldState.error && "text-red-500"
                        )}
                      >
                        Transaction Date
                        <span className="text-red-500">*</span>
                      </FormLabel>
                      <CustomDatePicker
                        control={form.control}
                        name="transactionDate"
                        label=""
                        disabled={!canEdit}
                      />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="cardLast4"
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <FormLabel
                        className={cn(
                          "flex items-center gap-1",
                          fieldState.error && "text-red-500"
                        )}
                      >
                        Card Last 4 Digits
                        <span className="text-red-500">*</span>
                      </FormLabel>

                      <FormControl>
                        <Input
                          {...field}
                          placeholder="XXXX"
                          maxLength={4}
                          className={cn(fieldState.error && "border-red-500")}
                          disabled={!canEdit}
                        />
                      </FormControl>

                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* 3️⃣ Subscription Details (Conditional) */}
              {transactionType === "subscription" && (
                <div className="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2">
                  <CustomDropDownSearchable
                    form={form}
                    name="subscriptionCycle"
                    label="Subscription Cycle"
                    options={SubscriptionTypeOptions}
                    placeholder="Select cycle"
                    searchEnabled={false}
                    disabled={!canEdit}
                  />

                  <CustomDatePicker
                    control={form.control}
                    name="subscriptionEndDate"
                    label="Subscription End Date"
                    placeholder="Select end date"
                    disabled={!canEdit}
                  />
                </div>
              )}

              {/* 4️⃣ Payment Info */}

              {/* 5️⃣ Receipt Upload */}
              <FileUpload
                name="file"
                label="Transaction Receipt"
                fileLabel="PDF, DOC, DOCX, JPG, JPEG (MAX 25MB)"
                onFileSelect={undefined}
                onFileRemove={handleFileRemove}
                existingFileUrl={
                  hasExistingFile && currentRow?.referenceFileLink
                    ? currentRow.referenceFileLink
                    : undefined
                }
                existingFileName={
                  hasExistingFile && currentRow?.referenceFileLink
                    ? "Transaction Reference File"
                    : undefined
                }
                acceptedFormats={{
                  "application/pdf": [".pdf"],
                  "application/msword": [".doc"],
                  "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
                    [".docx"],
                  "image/jpeg": [".jpg", ".jpeg"],
                  "image/jpg": [".jpg"],
                }}
                disabled={!canEdit}
              />

              {/* 6️⃣ Reason */}
              <FormField
                control={form.control}
                name="reason"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormLabel
                      className={cn(
                        "flex items-center gap-1",
                        fieldState.error && "text-red-500"
                      )}
                    >
                      Reason
                      <span className="text-red-500">*</span>
                    </FormLabel>

                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="Any additional notes about the transaction..."
                        className={cn(fieldState.error && "border-red-500")}
                        disabled={!canEdit}
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
          <CustomButton
            type="submit"
            form="company-form"
            loading={loading}
            disabled={!canEdit}
          >
            Save Changes
          </CustomButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
