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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useGetServerList } from "@/features/server/services";
import {
  ProjectServerStatusOptions,
  ProjectServerTypeOptions,
} from "@/utils/constant";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { ProjectServerSchema, TProjectServerSchema } from "../schema";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface Props {
  currentRow?: any;
  open: boolean;
  isEdit?: boolean;
  onOpenChange: (open: boolean) => void;
  loading?: boolean;
  onSubmit: (values: TProjectServerSchema) => void;
}

export function ProjectServerActionForm({
  currentRow,
  open,
  isEdit,
  onOpenChange,
  onSubmit: onSubmitValues,
  loading,
}: Readonly<Props>) {
  const { data: serverList, isFetching: isServerListLoading }: any =
    useGetServerList({ pagination: false });

  const serverListOptions = serverList?.data?.map((server: any) => ({
    value: server.id,
    label: server.ip,
  }));

  const form = useForm<TProjectServerSchema>({
    resolver: zodResolver(ProjectServerSchema),
    defaultValues: {
      url: currentRow?.url ?? "",
      port: `${currentRow?.port ? currentRow?.port : ""}`,
      type: currentRow?.type ?? "",
      status: currentRow?.status ?? "",
      serverId: currentRow?.server?.id ?? "",
    },
  });

  const onSubmit: SubmitHandler<TProjectServerSchema> = (values) => {
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
              {/* <TextInputField
                control={form.control}
                name="url"
                label="URL"
                placeholder="https://example.com"
              /> */}
              <FormField
                control={form.control}
                name="url"
                render={({ field }: any) => (
                  <FormItem className="col-span-2">
                    <FormLabel>
                      Meeting Name <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="https://example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Server ID */}
              <CustomDropDownSearchable
                form={form}
                name="serverId"
                label="Server"
                options={serverListOptions}
                placeholder="Select Status"
                searchEnabled={true}
                isLoading={isServerListLoading}
              />
              <Controller
                control={form.control}
                name={"port"}
                render={({ field, fieldState }) => (
                  <div className="flex flex-col gap-2 ">
                    <Label htmlFor={field.name}>Port</Label>

                    <Input
                      id={field.name}
                      {...field}
                      placeholder={"Enter Port..."}
                      onChange={(e) => {
                        let value = e.target.value;
                        value = value.replace(/[^0-9.]/g, "");
                        value = value.replace(/[^0-9]/g, "");
                        field.onChange(value);
                      }}
                    />

                    {fieldState?.error?.message && (
                      <p className="text-sm text-red-500">
                        {fieldState.error.message}
                      </p>
                    )}
                  </div>
                )}
              />

              {/* Type Dropdown */}
              <FormField
                control={form.control}
                name="type"
                render={({ fieldState }) => (
                  <FormItem>
                    <FormLabel
                      className={cn(
                        "flex items-center gap-1",
                        fieldState.error && "text-red-500"
                      )}
                    >
                      Type
                      <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <CustomDropDownSearchable
                        form={form}
                        name="type"
                        label=""
                        options={ProjectServerTypeOptions}
                        placeholder="Select Type"
                        searchEnabled={false}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              {/* Status Dropdown */}
              <FormField
                control={form.control}
                name="status"
                render={({ fieldState }) => (
                  <FormItem>
                    <FormLabel
                      className={cn(
                        "flex items-center gap-1",
                        fieldState.error && "text-red-500"
                      )}
                    >
                      Status
                      <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <CustomDropDownSearchable
                        form={form}
                        name="status"
                        label=""
                        options={ProjectServerStatusOptions}
                        placeholder="Select Status"
                        searchEnabled={false}
                      />
                    </FormControl>
                  </FormItem>
                )}
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
