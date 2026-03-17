import { roles } from "@/utils/constant";
import {
  IconAlignBoxBottomCenter,
  IconAugmentedReality,
  IconLayersIntersect,
  IconLayoutBoardFilled,
  IconMessage2Question,
  IconPalette,
  IconPencilSearch,
  IconReservedLine,
  IconTool,
  IconUsers,
  // IconUserScreen,
  IconReportAnalytics,
  IconReport,
  IconClipboardCheck,
} from "@tabler/icons-react";
import {
  ArrowDownToLine,
  ArrowUpFromLine,
  Building2,
  CalendarCheck,
  Command,
  Cpu,
  Flame,
  Globe,
  // CpuIcon,
  HardDrive,
  Headset,
  MemoryStick,
  Microchip,
  Network,
  ScrollText,
  Tag,
  UserStar,
} from "lucide-react";
import { type SidebarData } from "../types";
// import { useAuthStore } from "@/stores/use-auth-store";

// const { user } = useAuthStore.getState();
// const userID = user?.user?.id;

// const allowUserID1 = userID === 1 ? true : false;

export const sidebarData: SidebarData = {
  user: {
    name: "satnaing",
    email: "satnaingdev@gmail.com",
    avatar: "/avatars/shadcn.jpg",
  },
  teams: [
    {
      name: "Shadcn Admin",
      logo: Command,
      plan: "Vite + ShadcnUI",
    },
    {
      name: "Acme Inc",
      logo: IconTool,
      plan: "Enterprise",
    },
    {
      name: "Acme Corp.",
      logo: IconPalette,
      plan: "Startup",
    },
  ],
  navGroups: [
    {
      title: "Overview",
      requiredRoles: [
        roles.ADMIN,
        roles.TEAM_LEAD,
        roles.PROJECT_MANAGER,
        roles.DEVELOPER,
        roles.BDE,
      ],
      items: [
        {
          title: "Dashboard",
          url: "/",
          icon: IconLayoutBoardFilled,
          requiredRoles: [
            roles.ADMIN,
            roles.TEAM_LEAD,
            roles.PROJECT_MANAGER,
            roles.DEVELOPER,
            roles.BDE,
          ],
        },
        {
          title: "Daily Report",
          url: "/daily-report",
          icon: IconReportAnalytics,
          requiredRoles: [
            roles.ADMIN,
            roles.TEAM_LEAD,
            roles.PROJECT_MANAGER,
            roles.DEVELOPER,
            roles.BDE,
          ],
        },
        {
          title: "Lead Management",
          url: "/inquiry",
          icon: IconMessage2Question,
          // allowUserID1: allowUserID1,
          requiredRoles: [roles.ADMIN],
        },
        {
          title: "System Inventory",
          url: "/system-inventory",
          icon: IconReservedLine,
          requiredRoles: [
            roles.ADMIN,
            roles.TEAM_LEAD,
            roles.PROJECT_MANAGER,
            roles.DEVELOPER,
            roles.BDE,
          ],
        },
        {
          title: "Extra Work Report",
          url: "/extra-work-report",
          icon: IconReport,
          requiredRoles: [roles.ADMIN],
        },
        {
          title: "Leave Management",
          url: "/leave-management",
          icon: IconClipboardCheck,
          requiredRoles: [roles.ADMIN, roles.TEAM_LEAD, roles.PROJECT_MANAGER],
        },
        {
          title: "Meetings Overview",
          url: "/meetings-overview",
          icon: IconMessage2Question,
          requiredRoles: [roles.ADMIN, roles.PROJECT_MANAGER],
        },
      ],
    },
    {
      title: "Recruitment",
      requiredRoles: [roles.ADMIN, roles.TEAM_LEAD, roles.PROJECT_MANAGER],
      items: [
        {
          title: "Interviews",
          url: "/interviews",
          icon: IconLayersIntersect,
          requiredRoles: [roles.ADMIN, roles.PROJECT_MANAGER, roles.TEAM_LEAD],
        },
        {
          title: "To be Join",
          url: "/new-joinees",
          icon: IconUsers,
          requiredRoles: [roles.ADMIN, roles.TEAM_LEAD, roles.PROJECT_MANAGER],
        },
      ],
    },
    {
      title: "Operations",
      requiredRoles: [roles.ADMIN, roles.TEAM_LEAD, roles.PROJECT_MANAGER],
      items: [
        {
          title: "Conference Room Booking",
          url: "/conference-room-booking",
          icon: CalendarCheck,
          requiredRoles: [
            roles.ADMIN,
            roles.TEAM_LEAD,
            roles.PROJECT_MANAGER,
            roles.BDE,
          ],
        },
        {
          title: "Transaction Logs",
          url: "/transactions-logs",
          icon: ScrollText,
          requiredRoles: [roles.ADMIN, roles.PROJECT_MANAGER, roles.TEAM_LEAD],
        },
        {
          title: "Tools Management",
          url: "/tools-management",
          icon: IconTool,
          requiredRoles: [roles.ADMIN, roles.PROJECT_MANAGER, roles.TEAM_LEAD],
        },
      ],
    },
    {
      title: "Infrastructure",
      requiredRoles: [roles.ADMIN, roles.TEAM_LEAD, roles.PROJECT_MANAGER],
      items: [
        {
          title: "Servers",
          url: "/server",
          icon: IconReservedLine,
          requiredRoles: ["admin", "project_manager"],
        },
        {
          title: "Server Monitoring",
          url: "/linode-server-dashboard",
          icon: Cpu,
          requiredRoles: [roles.ADMIN, roles.TEAM_LEAD, roles.PROJECT_MANAGER],
        },
      ],
    },
    {
      title: "Inquiry Management",
      requiredRoles: [roles.ADMIN, roles.BDE, roles.PROJECT_MANAGER],
      isCollapsible: true,
      items: [
        {
          title: "Industry",
          url: "/industry",
          icon: Building2,
          requiredRoles: [roles.ADMIN, roles.PROJECT_MANAGER],
        },
        {
          title: "Domain",
          url: "/domain",
          icon: Globe,
          requiredRoles: [roles.ADMIN, roles.PROJECT_MANAGER],
        },
        {
          title: "Inquiry Types",
          url: "/inquiry-types",
          icon: Flame,
          requiredRoles: [roles.ADMIN, roles.PROJECT_MANAGER],
        },
        {
          title: "Inquiry Channels",
          url: "/inquiry-channels",
          icon: Network,
          requiredRoles: [roles.ADMIN, roles.PROJECT_MANAGER],
        },
        {
          title: "Inbound Sources",
          url: "/inbound-sources",
          icon: ArrowDownToLine,
          requiredRoles: [roles.ADMIN, roles.PROJECT_MANAGER],
        },
        {
          title: "Outbound Sources",
          url: "/outbound-sources",
          icon: ArrowUpFromLine,
          requiredRoles: [roles.ADMIN, roles.PROJECT_MANAGER],
        },
        // {
        //   title: "To be Join",
        //   url: "/new-joinees",
        //   icon: IconUsers,
        //   requiredRoles: [roles.ADMIN, roles.TEAM_LEAD, roles.PROJECT_MANAGER],
        // },
      ],
    },
    {
      title: "System Inventory Management",
      requiredRoles: [roles.ADMIN],
      isCollapsible: true,
      items: [
        {
          title: "Processor Types",
          url: "/processor",
          icon: Microchip,
          requiredRoles: ["admin"],
        },
        {
          title: "RAM Types",
          url: "/ram-types",
          icon: MemoryStick,
          requiredRoles: ["admin"],
        },
        {
          title: "Headphone Brands",
          url: "/headphone-brand",
          icon: Headset,
          requiredRoles: ["admin"],
        },
        {
          title: "Storage",
          url: "/storage",
          icon: HardDrive,
          requiredRoles: ["admin"],
        },
        {
          title: "Monitor Sizes",
          url: "/monitor-size",
          icon: IconReservedLine,
          requiredRoles: ["admin"],
        },
        {
          title: "Brands",
          url: "/brands",
          icon: Tag,
          requiredRoles: ["admin"],
        },
      ],
    },
    {
      title: "Masters",
      requiredRoles: [roles.ADMIN, roles.TEAM_LEAD, roles.PROJECT_MANAGER],
      isCollapsible: true,
      items: [
        {
          title: "Clients",
          url: "/clients",
          icon: UserStar,
          requiredRoles: [roles.ADMIN, roles.TEAM_LEAD, roles.PROJECT_MANAGER],
        },
        {
          title: "Users",
          url: "/users",
          icon: IconUsers,
          requiredRoles: [roles.ADMIN, roles.TEAM_LEAD, roles.PROJECT_MANAGER],
        },
        {
          title: "Technologies",
          url: "/technology",
          icon: IconAugmentedReality,
          requiredRoles: [roles.ADMIN, roles.TEAM_LEAD, roles.PROJECT_MANAGER],
        },
        // {
        //   title: "Projects",
        //   url: "/projects",
        //   icon: IconUserScreen,
        //   requiredRoles: [roles.ADMIN, roles.TEAM_LEAD, roles.PROJECT_MANAGER],
        // },
        {
          title: "Project Types",
          url: "/project-type",
          icon: IconAlignBoxBottomCenter,
          requiredRoles: [roles.ADMIN, roles.TEAM_LEAD, roles.PROJECT_MANAGER],
        },
        {
          title: "Inquiry Requirements",
          url: "/inquiry-requirements",
          icon: IconPencilSearch,
          requiredRoles: [roles.ADMIN, roles.PROJECT_MANAGER],
        },
      ],
    },
  ],
};
