import {
  IconAugmentedReality,
  IconBrandDatabricks,
  IconLayoutBoardFilled,
  IconPalette,
  IconTool,
  IconUsers,
  IconUserScreen,
  
} from '@tabler/icons-react'
import { Command} from 'lucide-react'
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
      requiredRoles:['admin', 'team_lead',"project_manager","developer"],
      items: [
        {
          title: ' Project Board',
          url: '/',
          icon: IconLayoutBoardFilled,
          requiredRoles:['admin', 'team_lead',"project_manager","developer"],
        },
      ],
    },
    {
      title: 'Masters',
      requiredRoles: ['admin', 'team_lead',"project_manager"],
      items: [
        {
          title: 'Technology',
          url: '/technology',
          icon: IconAugmentedReality,
          requiredRoles: ['admin', 'team_lead',"project_manager"],
        },
        {
          title: 'Projects',
          url: '/projects',
          icon: IconUserScreen,
          requiredRoles: ['admin', 'team_lead',"project_manager"],
        },
        {
          title: 'Clients',
          url: '/clients',
          icon: IconBrandDatabricks,
          requiredRoles: ['admin', 'team_lead',"project_manager"],
        },
        {
          title: 'Users',
          url: '/users',
          icon: IconUsers,
          requiredRoles: ['admin', 'team_lead',"project_manager"],
        },
      ],
    },
   
  ],
}
