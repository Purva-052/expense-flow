import {
  IconBuildings,
  IconPalette,
  IconSettings,
  IconTool,
  
} from '@tabler/icons-react'
import { Command, Home } from 'lucide-react'
import { type SidebarData } from '../types'

export const sidebarData: SidebarData = {
  user: {
    name: 'satnaing',
    email: 'satnaingdev@gmail.com',
    avatar: '/avatars/shadcn.jpg',
  },
  teams: [
    {
      name: 'Shadcn Admin',
      logo: Command,
      plan: 'Vite + ShadcnUI',
    },
    {
      name: 'Acme Inc',
      logo: IconTool,
      plan: 'Enterprise',
    },
    {
      name: 'Acme Corp.',
      logo: IconPalette,
      plan: 'Startup',
    },
  ],
  navGroups: [
    {
      title: 'Overview',
      requiredRoles: ['super_admin', 'venue_owner'],
      items: [
        {
          title: 'Dashboard',
          url: '/',
          icon: Home,
          requiredRoles: ['super_admin', 'venue_owner'],
        },
      ],
    },
    {
      title: 'Masters',
      requiredRoles: ['super_admin', 'venue_owner'],
      items: [
      
        {
          title: 'Coupons',
          url: '/coupons',
          icon: IconBuildings,
          requiredRoles: ['super_admin'],
        },
      
      ],
    },
    {
      title: 'Operations',
      requiredRoles: ['super_admin', 'venue_owner'],
      items: [
        {
          title: ' Kanban Board',
          url: '/kanban-board',
          icon: IconSettings,
          requiredRoles: ['super_admin','venue_owner'],
        },
      ],
    },
  ],
}
