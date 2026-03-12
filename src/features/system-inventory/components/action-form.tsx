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
import z from "zod";
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

type SelectValue = string | number | null | undefined;

type DeviceOwnershipType = "self" | "company";
type ConnectionType = "wired" | "wireless";

const selectValueSchema = z
  .union([z.string(), z.number()])
  .nullable()
  .optional();

const deviceOwnershipSchema = z.enum(["self", "company"], {
  errorMap: () => ({ message: "Ownership is required" }),
});

const systemInventorySchema = z
  .object({
    mouseEnabled: z.boolean(),
    mouseConnectionType: z.string().optional(),
    mouseOwnershipType: deviceOwnershipSchema,

    keyboardEnabled: z.boolean(),
    keyboardConnectionType: z.string().optional(),
    keyboardOwnershipType: deviceOwnershipSchema,

    cpuEnabled: z.boolean(),
    cpuProcessorId: selectValueSchema,
    cpuStorageId: selectValueSchema,
    cpuRamId: selectValueSchema,
    cpuOwnershipType: deviceOwnershipSchema,

    laptopEnabled: z.boolean(),
    laptopBrandId: selectValueSchema,
    laptopProcessorId: selectValueSchema,
    laptopStorageId: selectValueSchema,
    laptopRamId: selectValueSchema,
    laptopOwnershipType: deviceOwnershipSchema,

    monitorEnabled: z.boolean(),
    monitorBrandId: selectValueSchema,
    monitorSizeId: selectValueSchema,
    monitorOwnershipType: deviceOwnershipSchema,

    headphoneEnabled: z.boolean(),
    headphoneBrandId: selectValueSchema,
    headphoneConnectionType: z.string().optional(),
    headphoneOwnershipType: deviceOwnershipSchema,

    notes: z.string().max(500, "Notes cannot exceed 500 characters").optional(),
  })
  .superRefine((values, ctx) => {
    const hasValue = (value: SelectValue | string | undefined) =>
      !(value === null || value === undefined || value === "");

    if (values.cpuEnabled && !hasValue(values.cpuProcessorId)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["cpuProcessorId"],
        message: "Processor is required",
      });
    }

    if (values.cpuEnabled && !hasValue(values.cpuStorageId)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["cpuStorageId"],
        message: "Storage is required",
      });
    }

    if (values.cpuEnabled && !hasValue(values.cpuRamId)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["cpuRamId"],
        message: "RAM is required",
      });
    }

    if (values.laptopEnabled && !hasValue(values.laptopBrandId)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["laptopBrandId"],
        message: "Brand is required",
      });
    }

    if (values.laptopEnabled && !hasValue(values.laptopProcessorId)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["laptopProcessorId"],
        message: "Processor is required",
      });
    }

    if (values.laptopEnabled && !hasValue(values.laptopStorageId)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["laptopStorageId"],
        message: "Storage is required",
      });
    }

    if (values.laptopEnabled && !hasValue(values.laptopRamId)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["laptopRamId"],
        message: "RAM is required",
      });
    }

    if (values.monitorEnabled && !hasValue(values.monitorBrandId)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["monitorBrandId"],
        message: "Brand is required",
      });
    }

    if (values.mouseEnabled && !hasValue(values.mouseConnectionType)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["mouseConnectionType"],
        message: "Connection type is required",
      });
    }

    if (values.keyboardEnabled && !hasValue(values.keyboardConnectionType)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["keyboardConnectionType"],
        message: "Connection type is required",
      });
    }

    if (values.headphoneEnabled && !hasValue(values.headphoneConnectionType)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["headphoneConnectionType"],
        message: "Connection type is required",
      });
    }

    if (
      !values.mouseEnabled &&
      !values.keyboardEnabled &&
      !values.cpuEnabled &&
      !values.laptopEnabled &&
      !values.monitorEnabled &&
      !values.headphoneEnabled
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["mouseEnabled"], // Arbitrary base path for the overall error
        message: "Please select CPU/Computer or Laptop",
      });
    }
  });

