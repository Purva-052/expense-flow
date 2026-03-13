import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  Cpu,
  Headphones,
  Keyboard,
  Laptop,
  Monitor,
  Mouse,
} from "lucide-react";
import {
  isObjectCheck,
  mapDropdownOptions,
  pickDefined,
  SystemInventoryViewFormProps,
} from "./action-form";
import { SelectValue } from "../schema";
import {
  CONNECTION_OPTIONS,
  DeviceOwnershipType,
  DropdownOption,
} from "../types";
import { ComponentType, ReactNode, useMemo } from "react";
import { normalizeSystemInventoryRecord } from "./helperFunction";

function InventoryViewSection({
  title,
  icon,
  children,
}: Readonly<{
  title: string;
  icon: ComponentType<{ className?: string }>;
  children: ReactNode;
}>) {
  const Icon = icon;

  return (
    <div className="space-y-4 rounded-md border border-[#d9d9d9] bg-white p-4">
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-semibold">{title}</span>
      </div>
      <div>{children}</div>
    </div>
  );
}

function ViewField({
  label,
  value,
}: Readonly<{
  label: string;
  value?: string | number | null;
}>) {
  const displayValue =
    value === undefined || value === null || value === "" ? "-" : String(value);

  return (
    <div className="space-y-1">
      <span className="text-xs text-muted-foreground">{label}</span>
      <div className="flex h-9 items-center rounded-md border border-[#e5e5e5] bg-[#f5f5f5] px-3 text-sm">
        {displayValue}
      </div>
    </div>
  );
}

