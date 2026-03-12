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
import { InboundSourceSchema, TInboundSourceSchema } from "../schema";
import CustomDropDownSearchable from "@/components/shared/custome-searchable-dropdown";
import { useGetDomainDropdownList } from "@/features/domain/services";

interface Props {
  currentRow?: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  loading?: boolean;
  onSubmit: (values: TProjectFormSchema) => void;
}

export function InboundSourceActionForm({
  currentRow,
  open,
  onOpenChange,
  onSubmit: onSubmitValues,
  loading,
}: Readonly<Props>) {
  const isEdit = !!currentRow;

  const { data: domainList, isPending: loadingDomain }: any =
    useGetDomainDropdownList();

  const form = useForm<TInboundSourceSchema>({
    resolver: zodResolver(InboundSourceSchema) as any,
    defaultValues: {
      name: currentRow?.name ?? "",
    },
  });

  const onSubmit: SubmitHandler<TInboundSourceSchema> = (values: any) => {
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
            {isEdit ? "Edit Inbound Source" : "Add Inbound Source"}
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
                      Inbound Source Name{" "}
                      <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter Inbound Source Name"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <CustomDropDownSearchable
                form={form}
                name="domainId"
                label="Domain"
                options={domainList?.data?.map((d: any) => ({
                  value: d.id,
                  label: d.name,
                }))}
                placeholder="Select Domain"
                isLoading={loadingDomain}
                sortOptions={false}
                // disabled={!canEdit}
              />
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