export type TSystemInventorySchema = z.infer<typeof systemInventorySchema>;

export interface DropdownOption {
  label: string;
  value: string | number;
}

export interface SystemInventoryFormProps {
  initialValues?: Partial<TSystemInventorySchema> | null;
  onSubmit: (values: TSystemInventorySchema) => void;
  loading?: boolean;
  disabled?: boolean;
  submitLabel?: string;
  hideSubmitButton?: boolean;
  formId?: string;
  processorList?: unknown[];
  ramList?: unknown[];
  storageList?: unknown[];
  brandList?: unknown[];
  headphoneBrandList?: unknown[];
  monitorSizeList?: unknown[];
  dropdownLoading?: boolean;
  isAdmin?: boolean;
}

const DEVICE_OWNERSHIP_OPTIONS: DropdownOption[] = [
  { label: "Self", value: "self" },
  { label: "Company", value: "company" },
];

const CONNECTION_OPTIONS: DropdownOption[] = [
  {
    label: "Wired",
    value: "wired",
  },
  {
    label: "Wireless",
    value: "wireless",
  },
];

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

  notes: "",
};

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const pickDefined = (...values: unknown[]) =>
  values.find((value) => value !== undefined && value !== null);

const normalizeDeviceOwnership = (value: unknown): DeviceOwnershipType => {
  const formatted = String(value ?? "")
    .trim()
    .toLowerCase();

  if (formatted === "self" || formatted === "personal") {
    return "self";
  }

  return "company";
};

const normalizeConnectionValue = (value: unknown): ConnectionType | "" => {
  const formatted = String(value ?? "")
    .trim()
    .toLowerCase();

  if (formatted.includes("wireless")) {
    return "wireless";
  }

  if (formatted.includes("wired")) {
    return "wired";
  }

  return "";
};

const normalizeBoolean = (value: unknown, fallback = false) => {
  if (value === undefined || value === null) {
    return fallback;
  }

  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "number") {
    return value === 1;
  }

  const formatted = String(value).trim().toLowerCase();

  return ["true", "1", "yes", "enabled"].includes(formatted);
};

const normalizeSelectValue = (value: unknown): SelectValue => {
  if (value === undefined || value === null || value === "") {
    return undefined;
  }

  if (typeof value === "string" || typeof value === "number") {
    return value;
  }

  if (isObject(value)) {
    const idValue = pickDefined(
      value.id,
      value.value,
      value._id,
      value.key,
      value.brandId,
      value.processorId,
      value.ramId,
      value.storageId,
      value.monitorSizeId
    );

    if (typeof idValue === "string" || typeof idValue === "number") {
      return idValue;
    }
  }

  return undefined;
};

