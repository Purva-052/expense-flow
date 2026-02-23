/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
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
import { extraWorkSchema, TExtraWorkFormSchema } from "../schema";
import CustomDropDownSearchable from "@/components/shared/custome-searchable-dropdown";
import { Textarea } from "@/components/ui/textarea";
import { CustomDatePicker } from "@/components/shared/custome-datePicker";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

interface Props {
  currentRow?: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectsList: any;
  projectsListLoading: boolean;
  employeesList: any;
  employeesListLoading: boolean;
  loading?: boolean;
  onSubmit: (values: TExtraWorkFormSchema) => void;
}

export function ExtraWorkActionForm({
  currentRow,
  open,
  onOpenChange,
  projectsList,
  projectsListLoading,
  employeesList,
  employeesListLoading,
  onSubmit: onSubmitValues,
  loading,
}: Readonly<Props>) {
  const isEdit = !!currentRow;

  const form = useForm<TExtraWorkFormSchema>({
    resolver: zodResolver(extraWorkSchema) as any,
    mode: "onSubmit",
    reValidateMode: "onChange",
    defaultValues: isEdit
      ? {
          reportingDate: currentRow?.reportingDate
            ? new Date(currentRow.reportingDate)
            : undefined,
          inCashOrLeave: currentRow?.inCashOrLeave,
          employeeId: currentRow?.employeeId ?? currentRow?.employee?.id,
          projectId: currentRow?.projectId ?? currentRow?.project?.id,
          taskDescription: currentRow?.taskDescription ?? "",
          timeSpent: currentRow?.timeSpent ?? "",
          remark: currentRow?.remark ?? "",
        }
      : {
          reportingDate: undefined,
          inCashOrLeave: 0,
          employeeId: undefined,
          projectId: undefined,
          taskDescription: "",
          timeSpent: "",
          remark: "",
        },
  });

  const [hours, setHours] = useState<string>("0");
  const [minutes, setMinutes] = useState<string>("0");

  useEffect(() => {
    if (currentRow && open) {
      const rowEmployeeId = currentRow.employeeId ?? currentRow.employee?.id;
      const rowProjectId = currentRow.projectId ?? currentRow.project?.id;
      const rawDate = currentRow.reportingDate;
      const parsedDate = rawDate ? new Date(rawDate.split("T")[0]) : undefined;

      form.reset({
        reportingDate: parsedDate,
        inCashOrLeave: currentRow.inCashOrLeave,
        employeeId: rowEmployeeId,
        projectId: rowProjectId,
        taskDescription: currentRow.taskDescription,
        timeSpent: currentRow.timeSpent,
        remark: currentRow.remark,
      });

      const timeStr = String(currentRow.timeSpent || "0");
      let h = "0";
      let m = "0";

      const hMatch = timeStr.match(/(\d+)\s*h/i);
      const mMatch = timeStr.match(/(\d+)\s*m/i);

      if (hMatch || mMatch) {
        h = hMatch ? parseInt(hMatch[1], 10).toString() : "0";
        m = mMatch ? parseInt(mMatch[2], 10).toString() : "0";
      } else if (timeStr.includes(".")) {
        const parts = timeStr.split(".");
        h = parseInt(parts[0], 10).toString();
        const rawM = parts[1] || "0";
        let minutesValue = parseInt(rawM.slice(0, 2), 10);
        minutesValue = Math.round(minutesValue / 5) * 5;

        if (minutesValue === 60) {
          h = (parseInt(h, 10) + 1).toString();
          m = "0";
        } else {
          m = minutesValue.toString();
        }
      } else if (!isNaN(Number(timeStr))) {
        h = parseInt(timeStr, 10).toString();
        m = "0";
      }

      setHours(h);
      setMinutes(m);
    }
    if (!open) {
      form.reset();
      setHours("0");
      setMinutes("0");
    }
  }, [currentRow, open, form]);

  useEffect(() => {
    form.setValue("timeSpent", `${hours}h${minutes}m`, {
      shouldValidate: true,
    });
  }, [hours, minutes, form]);

  const onSubmit: SubmitHandler<TExtraWorkFormSchema> = async (values) => {
    const date = values.reportingDate;
    const formattedDate = `${date.getFullYear()}-${String(
      date.getMonth() + 1
    ).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

    onSubmitValues({
      ...values,
      reportingDate: formattedDate as any,
    });
  };

  const hourOptions = Array.from({ length: 25 }, (_, i) => ({
    value: i.toString(),
    label: i.toString(),
  }));

  const minuteOptions = Array.from({ length: 12 }, (_, i) => ({
    value: (i * 5).toString(),
    label: (i * 5).toString(),
  }));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Edit Extra Work Report" : "Add Extra Work Report"}
          </DialogTitle>
        </DialogHeader>

        <div className="h-fit w-full overflow-y-auto py-1">
          <Form {...form}>
            <form
              id="extra-work-form"
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-4 p-0.5"
            >
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {/* Reporting Date */}
                <FormField
                  control={form.control}
                  name="reportingDate"
                  render={() => (
                    <FormItem>
                      <FormLabel>
                        Reporting Date <span className="text-red-500">*</span>
                      </FormLabel>
                      <CustomDatePicker
                        control={form.control}
                        name="reportingDate"
                        label=""
                        disabledDays={(date: Date) => date > new Date()}
                        triggerClassName="h-9"
                      />
                    </FormItem>
                  )}
                />

                {/* Employee */}
                <CustomDropDownSearchable
                  form={form}
                  name="employeeId"
                  // --- Change is here ---
                  label={
                    <>
                      Employee <span className="text-red-500">*</span>
                    </>
                  }
                  options={employeesList?.data?.map((user: any) => ({
                    value: user.id,
                    label: user.fullName,
                  }))}
                  placeholder="Select employee"
                  isLoading={employeesListLoading}
                  triggerClassName="h-9"
                />
              </div>
              {/* Project */}
              <CustomDropDownSearchable
                form={form}
                name="projectId"
                // --- Change is here ---
                label={
                  <>
                    Project <span className="text-red-500">*</span>
                  </>
                }
                options={projectsList?.data?.map((project: any) => ({
                  value: project.id,
                  label: project.name,
                }))}
                placeholder="Select project"
                isLoading={projectsListLoading}
              />
              {/* Task Description */}
              <FormField
                control={form.control}
                name="taskDescription"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Task Description <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="What did you work on?"
                        className="min-h-[100px]"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* Combined Row for Time and Cash/Leave */}
              <div className="grid grid-cols-1 !gap-12 lg:grid-cols-12 md:grid-cols-6 items-start">
                {/* Cash/Leave Radio */}
                <div className="lg:col-span-7">
                  <FormField
                    control={form.control}
                    name="inCashOrLeave"
                    render={({ field }) => (
                      <FormItem className="space-y-2">
                        <FormLabel className="whitespace-nowrap">
                          Do you want extra work as cash/leave?
                        </FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={(val) => field.onChange(Number(val))}
                            value={field.value?.toString()}
                            className="flex items-center gap-4 pt-1"
                          >
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="0" id="cash" />
                              <Label
                                htmlFor="cash"
                                className="cursor-pointer font-normal"
                              >
                                Cash
                              </Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="1" id="leave" />
                              <Label
                                htmlFor="leave"
                                className="cursor-pointer font-normal"
                              >
                                Leave
                              </Label>
                            </div>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                {/* Hours */}
                <div className="lg:col-span-2 space-y-2">
                  <Label htmlFor="hours" className="whitespace-nowrap">
                    Hours <span className="text-red-500">*</span>
                  </Label>
                  <Select onValueChange={setHours} value={hours}>
                    <SelectTrigger id="hours" className="h-9">
                      <SelectValue placeholder="Hours" />
                    </SelectTrigger>
                    <SelectContent>
                      {hourOptions.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Minutes */}
                <div className="lg:col-span-2 space-y-2">
                  <Label htmlFor="minutes" className="whitespace-nowrap">
                    Minutes <span className="text-red-500">*</span>
                  </Label>
                  <Select onValueChange={setMinutes} value={minutes}>
                    <SelectTrigger id="minutes" className="h-9">
                      <SelectValue placeholder="Minutes" />
                    </SelectTrigger>
                    <SelectContent>
                      {minuteOptions.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Validation message hidden but present for schema compliance */}
              <FormField
                control={form.control}
                name="timeSpent"
                render={({ fieldState, formState }) => {
                  const showError =
                    formState.submitCount > 0 && fieldState.error;

                  return (
                    <div className="-mt-2">
                      {showError && (
                        <FormMessage>{fieldState.error?.message}</FormMessage>
                      )}
                    </div>
                  );
                }}
              />

              {/* Remark */}
              <FormField
                control={form.control}
                name="remark"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Remark</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="Additional notes..."
                        className="min-h-[80px]"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
          </Form>
        </div>

        <DialogFooter>
          <CustomButton type="submit" form="extra-work-form" loading={loading}>
            {isEdit ? "Update" : "Save"}
          </CustomButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
