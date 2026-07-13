import {
  DEFAULT_SYSTEM_INVENTORY_VALUES,
  isObjectCheck,
  pickDefined,
} from "./action-form";
import { SelectValue, TSystemInventorySchema } from "../schema";
import { ConnectionType, DeviceOwnershipType } from "../types";

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

  if (isObjectCheck(value)) {
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
  rawInventory: unknown
): TSystemInventorySchema => {
  if (!isObjectCheck(rawInventory)) {
    return DEFAULT_SYSTEM_INVENTORY_VALUES;
  }
  
  const inventory = rawInventory as any;

  const mouse = isObjectCheck(inventory.mouse)
    ? inventory.mouse
    : isObjectCheck(inventory.mouseDetails)
      ? inventory.mouseDetails
      : null;

  const keyboard = isObjectCheck(inventory.keyboard)
    ? inventory.keyboard
    : isObjectCheck(inventory.keyboardDetails)
      ? inventory.keyboardDetails
      : null;

  const cpu = isObjectCheck(inventory.cpu)
    ? inventory.cpu
    : isObjectCheck(inventory.cpuComputer)
      ? inventory.cpuComputer
      : isObjectCheck(inventory.cpuDetails)
        ? inventory.cpuDetails
        : null;

  const laptop = isObjectCheck(inventory.laptop)
    ? inventory.laptop
    : isObjectCheck(inventory.laptopDetails)
      ? inventory.laptopDetails
      : null;

  const monitor = isObjectCheck(inventory.monitor)
    ? inventory.monitor
    : isObjectCheck(inventory.monitorDetails)
      ? inventory.monitorDetails
      : null;

  const headphone = isObjectCheck(inventory.headphone)
    ? inventory.headphone
    : isObjectCheck(inventory.headphones)
      ? inventory.headphones
      : isObjectCheck(inventory.headphoneDetails)
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
      Boolean(
        keyboard || keyboardConnectionType || inventory.keyboardOwnershipType
      )
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
      Boolean(
        cpu ||
          cpuProcessorId ||
          cpuStorageId ||
          cpuRamId ||
          inventory.cpuOwnershipType
      )
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
      Boolean(
        monitor ||
          monitorBrandId ||
          monitorSizeId ||
          inventory.monitorOwnershipType
      )
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
      Boolean(
        headphone ||
          headphoneBrandId ||
          headphoneConnectionType ||
          inventory.headphoneOwnershipType
      )
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

    employeeId: normalizeSelectValue(inventory.employee?.id),

    notes:
      typeof inventory.notes === "string"
        ? inventory.notes
        : typeof inventory.note === "string"
          ? inventory.note
          : "",
  };
};