export const normalizeSystemInventoryRecord = (
  inventory: unknown
): TSystemInventorySchema => {
  if (!isObject(inventory)) {
    return DEFAULT_SYSTEM_INVENTORY_VALUES;
  }

  const mouse = isObject(inventory.mouse)
    ? inventory.mouse
    : isObject(inventory.mouseDetails)
      ? inventory.mouseDetails
      : null;

  const keyboard = isObject(inventory.keyboard)
    ? inventory.keyboard
    : isObject(inventory.keyboardDetails)
      ? inventory.keyboardDetails
      : null;

  const cpu = isObject(inventory.cpu)
    ? inventory.cpu
    : isObject(inventory.cpuComputer)
      ? inventory.cpuComputer
      : isObject(inventory.cpuDetails)
        ? inventory.cpuDetails
        : null;

  const laptop = isObject(inventory.laptop)
    ? inventory.laptop
    : isObject(inventory.laptopDetails)
      ? inventory.laptopDetails
      : null;

  const monitor = isObject(inventory.monitor)
    ? inventory.monitor
    : isObject(inventory.monitorDetails)
      ? inventory.monitorDetails
      : null;

  const headphone = isObject(inventory.headphone)
    ? inventory.headphone
    : isObject(inventory.headphones)
      ? inventory.headphones
      : isObject(inventory.headphoneDetails)
        ? inventory.headphoneDetails
        : null;

  const mouseConnectionType = normalizeConnectionValue(
    pickDefined(
      mouse?.connectionType,
      mouse?.connection_type,
      inventory.mouseConnectionType,
      inventory.mouse_connection_type
    )
  );

  const keyboardConnectionType = normalizeConnectionValue(
    pickDefined(
      keyboard?.connectionType,
      keyboard?.connection_type,
      inventory.keyboardConnectionType,
      inventory.keyboard_connection_type
    )
  );

  const headphoneConnectionType = normalizeConnectionValue(
    pickDefined(
      headphone?.connectionType,
      headphone?.connection_type,
      inventory.headphoneConnectionType,
      inventory.headphone_connection_type
    )
  );

  const cpuProcessorId = normalizeSelectValue(
    pickDefined(
      cpu?.processorId,
      cpu?.processor,
      inventory.cpuProcessorId,
      inventory.cpuProcessor,
      inventory.cpu_processor
    )
  );
  const cpuStorageId = normalizeSelectValue(
    pickDefined(
      cpu?.storageId,
      cpu?.storage,
      inventory.cpuStorageId,
      inventory.cpuStorage,
      inventory.cpu_storage
    )
  );
  const cpuRamId = normalizeSelectValue(
    pickDefined(
      cpu?.ramId,
      cpu?.ram,
      inventory.cpuRamId,
      inventory.cpuRam,
      inventory.cpu_ram
    )
  );

  const laptopBrandId = normalizeSelectValue(
    pickDefined(
      laptop?.brandId,
      laptop?.brand,
      inventory.laptopBrandId,
      inventory.laptopBrand,
      inventory.laptop_brand
    )
  );
  const laptopProcessorId = normalizeSelectValue(
    pickDefined(
      laptop?.processorId,
      laptop?.processor,
      inventory.laptopProcessorId,
      inventory.laptopProcessor,
      inventory.laptop_processor
    )
  );
  const laptopStorageId = normalizeSelectValue(
    pickDefined(
      laptop?.storageId,
      laptop?.storage,
      inventory.laptopStorageId,
      inventory.laptopStorage,
      inventory.laptop_storage
    )
  );
  const laptopRamId = normalizeSelectValue(
    pickDefined(
      laptop?.ramId,
      laptop?.ram,
      inventory.laptopRamId,
      inventory.laptopRam,
      inventory.laptop_ram
    )
  );

  const monitorBrandId = normalizeSelectValue(
    pickDefined(
      monitor?.brandId,
      monitor?.brand,
      inventory.monitorBrandId,
      inventory.monitorBrand,
      inventory.monitor_brand
    )
  );
  const monitorSizeId = normalizeSelectValue(
    pickDefined(
      monitor?.monitorSizeId,
      monitor?.sizeId,
      monitor?.size,
      inventory.monitorSizeId,
      inventory.monitorSize,
      inventory.monitor_size
    )
  );

  const headphoneBrandId = normalizeSelectValue(
    pickDefined(
      headphone?.brandId,
      headphone?.headphoneBrandId,
      headphone?.brand,
      inventory.headphoneBrandId,
      inventory.headphoneBrand,
      inventory.headphone_brand
    )
  );

  return {
    mouseEnabled: normalizeBoolean(
      pickDefined(mouse?.enabled, mouse?.isEnabled, inventory.mouseEnabled),
      Boolean(mouse || mouseConnectionType || inventory.mouseOwnershipType)
    ),
    mouseConnectionType,
    mouseOwnershipType: normalizeDeviceOwnership(
      pickDefined(
        mouse?.ownershipType,
        mouse?.ownership_type,
        inventory.mouseOwnershipType,
        inventory.mouse_ownership_type
      )
    ),

    keyboardEnabled: normalizeBoolean(
      pickDefined(
        keyboard?.enabled,
        keyboard?.isEnabled,
        inventory.keyboardEnabled
      ),
      Boolean(keyboard || keyboardConnectionType || inventory.keyboardOwnershipType)
    ),
    keyboardConnectionType,
    keyboardOwnershipType: normalizeDeviceOwnership(
      pickDefined(
        keyboard?.ownershipType,
        keyboard?.ownership_type,
        inventory.keyboardOwnershipType,
        inventory.keyboard_ownership_type
      )
    ),

    cpuEnabled: normalizeBoolean(
      pickDefined(cpu?.enabled, cpu?.isEnabled, inventory.cpuEnabled),
      Boolean(cpu || cpuProcessorId || cpuStorageId || cpuRamId || inventory.cpuOwnershipType)
    ),
    cpuProcessorId,
    cpuStorageId,
    cpuRamId,
    cpuOwnershipType: normalizeDeviceOwnership(
      pickDefined(
        cpu?.ownershipType,
        cpu?.ownership_type,
        inventory.cpuOwnershipType,
        inventory.cpu_ownership_type
      )
    ),

    laptopEnabled: normalizeBoolean(
      pickDefined(laptop?.enabled, laptop?.isEnabled, inventory.laptopEnabled),
      Boolean(
        laptop ||
          laptopBrandId ||
          laptopProcessorId ||
          laptopStorageId ||
          laptopRamId ||
          inventory.laptopOwnershipType
      )
    ),
    laptopBrandId,
    laptopProcessorId,
    laptopStorageId,
    laptopRamId,
    laptopOwnershipType: normalizeDeviceOwnership(
      pickDefined(
        laptop?.ownershipType,
        laptop?.ownership_type,
        inventory.laptopOwnershipType,
        inventory.laptop_ownership_type
      )
    ),

    monitorEnabled: normalizeBoolean(
      pickDefined(
        monitor?.enabled,
        monitor?.isEnabled,
        inventory.monitorEnabled
      ),
      Boolean(monitor || monitorBrandId || monitorSizeId || inventory.monitorOwnershipType)
    ),
    monitorBrandId,
    monitorSizeId,
    monitorOwnershipType: normalizeDeviceOwnership(
      pickDefined(
        monitor?.ownershipType,
        monitor?.ownership_type,
        inventory.monitorOwnershipType,
        inventory.monitor_ownership_type
      )
    ),

    headphoneEnabled: normalizeBoolean(
      pickDefined(
        headphone?.enabled,
        headphone?.isEnabled,
        inventory.headphoneEnabled
      ),
      Boolean(headphone || headphoneBrandId || headphoneConnectionType || inventory.headphoneOwnershipType)
    ),
    headphoneBrandId,
    headphoneConnectionType,
    headphoneOwnershipType: normalizeDeviceOwnership(
      pickDefined(
        headphone?.ownershipType,
        headphone?.ownership_type,
        inventory.headphoneOwnershipType,
        inventory.headphone_ownership_type
      )
    ),

    notes:
      typeof inventory.notes === "string"
        ? inventory.notes
        : typeof inventory.note === "string"
          ? inventory.note
          : "",
  };
};

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
  values: TSystemInventorySchema
) => ({
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
  laptopOwnershipType: values.laptopEnabled ? values.laptopOwnershipType : null,

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
});

const mapDropdownOptions = (items: unknown[] | undefined): DropdownOption[] => {
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

      if (isObject(item)) {
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
    <div className="space-y-4 rounded-md border border-[#d9d9d9] bg-white p-4">
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
        className="space-y-5"
      >
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
            className="h-10 w-full bg-black text-white hover:bg-black/90"
          >
            {submitLabel}
          </CustomButton>
        )}
      </form>
    </Form>
  );
}
