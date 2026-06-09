/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useMemo, useState } from "react";
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
import CustomDropDownSearchable from "@/components/shared/custome-searchable-dropdown";
import { useAdjustLeaveBalance, useGetLeaveTypes } from "../services";
import { Scale } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface AdjustBalanceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employeesList: any;
  employeesListLoading: boolean;
}

const adjustBalanceSchema = z.object({
  employeeId: z
    .union([z.string(), z.number()], { required_error: "Employee is required" })
    .transform((val) => Number(val))
    .refine((val) => !isNaN(val) && val > 0, {
      message: "Employee is required",
    }),
  leaveTypeId: z
    .union([z.string(), z.number()], {
      required_error: "Leave type is required",
    })
    .transform((val) => Number(val))
    .refine((val) => !isNaN(val) && val > 0, {
      message: "Leave type is required",
    }),
  balance: z
    .union([z.string(), z.number()], {
      required_error: "Balance to add is required",
    })
    .transform((val) => Number(val))
    .refine((val) => !isNaN(val) && val >= 0 && val <= 100, {
      message: "Balance to add must be between 0 and 100",
    }),
  reason: z.string().optional(),
});

type TAdjustBalanceFormSchema = z.infer<typeof adjustBalanceSchema>;

export function AdjustBalanceModal({
  open,
  onOpenChange,
  employeesList,
  employeesListLoading,
}: AdjustBalanceModalProps) {
  const form = useForm<any>({
    resolver: zodResolver(adjustBalanceSchema) as any,
    defaultValues: {
      employeeId: undefined,
      leaveTypeId: undefined,
      balance: undefined,
    },
  });

  const { data: leaveTypesRes, isPending: leaveTypesLoading } =
    useGetLeaveTypes(open);

  const { mutateAsync: adjustBalance, isPending: isSubmitting } =
    useAdjustLeaveBalance(() => {
      onOpenChange(false);
    });

  const [reason, setReason] = useState("");

  const employeeOptions = useMemo(() => {
    const list = employeesList?.data || [];
    return list.map((u: any) => ({
      value: u.id,
      label: u.fullName,
    }));
  }, [employeesList]);

  const leaveTypeOptions = useMemo(() => {
    const rawList = Array.isArray(leaveTypesRes)
      ? leaveTypesRes
      : Array.isArray((leaveTypesRes as any)?.data)
        ? (leaveTypesRes as any).data
        : [];

    return rawList.map((item: any) => ({
      value: item.id ?? item.value ?? item.code,
      label: item.name ?? item.label ?? item.title,
    }));
  }, [leaveTypesRes]);

  // Reset form when dialog opens/closes
  useEffect(() => {
    if (open) {
      form.reset({
        employeeId: undefined,
        leaveTypeId: undefined,
        balance: undefined,
        reason: "",
      });
    }
  }, [open, form]);

  const onSubmit = async (values: TAdjustBalanceFormSchema) => {
    try {
      await adjustBalance(values);
    } catch (error) {
      console.error("Failed to adjust leave balance:", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-rose-500 font-bold text-lg dark:text-rose-400">
            <Scale className="h-5 w-5 text-rose-500 animate-pulse" />
            Adjust Leave Balance
          </DialogTitle>
          <DialogDescription>
            Modify leave balance for a specific employee and leave type.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4 py-2"
          >
            <CustomDropDownSearchable
              form={form}
              name="employeeId"
              label={
                <span className="text-sm font-semibold">
                  Select Employee <span className="text-red-500">*</span>
                </span>
              }
              options={employeeOptions}
              placeholder="Search and select employee"
              isLoading={employeesListLoading}
              showClearButton={true}
            />

            <CustomDropDownSearchable
              form={form}
              name="leaveTypeId"
              label={
                <span className="text-sm font-semibold">
                  Leave Type <span className="text-red-500">*</span>
                </span>
              }
              options={leaveTypeOptions}
              placeholder="Search and select leave type"
              isLoading={leaveTypesLoading}
              showClearButton={true}
              searchEnabled={false}
            />

            <FormField
              control={form.control}
              name="balance"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-semibold">
                    Balance to Add <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="e.g. 5"
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
                    Maximum allowed number is 100. Decimal values (e.g. 0.5) are
                    supported.
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid gap-2">
              <Label htmlFor="reason">Reason</Label>
              <Textarea
                id="reason"
                placeholder="Add reason for adding balance..."
                className="resize-none min-h-[80px]"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
            </div>

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
