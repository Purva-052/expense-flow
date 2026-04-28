/* eslint-disable react-refresh/only-export-components */
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Cpu,
  Headphones,
  Keyboard,
  Laptop,
  Monitor,
  Mouse,
} from "lucide-react";
import { ComponentType, ReactNode, useEffect, useMemo } from "react";
import { SubmitHandler, useForm, useWatch } from "react-hook-form";
import CustomButton from "@/components/shared/custom-button";
import CustomDropDownSearchable from "@/components/shared/custome-searchable-dropdown";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  SelectValue,
  systemInventorySchema,
  TSystemInventorySchema,
} from "../schema";
import {
  CONNECTION_OPTIONS,
  DEVICE_OWNERSHIP_OPTIONS,
  DropdownOption,
} from "../types";

export interface SystemInventoryFormProps {
  initialValues?: Partial<TSystemInventorySchema> | null;
  onSubmit: (values: TSystemInventorySchema) => void;
  loading?: boolean;
  disabled?: boolean;
  submitLabel?: string;
  hideSubmitButton?: boolean;
  formId?: string;
  showEmployeeSelect?: boolean;
  employeeOptions?: DropdownOption[];
  processorList?: unknown[];
  ramList?: unknown[];
  storageList?: unknown[];
  brandList?: unknown[];
  headphoneBrandList?: unknown[];
  monitorSizeList?: unknown[];
  dropdownLoading?: boolean;
  isAdmin?: boolean;
}

export interface SystemInventoryViewFormProps {
  inventory?: unknown;
  processorList?: unknown[];
  ramList?: unknown[];
  storageList?: unknown[];
  brandList?: unknown[];
  headphoneBrandList?: unknown[];
  monitorSizeList?: unknown[];
}

export const DEFAULT_SYSTEM_INVENTORY_VALUES: TSystemInventorySchema = {
  mouseEnabled: false,
  mouseConnectionType: "",
  mouseOwnershipType: "company",

  keyboardEnabled: false,
  keyboardConnectionType: "",
  keyboardOwnershipType: "company",

  cpuEnabled: false,
  cpuProcessorId: undefined,
  cpuStorageId: undefined,
  cpuRamId: undefined,
  cpuOwnershipType: "company",

  laptopEnabled: false,
  laptopBrandId: undefined,
  laptopProcessorId: undefined,
  laptopStorageId: undefined,
  laptopRamId: undefined,
  laptopOwnershipType: "company",

  monitorEnabled: false,
  monitorBrandId: undefined,
  monitorSizeId: undefined,
  monitorOwnershipType: "company",

  headphoneEnabled: false,
  headphoneBrandId: undefined,
  headphoneConnectionType: "",
  headphoneOwnershipType: "company",

  employeeId: undefined,
  notes: "",
};

export const isObjectCheck = (
  value: unknown
): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

export const pickDefined = (...values: unknown[]) =>
  values.find((value) => value !== undefined && value !== null);

const parseIdValue = (value: SelectValue) => {
  if (value === undefined || value === null || value === "") {
    return null;
  }

  if (typeof value === "number") {
    return value;
  }

  const cleanedValue = value.trim();

  if (/^\d+$/.test(cleanedValue)) {
    return Number(cleanedValue);
  }

  return cleanedValue;
};

