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
import { clientFormSchema, TClientFormSchema } from "../schema";
import { useTimezoneSelect, allTimezones } from "react-timezone-select";
import CustomDropDownSearchable from "@/components/shared/custome-searchable-dropdown";
import { useGetCountryDropdownList } from "../services";
import { Input } from "@/components/ui/input";
import { PRIORITY_OPTIONS } from "@/utils/constant";

interface Props {
  currentRow?: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  loading?: boolean;
  onSubmit: (values: TClientFormSchema) => void;
}

export function ClientActionForm({
  currentRow,
  open,
  onOpenChange,
  onSubmit: onSubmitValues,
  loading,
}: Readonly<Props>) {
  const labelStyle = "original";
  const timezones = {
    ...allTimezones,
    "Europe/Berlin": "Frankfurt",
  };

  const { options } = useTimezoneSelect({
    labelStyle,
    timezones,
  });

  const { data: countryList, isPending: loadingCountry }: any =
    useGetCountryDropdownList();

  const isEdit = !!currentRow;

  const form = useForm<TClientFormSchema>({
    resolver: zodResolver(clientFormSchema) as any,
    defaultValues: isEdit
      ? {
          name: currentRow?.name ?? "",
          company: currentRow?.company ?? "",
          priority: currentRow?.priority ?? 2,
          countryId: currentRow?.country?.id ?? "",
          timezone: currentRow?.timezone ?? "",
        }
      : {
          name: "",
          company: "",
          priority: 2,
          countryId: "",
          timezone: "",
        },
  });

  const onSubmit: SubmitHandler<TClientFormSchema> = (values) => {
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
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Client" : "Add Client"}</DialogTitle>
        </DialogHeader>

        <div className="h-fit w-full overflow-y-auto py-1">
          <Form {...form}>
            <form
              id="company-form"
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-4 p-0.5"
            >
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Name <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="Enter name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <TextInputField
                control={form.control}
                name="company"
                label="Company"
                placeholder="Enter company"
              />

              <FormField
                control={form.control}
                name="priority"
                render={() => (
                  <FormItem>
                    <FormLabel>
                      Priority<span className="text-red-500">*</span>
                    </FormLabel>
                    <CustomDropDownSearchable
                      form={form}
                      name="priority"
                      label=""
                      placeholder="Select priority"
                      sortOptions={false}
                      options={PRIORITY_OPTIONS}
                      searchEnabled={false}
                      // change for the country id fixing
                    />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="countryId"
                render={() => (
                  <FormItem>
                    <FormLabel>
                      Country<span className="text-red-500">*</span>
                    </FormLabel>
                    <CustomDropDownSearchable
                      form={form}
                      name="countryId"
                      label=""
                      placeholder="Select country"
                      sortOptions={false}
                      options={countryList?.data?.map((opt: any) => {
                        return { value: opt.id, label: opt.name };
                      })}
                      // change for the country id fixing
                    />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="timezone"
                render={() => (
                  <FormItem>
                    <FormLabel>
                      Timezone<span className="text-red-500">*</span>
                    </FormLabel>
                    <CustomDropDownSearchable
                      form={form}
                      name="timezone"
                      label=""
                      isLoading={loadingCountry}
                      sortOptions={true}
                      options={options?.map((opt) => {
                        return { value: opt.value, label: opt.label };
                      })}
                      placeholder="Select Timezone"
                      searchEnabled={true}
                    />
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
