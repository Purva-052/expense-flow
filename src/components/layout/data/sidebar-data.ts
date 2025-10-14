import {
  IconAlignBoxBottomCenter,
  IconBoxMargin,
  IconBrandSafari,
  IconBuildingBank,
  IconBuildings,
  IconCalendarTime,
  IconCategory,
  IconComponents,
  IconCurrentLocation,
  IconMapPin,
  IconPalette,
  IconReceiptDollar,
  IconSettings,
  IconTableFilled,
  IconTablePlus,
  IconTool,
  IconToolsKitchen,
  IconUsers,
  IconWorld,
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
          title: 'Country',
          url: '/country',
          icon: IconWorld,
          requiredRoles: ['super_admin'],
        },
        {
          title: 'States',
          url: '/states',
          icon: IconBrandSafari,
          requiredRoles: ['super_admin'],
        },
        {
          title: 'City',
          url: '/city',
          icon: IconBuildings,
          requiredRoles: ['super_admin'],
        },
        {
          title: 'Locality',
          url: '/locality',
          icon: IconCurrentLocation,
          requiredRoles: ['super_admin'],
        },
        {
          title: 'Venue Types',
          url: '/venue-types',
          icon: IconAlignBoxBottomCenter,
          requiredRoles: ['super_admin'],
        },
        {
          title: 'Venue Section Types',
          url: '/venueSectionTypes',
          icon: IconBoxMargin,
          requiredRoles: ['super_admin',"venue_owner"],
        },
        {
          title: 'Menu Categories',
          url: '/admin-menu-categories',
          icon: IconCategory,
          requiredRoles: ['super_admin',"venue_owner"],
        },
        {
          title: 'Tables',
          url: '/tables',
          icon: IconTablePlus,
          requiredRoles: ['master-admin'],
        },
        {
          title: 'Menu categories',
          url: '/menu-categories',
          icon: IconToolsKitchen,
          requiredRoles: ['club-admin'],
        },
        {
          title: 'Seating preference',
          url: '/seating-preference',
          icon: IconBuildingBank,
          requiredRoles: ['club-admin'],
        },
        {
          title: 'Tables Management',
          url: '/tables-management',
          icon: IconTableFilled,
          requiredRoles: ['club-admin'],
        },
      ],
    },
    {
      title: 'Operations',
      requiredRoles: ['super_admin', 'venue_owner'],
      items: [
        {
          title: 'Venue',
          url: '/venue',
          icon: IconMapPin,
          requiredRoles: ['super_admin'],
        },
        {
          title: 'Venue Sections',
          url: '/venue-sections',
          icon: IconMapPin,
          requiredRoles: ['venue_owner'],
        },
        {
          title: 'Menu',
          url: '/menu',
          icon: IconToolsKitchen,
          requiredRoles: ['venue_owner'],
        },
        {
          title: 'Bookings',
          url: '/bookings',
          icon: IconCalendarTime,
          requiredRoles: ['super_admin','venue_owner'],
        },
        {
          title: 'Payments',
          url: '/payments',
          icon: IconReceiptDollar,
          requiredRoles: ['super_admin'],
        },
        {
          title: 'Customers',
          url: '/customers',
          icon: IconUsers,
          requiredRoles: ['venue_owner'],
        },
        {
          title: 'Coupons',
          url: '/coupons',
          icon: IconComponents,
          requiredRoles: ['venue_owner'],
        },
        {
          title: ' Settings',
          url: '/settings',
          icon: IconSettings,
          requiredRoles: ['super_admin','venue_owner'],
        },
      ],
    },
  ],
}
