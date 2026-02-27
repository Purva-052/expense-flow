/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect } from "react";
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
import { toolsSchema, TToolsFormSchema } from "../schema";
import CustomDropDownSearchable from "@/components/shared/custome-searchable-dropdown";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { CustomDatePicker } from "@/components/shared/custome-datePicker";

interface Props {
  currentRow?: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  loading?: boolean;
  onSubmit: (values: TToolsFormSchema) => void;
  usersList: any;
  usersListLoading: any;
}

export function ToolsActionForm({
  currentRow,
  open,
  onOpenChange,
  usersList,
  usersListLoading,
  onSubmit: onSubmitValues,
  loading,
}: Readonly<Props>) {
  const isEdit = !!currentRow;

  const form = useForm<TToolsFormSchema>({
    resolver: zodResolver(toolsSchema) as any,
    mode: "onSubmit",
    reValidateMode: "onChange",
    defaultValues: {
      toolName: "",
      description: "",
      purchaseDate: undefined,
      expiryDate: undefined,
      purchasedBy: undefined,
    },
  });

  useEffect(() => {
    if (currentRow && open) {
      // Handle purchasedBy being an object in list response ({id, name}) but needing ID for form
      const rowPurchasedById =
        currentRow.purchasedBy?.id ?? currentRow.purchasedBy;

      form.reset({
        toolName: currentRow.toolName ?? "",
        description: currentRow.description ?? "",
        purchaseDate: currentRow.purchaseDate
          ? new Date(currentRow.purchaseDate)
          : undefined,
        expiryDate: currentRow.expiryDate
          ? new Date(currentRow.expiryDate)
          : undefined,
        purchasedBy: rowPurchasedById,
      });
    }
    if (!open) {
      form.reset();
    }
  }, [currentRow, open, form]);

  const onSubmit: SubmitHandler<TToolsFormSchema> = async (values) => {
    // Format dates to ISO strings as per payload example usually requires,
    // or keep as Date objects depending on your axios interceptor.
    // Assuming backend accepts ISO string based on example: "2023-01-15T00:00:00.000Z"

    onSubmitValues(values);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Tool" : "Add Tool"}</DialogTitle>
        </DialogHeader>

        <div className="h-fit w-full overflow-y-auto py-2">
          <Form {...form}>
            <form
              id="tools-form"
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-4 p-0.5"
            >
              {/* Tool Name */}
              <FormField
                control={form.control}
                name="toolName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Tool Name <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="e.g. GitLab" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {/* Purchase Date */}
                <FormField
                  control={form.control}
                  name="purchaseDate"
                  render={() => (
                    <FormItem>
                      <FormLabel>
                        Purchase Date <span className="text-red-500">*</span>
                      </FormLabel>
                      <CustomDatePicker
                        control={form.control}
                        name="purchaseDate"
                        label=""
                        triggerClassName="h-9"
                      />
                    </FormItem>
                  )}
                />

                {/* Expiry Date */}
                <FormField
                  control={form.control}
                  name="expiryDate"
                  render={() => (
                    <FormItem>
                      <FormLabel>
                        Expiry Date <span className="text-red-500">*</span>
                      </FormLabel>
                      <CustomDatePicker
                        control={form.control}
                        name="expiryDate"
                        label=""
                        triggerClassName="h-9"
                      />
                    </FormItem>
                  )}
                />
              </div>

              {/* Purchased By */}
              <CustomDropDownSearchable
                form={form}
                name="purchasedBy"
                label={
                  <>
                    Purchased By <span className="text-red-500">*</span>
                  </>
                }
                options={usersList?.data?.map((user: any) => ({
                  value: user.id,
                  label: user.fullName || user.name,
                }))}
                placeholder="Select user"
                isLoading={usersListLoading}
                triggerClassName="h-9"
              />

              {/* Description */}
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Description <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <div className="space-y-1">
                        <Textarea
                          {...field}
                          maxLength={150}
                          placeholder="Tool description..."
                          className="w-full max-w-full resize-none break-all whitespace-pre-wrap overflow-y-auto overflow-x-hidden pr-4 pb-2 min-h-[80px]"
                        />
                        <div className="text-xs text-muted-foreground text-right">
                          {field.value?.length || 0}/150
                        </div>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
          </Form>
        </div>

        <DialogFooter>
          <CustomButton type="submit" form="tools-form" loading={loading}>
            {isEdit ? "Update" : "Save"}
          </CustomButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
