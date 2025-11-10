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
import { Form } from "@/components/ui/form";
import CustomButton from "@/components/shared/custom-button";
import { TextInputField } from "@/components/shared/custom-input-field";
import CustomDropDownSearchable from "@/components/shared/custome-searchable-dropdown";
import { ServerSchema, TServerSchema } from "../schema";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

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
      ipOrUrl: currentRow?.ipOrUrl ?? "",
      type: currentRow?.type ?? "",
      owner: currentRow?.owner ?? "",
      ssl: currentRow?.ssl ?? true,
      serverId: currentRow?.serverId ?? "",
      status: currentRow?.status ?? "",
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
              <TextInputField
                control={form.control}
                name="ipOrUrl"
                label="IP / URL"
                placeholder="Enter IP address or URL"
              />

              {/* Type Dropdown */}
              <CustomDropDownSearchable
                form={form}
                name="type"
                label="Type"
                options={[
                  { value: "frontend", label: "Frontend" },
                  { value: "backend", label: "Backend" },
                  { value: "s3", label: "S3" },
                ]}
                placeholder="Select Type"
                searchEnabled={false}
              />

              {/* Owner Dropdown */}
              <CustomDropDownSearchable
                form={form}
                name="owner"
                label="Owner"
                options={[
                  { value: "devstree", label: "Devstree" },
                  { value: "client", label: "Client" },
                ]}
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

              {/* Server ID */}
              <TextInputField
                control={form.control}
                name="serverId"
                label="Server ID"
                placeholder="Enter Server ID"
              />

              {/* Status Dropdown */}
              <CustomDropDownSearchable
                form={form}
                name="status"
                label="Status"
                options={[
                  { value: "active", label: "Active" },
                  { value: "inactive", label: "Inactive" },
                  { value: "maintenance", label: "Maintenance" },
                ]}
                placeholder="Select Status"
                searchEnabled={false}
              />
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
