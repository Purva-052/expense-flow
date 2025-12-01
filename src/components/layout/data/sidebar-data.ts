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
  IconUserScreen,
} from "@tabler/icons-react";
import { Command } from "lucide-react";
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
          title: "Inquiries",
          url: "/Inquiry",
          icon: IconMessage2Question,
          allowUserID1: allowUserID1,
        },
        {
          title: "Interviews",
          url: "/Interviews",
          icon: IconLayersIntersect,
          requiredRoles: [roles.ADMIN, roles.PROJECT_MANAGER, roles.TEAM_LEAD],
        },
      ],
    },
    {
      title: "Masters",
      requiredRoles: [roles.ADMIN, roles.TEAM_LEAD, roles.PROJECT_MANAGER],
      items: [
        {
          title: "Technologies",
          url: "/technology",
          icon: IconAugmentedReality,
          requiredRoles: [roles.ADMIN, roles.TEAM_LEAD, roles.PROJECT_MANAGER],
        },
        {
          title: "Projects",
          url: "/projects",
          icon: IconUserScreen,
          requiredRoles: [roles.ADMIN, roles.TEAM_LEAD, roles.PROJECT_MANAGER],
        },
        {
          title: "Project Types",
          url: "/Project-type",
          icon: IconAlignBoxBottomCenter,
          requiredRoles: [roles.ADMIN, roles.TEAM_LEAD, roles.PROJECT_MANAGER],
        },
        {
          title: "Inquiry Types",
          url: "/Inquiry-type",
          icon: IconPencilSearch,
          requiredRoles: [roles.ADMIN],
        },
        {
          title: "Clients",
          url: "/clients",
          icon: IconBrandDatabricks,
          requiredRoles: [roles.ADMIN, roles.TEAM_LEAD, roles.PROJECT_MANAGER],
        },
        {
          title: "Servers",
          url: "/Server",
          icon: IconReservedLine,
          requiredRoles: ["admin", "project_manager"],
        },
        {
          title: "Users",
          url: "/users",
          icon: IconUsers,
          requiredRoles: [roles.ADMIN, roles.TEAM_LEAD, roles.PROJECT_MANAGER],
        },
      ],
    },
  ],
};