export const buildSystemInventoryPayload = (
  values: TSystemInventorySchema,
  options?: { includeEmployeeId?: boolean }
) => {
  const payload: Record<string, unknown> = {
    mouseConnectionType: values.mouseEnabled
      ? values.mouseConnectionType || null
      : null,
    mouseOwnershipType: values.mouseEnabled ? values.mouseOwnershipType : null,

    keyboardConnectionType: values.keyboardEnabled
      ? values.keyboardConnectionType || null
      : null,
    keyboardOwnershipType: values.keyboardEnabled
      ? values.keyboardOwnershipType
      : null,

    cpuProcessorId: values.cpuEnabled
      ? parseIdValue(values.cpuProcessorId)
      : null,
    cpuStorageId: values.cpuEnabled ? parseIdValue(values.cpuStorageId) : null,
    cpuRamId: values.cpuEnabled ? parseIdValue(values.cpuRamId) : null,
    cpuOwnershipType: values.cpuEnabled ? values.cpuOwnershipType : null,

    laptopBrandId: values.laptopEnabled
      ? parseIdValue(values.laptopBrandId)
      : null,
    laptopProcessorId: values.laptopEnabled
      ? parseIdValue(values.laptopProcessorId)
      : null,
    laptopStorageId: values.laptopEnabled
      ? parseIdValue(values.laptopStorageId)
      : null,
    laptopRamId: values.laptopEnabled ? parseIdValue(values.laptopRamId) : null,
    laptopOwnershipType: values.laptopEnabled
      ? values.laptopOwnershipType
      : null,

    monitorBrandId: values.monitorEnabled
      ? parseIdValue(values.monitorBrandId)
      : null,
    monitorSizeId: values.monitorEnabled
      ? parseIdValue(values.monitorSizeId)
      : null,
    monitorOwnershipType: values.monitorEnabled
      ? values.monitorOwnershipType
      : null,

    headphoneBrandId: values.headphoneEnabled
      ? parseIdValue(values.headphoneBrandId)
      : null,
    headphoneConnectionType: values.headphoneEnabled
      ? values.headphoneConnectionType || null
      : null,
    headphoneOwnershipType: values.headphoneEnabled
      ? values.headphoneOwnershipType
      : null,

    notes: values.notes?.trim() || null,
  };

  if (options?.includeEmployeeId) {
    const employeeId = parseIdValue(values.employeeId);
    if (employeeId !== null && employeeId !== undefined && employeeId !== "") {
      payload.employeeId = employeeId;
    }
  }

  return payload;
};

export const mapDropdownOptions = (
  items: unknown[] | undefined
): DropdownOption[] => {
  if (!Array.isArray(items)) {
    return [];
  }

  return items
    .map((item) => {
      if (typeof item === "string" || typeof item === "number") {
        return {
          label: String(item),
          value: item,
        };
      }

      if (isObjectCheck(item)) {
        const value = pickDefined(item.id, item.value, item._id, item.key);
        const label = pickDefined(item.name, item.label, item.title);

        if (
          (typeof value === "string" || typeof value === "number") &&
          typeof label === "string"
        ) {
          return {
            label,
            value,
          };
        }
      }

      return null;
    })
    .filter((item): item is DropdownOption => item !== null);
};

/** Compact ownership + connection type row rendered inside a section */
function OwnershipDropdown({
  form,
  name,
  disabled,
  className,
}: Readonly<{
  form: ReturnType<typeof useForm<TSystemInventorySchema>>;
  name: keyof TSystemInventorySchema;
  disabled?: boolean;
  className?: string;
}>) {
  return (
    <CustomDropDownSearchable
      form={form}
      name={name as string}
      label="Ownership"
      options={DEVICE_OWNERSHIP_OPTIONS}
      placeholder="Select ownership"
      disabled={disabled}
      className={cn("max-w-[200px]", className)}
      triggerClassName="h-9 w-full bg-[#f5f5f5]"
      searchEnabled={false}
      sortOptions={false}
    />
  );
}

function InventorySection({
  title,
  enabled,
  onEnabledChange,
  disabled,
  icon,
  showAsterisk,
  children,
}: Readonly<{
  title: string;
  enabled: boolean;
  onEnabledChange: (checked: boolean) => void;
  disabled?: boolean;
  icon: ComponentType<{ className?: string }>;
  showAsterisk?: boolean;
  children: ReactNode;
}>) {
  const Icon = icon;

  return (
    <div className="space-y-4 rounded-md border bg-card p-4">
      <div className="flex items-center gap-2">
        <Checkbox
          checked={enabled}
          onCheckedChange={(checked) => onEnabledChange(checked === true)}
          disabled={disabled}
        />
        <Icon className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-semibold">
          {title}
          {showAsterisk && <span className="ml-1 text-red-500">*</span>}
        </span>
      </div>
      <div>{children}</div>
    </div>
  );
}

