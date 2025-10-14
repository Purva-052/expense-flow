import {
  IconAugmentedReality,
  IconBrandDatabricks,
  IconPalette,
  IconSettings,
  IconTool,
  IconUsers,
  IconUserScreen,
  
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
          title: 'Technology',
          url: '/technology',
          icon: IconAugmentedReality,
          requiredRoles: ['super_admin'],
        },
        {
          title: 'Projects',
          url: '/projects',
          icon: IconUserScreen,
          requiredRoles: ['super_admin'],
        },
        {
          title: 'Clients',
          url: '/clients',
          icon: IconBrandDatabricks,
          requiredRoles: ['super_admin'],
        },
        {
          title: 'Users',
          url: '/users',
          icon: IconUsers,
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
