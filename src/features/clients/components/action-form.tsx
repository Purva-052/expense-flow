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
import { clientFormSchema, TClientFormSchema } from "../schema";

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
  const isEdit = !!currentRow;

  const form = useForm<TClientFormSchema>({
    resolver: zodResolver(clientFormSchema) as any,
    defaultValues: isEdit
      ? {
          name: currentRow?.name ?? "",
          company: currentRow?.company ?? "",
          country: currentRow?.country ?? "",
          timezone: currentRow?.timezone ?? "",
        }
      : {
          name: "",
          company: "",
          country: "",
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
          <DialogTitle>{isEdit ? "Edit Company" : "Add Company"}</DialogTitle>
        </DialogHeader>

        <div className="h-fit w-full overflow-y-auto py-1">
          <Form {...form}>
            <form
              id="company-form"
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-4 p-0.5"
            >
              <TextInputField
                control={form.control}
                name="name"
                label="Name"
                placeholder="Enter name"
              />
              <TextInputField
                control={form.control}
                name="company"
                label="Company"
                placeholder="Enter company"
              />
              <TextInputField
                control={form.control}
                name="country"
                label="Country"
                placeholder="Enter country"
              />
              <TextInputField
                control={form.control}
                name="timezone"
                label="Timezone"
                placeholder="Enter timezone (e.g. Asia/Kolkata)"
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
