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
        }
      : {
          reason: "",
          projectId: "",
          amount: "",
          cardLast4: "",
          transactionDate: undefined,
          transactionType: "",
          subscriptionCycle: "",
        },
  });

  const transactionType = form.watch("transactionType");

  const onSubmit: SubmitHandler<TTransactionFormSchema> = (values) => {
    const payload = {
      ...values,
      transactionDate: new Date(values.transactionDate).toISOString(),
      ...(values.transactionType === "subscription"
        ? { subscriptionCycle: values.subscriptionCycle }
        : { subscriptionCycle: undefined }),
      // Convert empty projectId to undefined
      projectId: values.projectId || undefined,
    };

    if (payload.transactionType !== "subscription") {
      delete payload.subscriptionCycle;
    }

    onSubmitValues(payload as any);
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
              />
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
              <TextInputField
                control={form.control}
                name="amount"
                type="number"
                label="Transaction Amount"
                placeholder="Enter amount"
              />
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
