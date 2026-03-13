export type DeviceOwnershipType = "self" | "company";
export type ConnectionType = "wired" | "wireless";

export interface DropdownOption {
  label: string;
  value: string | number;
}

export const DEVICE_OWNERSHIP_OPTIONS: DropdownOption[] = [
  { label: "Self", value: "self" },
  { label: "Company", value: "company" },
];

export const CONNECTION_OPTIONS: DropdownOption[] = [
  {
    label: "Wired",
    value: "wired",
  },
  {
    label: "Wireless",
    value: "wireless",
  },
];