export function SystemInventoryViewForm({
  inventory,
  processorList,
  ramList,
  storageList,
  brandList,
  headphoneBrandList,
  monitorSizeList,
}: Readonly<SystemInventoryViewFormProps>) {
  const values = useMemo(
    () => normalizeSystemInventoryRecord(inventory),
    [inventory]
  );

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

  const resolveLabel = (
    rawValue: unknown,
    idValue: SelectValue,
    options: DropdownOption[]
  ) => {
    const rawLabel = isObjectCheck(rawValue)
      ? pickDefined(rawValue.name, rawValue.label, rawValue.title)
      : rawValue;

    if (typeof rawLabel === "string" && rawLabel.trim()) {
      return rawLabel;
    }

    if (typeof rawLabel === "number") {
      const option = options.find(
        (item) => String(item.value) === String(rawLabel)
      );

      return option?.label ?? String(rawLabel);
    }

    if (idValue === null || idValue === undefined || idValue === "") {
      return undefined;
    }

    const option = options.find(
      (item) => String(item.value) === String(idValue)
    );

    return option?.label ?? String(idValue);
  };

  const resolveOptionLabel = (
    value: SelectValue,
    options: DropdownOption[]
  ) => {
    if (value === null || value === undefined || value === "") {
      return undefined;
    }

    const option = options.find((item) => String(item.value) === String(value));

    return option?.label ?? String(value);
  };

  const isOwnedBy = (
    ownership: DeviceOwnershipType | null | undefined,
    expected: DeviceOwnershipType
  ) => ownership === expected;

  const personalSections = [
    values.mouseEnabled && isOwnedBy(values.mouseOwnershipType, "self") ? (
      <InventoryViewSection key="mouse" title="Mouse" icon={Mouse}>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <ViewField
            label="Connection Type"
            value={resolveOptionLabel(
              values.mouseConnectionType,
              CONNECTION_OPTIONS
            )}
          />
        </div>
      </InventoryViewSection>
    ) : null,
    values.keyboardEnabled &&
    isOwnedBy(values.keyboardOwnershipType, "self") ? (
      <InventoryViewSection key="keyboard" title="Keyboard" icon={Keyboard}>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <ViewField
            label="Connection Type"
            value={resolveOptionLabel(
              values.keyboardConnectionType,
              CONNECTION_OPTIONS
            )}
          />
        </div>
      </InventoryViewSection>
    ) : null,
    values.cpuEnabled && isOwnedBy(values.cpuOwnershipType, "self") ? (
      <InventoryViewSection key="cpu" title="CPU/Computer" icon={Cpu}>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <ViewField
            label="Processor"
            value={resolveLabel(
              isObjectCheck(inventory) ? inventory.cpuProcessor : undefined,
              values.cpuProcessorId,
              processorOptions
            )}
          />
          <ViewField
            label="Storage"
            value={resolveLabel(
              isObjectCheck(inventory) ? inventory.cpuStorage : undefined,
              values.cpuStorageId,
              storageOptions
            )}
          />
          <ViewField
            label="RAM"
            value={resolveLabel(
              isObjectCheck(inventory) ? inventory.cpuRam : undefined,
              values.cpuRamId,
              ramOptions
            )}
          />
        </div>
      </InventoryViewSection>
    ) : null,
    values.laptopEnabled && isOwnedBy(values.laptopOwnershipType, "self") ? (
      <InventoryViewSection key="laptop" title="Laptop" icon={Laptop}>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <ViewField
            label="Brand"
            value={resolveLabel(
              isObjectCheck(inventory) ? inventory.laptopBrand : undefined,
              values.laptopBrandId,
              brandOptions
            )}
          />
          <ViewField
            label="Processor"
            value={resolveLabel(
              isObjectCheck(inventory) ? inventory.laptopProcessor : undefined,
              values.laptopProcessorId,
              processorOptions
            )}
          />
          <ViewField
            label="Storage"
            value={resolveLabel(
              isObjectCheck(inventory) ? inventory.laptopStorage : undefined,
              values.laptopStorageId,
              storageOptions
            )}
          />
          <ViewField
            label="RAM"
            value={resolveLabel(
              isObjectCheck(inventory) ? inventory.laptopRam : undefined,
              values.laptopRamId,
              ramOptions
            )}
          />
        </div>
      </InventoryViewSection>
    ) : null,
    values.monitorEnabled && isOwnedBy(values.monitorOwnershipType, "self") ? (
      <InventoryViewSection key="monitor" title="Monitor" icon={Monitor}>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <ViewField
            label="Brand"
            value={resolveLabel(
              isObjectCheck(inventory) ? inventory.monitorBrand : undefined,
              values.monitorBrandId,
              brandOptions
            )}
          />
          <ViewField
            label="Size"
            value={resolveLabel(
              isObjectCheck(inventory) ? inventory.monitorSize : undefined,
              values.monitorSizeId,
              monitorSizeOptions
            )}
          />
        </div>
      </InventoryViewSection>
    ) : null,
    values.headphoneEnabled &&
    isOwnedBy(values.headphoneOwnershipType, "self") ? (
      <InventoryViewSection
        key="headphone"
        title="Headphones"
        icon={Headphones}
      >
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <ViewField
            label="Brand"
            value={resolveLabel(
              isObjectCheck(inventory) ? inventory.headphoneBrand : undefined,
              values.headphoneBrandId,
              headphoneBrandOptions
            )}
          />
          <ViewField
            label="Connection Type"
            value={resolveOptionLabel(
              values.headphoneConnectionType,
              CONNECTION_OPTIONS
            )}
          />
        </div>
      </InventoryViewSection>
    ) : null,
  ].filter(Boolean);

  const companySections = [
    values.mouseEnabled && isOwnedBy(values.mouseOwnershipType, "company") ? (
      <InventoryViewSection key="mouse" title="Mouse" icon={Mouse}>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <ViewField
            label="Connection Type"
            value={resolveOptionLabel(
              values.mouseConnectionType,
              CONNECTION_OPTIONS
            )}
          />
        </div>
      </InventoryViewSection>
    ) : null,
    values.keyboardEnabled &&
    isOwnedBy(values.keyboardOwnershipType, "company") ? (
      <InventoryViewSection key="keyboard" title="Keyboard" icon={Keyboard}>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <ViewField
            label="Connection Type"
            value={resolveOptionLabel(
              values.keyboardConnectionType,
              CONNECTION_OPTIONS
            )}
          />
        </div>
      </InventoryViewSection>
    ) : null,
    values.cpuEnabled && isOwnedBy(values.cpuOwnershipType, "company") ? (
      <InventoryViewSection key="cpu" title="CPU/Computer" icon={Cpu}>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <ViewField
            label="Processor"
            value={resolveLabel(
              isObjectCheck(inventory) ? inventory.cpuProcessor : undefined,
              values.cpuProcessorId,
              processorOptions
            )}
          />
          <ViewField
            label="Storage"
            value={resolveLabel(
              isObjectCheck(inventory) ? inventory.cpuStorage : undefined,
              values.cpuStorageId,
              storageOptions
            )}
          />
          <ViewField
            label="RAM"
            value={resolveLabel(
              isObjectCheck(inventory) ? inventory.cpuRam : undefined,
              values.cpuRamId,
              ramOptions
            )}
          />
        </div>
      </InventoryViewSection>
    ) : null,
    values.laptopEnabled && isOwnedBy(values.laptopOwnershipType, "company") ? (
      <InventoryViewSection key="laptop" title="Laptop" icon={Laptop}>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <ViewField
            label="Brand"
            value={resolveLabel(
              isObjectCheck(inventory) ? inventory.laptopBrand : undefined,
              values.laptopBrandId,
              brandOptions
            )}
          />
          <ViewField
            label="Processor"
            value={resolveLabel(
              isObjectCheck(inventory) ? inventory.laptopProcessor : undefined,
              values.laptopProcessorId,
              processorOptions
            )}
          />
          <ViewField
            label="Storage"
            value={resolveLabel(
              isObjectCheck(inventory) ? inventory.laptopStorage : undefined,
              values.laptopStorageId,
              storageOptions
            )}
          />
          <ViewField
            label="RAM"
            value={resolveLabel(
              isObjectCheck(inventory) ? inventory.laptopRam : undefined,
              values.laptopRamId,
              ramOptions
            )}
          />
        </div>
      </InventoryViewSection>
    ) : null,
    values.monitorEnabled &&
    isOwnedBy(values.monitorOwnershipType, "company") ? (
      <InventoryViewSection key="monitor" title="Monitor" icon={Monitor}>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <ViewField
            label="Brand"
            value={resolveLabel(
              isObjectCheck(inventory) ? inventory.monitorBrand : undefined,
              values.monitorBrandId,
              brandOptions
            )}
          />
          <ViewField
            label="Size"
            value={resolveLabel(
              isObjectCheck(inventory) ? inventory.monitorSize : undefined,
              values.monitorSizeId,
              monitorSizeOptions
            )}
          />
        </div>
      </InventoryViewSection>
    ) : null,
    values.headphoneEnabled &&
    isOwnedBy(values.headphoneOwnershipType, "company") ? (
      <InventoryViewSection
        key="headphone"
        title="Headphones"
        icon={Headphones}
      >
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <ViewField
            label="Brand"
            value={resolveLabel(
              isObjectCheck(inventory) ? inventory.headphoneBrand : undefined,
              values.headphoneBrandId,
              headphoneBrandOptions
            )}
          />
          <ViewField
            label="Connection Type"
            value={resolveOptionLabel(
              values.headphoneConnectionType,
              CONNECTION_OPTIONS
            )}
          />
        </div>
      </InventoryViewSection>
    ) : null,
  ].filter(Boolean);

  const defaultTab =
    personalSections.length > 0
      ? "personal"
      : companySections.length > 0
        ? "company"
        : "personal";

  const tabTriggerClass =
    "flex items-center gap-2 rounded-[50px] !px-3 !py-2  transition-all " +
    "data-[state=active]:bg-black data-[state=active]:text-white h-[35px]";

  return (
    <div className="space-y-6">
      <Tabs defaultValue={defaultTab} className="w-full">
        <TabsList className="bg-[#fdebef] rounded-full">
          <TabsTrigger value="personal" className={tabTriggerClass}>
            Personal
          </TabsTrigger>
          <TabsTrigger value="company" className={tabTriggerClass}>
            Company
          </TabsTrigger>
        </TabsList>

        <div className="mt-4 min-h-[200px] max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
          <TabsContent value="personal" className="mt-0">
            <div className="space-y-4">
              {personalSections.length > 0 ? (
                personalSections
              ) : (
                <p className="text-sm text-muted-foreground">
                  No personal inventory recorded.
                </p>
              )}
            </div>
          </TabsContent>

          <TabsContent value="company" className="mt-0">
            <div className="space-y-4">
              {companySections.length > 0 ? (
                companySections
              ) : (
                <p className="text-sm text-muted-foreground">
                  No company inventory recorded.
                </p>
              )}
            </div>
          </TabsContent>
        </div>
      </Tabs>

      <div className="space-y-2">
        <div className="text-sm font-semibold">Notes</div>
        <Textarea
          readOnly
          value={values.notes ?? ""}
          placeholder="No additional notes."
          className="min-h-[95px] resize-none bg-[#f5f5f5]"
        />
      </div>
    </div>
  );
}
