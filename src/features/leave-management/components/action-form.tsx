/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect } from "react";
import { SubmitHandler, useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
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
import { Input } from "@/components/ui/input";
import { CustomDatePicker } from "@/components/shared/custome-datePicker";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Props {
  currentRow?: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employeesList: any;
  employeesListLoading: boolean;
  loading?: boolean;
  onSubmit: (values: any) => void;
}

export function LeaveActionForm({
  currentRow,
  open,
  onOpenChange,
  employeesList,
  employeesListLoading,
  onSubmit: onSubmitValues,
  loading,
}: Readonly<Props>) {
  const isEdit = !!currentRow;

  const form = useForm<TLeaveFormSchema>({
    resolver: zodResolver(leaveSchema) as any,
    mode: "onSubmit",
    defaultValues: {
      days: [], // Initialize empty array for create mode
      dayType: "full", // Fallback for edit mode
      reason: "",
    },
  });

  // We use useFieldArray to manage the dynamic list of days in the form state
  const { fields, replace } = useFieldArray({
    control: form.control,
    name: "days",
  });

  const watchFromDate = form.watch("fromDate");
  const watchToDate = form.watch("toDate");
  const watchDays = form.watch("days");

  // --- 1. Handle Edit Mode Initialization ---
  useEffect(() => {
    if (currentRow && open) {
      form.reset({
        employeeId: currentRow.employeeId ?? currentRow.employee?.id,
        leaveDate: currentRow.leaveDate
          ? new Date(currentRow.leaveDate)
          : undefined,
        reason: currentRow.reason,
        description: currentRow.description || "",
        dayType: currentRow.dayType || "full",
        halfType: currentRow.halfType,
      });
    } else if (!open) {
      form.reset({
        days: [],
        dayType: "full",
        reason: "",
      });
    }
  }, [currentRow, open, form]);

  // --- 2. Handle Create Mode: Date Range to Table Generation ---
  useEffect(() => {
    // Only proceed if we are in create mode and the modal is open
    if (!isEdit && open) {
      // Check if BOTH dates are present
      if (watchFromDate && watchToDate) {
        const start = new Date(watchFromDate);
        const end = new Date(watchToDate);

        // Only generate if valid range (Start is before or equal to End)
        if (start <= end) {
          const newDays = [];
          const current = new Date(start);

          while (current <= end) {
            // Check if weekend (0 = Sunday, 6 = Saturday)
            const dayIndex = current.getDay();
            const isWeekend = dayIndex === 0 || dayIndex === 6;

            newDays.push({
              date: format(current, "yyyy-MM-dd"),
              dayName: format(current, "EEEE"),
              dayType: "full" as const,
              halfType: undefined,
              description: isWeekend ? "Weekly Off" : "",
            });
            current.setDate(current.getDate() + 1);
          }
          replace(newDays);
        } else {
          // Invalid range (Start > End) -> Clear table
          replace([]);
        }
      } else {
        // One or both dates are missing (Cleared by user) -> Clear table
        replace([]);
      }
    }
  }, [watchFromDate, watchToDate, isEdit, open, replace]);

  const onSubmit: SubmitHandler<TLeaveFormSchema> = async (values) => {
    if (isEdit) {
      onSubmitValues({
        ...values,
        leaveDate: values.leaveDate
          ? format(values.leaveDate, "yyyy-MM-dd")
          : undefined,
        fromDate: undefined,
        toDate: undefined,
        days: undefined,
      });
    } else {
      const payload = {
        employeeId: values.employeeId,
        fromDate: format(values.fromDate!, "yyyy-MM-dd"),
        toDate: format(values.toDate!, "yyyy-MM-dd"),
        reason: values.reason,
        days: values.days?.map((day) => ({
          date: day.date,
          dayType: day.dayType,
          halfType: day.dayType === "half" ? day.halfType : undefined,
          description: day.description,
        })),
      };

      onSubmitValues(payload);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={
          !isEdit
            ? "sm:max-w-4xl max-h-[90dvh] overflow-auto"
            : "sm:max-w-xl max-h-[70dvh] overflow-auto"
        }
      >
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Edit Leave Request" : "Apply for Leave"}
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
                  disabled={isEdit}
                />
              </div>

              {/* --- CREATE MODE: Table Layout --- */}
              {!isEdit && (
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
                      />
                    </FormItem>
                  </div>

                  {/* The Dynamic Table */}
                  {fields.length > 0 && (
                    <div className="border rounded-md mt-4 overflow-y-auto max-h-[330px] relative">
                      <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 text-gray-700 font-medium border-b sticky top-0 z-10 shadow-sm">
                          <tr>
                            <th className="p-3 w-[120px]">Leave Date</th>
                            <th className="p-3 w-[100px]">Day</th>
                            <th className="p-3">Description</th>
                            <th className="p-3 w-[160px]">Half/Full day</th>
                            <th className="p-3 w-[180px]">1st/2nd Half</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y">
                          {fields.map((field, index) => {
                            const currentDayType = watchDays?.[index]?.dayType;
                            const isWeekend =
                              field.dayName === "Saturday" ||
                              field.dayName === "Sunday";

                            // Format the date from YYYY-MM-DD to DD-MM-YYYY for display
                            const displayDate = field.date
                              .split("-")
                              .reverse()
                              .join("-");

                            return (
                              <tr key={field.id} className="hover:bg-gray-50">
                                {/* Date Display */}
                                <td className="p-3 align-middle whitespace-nowrap">
                                  {displayDate}
                                </td>

                                {/* Day Name */}
                                <td className="p-3 align-middle text-gray-500">
                                  {field.dayName}
                                </td>

                                {/* Description Input OR Holiday Text */}
                                <td className="p-3 align-middle">
                                  {isWeekend ? (
                                    <span className="text-gray-600 font-medium">
                                      Weekly Off
                                    </span>
                                  ) : (
                                    <FormField
                                      control={form.control}
                                      name={`days.${index}.description`}
                                      render={({ field: inputField }) => (
                                        <Input
                                          {...inputField}
                                          placeholder="Description..."
                                          className="h-8 text-xs"
                                        />
                                      )}
                                    />
                                  )}
                                </td>

                                {/* Full/Half Radio - DISABLED IF WEEKEND */}
                                <td className="p-3 align-middle">
                                  <FormField
                                    control={form.control}
                                    name={`days.${index}.dayType`}
                                    render={({ field: radioField }) => (
                                      <RadioGroup
                                        onValueChange={(val) => {
                                          radioField.onChange(val);
                                          if (val === "full") {
                                            form.setValue(
                                              `days.${index}.halfType`,
                                              undefined
                                            );
                                          }
                                        }}
                                        defaultValue={radioField.value}
                                        disabled={isWeekend}
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

                                {/* Session Radio (1st/2nd) - DISABLED IF WEEKEND OR FULL DAY */}
                                <td className="p-3 align-middle">
                                  <FormField
                                    control={form.control}
                                    name={`days.${index}.halfType`}
                                    render={({ field: sessionField }) => (
                                      <RadioGroup
                                        onValueChange={sessionField.onChange}
                                        value={sessionField.value}
                                        disabled={
                                          currentDayType === "full" || isWeekend
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
                                    form.formState.errors.days?.[index]
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
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              {/* --- EDIT MODE: Single Day Form --- */}
              {isEdit && (
                <div className="grid grid-cols-1 gap-4">
                  <FormItem>
                    <FormLabel>Leave Date</FormLabel>
                    <CustomDatePicker
                      control={form.control}
                      name="leaveDate"
                      label=""
                      disabled={true}
                    />
                  </FormItem>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="dayType"
                      render={({ field }) => (
                        <FormItem className="space-y-3">
                          <FormLabel>Day Type</FormLabel>
                          <FormControl>
                            <RadioGroup
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                              className="flex flex-col space-y-1"
                            >
                              <div className="flex items-center space-x-3 space-y-0">
                                <RadioGroupItem value="full" id="full" />
                                <Label htmlFor="full" className="font-normal">
                                  Full Day
                                </Label>
                              </div>
                              <div className="flex items-center space-x-3 space-y-0">
                                <RadioGroupItem value="half" id="half" />
                                <Label htmlFor="half" className="font-normal">
                                  Half Day
                                </Label>
                              </div>
                            </RadioGroup>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {form.watch("dayType") === "half" && (
                      <FormField
                        control={form.control}
                        name="halfType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              Session <span className="text-red-500">*</span>
                            </FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              value={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select session" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="first_half">
                                  First Half
                                </SelectItem>
                                <SelectItem value="second_half">
                                  Second Half
                                </SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                  </div>

                  <FormField
                    control={form.control}
                    name="reason"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Reason <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            placeholder="Reason..."
                            className="min-h-[80px]"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            placeholder="Optional..."
                            className="min-h-[60px]"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}
            </form>
          </Form>
        </div>

        <DialogFooter className="flex flex-row justify-end gap-2">
          <CustomButton type="submit" form="leave-form" loading={loading}>
            {isEdit ? "Update" : "Submit"}
          </CustomButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
