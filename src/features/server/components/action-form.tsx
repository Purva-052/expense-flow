/* eslint-disable @typescript-eslint/no-explicit-any */
import CustomButton from "@/components/shared/custom-button";
import CustomDropDownSearchable from "@/components/shared/custome-searchable-dropdown";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { ServerSchema, TServerSchema } from "../schema";
import { ServerOwnerTypeOptions } from "@/utils/constant";

interface Props {
  currentRow?: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  loading?: boolean;
  onSubmit: (values: TServerSchema) => void;
}

export function ServerActionForm({
  currentRow,
  open,
  onOpenChange,
  onSubmit: onSubmitValues,
  loading,
}: Readonly<Props>) {
  const isEdit = !!currentRow;

  const form = useForm<TServerSchema>({
    resolver: zodResolver(ServerSchema),
    defaultValues: {
      ip: currentRow?.ip ?? "",
      ownerName: currentRow?.ownerName ?? "",
      ssl: currentRow?.ssl ?? true,
    },
  });

  const onSubmit: SubmitHandler<TServerSchema> = (values) => {
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
      <DialogContent className="sm:max-w-lg max-h-[80vh] overflow-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Server" : "Add Server"}</DialogTitle>
        </DialogHeader>

        <div className="h-fit w-full overflow-y-auto py-1">
          <Form {...form}>
            <form
              id="server-form"
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-4 p-0.5"
            >
              {/* IP / URL */}
              <Controller
                control={form.control}
                name={"ip"}
                render={({ field, fieldState }) => (
                  <div className="flex flex-col gap-1">
                    <label htmlFor={field.name} className="font-medium text-sm">
                      IP Address
                    </label>
                    <Input
                      {...field}
                      onChange={(e) => {
                        const filtered = e.target.value.replace(/[^0-9.]/g, ""); // only digits and dots
                        field.onChange(filtered);
                      }}
                      placeholder="192.168.1.XX"
                    />
                    {fieldState?.error?.message && (
                      <p className="text-sm text-red-500">
                        {fieldState.error.message}
                      </p>
                    )}
                  </div>
                )}
              />

              {/* Owner Dropdown */}
              <CustomDropDownSearchable
                form={form}
                name="ownerName"
                label="Owner"
                options={ServerOwnerTypeOptions}
                placeholder="Select Owner"
                searchEnabled={false}
              />

              {/* SSL / NONSSL */}
              <div className="flex items-center justify-between border rounded-md p-3">
                <Label className="text-sm font-medium">SSL Enabled</Label>
                <Switch
                  checked={form.watch("ssl")}
                  onCheckedChange={(checked) => form.setValue("ssl", checked)}
                />
              </div>
            </form>
          </Form>
        </div>

        <DialogFooter>
          <CustomButton type="submit" form="server-form" loading={loading}>
            Save Changes
          </CustomButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
