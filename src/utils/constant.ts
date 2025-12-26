/* eslint-disable @typescript-eslint/no-explicit-any */
import { Roles } from "@/types";

export const UNIT_TYPES = [
  {
    label: "Kg",
    value: "kg",
  },
  {
    label: "Ltr",
    value: "ltr",
  },
];

export const OPERATOR_OPTIONS = [
  { label: "John Doe", value: "op-uuid-1" },
  { label: "Jane Smith", value: "op-uuid-2" },
  { label: "Peter Jones", value: "op-uuid-3" },
];

export const MACHINE_OPTIONS = [
  { label: "Tractor 1", value: "mach-uuid-a" },
  { label: "Harvester X5", value: "mach-uuid-b" },
  { label: "Seeder Pro", value: "mach-uuid-c" },
];

export const AREA_UNIT_OPTIONS = [
  { label: "Square Feet", value: "sq_ft" },
  { label: "Square Meters", value: "sq_m" },
  { label: "Acres", value: "acres" },
  { label: "Hectares", value: "hectares" },
];

export const roles: Roles = {
  ADMIN: "admin",
  PROJECT_MANAGER: "project_manager",
  TEAM_LEAD: "team_lead",
  DEVELOPER: "developer",
  BDE: "bde",
};

export const roleToDisplay = [
  { label: "Admin", value: roles.ADMIN },
  { label: "Project Manager", value: roles.PROJECT_MANAGER },
  { label: "Team Lead", value: roles.TEAM_LEAD },
  { label: "Developer", value: roles.DEVELOPER },
  { label: "Business Development Team", value: roles.BDE },
];

export const roleLabels: Record<string, string> = {
  bde: "Business Development Team",
};

export const INQUIRY_STATUS = {
  NEW_INQUIRY: "new-inquiry",
  IN_DISCUSSION: "in-discussion",
  NEAR_TO_CLOSE: "near-to-close",
  CLOSED: "closed",
  OPTED_OUT: "opted-out",
};

export const INQUIRY_STATUS_LABEL: any = {
  "new-inquiry": "New Inquiry",
  "in-discussion": "In Discussion",
  "near-to-close": "Near to Close",
  closed: "Closed",
  "opted-out": "Opted Out",
};

export const INTERVIEW_STATUS_LABEL: any = {
  pending: "Pending",
  technical_completed: "Technical Completed",
  practical_completed: "Practical Completed",
  hr_round: "HR Round",
  joining: "Joining",
  rejected: "Rejected",
};

export const ServerOwnerTypeLabel: any = {
  DEVSTREE: "Devstree",
  CLIENT: "Client",
};

export const ServerOwnerTypeOptions = [
  {
    label: "Devstree",
    value: "DEVSTREE",
  },
  {
    label: "Client",
    value: "CLIENT",
  },
];

export const ProjectServerTypeOptions = [
  {
    label: "Frontend",
    value: "FRONTEND",
  },
  {
    label: "Backend",
    value: "BACKEND",
  },
  {
    label: "S3",
    value: "S3",
  },
];

export const ProjectServerStatusOptions = [
  {
    label: "Active",
    value: "ACTIVE",
  },
  {
    label: "Inactive",
    value: "INACTIVE",
  },
];

export const TransactionTypeOptions = [
  {
    label: "One Time",
    value: "onetime",
  },
  {
    label: "Subscription",
    value: "subscription",
  },
];

export const SubscriptionTypeOptions = [
  {
    label: "Monthly",
    value: "monthly",
  },
  {
    label: "Yearly",
    value: "yearly",
  },
];

export const MeetingType = [
  { label: "Client", value: "client" },
  { label: "Internal", value: "internal" },
];
