import { AlertCircle } from "lucide-react";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import CustomDropDownSearchable from "@/components/shared/custome-searchable-dropdown";
import { Textarea } from "@/components/ui/textarea";
import { CustomDatePicker } from "@/components/shared/custome-datePicker";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FileUpload } from "@/components/shared/custome-file-upload";
import {
  CASUAL_LEAVE_TYPE_ID,
  PAID_LEAVE_TYPE_ID,
  LOSS_OF_PAY_LEAVE_TYPE_ID,
} from "../types/action-form-helpers";

interface LeaveFormFieldsProps {
  form: any;
  isEdit?: boolean;
  isViewOnly?: boolean;
  isAdmin?: boolean;
  showEmployeeDropdown?: boolean;
  employeeOptions: any[];
  employeesListLoading: boolean;
  watchIsExamLeave?: boolean;
  watchFromDate: any;
  isExamLeaveEligible?: boolean;
  notifyUserOptions: any[];
}

export const LeaveFormFields = ({
  form,
  isEdit,
  isViewOnly,
  isAdmin,
  showEmployeeDropdown,
  employeeOptions,
  employeesListLoading,
  watchIsExamLeave,
  watchFromDate,
  isExamLeaveEligible,
  notifyUserOptions,
}: LeaveFormFieldsProps) => {
  return (
    <>
      {/* Employee & Leave Type */}
      {(showEmployeeDropdown || !watchIsExamLeave) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {showEmployeeDropdown && (
            <CustomDropDownSearchable
              form={form}
              name="employeeId"
              label="Employee"
              options={employeeOptions}
              placeholder="Select employee"
              isLoading={employeesListLoading}
              disabled={isEdit || isViewOnly}
              showClearButton={!isEdit && !isViewOnly}
            />
          )}

          {!watchIsExamLeave && (
            <FormField
              control={form.control}
              name="leaveTypeId"
              render={({ field }) => (
                <FormItem className="full">
                  <FormLabel>
                    Leave Type <span className="text-red-500">*</span>
                  </FormLabel>
                  <Select
                    onValueChange={(val) => {
                      field.onChange(val);
                      form.setValue("leaveTypeId", val, {
                        shouldValidate: true,
                        shouldDirty: true,
                        shouldTouch: true,
                      });
                    }}
                    value={field.value}
                    disabled={isViewOnly}
                  >
                    <FormControl>
                      <SelectTrigger className="h-9 w-full">
                        <SelectValue placeholder="Select leave type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value={CASUAL_LEAVE_TYPE_ID}>
                        Casual Leave
                      </SelectItem>
                      <SelectItem value={PAID_LEAVE_TYPE_ID}>
                        Paid Leave
                      </SelectItem>
                      <SelectItem value={LOSS_OF_PAY_LEAVE_TYPE_ID}>
                        Loss of Pay
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
        </div>
      )}

      {/* Date Range */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <CustomDatePicker
          control={form.control}
          name="fromDate"
          label={
            <>
              From Date <span className="text-red-500">*</span>
            </>
          }
          disabled={isViewOnly}
        />
        <CustomDatePicker
          control={form.control}
          name="toDate"
          label={
            <>
              To Date <span className="text-red-500">*</span>
            </>
          }
          disabled={isViewOnly || !watchFromDate}
          minDate={watchFromDate}
        />
      </div>

      {!isEdit && !isViewOnly && isExamLeaveEligible && (
        <FormField
          control={form.control}
          name="isExamLeave"
          render={({ field }) => (
            <FormItem className="rounded-lg border border-slate-200 p-4 shadow-sm dark:border-slate-800">
              <div className="flex flex-row items-center justify-between">
                <div className="space-y-0.5">
                  <FormLabel className="text-sm font-semibold">
                    Exam Leave
                  </FormLabel>
                  <div className="text-[12px] text-muted-foreground">
                    Enable this option if the leave request is for an
                    examination.
                  </div>
                </div>
                <FormControl>
                  <Switch
                    checked={!!field.value}
                    onCheckedChange={(val) => {
                      field.onChange(val);
                      form.setValue("isExamLeave", val, {
                        shouldValidate: true,
                        shouldDirty: true,
                        shouldTouch: true,
                      });
                      if (!isAdmin) {
                        // For non-admin users, sync leaveTypeId with exam leave state
                        if (val) {
                          form.setValue("leaveTypeId", "4", {
                            shouldValidate: true,
                            shouldDirty: true,
                            shouldTouch: true,
                          });
                        } else {
                          form.setValue("leaveTypeId", undefined, {
                            shouldValidate: true,
                            shouldDirty: true,
                            shouldTouch: true,
                          });
                        }
                      }
                    }}
                    disabled={isViewOnly}
                  />
                </FormControl>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
      )}

      {isViewOnly ? (
        <div className="space-y-1">
          <FormLabel>Attachment</FormLabel>
          <div className="pt-1">
            {(() => {
              const attachmentsVal = form.watch("attachments");
              if (Array.isArray(attachmentsVal) && attachmentsVal.length > 0) {
                return (
                  <div className="space-y-1.5">
                    {attachmentsVal.map((att: any, idx: number) => (
                      <div key={att.id || idx}>
                        <a
                          href={att.referenceFileLink || att.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-500 hover:underline font-medium inline-flex items-center gap-1.5"
                        >
                          View/Download {att.name || `Attachment ${idx + 1}`}
                        </a>
                      </div>
                    ))}
                  </div>
                );
              }
              if (typeof attachmentsVal === "string" && attachmentsVal) {
                return (
                  <a
                    href={attachmentsVal}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-500 hover:underline font-medium"
                  >
                    View/Download Attachment
                  </a>
                );
              }
              return <p className="text-sm text-muted-foreground">-</p>;
            })()}
          </div>
        </div>
      ) : (
        <FileUpload
          name="attachments"
          label="Attachment (Optional)"
          fileLabel="Only PDF and JPEG allowed (Max 5MB)"
          acceptedFormats={{
            "application/pdf": [".pdf"],
            "image/jpeg": [".jpg", ".jpeg"],
          }}
          disabled={isViewOnly}
          existingFileUrl={
            typeof form.watch("attachments") === "string"
              ? (form.watch("attachments") as string)
              : Array.isArray(form.watch("attachments")) &&
                  form.watch("attachments").length > 0
                ? form.watch("attachments")[0]?.referenceFileLink ||
                  form.watch("attachments")[0]?.url
                : undefined
          }
          existingFileName={
            typeof form.watch("attachments") === "string"
              ? (form.watch("attachments") as string).split("/").pop()
              : Array.isArray(form.watch("attachments")) &&
                  form.watch("attachments").length > 0
                ? form.watch("attachments")[0]?.name
                : undefined
          }
        />
      )}

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
                className="min-h-[120px] resize-y"
                disabled={isViewOnly}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Notify Users Dropdown with Checkbox-style Multi-Select */}
      <CustomDropDownSearchable
        form={form}
        name="notifyUserIds"
        label="Notify Users"
        multiple
        options={notifyUserOptions}
        placeholder="Select users to notify"
        searchEnabled={true}
        isLoading={employeesListLoading}
        disabled={isViewOnly}
      />

      {/* leaveDays array-level error rendered as a warning banner */}
      {form.formState.errors.leaveDays &&
        !Array.isArray(form.formState.errors.leaveDays) && (
          <div className="mt-4 flex items-center gap-2 rounded-lg border border-destructive/20 bg-destructive/5 p-3 text-xs font-semibold text-destructive animate-in fade-in-50 duration-200">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{(form.formState.errors.leaveDays as any)?.message}</span>
          </div>
        )}
    </>
  );
};
