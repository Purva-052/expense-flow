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
import { TProjectFormSchema } from "@/features/projects/schema";
import { Input } from "@/components/ui/input";
import { OutboundSourceSchema, TOutboundSourceSchema } from "../schema";

interface Props {
  currentRow?: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  loading?: boolean;
  onSubmit: (values: TProjectFormSchema) => void;
}

export function OutboundSourceActionForm({
  currentRow,
  open,
  onOpenChange,
  onSubmit: onSubmitValues,
  loading,
}: Readonly<Props>) {
  const isEdit = !!currentRow;

  const form = useForm<TOutboundSourceSchema>({
    resolver: zodResolver(OutboundSourceSchema) as any,
    defaultValues: {
      name: currentRow?.name ?? "",
    },
  });

  const onSubmit: SubmitHandler<TOutboundSourceSchema> = (values: any) => {
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
          <DialogTitle>
            {isEdit ? "Edit Outbound Source" : "Add Outbound Source"}
          </DialogTitle>
        </DialogHeader>

        <div className="-mr-4 h-fit w-full overflow-y-auto py-1">
          <Form {...form}>
            <form
              id="inquiry-type-form"
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-4 p-0.5"
            >
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Outbound Source Name{" "}
                      <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter Outbound Source Name"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* <CustomDropDownSearchable
                form={form}
                name="domainId"
                label="Domain"
                options={projectsList?.data?.map((project: any) => ({
                  value: project.id,
                  label: project.name,
                }))}
                placeholder="Select project"
                isLoading={projectsListLoading}
                sortOptions={false}
                disabled={!canEdit}
              /> */}
            </form>
          </Form>
        </div>

        <DialogFooter>
          <CustomButton
            type="submit"
            loading={loading}
            form="inquiry-type-form"
          >
            Save Changes
          </CustomButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
