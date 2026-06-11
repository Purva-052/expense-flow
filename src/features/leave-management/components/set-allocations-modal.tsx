/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import CustomButton from "@/components/shared/custom-button";
import { useSetLeaveAllocations } from "../services";
import { AlertTriangle } from "lucide-react";

interface SetAllocationsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const setAllocationsSchema = z.object({
  casualLeave: z
    .union([z.string(), z.number()], {
      required_error: "Casual Leave is required",
    })
    .transform((val) => Number(val))
    .refine((val) => !isNaN(val) && val >= 0 && val <= 100, {
      message: "Casual leave must be between 0 and 100",
    }),
  paidLeave: z
    .union([z.string(), z.number()], {
      required_error: "Paid Leave is required",
    })
    .transform((val) => Number(val))
    .refine((val) => !isNaN(val) && val >= 0 && val <= 100, {
      message: "Paid leave must be between 0 and 100",
    }),
});

type TSetAllocationsFormSchema = z.infer<typeof setAllocationsSchema>;

export function SetAllocationsModal({
  open,
  onOpenChange,
}: SetAllocationsModalProps) {
  const form = useForm<any>({
    resolver: zodResolver(setAllocationsSchema) as any,
    defaultValues: {
      casualLeave: undefined,
      paidLeave: undefined,
    },
  });

  const { mutateAsync: setLeaveAllocations, isPending: isSubmitting } =
    useSetLeaveAllocations(() => {
      onOpenChange(false);
    });

  // Reset form when dialog opens/closes
  useEffect(() => {
    if (open) {
      form.reset({
        casualLeave: undefined,
        paidLeave: undefined,
      });
    }
  }, [open, form]);

  const onSubmit = async (values: TSetAllocationsFormSchema) => {
    try {
      await setLeaveAllocations(values);
    } catch (error) {
      console.error("Failed to set leave allocations:", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-rose-500 font-bold text-lg dark:text-rose-400">
            {/* <Coins className="h-5 w-5 text-rose-500 animate-pulse" /> */}
            Leave Settings
          </DialogTitle>
          <DialogDescription>
            Configure default leave allocations for all employees.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4 py-2"
          >
            <div className="bg-amber-50 border border-amber-200 dark:bg-amber-950/20 dark:border-amber-900/30 rounded-lg p-3 flex items-start gap-2 text-xs text-amber-800 dark:text-amber-300">
              <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-500 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold">Note:</span> The entered leaves
                will be added for all the users.
              </div>
            </div>

            <FormField
              control={form.control}
              name="casualLeave"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-semibold">
                    Casual Leave Balance <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="e.g. 2.5"
                      min={0}
                      max={100}
                      step={0.5}
                      {...field}
                      value={field.value ?? ""}
                      onChange={(e) => {
                        const val = e.target.value;
                        field.onChange(val === "" ? "" : Number(val));
                      }}
                    />
                  </FormControl>
                  <p className="text-[11px] text-muted-foreground mt-1">
                    Maximum allowed number is 100. Decimal values are supported.
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="paidLeave"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-semibold">
                    Paid Leave Balance <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="e.g. 1.5"
                      min={0}
                      max={100}
                      step={0.5}
                      {...field}
                      value={field.value ?? ""}
                      onChange={(e) => {
                        const val = e.target.value;
                        field.onChange(val === "" ? "" : Number(val));
                      }}
                    />
                  </FormControl>
                  <p className="text-[11px] text-muted-foreground mt-1">
                    Maximum allowed number is 100. Decimal values are supported.
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
              <CustomButton
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancel
              </CustomButton>
              <CustomButton type="submit" loading={isSubmitting}>
                Save Changes
              </CustomButton>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
