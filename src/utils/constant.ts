import { Roles } from '@/types';

export const UNIT_TYPES = [
  {
    label: 'Kg',
    value: 'kg',
  },
  {
    label: 'Ltr',
    value: 'ltr',
  },
];

export const OPERATOR_OPTIONS = [
  { label: 'John Doe', value: 'op-uuid-1' },
  { label: 'Jane Smith', value: 'op-uuid-2' },
  { label: 'Peter Jones', value: 'op-uuid-3' },
];

export const MACHINE_OPTIONS = [
  { label: 'Tractor 1', value: 'mach-uuid-a' },
  { label: 'Harvester X5', value: 'mach-uuid-b' },
  { label: 'Seeder Pro', value: 'mach-uuid-c' },
];

export const AREA_UNIT_OPTIONS = [
  { label: 'Square Feet', value: 'sq_ft' },
  { label: 'Square Meters', value: 'sq_m' },
  { label: 'Acres', value: 'acres' },
  { label: 'Hectares', value: 'hectares' },
];

export const roles: Roles = {
  ADMIN: 'admin',
  PROJECT_MANAGER: 'project_manager',
  TEAM_LEAD: 'team_lead',
  DEVELOPER: 'developer',
  BDE: 'bde',
};
