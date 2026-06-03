/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { SubmitHandler, useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format, eachDayOfInterval, isSaturday, isSunday, startOfDay } from "date-fns";
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
// import { Input } from "@/components/ui/input";
import { CustomDatePicker } from "@/components/shared/custome-datePicker";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useAuthStore } from "@/stores/use-auth-store";
import { LEAVE_TYPE, roles } from "@/utils/constant";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useGetLeaveBalance } from "../services";
import { Wallet } from "lucide-react";
import { cn } from "@/lib/utils";

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

// ─── helpers ───────────────────────────────────────────────────────────────────

function buildLeaveDays(from: Date, to: Date) {
  const start = startOfDay(from);
  const end = startOfDay(to);
  return eachDayOfInterval({ start, end }).map((d) => ({
    date: format(d, "yyyy-MM-dd"),
    dayName: format(d, "EEEE"),
    isWeekend: isSaturday(d) || isSunday(d),
    dayType: "full" as const,
    halfType: null as null | "first_half" | "second_half",
  }));
}

// ─── Component ─────────────────────────────────────────────────────────────────

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

  const user = useAuthStore((state) => state.user);
  const rawRole = user?.role || user?.user?.role;
  const roleName = String(
    rawRole && typeof rawRole === "object" ? rawRole?.name : rawRole || ""
  ).toLowerCase();

  const isAdmin = roleName === roles.ADMIN;
  const isPM = roleName === roles.PROJECT_MANAGER;
  const canApplyForOthers = isAdmin || isPM;

  const currentUserId = user?.user?.id || user?.user_id;

  const [applyTab, setApplyTab] = useState<"self" | "others">("self");

  const form = useForm<TLeaveFormSchema>({
    resolver: zodResolver(leaveSchema) as any,
    mode: "onSubmit",
    defaultValues: {
      reason: "",
      description: "",
      leaveTypeId: "",
      leaveDays: [],
    },
  });

  const { fields, replace } = useFieldArray({
    control: form.control,
    name: "leaveDays",
  });

  const watchFromDate = form.watch("fromDate");
  const watchToDate = form.watch("toDate");
  const watchLeaveTypeId = form.watch("leaveTypeId");
  const watchEmployeeId = form.watch("employeeId");

  const isSelfApplyMode = !canApplyForOthers || applyTab === "self";
  const balanceUserId = isSelfApplyMode ? currentUserId : watchEmployeeId;

  // Auto-regenerate leaveDays table whenever date range changes (add mode only)
  useEffect(() => {
    if (isEdit || isViewOnly) return;
    if (watchFromDate && watchToDate) {
      const from = startOfDay(new Date(watchFromDate));
      const to = startOfDay(new Date(watchToDate));
      if (from <= to) {
        replace(buildLeaveDays(from, to));
      } else {
        replace([]);
      }
    } else {
      replace([]);
    }
  }, [watchFromDate, watchToDate, isEdit, isViewOnly, replace]);

  // Fetch leave balance in add mode
  const { data: leaveBalanceData, isPending: leaveBalanceLoading } =
    useGetLeaveBalance(
      {
        userId: balanceUserId,
        leaveTypeId: watchLeaveTypeId || undefined,
      },
      open && !isEdit
    ) as any;

  const emptyDefaults = {
    employeeId: undefined as number | undefined,
    leaveTypeId: "",
    fromDate: undefined as Date | undefined,
    toDate: undefined as Date | undefined,
    reason: "",
    description: "",
    leaveDays: [] as any[],
  };

  // Reset form on open/close
  useEffect(() => {
    if (currentRow && open) {
      const days =
        currentRow.leaveDays?.map((d: any) => ({
          date: d.date,
          dayName: d.dayName || format(new Date(d.date), "EEEE"),
          isWeekend: isSaturday(new Date(d.date)) || isSunday(new Date(d.date)),
          dayType: d.dayType || "full",
          halfType: d.halfType || null,
        })) ?? [];

      form.reset({
        employeeId: currentRow.employeeId ?? currentRow.employee?.id,
        leaveTypeId: currentRow.leaveTypeId
          ? String(currentRow.leaveTypeId)
          : "",
        fromDate: currentRow.fromDate
          ? new Date(currentRow.fromDate)
          : undefined,
        toDate: currentRow.toDate ? new Date(currentRow.toDate) : undefined,
        reason: currentRow.reason,
        description: currentRow.description || "",
        leaveDays: days,
      });
    } else if (!open) {
      form.reset(emptyDefaults);
      replace([]);
      setApplyTab("self");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentRow, open]);

  const onSubmit: SubmitHandler<TLeaveFormSchema> = async (values) => {
    const formData = new FormData();
    formData.append("leaveTypeId", values.leaveTypeId);
    formData.append("fromDate", format(values.fromDate, "yyyy-MM-dd"));
    formData.append("toDate", format(values.toDate, "yyyy-MM-dd"));
    formData.append("reason", values.reason);
    formData.append("description", values.description || "");
    formData.append(
      "leaveDays",
      JSON.stringify(
        values.leaveDays.map((d) => ({
          date: d.date,
          dayType: d.dayType,
          ...(d.dayType === "half" && d.halfType
            ? { halfType: d.halfType }
            : {}),
        }))
      )
    );

    if (isEdit) {
      onSubmitValues({ id: currentRow.id, data: formData });
    } else {
      if (!isSelfApplyMode && values.employeeId) {
        formData.append("employeeId", String(values.employeeId));
      }
      onSubmitValues(formData);
    }
  };

  const showEmployeeDropdown =
    (canApplyForOthers && applyTab === "others" && !isEdit) ||
    (isEdit && canApplyForOthers);

  const tabTriggerClass =
    "flex items-center gap-2 rounded-[50px] !px-3 !py-2 transition-all h-[35px] " +
    "text-foreground/70 hover:text-foreground " +
    "data-[state=active]:bg-foreground data-[state=active]:text-background data-[state=active]:shadow-sm " +
    "dark:text-muted-foreground dark:hover:text-foreground " +
    "dark:data-[state=active]:bg-primary dark:data-[state=active]:text-white dark:data-[state=active]:shadow-[0_2px_8px_oklch(0_0_0/0.5)]";

  // ── Leave Balance Badge ────────────────────────────────────────────────────
  const LeaveBalanceBadge = () => {
    if (isEdit || isViewOnly || !watchLeaveTypeId) return null;
    const targetUserId = isSelfApplyMode ? currentUserId : watchEmployeeId;
    if (!targetUserId) return null;

    const leaveTypeLabel =
      LEAVE_TYPE.find((t) => t.value === watchLeaveTypeId)?.label ?? "";

    const balanceArray = Array.isArray(leaveBalanceData)
      ? leaveBalanceData
      : Array.isArray(leaveBalanceData?.data)
        ? leaveBalanceData.data
        : [];

    const selectedTypeRecord = balanceArray.find(
      (item: any) => String(item.leaveTypeId) === String(watchLeaveTypeId)
    );
    const leaveBalance = selectedTypeRecord?.availableDays ?? null;

    return (
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-red-200 bg-rose-50/50 text-sm w-fit text-rose-700">
        <Wallet className="h-4 w-4 text-rose-500 shrink-0" />
        <span className="font-medium">{leaveTypeLabel} Balance:</span>
        {leaveBalanceLoading ? (
          <span className="italic text-xs animate-pulse">Fetching...</span>
        ) : leaveBalance !== null && leaveBalance !== undefined ? (
          <span className="font-bold">{leaveBalance}</span>
        ) : (
          <span className="italic text-xs">No data</span>
        )}
      </div>
    );
  };

  // ── Per-day table ──────────────────────────────────────────────────────────
  const LeaveDaysTable = () => {
    if (fields.length === 0) return null;

    return (
      <div className="rounded-lg border overflow-hidden text-sm">
        {/* Header */}
        <div className="grid grid-cols-[1fr_1fr_1.5fr_1.2fr] gap-2 bg-muted/60 px-3 py-2 font-semibold text-muted-foreground text-xs uppercase tracking-wide">
          <span>Leave Date</span>
          <span>Day</span>
          <span>Half / Full Day</span>
          <span>1st / 2nd Half</span>
        </div>

        {/* Rows */}
        <div className="max-h-[280px] overflow-y-auto divide-y">
          {fields.map((field, idx) => {
            const isWeekend = field.isWeekend;
            const dayType = form.watch(`leaveDays.${idx}.dayType`);

            return (
              <div
                key={field.id}
                className={cn(
                  "grid grid-cols-[1fr_1fr_1.5fr_1.2fr] gap-2 items-center px-3 py-2",
                  isWeekend && "bg-muted/20"
                )}
              >
                {/* Date */}
                <span className="font-medium text-foreground tabular-nums">
                  {field.date}
                </span>

                {/* Day name */}
                <span
                  className={cn(
                    isWeekend
                      ? "text-red-500 font-medium"
                      : "text-muted-foreground"
                  )}
                >
                  {field.dayName}
                  {isWeekend && (
                    <span className="ml-1 text-[10px] text-red-400">
                      (Weekly Off)
                    </span>
                  )}
                </span>

                {/* Half / Full selector */}
                <FormField
                  control={form.control}
                  name={`leaveDays.${idx}.dayType`}
                  render={({ field: f }) => (
                    <FormItem className="m-0 p-0 space-y-0">
                      <FormControl>
                        <RadioGroup
                          onValueChange={(val) => {
                            f.onChange(val);
                            if (val === "full") {
                              form.setValue(`leaveDays.${idx}.halfType`, null);
                            }
                          }}
                          value={f.value}
                          disabled={isViewOnly}
                          className="flex items-center gap-3"
                        >
                          <div className="flex items-center gap-1">
                            <RadioGroupItem
                              value="half"
                              id={`half-${idx}`}
                              className="h-3.5 w-3.5"
                            />
                            <Label
                              htmlFor={`half-${idx}`}
                              className="text-xs cursor-pointer"
                            >
                              Half
                            </Label>
                          </div>
                          <div className="flex items-center gap-1">
                            <RadioGroupItem
                              value="full"
                              id={`full-${idx}`}
                              className="h-3.5 w-3.5"
                            />
                            <Label
                              htmlFor={`full-${idx}`}
                              className="text-xs cursor-pointer"
                            >
                              Full
                            </Label>
                          </div>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage className="text-[10px]" />
                    </FormItem>
                  )}
                />

                {/* 1st / 2nd half selector */}
                <FormField
                  control={form.control}
                  name={`leaveDays.${idx}.halfType`}
                  render={({ field: f }) => (
                    <FormItem className="m-0 p-0 space-y-0">
                      <FormControl>
                        <RadioGroup
                          onValueChange={f.onChange}
                          value={f.value || ""}
                          disabled={isViewOnly || dayType !== "half"}
                          className="flex items-center gap-3"
                        >
                          <div className="flex items-center gap-1">
                            <RadioGroupItem
                              value="first_half"
                              id={`1st-${idx}`}
                              className="h-3.5 w-3.5"
                              disabled={dayType !== "half"}
                            />
                            <Label
                              htmlFor={`1st-${idx}`}
                              className={cn(
                                "text-xs cursor-pointer",
                                dayType !== "half" && "text-muted-foreground/40"
                              )}
                            >
                              1st
                            </Label>
                          </div>
                          <div className="flex items-center gap-1">
                            <RadioGroupItem
                              value="second_half"
                              id={`2nd-${idx}`}
                              className="h-3.5 w-3.5"
                              disabled={dayType !== "half"}
                            />
                            <Label
                              htmlFor={`2nd-${idx}`}
                              className={cn(
                                "text-xs cursor-pointer",
                                dayType !== "half" && "text-muted-foreground/40"
                              )}
                            >
                              2nd
                            </Label>
                          </div>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage className="text-[10px]" />
                    </FormItem>
                  )}
                />
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // ── Form body ──────────────────────────────────────────────────────────────
  const formBody = (
    <Form {...form}>
      <form
        id="leave-form"
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-4 p-0.5"
      >
        {/* Employee dropdown */}
        {showEmployeeDropdown && (
          <CustomDropDownSearchable
            form={form}
            name="employeeId"
            label="Employee"
            options={employeesList?.data?.map((u: any) => ({
              value: u.id,
              label: u.fullName,
            }))}
            placeholder="Select employee"
            isLoading={employeesListLoading}
            disabled={isEdit || isViewOnly}
            showClearButton={!isEdit && !isViewOnly}
          />
        )}

        {/* Leave Type */}
        <CustomDropDownSearchable
          form={form}
          name="leaveTypeId"
          label={
            <span>
              Leave Type <span className="text-red-500">*</span>
            </span>
          }
          options={LEAVE_TYPE.map((t) => ({
            value: t.value,
            label: t.label,
          }))}
          placeholder="Select leave type"
          disabled={isViewOnly}
          showClearButton={false}
          searchEnabled={false}
        />

        {/* Leave Balance Badge */}
        <LeaveBalanceBadge />

        {/* Date Range */}
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

        {/* Per-day Leave Table */}
        <LeaveDaysTable />

        {/* leaveDays array-level error */}
        {form.formState.errors.leaveDays &&
          !Array.isArray(form.formState.errors.leaveDays) && (
            <p className="text-xs font-semibold text-destructive">
              {(form.formState.errors.leaveDays as any)?.message}
            </p>
          )}

        {/* Optional Description */}
        {/* <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="Short description..."
                  disabled={isViewOnly}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        /> */}

        {/* General Reason */}
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
                  placeholder="Reason for leave..."
                  className="min-h-[60px]"
                  disabled={isViewOnly}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </form>
    </Form>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl max-h-[90dvh] overflow-auto">
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
          {canApplyForOthers && !isEdit && !isViewOnly ? (
            <Tabs
              value={applyTab}
              onValueChange={(val) => {
                setApplyTab(val as "self" | "others");
                form.reset(emptyDefaults);
                replace([]);
              }}
            >
              <TabsList className="bg-[#fdebef] rounded-full dark:bg-muted dark:border-white/10 border border-rose-100/50 h-9 w-fit mb-4">
                <TabsTrigger value="self" className={tabTriggerClass}>
                  Self
                </TabsTrigger>
                <TabsTrigger value="others" className={tabTriggerClass}>
                  For Others
                </TabsTrigger>
              </TabsList>
              <TabsContent value="self">{formBody}</TabsContent>
              <TabsContent value="others">{formBody}</TabsContent>
            </Tabs>
          ) : (
            formBody
          )}
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
