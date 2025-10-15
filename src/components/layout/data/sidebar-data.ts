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
      requiredRoles: ['team_lead', 'admin'],
      items: [
        {
          title: 'Dashboard',
          url: '/',
          icon: Home,
          requiredRoles: ['team_lead', 'venue_owner'],
        },
      ],
    },
    {
      title: 'Masters',
      requiredRoles: ['team_lead', 'venue_owner'],
      items: [
        {
          title: 'Technology',
          url: '/technology',
          icon: IconAugmentedReality,
          requiredRoles: ['team_lead'],
        },
        {
          title: 'Projects',
          url: '/projects',
          icon: IconUserScreen,
          requiredRoles: ['team_lead'],
        },
        {
          title: 'Clients',
          url: '/clients',
          icon: IconBrandDatabricks,
          requiredRoles: ['team_lead'],
        },
        {
          title: 'Users',
          url: '/users',
          icon: IconUsers,
          requiredRoles: ['team_lead'],
        },
      ],
    },
    {
      title: 'Operations',
      requiredRoles: ['team_lead', 'venue_owner'],
      items: [
        {
          title: ' Kanban Board',
          url: '/kanban-board',
          icon: IconSettings,
          requiredRoles: ['team_lead','venue_owner'],
        },
      ],
    },
  ],
}
