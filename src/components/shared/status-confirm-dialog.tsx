import { useEffect } from "react";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, FormProvider } from "react-hook-form";
import { z } from "zod";
import { FormControl, FormField, FormItem, FormMessage } from "../ui/form";

const statusUpdateSchema = z.object({
  notes: z.string().min(1, { message: "Notes are required." }),
});

interface StatusConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectName: string;
  newStatus: "completed" | "stop";
  onSubmit: (status: string, note: string) => Promise<void>;
  isLoading?: boolean;
}

export function StatusConfirmDialog({
  open,
  onOpenChange,
  // projectName,
  newStatus,
  onSubmit,
  isLoading = false,
}: StatusConfirmDialogProps) {
  const form = useForm<z.infer<typeof statusUpdateSchema>>({
    resolver: zodResolver(statusUpdateSchema),
    defaultValues: { notes: "" },
  });

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      form.reset({ notes: "" });
    }
  }, [open, form]);

  const handleFormSubmit = async (data: z.infer<typeof statusUpdateSchema>) => {
    await onSubmit(newStatus, data.notes);
    onOpenChange(false);
  };

  const statusLabel = newStatus === "completed" ? "Completed" : "Stop";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <FormProvider {...form}>
          <form onSubmit={form.handleSubmit(handleFormSubmit)}>
            <DialogHeader>
              <DialogTitle className="text-base font-semibold">
                Update Project Status
              </DialogTitle>

              <DialogDescription className="text-sm text-muted-foreground mt-1">
                Updating the status to{" "}
                <span className="font-medium">"{statusLabel}"</span> will move
                this project to <span className="font-medium">Archived</span>.
              </DialogDescription>
            </DialogHeader>

            <div className="flex flex-col justify-center gap-4 my-4">
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <Label htmlFor="notes">Notes</Label>
                    <FormControl>
                      <Textarea
                        id="notes"
                        placeholder="Add your notes here..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Updating..." : "Update Status"}
              </Button>
            </DialogFooter>
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}
