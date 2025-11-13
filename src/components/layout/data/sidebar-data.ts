import { roles } from "@/utils/constant";
import {
  IconAlignBoxBottomCenter,
  IconAugmentedReality,
  IconBrandDatabricks,
  IconLayoutBoardFilled,
  IconMessage2Question,
  IconPalette,
  IconPencilSearch,
  IconTool,
  IconUsers,
  IconUserScreen,
} from "@tabler/icons-react";
import { Command } from "lucide-react";
import { type SidebarData } from "../types";

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
          title: "Inquiry",
          url: "/Inquiry",
          icon: IconMessage2Question,
          requiredRoles: [roles.ADMIN],
        },
      ],
    },
    {
      title: "Masters",
      requiredRoles: [roles.ADMIN, roles.TEAM_LEAD, roles.PROJECT_MANAGER],
      items: [
        {
          title: "Technology",
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
          title: "Projects Type",
          url: "/Project-type",
          icon: IconAlignBoxBottomCenter,
          requiredRoles: [roles.ADMIN, roles.TEAM_LEAD, roles.PROJECT_MANAGER],
        },
        {
          title: "Inquiry Type",
          url: "/Inquiry-type",
          icon: IconPencilSearch,
          requiredRoles: ["admin"],
        },
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
      ],
    },
  ],
};
