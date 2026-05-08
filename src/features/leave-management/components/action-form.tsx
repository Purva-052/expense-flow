/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect } from "react";
import { SubmitHandler, useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { eachDayOfInterval, endOfDay, format, startOfDay } from "date-fns";
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
import { leaveSchema, TLeaveFormSchema } from "../schema";
import CustomDropDownSearchable from "@/components/shared/custome-searchable-dropdown";
import { Textarea } from "@/components/ui/textarea";
import { CustomDatePicker } from "@/components/shared/custome-datePicker";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

interface Props {
  currentRow?: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employeesList: any;
  employeesListLoading: boolean;
  loading?: boolean;
  onSubmit: (values: any) => void;
  isViewOnly?: boolean;
}

export function LeaveActionForm({
  currentRow,
  open,
  onOpenChange,
  employeesList,
  employeesListLoading,
  onSubmit: onSubmitValues,
  loading,
  isViewOnly,
}: Readonly<Props>) {
  const isEdit = !!currentRow;

  const form = useForm<TLeaveFormSchema>({
    resolver: zodResolver(leaveSchema) as any,
    mode: "onSubmit",
    defaultValues: {
      leaveDays: [],
      dayType: "full",
      reason: "",
    },
  });

  const { fields, replace } = useFieldArray({
    control: form.control,
    name: "leaveDays",
  });

  const watchFromDate = form.watch("fromDate");
  const watchToDate = form.watch("toDate");
  const watchDays = form.watch("leaveDays");

  useEffect(() => {
    if (currentRow && open) {
      form.reset({
        employeeId: currentRow.employeeId ?? currentRow.employee?.id,
        fromDate: currentRow.fromDate
          ? new Date(currentRow.fromDate)
          : undefined,
        toDate: currentRow.toDate ? new Date(currentRow.toDate) : undefined,
        reason: currentRow.reason,
      });

      if (currentRow.leaveDays && Array.isArray(currentRow.leaveDays)) {
        const daysToPopulate = currentRow.leaveDays.map((day: any) => ({
          date: format(new Date(day.date), "yyyy-MM-dd"),
          dayName: format(new Date(day.date), "EEEE"),
          dayType: day.dayType || "full",
          halfType: day.halfType,
        }));
        replace(daysToPopulate);
      }
    } else if (!open) {
      form.reset({
        employeeId: undefined,
        fromDate: undefined,
        toDate: undefined,
        reason: "",
        leaveDays: [],
        dayType: "full",
      });
      replace([]);
    }
  }, [currentRow, open, form, replace]);

  useEffect(() => {
    if (open && watchFromDate && watchToDate) {
      const start = startOfDay(new Date(watchFromDate));
      const end = endOfDay(new Date(watchToDate));

      if (start <= end) {
        const currentFormDays = form.getValues("leaveDays") || [];
        const newDays = eachDayOfInterval({ start, end }).map((date) => {
          const dateStr = format(date, "yyyy-MM-dd");
          const existingDay = currentFormDays.find((d) => d.date === dateStr);

          if (existingDay) {
            const { description, ...rest } = existingDay as any;
            return rest;
          } else {
            return {
              date: dateStr,
              dayName: format(date, "EEEE"),
              dayType: "full" as const,
              halfType: undefined,
            };
          }
        });

        const currentDatesStr = currentFormDays.map((d) => d.date).join(",");
        const newDatesStr = newDays.map((d) => d.date).join(",");

        if (currentDatesStr !== newDatesStr) {
          replace(newDays);
        }
      } else {
        replace([]);
      }
    }
  }, [watchFromDate, watchToDate, open, replace, form]);

  const onSubmit: SubmitHandler<TLeaveFormSchema> = async (values) => {
    const formatLeaveDays = (days: any[]) => {
      return days?.map((day) => ({
        date: day.date,
        dayType: day.dayType,
        halfType: day.dayType === "half" ? day.halfType : undefined,
      }));
    };

    if (isEdit) {
      onSubmitValues({
        ...values,
        id: currentRow.id,
        leaveDate: values.leaveDate
          ? format(values.leaveDate, "yyyy-MM-dd")
          : undefined,
        fromDate: values.fromDate
          ? format(values.fromDate, "yyyy-MM-dd")
          : undefined,
        toDate: values.toDate ? format(values.toDate, "yyyy-MM-dd") : undefined,
        leaveDays: formatLeaveDays(values.leaveDays || []),
      });
    } else {
      const payload = {
        employeeId: values.employeeId,
        fromDate: format(values.fromDate!, "yyyy-MM-dd"),
        toDate: format(values.toDate!, "yyyy-MM-dd"),
        reason: values.reason,
        leaveDays: formatLeaveDays(values.leaveDays || []),
      };
      onSubmitValues(payload);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={
          fields.length > 0
            ? "sm:max-w-4xl max-h-[90dvh] overflow-auto"
            : "sm:max-w-xl max-h-[70dvh] overflow-auto"
        }
      >
        <DialogHeader>
          <DialogTitle>
            {isViewOnly
              ? "View Leave Request"
              : isEdit
                ? "Edit Leave Request"
                : "Add Leave"}
          </DialogTitle>
        </DialogHeader>

        <div className="w-full py-1">
          <Form {...form}>
            <form
              id="leave-form"
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-4 p-0.5"
            >
              {/* --- Common Fields --- */}
              <div className="grid grid-cols-1 gap-4">
                <CustomDropDownSearchable
                  form={form}
                  name="employeeId"
                  label="Employee"
                  options={employeesList?.data?.map((user: any) => ({
                    value: user.id,
                    label: user.fullName,
                  }))}
                  placeholder="Select employee"
                  isLoading={employeesListLoading}
                  disabled={isEdit || isViewOnly}
                  showClearButton={!isEdit && !isViewOnly}
                />
              </div>

              <div className="space-y-4">
                {/* Date Range Selectors */}
                <div className="grid grid-cols-2 gap-4">
                  <FormItem>
                    <FormLabel>
                      From Date <span className="text-red-500">*</span>
                    </FormLabel>
                    <CustomDatePicker
                      control={form.control}
                      name="fromDate"
                      label=""
                      disabled={isViewOnly}
                    />
                  </FormItem>
                  <FormItem>
                    <FormLabel>
                      To Date <span className="text-red-500">*</span>
                    </FormLabel>
                    <CustomDatePicker
                      control={form.control}
                      name="toDate"
                      label=""
                      disabled={isViewOnly}
                    />
                  </FormItem>
                </div>

                {/* The Dynamic Table */}
                {fields.length > 0 && (
                  <div className="border border-border rounded-md mt-4 overflow-y-auto max-h-[330px] relative bg-background">
                    <table className="w-full text-sm text-left">
                      <thead className="[&_tr]:border-b">
                        <tr>
                          <th className="h-12 bg-muted text-foreground z-10 border-b px-3 text-left align-middle font-medium sticky top-0 w-[120px]">
                            Leave Date
                          </th>
                          <th className="h-12 bg-muted text-foreground z-10 border-b px-3 text-left align-middle font-medium sticky top-0 w-[100px]">
                            Day
                          </th>
                          <th className="h-12 bg-muted text-foreground z-10 border-b px-3 text-left align-middle font-medium sticky top-0 w-[160px]">
                            Half/Full day
                          </th>
                          <th className="h-12 bg-muted text-foreground z-10 border-b px-3 text-left align-middle font-medium sticky top-0 w-[180px]">
                            1st/2nd Half
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {fields.map((field, index) => {
                          const currentDayType = watchDays?.[index]?.dayType;
                          const isWeekend =
                            field.dayName === "Saturday" ||
                            field.dayName === "Sunday";

                          const displayDate = field.date
                            .split("-")
                            .reverse()
                            .join("-");

                          return (
                            <tr
                              key={field.id}
                              className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
                            >
                              <td className="p-3 align-middle whitespace-nowrap">
                                {displayDate}
                              </td>
                              <td className="p-3 align-middle text-muted-foreground">
                                {field.dayName}
                                {isWeekend && (
                                  <span className="block text-xs text-red-400 font-medium">
                                    (Weekly Off)
                                  </span>
                                )}
                              </td>

                              <td className="p-3 align-middle">
                                <FormField
                                  control={form.control}
                                  name={`leaveDays.${index}.dayType`}
                                  render={({ field: radioField }) => (
                                    <RadioGroup
                                      onValueChange={(val) => {
                                        radioField.onChange(val);
                                        if (val === "full") {
                                          form.setValue(
                                            `leaveDays.${index}.halfType`,
                                            undefined as any,
                                            {
                                              shouldValidate: true,
                                              shouldDirty: true,
                                              shouldTouch: true,
                                            }
                                          );
                                        }
                                      }}
                                      defaultValue={radioField.value}
                                      disabled={isWeekend || isViewOnly}
                                      className={`flex items-center space-x-3 ${
                                        isWeekend
                                          ? "opacity-50 cursor-not-allowed"
                                          : ""
                                      }`}
                                    >
                                      <div className="flex items-center space-x-1">
                                        <RadioGroupItem
                                          value="half"
                                          id={`half-${index}`}
                                        />
                                        <Label
                                          htmlFor={`half-${index}`}
                                          className="text-xs font-normal cursor-pointer"
                                        >
                                          Half
                                        </Label>
                                      </div>
                                      <div className="flex items-center space-x-1">
                                        <RadioGroupItem
                                          value="full"
                                          id={`full-${index}`}
                                        />
                                        <Label
                                          htmlFor={`full-${index}`}
                                          className="text-xs font-normal cursor-pointer"
                                        >
                                          Full
                                        </Label>
                                      </div>
                                    </RadioGroup>
                                  )}
                                />
                              </td>
                              <td className="p-3 align-middle">
                                <FormField
                                  control={form.control}
                                  name={`leaveDays.${index}.halfType`}
                                  render={({ field: sessionField }) => (
                                    <RadioGroup
                                      onValueChange={sessionField.onChange}
                                      // UPDATED: fallback to "" helps visually clear the selection
                                      value={sessionField.value || ""}
                                      disabled={
                                        currentDayType === "full" ||
                                        isWeekend ||
                                        isViewOnly
                                      }
                                      className={`flex items-center space-x-3 ${
                                        currentDayType === "full" || isWeekend
                                          ? "opacity-30 cursor-not-allowed"
                                          : ""
                                      }`}
                                    >
                                      <div className="flex items-center space-x-1">
                                        <RadioGroupItem
                                          value="first_half"
                                          id={`1st-${index}`}
                                        />
                                        <Label
                                          htmlFor={`1st-${index}`}
                                          className="text-xs font-normal cursor-pointer"
                                        >
                                          1st
                                        </Label>
                                      </div>
                                      <div className="flex items-center space-x-1">
                                        <RadioGroupItem
                                          value="second_half"
                                          id={`2nd-${index}`}
                                        />
                                        <Label
                                          htmlFor={`2nd-${index}`}
                                          className="text-xs font-normal cursor-pointer"
                                        >
                                          2nd
                                        </Label>
                                      </div>
                                    </RadioGroup>
                                  )}
                                />
                                {!isWeekend &&
                                  form.formState.errors.leaveDays?.[index]
                                    ?.halfType && (
                                    <span className="text-[10px] text-red-500 block mt-1">
                                      Required
                                    </span>
                                  )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* General Reason */}
                <FormField
                  control={form.control}
                  name="reason"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        General Reason <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          placeholder="Reason for leave..."
                          className="min-h-[60px]"
                          disabled={isViewOnly}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </form>
          </Form>
        </div>

        <DialogFooter className="flex flex-row justify-end gap-2">
          {!isViewOnly && (
            <CustomButton type="submit" form="leave-form" loading={loading}>
              {isEdit ? "Update" : "Submit"}
            </CustomButton>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
