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
import { technologyFormSchema, TTechnologyFormSchema } from "../schema";

interface Props {
  currentRow?: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  loading?: boolean;
  onSubmit: (values: TTechnologyFormSchema) => void;
}

export function TechnologyActionForm({
  currentRow,
  open,
  onOpenChange,
  onSubmit: onSubmitValues,
  loading,
}: Readonly<Props>) {
  const isEdit = !!currentRow;

  const form = useForm<TTechnologyFormSchema>({
    resolver: zodResolver(technologyFormSchema) as any,
    defaultValues: {
      name: currentRow?.name ?? "",
      color: currentRow?.color ?? "",
    },
  });

  const onSubmit: SubmitHandler<TTechnologyFormSchema> = (values) => {
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
            {isEdit ? "Edit Technology" : "Add Technology"}
          </DialogTitle>
        </DialogHeader>

        <div className="-mr-4 h-fit w-full overflow-y-auto py-1">
          <Form {...form}>
            <form
              id="technology-form"
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-4 p-0.5"
            >
              <TextInputField
                control={form.control}
                name="name"
                label="Technology Name"
                placeholder="Enter technology name"
              />
              <TextInputField
                control={form.control}
                name="color"
                label="Color HEX"
                placeholder="#61DAFB"
                type="text"
              />
            </form>
          </Form>
        </div>

        <DialogFooter>
          <CustomButton type="submit" loading={loading} form="technology-form">
            Save Changes
          </CustomButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
