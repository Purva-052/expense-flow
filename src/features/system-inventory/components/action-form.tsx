/* eslint-disable react-refresh/only-export-components */
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Building2,
  Cpu,
  Headphones,
  Keyboard,
  Laptop,
  Monitor,
  Mouse,
  UserRound,
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

type OwnershipType = "company_owned" | "personal";
type ConnectionType = "wired" | "wireless";

const selectValueSchema = z
  .union([z.string(), z.number()])
  .nullable()
  .optional();

const systemInventorySchema = z
  .object({
    ownershipType: z.enum(["company_owned", "personal"]),

    mouseEnabled: z.boolean(),
    mouseConnectionType: z.string().optional(),

    keyboardEnabled: z.boolean(),
    keyboardConnectionType: z.string().optional(),

    cpuEnabled: z.boolean(),
    cpuProcessorId: selectValueSchema,
    cpuStorageId: selectValueSchema,
    cpuRamId: selectValueSchema,

    laptopEnabled: z.boolean(),
    laptopBrandId: selectValueSchema,
    laptopProcessorId: selectValueSchema,
    laptopStorageId: selectValueSchema,
    laptopRamId: selectValueSchema,

    monitorEnabled: z.boolean(),
    monitorBrandId: selectValueSchema,
    monitorSizeId: selectValueSchema,

    headphoneEnabled: z.boolean(),
    headphoneBrandId: selectValueSchema,
    headphoneConnectionType: z.string().optional(),

    notes: z.string().max(500, "Notes cannot exceed 500 characters").optional(),
  })
  .superRefine((values, ctx) => {
    const hasValue = (value: SelectValue | string | undefined) =>
      !(value === null || value === undefined || value === "");

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

    if (values.monitorEnabled && !hasValue(values.monitorSizeId)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["monitorSizeId"],
        message: "Size is required",
      });
    }

    if (values.headphoneEnabled && !hasValue(values.headphoneBrandId)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["headphoneBrandId"],
        message: "Brand is required",
      });
    }

    if (values.headphoneEnabled && !hasValue(values.headphoneConnectionType)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["headphoneConnectionType"],
        message: "Connection type is required",
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
}

const OWNERSHIP_OPTIONS: Array<{
  label: string;
  value: OwnershipType;
  icon: ComponentType<{ className?: string }>;
}> = [
  {
    label: "Company Owned",
    value: "company_owned",
    icon: Building2,
  },
  {
    label: "Personal",
    value: "personal",
    icon: UserRound,
  },
];

const CONNECTION_OPTIONS: DropdownOption[] = [
  {
    label: "Wired/USB",
    value: "wired",
  },
  {
    label: "Wireless",
    value: "wireless",
  },
];

export const DEFAULT_SYSTEM_INVENTORY_VALUES: TSystemInventorySchema = {
  ownershipType: "company_owned",

  mouseEnabled: true,
  mouseConnectionType: "",

  keyboardEnabled: true,
  keyboardConnectionType: "",

  cpuEnabled: true,
  cpuProcessorId: undefined,
  cpuStorageId: undefined,
  cpuRamId: undefined,

  laptopEnabled: true,
  laptopBrandId: undefined,
  laptopProcessorId: undefined,
  laptopStorageId: undefined,
  laptopRamId: undefined,

  monitorEnabled: true,
  monitorBrandId: undefined,
  monitorSizeId: undefined,

  headphoneEnabled: true,
  headphoneBrandId: undefined,
  headphoneConnectionType: "",

  notes: "",
};

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const pickDefined = (...values: unknown[]) =>
  values.find((value) => value !== undefined && value !== null);

