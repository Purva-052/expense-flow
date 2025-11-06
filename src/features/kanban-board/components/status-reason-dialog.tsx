// src/components/ReasonDialog.tsx (or appropriate path)

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useForm, FormProvider, Controller } from "react-hook-form";

interface ReasonDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSubmit: (reason: string) => void;
}

export function ReasonDialog({
  isOpen,
  onOpenChange,
  onSubmit,
}: ReasonDialogProps) {
  const form = useForm({
    defaultValues: {
      reason: "",
    },
  });

  const { handleSubmit, control, reset } = form;

  const handleDialogSubmit = (data: { reason: string }) => {
    onSubmit(data.reason);
    reset(); // Reset form after submission
    onOpenChange(false); // Close dialog
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reason</DialogTitle>
        </DialogHeader>
        <FormProvider {...form}>
          <form onSubmit={handleSubmit(handleDialogSubmit)}>
            <div className="py-4">
              <Controller
                name="reason"
                control={control}
                rules={{ required: "Reason is required" }}
                render={({ field, fieldState }) => (
                  <>
                    <Textarea
                      {...field}
                      placeholder="Please provide a reason for the status change..."
                      className="min-h-[100px]"
                    />
                    {fieldState.error && (
                      <p className="text-red-500 text-sm mt-1">
                        {fieldState.error.message}
                      </p>
                    )}
                  </>
                )}
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Submit</Button>
            </DialogFooter>
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}
