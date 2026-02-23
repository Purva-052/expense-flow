import { roles } from "@/utils/constant";
import {
  IconAlignBoxBottomCenter,
  IconAugmentedReality,
  IconBrandDatabricks,
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
import {  CalendarCheck, Command, Cpu, ScrollText } from "lucide-react";
import { type SidebarData } from "../types";
import { useAuthStore } from "@/stores/use-auth-store";

const { user } = useAuthStore.getState();
const userID = user?.user?.id;

const allowUserID1 = userID === 1 ? true : false;

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
          title: "Extra Work Report",
          url: "/extra-work-report",
          icon: IconReport,
          requiredRoles: [
            roles.ADMIN,
          ],
        },
        {
          title: "Leave Management",
          url: "/leave-management",
          icon: IconClipboardCheck,
          requiredRoles: [
            roles.ADMIN,
            roles.TEAM_LEAD,
            roles.PROJECT_MANAGER,
          ],
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
      title: "Masters",
      requiredRoles: [roles.ADMIN, roles.TEAM_LEAD, roles.PROJECT_MANAGER],
      isCollapsible: true,
      items: [
        {
          title: "Clients",
          url: "/clients",
          icon: IconBrandDatabricks,
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
          title: "Inquiries",
          url: "/inquiry",
          icon: IconMessage2Question,
          allowUserID1: allowUserID1,
        },
        {
          title: "Inquiry Types",
          url: "/inquiry-type",
          icon: IconPencilSearch,
          requiredRoles: [roles.ADMIN, roles.PROJECT_MANAGER],
        },
      ],
    },
  ],
};
