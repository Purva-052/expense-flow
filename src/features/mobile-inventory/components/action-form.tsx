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
import { MobileInventorySchema, TMobileInventorySchema } from "../schema";
import CustomDropDownSearchable from "@/components/shared/custome-searchable-dropdown";
import { useGetBrandDropdown } from "@/features/system-inventory/services";
import { useGetUserDropdownList } from "@/features/users/services";

interface Props {
  currentRow?: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  loading?: boolean;
  onSubmit: (values: TMobileInventorySchema) => void;
}

export function MobileInventoryForm({
  currentRow,
  open,
  onOpenChange,
  onSubmit: onSubmitValues,
  loading,
}: Readonly<Props>) {
  const isEdit = !!currentRow;

  const { data: brandDetails, isPending: brandLoading }: any =
    useGetBrandDropdown();

  const { data: usersList, isPending: usersLoading }: any =
    useGetUserDropdownList({ role: ["team_lead", "project_manager"] });

  const form = useForm<TMobileInventorySchema>({
    resolver: zodResolver(MobileInventorySchema) as any,
    defaultValues: {
      ...currentRow,
      brandId: currentRow?.brand?.id || currentRow?.brandId || undefined,
      model: currentRow?.model || "",
      color: currentRow?.color || "",
      os: currentRow?.os || "",
      serialNumber: currentRow?.serialNumber || "",
      allocateTo: currentRow?.allocateTo?.id || currentRow?.allocateTo || undefined,
    },
  });

  const onSubmit: SubmitHandler<TMobileInventorySchema> = (values: any) => {
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
          <DialogTitle>{isEdit ? "Edit Inventory" : "Add Inventory"}</DialogTitle>
        </DialogHeader>

        <div className="-mr-4 h-fit w-full overflow-y-auto py-1">
          <Form {...form}>
            <form
              id="mobile-inventory-form"
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-4 p-0.5"
            >
              <CustomDropDownSearchable
                form={form}
                name="brandId"
                label={
                  <span className="flex items-center gap-1">
                    Brand
                    <span className="text-red-500">*</span>
                  </span>
                }
                options={brandDetails?.data?.map((b: any) => ({
                  value: b.id,
                  label: b.name,
                }))}
                placeholder="Select Brand"
                searchEnabled={false}
                isLoading={brandLoading}
              />

              <FormField
                control={form.control}
                name="model"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Model <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="Enter Model" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="color"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Color <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="Enter Color" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="os"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      OS <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="Enter OS" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
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

              <CustomDropDownSearchable
                form={form}
                name="allocateTo"
                label="Allocate To (User)"
                options={usersList?.data?.map((u: any) => ({
                  value: u.id,
                  label: u.fullName || u.name || `${u.firstName || ''} ${u.lastName || ''}`.trim() || `User ${u.id}`,
                }))}
                placeholder="Select User"
                searchEnabled={true}
                isLoading={usersLoading}
              />
            </form>
          </Form>
        </div>

        <DialogFooter>
          <CustomButton type="submit" loading={loading} form="mobile-inventory-form">
            Save Changes
          </CustomButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
