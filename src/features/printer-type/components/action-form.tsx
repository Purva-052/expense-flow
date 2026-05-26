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
import { PrinterTypeSchema, TPrinterTypeSchema } from "../schema";

interface Props {
  currentRow?: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  loading?: boolean;
  onSubmit: (values: TPrinterTypeSchema) => void;
}

export function PrinterTypeForm({
  currentRow,
  open,
  onOpenChange,
  onSubmit: onSubmitValues,
  loading,
}: Readonly<Props>) {
  const isEdit = !!currentRow;

  const form = useForm<TPrinterTypeSchema>({
    resolver: zodResolver(PrinterTypeSchema) as any,
    defaultValues: {
      name: currentRow?.name ?? "",
    },
  });

  const onSubmit: SubmitHandler<TPrinterTypeSchema> = (values: any) => {
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
            {isEdit ? "Edit Printer Type" : "Add Printer Type"}
          </DialogTitle>
        </DialogHeader>

        <div className="-mr-4 h-fit w-full overflow-y-auto py-1">
          <Form {...form}>
            <form
              id="printer-type-form"
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-4 p-0.5"
            >
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Printer Type Name <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="Enter Printer Type Name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
          </Form>
        </div>

        <DialogFooter>
          <CustomButton
            type="submit"
            loading={loading}
            form="printer-type-form"
          >
            Save Changes
          </CustomButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
