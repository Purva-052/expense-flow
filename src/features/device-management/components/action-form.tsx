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
import { Input } from "@/components/ui/input";
import { DeviceSchema, TDeviceSchema } from "../schema";
import CustomDropDownSearchable from "@/components/shared/custome-searchable-dropdown";
import { useGetBrandDropdown } from "@/features/system-inventory/services";

interface Props {
  currentRow?: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  loading?: boolean;
  onSubmit: (values: TDeviceSchema) => void;
}

export function DeviceForm({
  currentRow,
  open,
  onOpenChange,
  onSubmit: onSubmitValues,
  loading,
}: Readonly<Props>) {
  const isEdit = !!currentRow;

  const { data: brandDetails, isPending: brandLoading }: any =
    useGetBrandDropdown();

  const OPERATING_SYSTEM_OPTIONS = [
    { value: "Android", label: "Android" },
    { value: "iOS", label: "iOS" },
    { value: "other", label: "Other" },
  ];

  const form = useForm<TDeviceSchema>({
    resolver: zodResolver(DeviceSchema) as any,
    defaultValues: {
      brandId: currentRow?.brandId || undefined,
      modelName: currentRow?.modelName || "",
      osType: currentRow?.osType || undefined,
      serialNumber: currentRow?.serialNumber || "",
      ...currentRow,
    },
  });

  const onSubmit: SubmitHandler<TDeviceSchema> = (values: any) => {
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
        <DialogHeader className="text-left">
          <DialogTitle>{isEdit ? "Edit Device" : "Add Device"}</DialogTitle>
        </DialogHeader>

        <div className="-mr-4 h-fit w-full overflow-y-auto py-1">
          <Form {...form}>
            <form
              id="device-form"
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-4 p-0.5"
            >
              <CustomDropDownSearchable
                form={form}
                name="brandId"
                label="Brand"
                options={brandDetails?.data?.map((b: any) => ({
                  value: b.id,
                  label: b.name,
                }))}
                placeholder="Select brand"
                isLoading={brandLoading}
                sortOptions={false}
              />

              <FormField
                control={form.control}
                name="modelName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Model Name <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="Enter Model Name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <CustomDropDownSearchable
                form={form}
                name="osType"
                label="Operating System"
                options={OPERATING_SYSTEM_OPTIONS}
                placeholder="Select operating system"
                isLoading={brandLoading}
                sortOptions={false}
              />

              <FormField
                control={form.control}
                name="serialNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Serial Number <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="Enter Serial Number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
          </Form>
        </div>

        <DialogFooter>
          <CustomButton type="submit" loading={loading} form="device-form">
            Save Changes
          </CustomButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
