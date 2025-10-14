/* eslint-disable @typescript-eslint/no-explicit-any */
import { Link } from '@tanstack/react-router'
import sidebarLogo from '@/assets/klubTrasperentLogo.svg'
import { useAuthStore } from '@/stores/use-auth-store'
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarRail,
} from '@/components/ui/sidebar'
import { NavGroup } from '@/components/layout/nav-group'
import { sidebarData } from './data/sidebar-data'

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user } = useAuthStore()

  const filteredNavGroups = sidebarData.navGroups
    // Filter entire groups by role if group has requiredRoles
    .filter((group: any) => {
      if (!group.requiredRoles) return true

      return group.requiredRoles.includes(user?.user?.role?.name || '')
    })
    // Also filter items inside groups by role
    .map((group) => ({
      ...group,
      items: group.items.filter((item: any) => {
        if (!item.requiredRoles) return true
        return item.requiredRoles.includes(user?.user?.role?.name || '')
      }),
    }))
    // Remove empty groups (in case all items got filtered out)
    .filter((group) => group.items.length > 0)

  return (
    <Sidebar collapsible='icon' variant='sidebar' {...props}>
      <SidebarHeader className='cursor-pointer py-6 !shadow-sm group-data-[state=collapsed]:py-0'>
        <Link to='/'>
          <img
            className='h-24 w-full group-data-[state=collapsed]:h-14'
            src={sidebarLogo}
            alt='klub Logo'
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
  )
}
