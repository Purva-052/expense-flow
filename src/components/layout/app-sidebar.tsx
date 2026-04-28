/* eslint-disable @typescript-eslint/no-explicit-any */
import { Link } from "@tanstack/react-router";
import sidebarLogo from "@/assets/devstree-black-square.svg";
import darkLogo from "@/assets/devstree-squre-white-text-logo.svg";
import { useAuthStore } from "@/stores/use-auth-store";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import { NavGroup } from "@/components/layout/nav-group";
import { sidebarData } from "./data/sidebar-data";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user } = useAuthStore();
  const role = user?.user?.role || "";
  const id = user?.user?.id;

  const hasSidebarAccess = (item: {
    requiredRoles?: string[];
    allowUserIDs?: number[];
  }) => {
    const hasRoleAccess = item.requiredRoles?.includes(role) ?? false;
    const hasUserIDsAccess = item.allowUserIDs?.includes(id) ?? false;

    return hasRoleAccess || hasUserIDsAccess;
  };

  const filteredNavGroups = sidebarData.navGroups
    .filter((group: any) => {
      if (!group.requiredRoles && !group.allowUserIDs) return true;
      return hasSidebarAccess(group);
    })
    .map((group) => ({
      ...group,
      items: group.items
        .filter((item: any) => hasSidebarAccess(item))
        .map((item: any) => {
          if (item.items && Array.isArray(item.items)) {
            return {
              ...item,
              items: item.items.filter((subItem: any) =>
                hasSidebarAccess(subItem)
              ),
            };
          }
          return item;
        }),
    }))
    .filter((group) => group.items.length > 0);

  return (
    <Sidebar collapsible="icon" variant="sidebar" {...props}>
      <SidebarHeader className="cursor-pointer p-2 border-b bg-card">
        <Link to="/">
          <img
            className='h-12 w-full group-data-[state=collapsed]:h-10 dark:hidden'
            src={sidebarLogo}
            alt='Resource Logo'
          />
          <img
            className='h-12 w-full group-data-[state=collapsed]:h-10 hidden dark:block'
            src={darkLogo}
            alt='Resource Logo'
          />
        </Link>
      </SidebarHeader>
      <SidebarContent>
        {filteredNavGroups.map((props) => (
          <NavGroup key={props.title} {...props} />
        ))}
      </SidebarContent>
      {/* <SidebarFooter>
        <NavUser user={sidebarData.user} />
      </SidebarFooter> */}
      <SidebarRail />
    </Sidebar>
  );
}