export function SystemInventoryActionForm({
  initialValues,
  onSubmit,
  loading,
  disabled,
  submitLabel = "Submit Inventory",
  hideSubmitButton,
  formId = "system-inventory-form",
  showEmployeeSelect = false,
  employeeOptions = [],
  processorList,
  ramList,
  storageList,
  brandList,
  headphoneBrandList,
  monitorSizeList,
  dropdownLoading,
}: Readonly<SystemInventoryFormProps>) {
  const form = useForm<TSystemInventorySchema>({
    resolver: zodResolver(systemInventorySchema),
    mode: "onSubmit",
    reValidateMode: "onChange",
    defaultValues: DEFAULT_SYSTEM_INVENTORY_VALUES,
  });

  const mergedValues = useMemo(
    () => ({
      ...DEFAULT_SYSTEM_INVENTORY_VALUES,
      ...initialValues,
    }),
    [initialValues]
  );

  useEffect(() => {
    form.reset(mergedValues);
  }, [form, mergedValues]);

  const mouseEnabled = useWatch({
    control: form.control,
    name: "mouseEnabled",
  });
  const keyboardEnabled = useWatch({
    control: form.control,
    name: "keyboardEnabled",
  });
  const cpuEnabled = useWatch({ control: form.control, name: "cpuEnabled" });
  const laptopEnabled = useWatch({
    control: form.control,
    name: "laptopEnabled",
  });
  const monitorEnabled = useWatch({
    control: form.control,
    name: "monitorEnabled",
  });
  const headphoneEnabled = useWatch({
    control: form.control,
    name: "headphoneEnabled",
  });

  const processorOptions = useMemo(
    () => mapDropdownOptions(processorList),
    [processorList]
  );
  const ramOptions = useMemo(() => mapDropdownOptions(ramList), [ramList]);
  const storageOptions = useMemo(
    () => mapDropdownOptions(storageList),
    [storageList]
  );
  const brandOptions = useMemo(
    () => mapDropdownOptions(brandList),
    [brandList]
  );
  const headphoneBrandOptions = useMemo(
    () => mapDropdownOptions(headphoneBrandList),
    [headphoneBrandList]
  );
  const monitorSizeOptions = useMemo(
    () => mapDropdownOptions(monitorSizeList),
    [monitorSizeList]
  );

  const submitForm: SubmitHandler<TSystemInventorySchema> = (values) => {
    const hasValue = (value: SelectValue | string | undefined) =>
      !(value === null || value === undefined || value === "");

    if (showEmployeeSelect && !hasValue(values.employeeId)) {
      form.setError("employeeId", {
        type: "manual",
        message: "Employee is required",
      });
      return;
    }

    onSubmit(values);
  };

  const clearSectionErrors = (fields: (keyof TSystemInventorySchema)[]) => {
    form.clearErrors(fields);
    fields.forEach((field) => {
      const defaultValue = DEFAULT_SYSTEM_INVENTORY_VALUES[field];
      form.setValue(field, defaultValue as never, {
        shouldDirty: true,
        shouldTouch: false,
        shouldValidate: false,
      });
    });
  };

  const renderSection = (name: keyof TSystemInventorySchema) => {
    switch (name) {
      case "mouseEnabled":
        return (
          <FormField
            control={form.control}
            name="mouseEnabled"
            render={({ field }) => (
              <InventorySection
                title="Mouse"
                icon={Mouse}
                enabled={field.value}
                onEnabledChange={(checked) => {
                  field.onChange(checked);
                  if (!checked) {
                    clearSectionErrors([
                      "mouseConnectionType",
                      "mouseOwnershipType",
                    ]);
                  }
                }}
                disabled={disabled}
                showAsterisk={mouseEnabled}
              >
                <div
                  className={cn(
                    "grid grid-cols-1 gap-3 md:grid-cols-2",
                    !mouseEnabled && "opacity-50 pointer-events-none"
                  )}
                >
                  <CustomDropDownSearchable
                    form={form}
                    name="mouseConnectionType"
                    label={
                      <span>
                        Connection Type
                        {mouseEnabled && (
                          <span className="ml-1 text-red-500">*</span>
                        )}
                      </span>
                    }
                    options={CONNECTION_OPTIONS}
                    placeholder="Select connection type"
                    disabled={disabled || !mouseEnabled || dropdownLoading}
                    className="max-w-[220px]"
                    triggerClassName="h-9 bg-[#f5f5f5]"
                    searchEnabled={false}
                    sortOptions={false}
                  />
                  <OwnershipDropdown
                    form={form}
                    name="mouseOwnershipType"
                    disabled={disabled || !mouseEnabled}
                  />
                </div>
              </InventorySection>
            )}
          />
        );
      case "keyboardEnabled":
        return (
          <FormField
            control={form.control}
            name="keyboardEnabled"
            render={({ field }) => (
              <InventorySection
                title="Keyboard"
                icon={Keyboard}
                enabled={field.value}
                onEnabledChange={(checked) => {
                  field.onChange(checked);
                  if (!checked) {
                    clearSectionErrors([
                      "keyboardConnectionType",
                      "keyboardOwnershipType",
                    ]);
                  }
                }}
                disabled={disabled}
                showAsterisk={keyboardEnabled}
              >
                <div
                  className={cn(
                    "grid grid-cols-1 gap-3 md:grid-cols-2",
                    !keyboardEnabled && "opacity-50 pointer-events-none"
                  )}
                >
                  <CustomDropDownSearchable
                    form={form}
                    name="keyboardConnectionType"
                    label={
                      <span>
                        Connection Type
                        {keyboardEnabled && (
                          <span className="ml-1 text-red-500">*</span>
                        )}
                      </span>
                    }
                    options={CONNECTION_OPTIONS}
                    placeholder="Select connection type"
                    disabled={disabled || !keyboardEnabled || dropdownLoading}
                    className="max-w-[220px]"
                    triggerClassName="h-9 bg-[#f5f5f5]"
                    searchEnabled={false}
                    sortOptions={false}
                  />
                  <OwnershipDropdown
                    form={form}
                    name="keyboardOwnershipType"
                    disabled={disabled || !keyboardEnabled}
                  />
                </div>
              </InventorySection>
            )}
          />
        );
      case "cpuEnabled":
        return (
          <FormField
            control={form.control}
            name="cpuEnabled"
            render={({ field }) => (
              <InventorySection
                title="CPU / Computer"
                icon={Cpu}
                enabled={field.value}
                onEnabledChange={(checked) => {
                  field.onChange(checked);
                  if (!checked) {
                    clearSectionErrors([
                      "cpuProcessorId",
                      "cpuStorageId",
                      "cpuRamId",
                      "cpuOwnershipType",
                    ]);
                  }
                }}
                disabled={disabled}
                showAsterisk={cpuEnabled}
              >
                <div className="space-y-3">
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                    <CustomDropDownSearchable
                      form={form}
                      name="cpuProcessorId"
                      label={
                        <span>
                          Processor
                          {cpuEnabled && (
                            <span className="ml-1 text-red-500">*</span>
                          )}
                        </span>
                      }
                      options={processorOptions}
                      placeholder="Select processor"
                      disabled={disabled || !cpuEnabled || dropdownLoading}
                      className="max-w-[300px]"
                      triggerClassName="h-9 bg-[#f5f5f5]"
                    />
                    <CustomDropDownSearchable
                      form={form}
                      name="cpuStorageId"
                      label={
                        <span>
                          Storage
                          {cpuEnabled && (
                            <span className="ml-1 text-red-500">*</span>
                          )}
                        </span>
                      }
                      options={storageOptions}
                      placeholder="Select storage"
                      disabled={disabled || !cpuEnabled || dropdownLoading}
                      className="max-w-[300px]"
                      triggerClassName="h-9 bg-[#f5f5f5]"
                    />
                    <CustomDropDownSearchable
                      form={form}
                      name="cpuRamId"
                      label={
                        <span>
                          RAM
                          {cpuEnabled && (
                            <span className="ml-1 text-red-500">*</span>
                          )}
                        </span>
                      }
                      options={ramOptions}
                      placeholder="Select RAM"
                      disabled={disabled || !cpuEnabled || dropdownLoading}
                      className="max-w-[300px]"
                      triggerClassName="h-9 bg-[#f5f5f5]"
                    />
                  </div>
                  <OwnershipDropdown
                    form={form}
                    name="cpuOwnershipType"
                    disabled={disabled || !cpuEnabled}
                  />
                </div>
              </InventorySection>
            )}
          />
        );
      case "laptopEnabled":
        return (
          <FormField
            control={form.control}
            name="laptopEnabled"
            render={({ field }) => (
              <InventorySection
                title="Laptop"
                icon={Laptop}
                enabled={field.value}
                onEnabledChange={(checked) => {
                  field.onChange(checked);
                  if (!checked) {
                    clearSectionErrors([
                      "laptopBrandId",
                      "laptopProcessorId",
                      "laptopStorageId",
                      "laptopRamId",
                      "laptopOwnershipType",
                    ]);
                  }
                }}
                disabled={disabled}
                showAsterisk={laptopEnabled}
              >
                <div className="space-y-3">
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                    <CustomDropDownSearchable
                      form={form}
                      name="laptopBrandId"
                      label={
                        <span>
                          Brand
                          {laptopEnabled && (
                            <span className="ml-1 text-red-500">*</span>
                          )}
                        </span>
                      }
                      options={brandOptions}
                      placeholder="Select brand"
                      disabled={disabled || !laptopEnabled || dropdownLoading}
                      className="max-w-xs"
                      triggerClassName="h-9 bg-[#f5f5f5]"
                    />
                    <CustomDropDownSearchable
                      form={form}
                      name="laptopProcessorId"
                      label={
                        <span>
                          Processor
                          {laptopEnabled && (
                            <span className="ml-1 text-red-500">*</span>
                          )}
                        </span>
                      }
                      options={processorOptions}
                      placeholder="Select processor"
                      disabled={disabled || !laptopEnabled || dropdownLoading}
                      className="max-w-xs"
                      triggerClassName="h-9 bg-[#f5f5f5]"
                    />
                    <CustomDropDownSearchable
                      form={form}
                      name="laptopStorageId"
                      label={
                        <span>
                          Storage
                          {laptopEnabled && (
                            <span className="ml-1 text-red-500">*</span>
                          )}
                        </span>
                      }
                      options={storageOptions}
                      placeholder="Select storage"
                      disabled={disabled || !laptopEnabled || dropdownLoading}
                      className="max-w-xs"
                      triggerClassName="h-9 bg-[#f5f5f5]"
                    />
                    <CustomDropDownSearchable
                      form={form}
                      name="laptopRamId"
                      label={
                        <span>
                          RAM
                          {laptopEnabled && (
                            <span className="ml-1 text-red-500">*</span>
                          )}
                        </span>
                      }
                      options={ramOptions}
                      placeholder="Select RAM"
                      disabled={disabled || !laptopEnabled || dropdownLoading}
                      className="max-w-xs"
                      triggerClassName="h-9 bg-[#f5f5f5]"
                    />
                  </div>
                  <OwnershipDropdown
                    form={form}
                    name="laptopOwnershipType"
                    disabled={disabled || !laptopEnabled}
                  />
                </div>
              </InventorySection>
            )}
          />
        );
      case "monitorEnabled":
        return (
          <FormField
            control={form.control}
            name="monitorEnabled"
            render={({ field }) => (
              <InventorySection
                title="Monitor"
                icon={Monitor}
                enabled={field.value}
                onEnabledChange={(checked) => {
                  field.onChange(checked);
                  if (!checked) {
                    clearSectionErrors([
                      "monitorBrandId",
                      "monitorSizeId",
                      "monitorOwnershipType",
                    ]);
                  }
                }}
                disabled={disabled}
                showAsterisk={monitorEnabled}
              >
                <div className="space-y-3">
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                    <CustomDropDownSearchable
                      form={form}
                      name="monitorBrandId"
                      label={
                        <span>
                          Brand
                          {monitorEnabled && (
                            <span className="ml-1 text-red-500">*</span>
                          )}
                        </span>
                      }
                      options={brandOptions}
                      placeholder="Select brand"
                      disabled={disabled || !monitorEnabled || dropdownLoading}
                      className="max-w-xs"
                      triggerClassName="h-9 bg-[#f5f5f5]"
                    />
                    <CustomDropDownSearchable
                      form={form}
                      name="monitorSizeId"
                      label="Size"
                      options={monitorSizeOptions}
                      placeholder="Select size"
                      disabled={disabled || !monitorEnabled || dropdownLoading}
                      className="max-w-xs"
                      triggerClassName="h-9 bg-[#f5f5f5]"
                    />
                  </div>
                  <OwnershipDropdown
                    form={form}
                    name="monitorOwnershipType"
                    disabled={disabled || !monitorEnabled}
                  />
                </div>
              </InventorySection>
            )}
          />
        );
      case "headphoneEnabled":
        return (
          <FormField
            control={form.control}
            name="headphoneEnabled"
            render={({ field }) => (
              <InventorySection
                title="Headphones"
                icon={Headphones}
                enabled={field.value}
                onEnabledChange={(checked) => {
                  field.onChange(checked);
                  if (!checked) {
                    clearSectionErrors([
                      "headphoneBrandId",
                      "headphoneConnectionType",
                      "headphoneOwnershipType",
                    ]);
                  }
                }}
                disabled={disabled}
                showAsterisk={headphoneEnabled}
              >
                <div className="space-y-3">
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                    <CustomDropDownSearchable
                      form={form}
                      name="headphoneBrandId"
                      label={
                        <span>
                          Brand
                          {headphoneEnabled && (
                            <span className="ml-1 text-red-500">*</span>
                          )}
                        </span>
                      }
                      options={headphoneBrandOptions}
                      placeholder="Select brand"
                      disabled={
                        disabled || !headphoneEnabled || dropdownLoading
                      }
                      className="max-w-xs"
                      triggerClassName="h-9 bg-[#f5f5f5]"
                    />
                    <CustomDropDownSearchable
                      form={form}
                      name="headphoneConnectionType"
                      label={
                        <span>
                          Connection Type
                          {headphoneEnabled && (
                            <span className="ml-1 text-red-500">*</span>
                          )}
                        </span>
                      }
                      options={CONNECTION_OPTIONS}
                      placeholder="Select connection type"
                      disabled={
                        disabled || !headphoneEnabled || dropdownLoading
                      }
                      className="max-w-xs"
                      triggerClassName="h-9 bg-[#f5f5f5]"
                      searchEnabled={false}
                      sortOptions={false}
                    />
                  </div>
                  <OwnershipDropdown
                    form={form}
                    name="headphoneOwnershipType"
                    disabled={disabled || !headphoneEnabled}
                  />
                </div>
              </InventorySection>
            )}
          />
        );
      default:
        return null;
    }
  };

  return (
    <Form {...form}>
      <form
        id={formId}
        onSubmit={form.handleSubmit(submitForm)}
        className="space-y-5 overflow-auto"
      >
        {showEmployeeSelect && (
          <div className="space-y-1">
            <CustomDropDownSearchable
              form={form}
              name="employeeId"
              label={
                <span>
                  Employee <span className="text-red-500">*</span>
                </span>
              }
              options={employeeOptions}
              placeholder="Select employee"
              disabled={disabled || dropdownLoading}
              className="max-w-sm"
              triggerClassName="h-9 bg-[#f5f5f5]"
            />
            {form.formState.errors.employeeId?.message && (
              <p className="text-sm font-medium text-destructive">
                {form.formState.errors.employeeId.message}
              </p>
            )}
          </div>
        )}

        <div className="space-y-4">
          {renderSection("mouseEnabled")}
          {renderSection("keyboardEnabled")}
          {renderSection("cpuEnabled")}
          {renderSection("laptopEnabled")}
          {renderSection("monitorEnabled")}
          {renderSection("headphoneEnabled")}

          {form.formState.errors.mouseEnabled?.message && (
            <p className="text-sm font-medium text-destructive">
              {form.formState.errors.mouseEnabled.message}
            </p>
          )}
        </div>

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes (Optional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Any additional information about the system..."
                  className="min-h-[95px] resize-none bg-[#f5f5f5]"
                  maxLength={500}
                  disabled={disabled}
                  {...field}
                />
              </FormControl>
              <div className="text-right text-xs text-muted-foreground">
                {field.value?.length ?? 0}/500
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        {!hideSubmitButton && (
          <CustomButton
            type="submit"
            loading={loading}
            disabled={disabled}
            className="h-10 w-full bg-black text-white hover:bg-black/90 dark:bg-white dark:text-black dark:hover:bg-white/90"
          >
            {submitLabel}
          </CustomButton>
        )}
      </form>
    </Form>
  );
}
