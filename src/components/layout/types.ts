import { LinkProps } from "@tanstack/react-router";

interface User {
  name: string;
  email: string;
  avatar: string;
}

interface Team {
  name: string;
  logo: React.ElementType;
  plan: string;
}

interface BaseNavItem {
  title: string;
  badge?: string;
  icon?: React.ElementType;
}

type NavLink = BaseNavItem & {
  url: LinkProps["to"];
  items?: never;
  requiredRoles?: string[];
  allowUserID1?: boolean;
  allowUserIDs?: number[];
};

type NavCollapsible = BaseNavItem & {
  items: (BaseNavItem & {
    url: LinkProps["to"];
    requiredRoles?: string[];
    allowUserID1?: boolean;
    allowUserIDs?: number[];
  })[];
  url?: never;
  requiredRoles?: string[];
  defaultClosed?: boolean;
  allowUserIDs?: number[];
};

type NavItem = NavCollapsible | NavLink;

interface NavGroup {
  title: string;
  items: NavItem[];
  requiredRoles?: string[];
  isCollapsible?: boolean;
  allowUserIDs?: number[];
}

interface SidebarData {
  user: User;
  teams: Team[];
  navGroups: NavGroup[];
}

export type { SidebarData, NavGroup, NavItem, NavCollapsible, NavLink };
