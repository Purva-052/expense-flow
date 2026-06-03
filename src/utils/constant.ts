/* eslint-disable @typescript-eslint/no-explicit-any */
import { Roles } from "@/types";
import { DollarSign, Euro, IndianRupee } from "lucide-react";

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
export const PRODUCT_INQUIRY_STATUS = {
  CONTACTED: "contacted",
  UNQUALIFIED: "unqualified_lead",
  NO_RESPONSE: "no_response",
  DEMO_SCHEDULED: "demo_scheduled",
  DEMO_COMPLETED: "demo_completed",
  PROPOSAL_SHARED: "proposal_shared",
  WON: "won",
  LOST: "lost",
  OTHERS: "others",
  TRIAL: "trial",
};

export const PRODUCT_INQUIRY_STATUS_OPTIONS = [
  {
    value: PRODUCT_INQUIRY_STATUS.CONTACTED,
    label: "Contacted",
  },
  {
    value: PRODUCT_INQUIRY_STATUS.UNQUALIFIED,
    label: "Unqualified Lead",
  },
  {
    value: PRODUCT_INQUIRY_STATUS.NO_RESPONSE,
    label: "No Response",
  },
  {
    value: PRODUCT_INQUIRY_STATUS.DEMO_SCHEDULED,
    label: "Demo Scheduled",
  },
  {
    value: PRODUCT_INQUIRY_STATUS.DEMO_COMPLETED,
    label: "Demo Completed",
  },
  {
    value: PRODUCT_INQUIRY_STATUS.PROPOSAL_SHARED,
    label: "Proposal Shared",
  },
  {
    value: PRODUCT_INQUIRY_STATUS.WON,
    label: "Won",
  },
  {
    value: PRODUCT_INQUIRY_STATUS.LOST,
    label: "Lost",
  },
  {
    value: PRODUCT_INQUIRY_STATUS.OTHERS,
    label: "Others",
  },
  {
    value: PRODUCT_INQUIRY_STATUS.TRIAL,
    label: "Trial",
  },
];

export const PRODUCT_INQUIRY_STATUS_LABEL: any = {
  contacted: "Contacted",
  unqualified_lead: "Unqualified Lead",
  no_response: "No Response",
  demo_scheduled: "Demo Scheduled",
  demo_completed: "Demo Completed",
  proposal_shared: "Proposal Shared",
  won: "Won",
  lost: "Lost",
  others: "Others",
  trial_started: "Trial Started",
  converted: "Converted",
  not_interested: "Not Interested",
};

export const formatProductInquiryStatusLabel = (
  status?: string | null
): string => {
  if (!status) return "-";

  return (
    PRODUCT_INQUIRY_STATUS_LABEL[status] ||
    status
      .split(/[_-]+/)
      .filter(Boolean)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ")
  );
};

export const INTERVIEW_STATUS_LABEL: any = {
  technical_round: "Technical Round",
  practical_round: "Practical Round",
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

export const CurrencyType = [
  {
    label: "USD",
    value: "usd",
    icon: DollarSign,
    color: "text-green-600",
  },
  {
    label: "INR",
    value: "inr",
    icon: IndianRupee,
    color: "text-orange-600",
  },
  {
    label: "EUR",
    value: "eur",
    icon: Euro,
    color: "text-blue-600",
  },
];

export const ACCOUNTANT_USER_IDS = [169, 170, 171];

export const PROJECT_DETAILS_FILTER_STORAGE_KEY = "project_details_filters";

export const TransactionTypeStatus = [
  {
    label: "Pending",
    value: "pending",
  },
  {
    label: "Approved",
    value: "approved",
  },
  {
    label: "Rejected",
    value: "rejected",
  },
  {
    label: "Completed",
    value: "completed",
  },
];

export const PRIORITY_OPTIONS = [
  { label: "1", value: "1" },
  { label: "2", value: "2" },
  { label: "3", value: "3" },
];

export const LEAVE_TYPE = [
  { label: "Casual Leave", value: "1" },
  { label: "Paid Leave", value: "2" },
] as const;
