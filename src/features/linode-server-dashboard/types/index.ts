export interface InstanceSpecs {
  disk: number;
  memory: number;
  vcpus: number;
  gpus: number;
  transfer: number;
  accelerated_devices: number;
}

export enum FilterType {
  ALL = "ALL",
  ZOMBIE = "ZOMBIE", // Underutilized
  HIGH_LOAD = "HIGH_LOAD",
}

export interface InstanceAlerts {
  cpu: number;
  network_in: number;
  network_out: number;
  transfer_quota: number;
  io: number;
}

export interface BackupSchedule {
  day: string;
  window: string;
}

export interface Backups {
  enabled: boolean;
  available: boolean;
  schedule: BackupSchedule;
  last_successful: string | null;
}

export interface LinodeInstance {
  id: number;
  label: string;
  group: string;
  status: "running" | "offline" | "stopped" | "booting" | "provisioning" | "deleting" | "migrating";
  created: string;
  updated: string;
  type: string;
  ipv4: string[];
  ipv6: string;
  image: string;
  region: string;
  site_type: string;
  specs: InstanceSpecs;
  alerts: InstanceAlerts;
  backups: Backups;
  hypervisor: string;
  watchdog_enabled: boolean;
  tags: string[];
  host_uuid: string;
  has_user_data: boolean;
  placement_group: string | null;
  disk_encryption: string;
  lke_cluster_id: number | null;
  capabilities: string[];
  monthlyCost: number;
  // Calculated fields for dashboard logic
  utilizationScore?: number;
}

export interface PerformanceDataPoint {
  timestamp: number;
  cpu: number;
  net_in: number;
  net_out: number;
  io_io: number;
}

export interface LinodeInstanceDetail extends LinodeInstance {
  performanceData?: PerformanceDataPoint[];
}
