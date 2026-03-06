import API from "@/config/api/api";

export type SystemInventoryMasterType =
  | "processor"
  | "ram"
  | "headphone_brand"
  | "storage"
  | "monitor_size"
  | "brands";

export type SystemInventoryApiConfig = {
  list: string;
  create: string;
  update: string;
  delete: string;
};

export interface SystemInventoryMasterConfig {
  pageTitle: string;
  description: string;
  addButtonText: string;
  itemLabel: string;
  nameLabel: string;
  namePlaceholder: string;
  api: SystemInventoryApiConfig;
}

export const SYSTEM_INVENTORY_MASTER_CONFIG: Record<
  SystemInventoryMasterType,
  SystemInventoryMasterConfig
> = {
  processor: {
    pageTitle: "Processor Types",
    description: "Manage your processor types here.",
    addButtonText: "Add Processor",
    itemLabel: "Processor",
    nameLabel: "Processor Name",
    namePlaceholder: "Enter processor name",
    api: API.processor,
  },
  ram: {
    pageTitle: "RAM Types",
    description: "Manage your RAM types here.",
    addButtonText: "Add RAM Type",
    itemLabel: "RAM",
    nameLabel: "RAM Name",
    namePlaceholder: "Enter RAM name",
    api: API.ram,
  },
  headphone_brand: {
    pageTitle: "Headphone Brands",
    description: "Manage your headphone brands here.",
    addButtonText: "Add Headphone Brand",
    itemLabel: "Headphone Brand",
    nameLabel: "Headphone Brand Name",
    namePlaceholder: "Enter headphone brand name",
    api: API.headphone_brand,
  },
  storage: {
    pageTitle: "Storage",
    description: "Manage your storage options here.",
    addButtonText: "Add Storage",
    itemLabel: "Storage",
    nameLabel: "Storage Name",
    namePlaceholder: "Enter storage name",
    api: API.storage,
  },
  monitor_size: {
    pageTitle: "Monitor Sizes",
    description: "Manage your monitor sizes here.",
    addButtonText: "Add Monitor Size",
    itemLabel: "Monitor Size",
    nameLabel: "Monitor Size Name",
    namePlaceholder: "Enter monitor size name",
    api: API.monitor_size,
  },
  brands: {
    pageTitle: "Brands",
    description: "Manage your brands here.",
    addButtonText: "Add Brand",
    itemLabel: "Brand",
    nameLabel: "Brand Name",
    namePlaceholder: "Enter brand name",
    api: API.brands,
  },
};