const normalizeOwnershipValue = (value: unknown): OwnershipType => {
  const formatted = String(value ?? "")
    .trim()
    .toLowerCase();

  if (formatted.includes("personal")) {
    return "personal";
  }

  return "company_owned";
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
      : null;

  const laptop = isObject(inventory.laptop) ? inventory.laptop : null;

  const monitor = isObject(inventory.monitor)
    ? inventory.monitor
    : isObject(inventory.monitorDetails)
      ? inventory.monitorDetails
      : null;

  const headphone = isObject(inventory.headphone)
    ? inventory.headphone
    : isObject(inventory.headphones)
      ? inventory.headphones
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
    ownershipType: normalizeOwnershipValue(
      pickDefined(
        inventory.systemOwnership,
        inventory.system_ownership,
        inventory.ownershipType,
        inventory.ownership_type
      )
    ),

    mouseEnabled: normalizeBoolean(
      pickDefined(mouse?.enabled, mouse?.isEnabled, inventory.mouseEnabled),
      Boolean(mouse || mouseConnectionType)
    ),
    mouseConnectionType,

    keyboardEnabled: normalizeBoolean(
      pickDefined(
        keyboard?.enabled,
        keyboard?.isEnabled,
        inventory.keyboardEnabled
      ),
      Boolean(keyboard || keyboardConnectionType)
    ),
    keyboardConnectionType,

    cpuEnabled: normalizeBoolean(
      pickDefined(cpu?.enabled, cpu?.isEnabled, inventory.cpuEnabled),
      Boolean(cpu || cpuProcessorId || cpuStorageId || cpuRamId)
    ),
    cpuProcessorId,
    cpuStorageId,
    cpuRamId,

    laptopEnabled: normalizeBoolean(
      pickDefined(laptop?.enabled, laptop?.isEnabled, inventory.laptopEnabled),
      Boolean(
        laptop ||
          laptopBrandId ||
          laptopProcessorId ||
          laptopStorageId ||
          laptopRamId
      )
    ),
    laptopBrandId,
    laptopProcessorId,
    laptopStorageId,
    laptopRamId,

    monitorEnabled: normalizeBoolean(
      pickDefined(
        monitor?.enabled,
        monitor?.isEnabled,
        inventory.monitorEnabled
      ),
      Boolean(monitor || monitorBrandId || monitorSizeId)
    ),
    monitorBrandId,
    monitorSizeId,

    headphoneEnabled: normalizeBoolean(
      pickDefined(
        headphone?.enabled,
        headphone?.isEnabled,
        inventory.headphoneEnabled
      ),
      Boolean(headphone || headphoneBrandId || headphoneConnectionType)
    ),
    headphoneBrandId,
    headphoneConnectionType,

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
  ownershipType: values.ownershipType,
  mouseConnectionType: values.mouseEnabled
    ? values.mouseConnectionType || null
    : null,
  keyboardConnectionType: values.keyboardEnabled
    ? values.keyboardConnectionType || null
    : null,
  cpuProcessorId: values.cpuEnabled
    ? parseIdValue(values.cpuProcessorId)
    : null,
  cpuStorageId: values.cpuEnabled ? parseIdValue(values.cpuStorageId) : null,
  cpuRamId: values.cpuEnabled ? parseIdValue(values.cpuRamId) : null,
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
  monitorBrandId: values.monitorEnabled
    ? parseIdValue(values.monitorBrandId)
    : null,
  monitorSizeId: values.monitorEnabled
    ? parseIdValue(values.monitorSizeId)
    : null,
  headphoneBrandId: values.headphoneEnabled
    ? parseIdValue(values.headphoneBrandId)
    : null,
  headphoneConnectionType: values.headphoneEnabled
    ? values.headphoneConnectionType || null
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

function InventorySection({
  title,
  enabled,
  onEnabledChange,
  disabled,
  icon,
  children,
}: Readonly<{
  title: string;
  enabled: boolean;
  onEnabledChange: (checked: boolean) => void;
  disabled?: boolean;
  icon: ComponentType<{ className?: string }>;
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
        <span className="text-sm font-semibold">{title}</span>
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

  return (
    <Form {...form}>
      <form
        id={formId}
        onSubmit={form.handleSubmit(submitForm)}
        className="space-y-5"
      >
        <FormField
          control={form.control}
          name="ownershipType"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-semibold">
                System Ownership
              </FormLabel>
              <FormControl>
                <div className="grid grid-cols-2 gap-3">
                  {OWNERSHIP_OPTIONS.map((option) => {
                    const Icon = option.icon;
                    const selected = field.value === option.value;

                    return (
                      <button
                        type="button"
                        key={option.value}
                        onClick={() => field.onChange(option.value)}
                        disabled={disabled}
                        className={cn(
                          "flex h-10 items-center justify-center gap-2 rounded-md border text-sm font-medium transition-colors",
                          selected
                            ? "border-[#f47a5b] bg-[#fff6f3] text-black"
                            : "border-[#d9d9d9] bg-white text-muted-foreground",
                          disabled && "cursor-not-allowed opacity-60"
                        )}
                      >
                        <Icon className="h-4 w-4" />
                        {option.label}
                      </button>
                    );
                  })}
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-4">
          <FormField
            control={form.control}
            name="mouseEnabled"
            render={({ field }) => (
              <InventorySection
                title="Mouse"
                icon={Mouse}
                enabled={field.value}
                onEnabledChange={field.onChange}
                disabled={disabled}
              >
                <CustomDropDownSearchable
                  form={form}
                  name="mouseConnectionType"
                  label="Connection Type"
                  options={CONNECTION_OPTIONS}
                  placeholder="Select connection type"
                  disabled={disabled || !mouseEnabled || dropdownLoading}
                  triggerClassName="h-9 max-w-[220px] bg-[#f5f5f5]"
                  searchEnabled={false}
                  sortOptions={false}
                />
              </InventorySection>
            )}
          />

          <FormField
            control={form.control}
            name="keyboardEnabled"
            render={({ field }) => (
              <InventorySection
                title="Keyboard"
                icon={Keyboard}
                enabled={field.value}
                onEnabledChange={field.onChange}
                disabled={disabled}
              >
                <CustomDropDownSearchable
                  form={form}
                  name="keyboardConnectionType"
                  label="Connection Type"
                  options={CONNECTION_OPTIONS}
                  placeholder="Select connection type"
                  disabled={disabled || !keyboardEnabled || dropdownLoading}
                  triggerClassName="h-9 max-w-[220px] bg-[#f5f5f5]"
                  searchEnabled={false}
                  sortOptions={false}
                />
              </InventorySection>
            )}
          />

          <FormField
            control={form.control}
            name="cpuEnabled"
            render={({ field }) => (
              <InventorySection
                title="CPU / Computer"
                icon={Cpu}
                enabled={field.value}
                onEnabledChange={field.onChange}
                disabled={disabled}
              >
                <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                  <CustomDropDownSearchable
                    form={form}
                    name="cpuProcessorId"
                    label="Processor"
                    options={processorOptions}
                    placeholder="Select processor"
                    disabled={disabled || !cpuEnabled || dropdownLoading}
                    triggerClassName="h-9 bg-[#f5f5f5]"
                  />
                  <CustomDropDownSearchable
                    form={form}
                    name="cpuStorageId"
                    label="Storage"
                    options={storageOptions}
                    placeholder="Select storage"
                    disabled={disabled || !cpuEnabled || dropdownLoading}
                    triggerClassName="h-9 bg-[#f5f5f5]"
                  />
                  <CustomDropDownSearchable
                    form={form}
                    name="cpuRamId"
                    label="RAM"
                    options={ramOptions}
                    placeholder="Select RAM"
                    disabled={disabled || !cpuEnabled || dropdownLoading}
                    triggerClassName="h-9 bg-[#f5f5f5]"
                  />
                </div>
              </InventorySection>
            )}
          />

          <FormField
            control={form.control}
            name="laptopEnabled"
            render={({ field }) => (
              <InventorySection
                title="Laptop"
                icon={Laptop}
                enabled={field.value}
                onEnabledChange={field.onChange}
                disabled={disabled}
              >
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  <CustomDropDownSearchable
                    form={form}
                    name="laptopBrandId"
                    label="Brand"
                    options={brandOptions}
                    placeholder="Select brand"
                    disabled={disabled || !laptopEnabled || dropdownLoading}
                    triggerClassName="h-9 bg-[#f5f5f5]"
                  />
                  <CustomDropDownSearchable
                    form={form}
                    name="laptopProcessorId"
                    label="Processor"
                    options={processorOptions}
                    placeholder="Select processor"
                    disabled={disabled || !laptopEnabled || dropdownLoading}
                    triggerClassName="h-9 bg-[#f5f5f5]"
                  />
                  <CustomDropDownSearchable
                    form={form}
                    name="laptopStorageId"
                    label="Storage"
                    options={storageOptions}
                    placeholder="Select storage"
                    disabled={disabled || !laptopEnabled || dropdownLoading}
                    triggerClassName="h-9 bg-[#f5f5f5]"
                  />
                  <CustomDropDownSearchable
                    form={form}
                    name="laptopRamId"
                    label="RAM"
                    options={ramOptions}
                    placeholder="Select RAM"
                    disabled={disabled || !laptopEnabled || dropdownLoading}
                    triggerClassName="h-9 bg-[#f5f5f5]"
                  />
                </div>
              </InventorySection>
            )}
          />

          <FormField
            control={form.control}
            name="monitorEnabled"
            render={({ field }) => (
              <InventorySection
                title="Monitor"
                icon={Monitor}
                enabled={field.value}
                onEnabledChange={field.onChange}
                disabled={disabled}
              >
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  <CustomDropDownSearchable
                    form={form}
                    name="monitorBrandId"
                    label="Brand"
                    options={brandOptions}
                    placeholder="Select brand"
                    disabled={disabled || !monitorEnabled || dropdownLoading}
                    triggerClassName="h-9 bg-[#f5f5f5]"
                  />
                  <CustomDropDownSearchable
                    form={form}
                    name="monitorSizeId"
                    label="Size"
                    options={monitorSizeOptions}
                    placeholder="Select size"
                    disabled={disabled || !monitorEnabled || dropdownLoading}
                    triggerClassName="h-9 bg-[#f5f5f5]"
                  />
                </div>
              </InventorySection>
            )}
          />

          <FormField
            control={form.control}
            name="headphoneEnabled"
            render={({ field }) => (
              <InventorySection
                title="Headphones"
                icon={Headphones}
                enabled={field.value}
                onEnabledChange={field.onChange}
                disabled={disabled}
              >
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  <CustomDropDownSearchable
                    form={form}
                    name="headphoneBrandId"
                    label="Brand"
                    options={headphoneBrandOptions}
                    placeholder="Select brand"
                    disabled={disabled || !headphoneEnabled || dropdownLoading}
                    triggerClassName="h-9 bg-[#f5f5f5]"
                  />
                  <CustomDropDownSearchable
                    form={form}
                    name="headphoneConnectionType"
                    label="Connection Type"
                    options={CONNECTION_OPTIONS}
                    placeholder="Select connection type"
                    disabled={disabled || !headphoneEnabled || dropdownLoading}
                    triggerClassName="h-9 bg-[#f5f5f5]"
                    searchEnabled={false}
                    sortOptions={false}
                  />
                </div>
              </InventorySection>
            )}
          />
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
