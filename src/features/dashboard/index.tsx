/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  Building2,
  CalendarCheck,
  DollarSign,
  Folder,
  Settings,
  Users,
} from 'lucide-react'
import { useAuthStore } from '@/stores/use-auth-store'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Main } from '@/components/layout/main'
import QuickActionCard from './components/QuickActionCard'
import RecentBookings from './components/RecentBookings'
import StatsCard from './components/StatusCard'
import SystemOverviewCard from './components/systemOverviewCard'
import {
  useGetDashboardDataVenueAPI,
  useStripeAccountActiveAPI,
} from './services'

export default function Dashboard() {
  const [redirectURL, setRedirectURL] = useState('')
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const role = user?.user?.role?.name

  const { data: StripeAccount, isLoading }: any = useStripeAccountActiveAPI(
    user?.user?.venue?.venueStripeConnectAccountActive
  )
  const { data: DashboardListData, DashboardDataLoading }: any =
    useGetDashboardDataVenueAPI()
  const DashboardData = DashboardListData?.data
  const bookings = DashboardData?.topBookings || []

  const handleStripeAccount = () => {
    if (redirectURL) window.location.href = redirectURL
  }

  const handleNavigate = (path: string) => navigate({ to: path })

  useEffect(() => {
    if (StripeAccount) setRedirectURL(StripeAccount?.data?.url)
  }, [StripeAccount])

  // Role-based Stats Cards
  const statsCardsData =
    role === 'super_admin'
      ? [
          {
            title: 'Total Clubs',
            value: DashboardData?.totalKlubs ?? 0,
            icon: <Building2 className='h-5 w-5 text-blue-600' />,
            subtitle: 'Growing steadily',
            onClick: () => handleNavigate('/venue'),
          },
          {
            title: 'Total Bookings',
            value: DashboardData?.totalBookings ?? 0,
            icon: <CalendarCheck className='h-5 w-5 text-purple-600' />,
            subtitle: 'Bookings handled this month',
            onClick: () => handleNavigate('/bookings'),
          },
          {
            title: 'Total Customers',
            value: DashboardData?.totalCustomers ?? 0,
            icon: <Users className='h-5 w-5 text-green-600' />,
            subtitle: 'Active customer base',
            onClick: () => handleNavigate('/customers'),
          },
          {
            title: 'Total Revenue',
            value: `$${DashboardData?.totalRevenue?.toLocaleString('en-IN') ?? 0}`,
            icon: <DollarSign className='h-5 w-5 text-orange-600' />,
            subtitle: 'Total income till date',
            onClick: undefined,
          },
        ]
      : [
          {
            title: 'Total Bookings',
            value: DashboardDataLoading
              ? '...'
              : (DashboardData?.totalBookings ?? 0),
            icon: <CalendarCheck className='h-5 w-5 text-purple-600' />,
            subtitle: 'All-time bookings',
            onClick: () => handleNavigate('/bookings'),
          },
          {
            title: 'Confirmed Earnings',
            value: DashboardDataLoading
              ? '...'
              : `$${DashboardData?.confirmedEarnings ?? 0}`,
            icon: <DollarSign className='h-5 w-5 text-green-600' />,
            subtitle: 'Amount received',
            onClick: undefined,
          },
          {
            title: 'Pending Earnings',
            value: DashboardDataLoading
              ? '...'
              : `$${DashboardData?.pendingEarnings ?? 0}`,
            icon: <Activity className='h-5 w-5 text-orange-600' />,
            subtitle: 'Awaiting payout',
            onClick: undefined,
          },
          {
            title: 'Active Customers',
            value: DashboardDataLoading
              ? '...'
              : (DashboardData?.uniqueUsers ?? 0),
            icon: <Users className='h-5 w-5 text-blue-600' />,
            subtitle: 'Unique users',
            onClick: () => handleNavigate('/customers'),
          },
        ]

  // Role-based Quick Actions
  const quickActionsData: Record<string, any[]> = {
    super_admin: [
      {
        title: 'Manage Payments',
        description: 'Manage payments information',
        path: '/payments',
        icon: <ArrowRight className='h-4 w-4 text-gray-500' />,
        hoverClass: 'hover:border-blue-200 hover:bg-blue-50',
      },
      {
        title: 'Admin Settings',
        description: 'Update Admin info and account preferences',
        path: '/settings',
        icon: <Settings className='h-4 w-4 text-gray-500' />,
        hoverClass: 'hover:border-purple-200 hover:bg-purple-50',
      },
      {
        title: 'Menu Categories',
        description: 'Add menu categories and update info',
        path: '/admin-menu-categories',
        icon: <Folder className='h-4 w-4 text-gray-500' />,
        hoverClass: 'hover:border-purple-200 hover:bg-purple-50',
      },
    ],
    venue_owner: [
      {
        title: 'View Coupons',
        description: 'Manage your coupons list and profiles',
        path: '/coupons',
        icon: <DollarSign className='h-4 w-4 text-gray-500' />,
        hoverClass: 'hover:border-purple-200 hover:bg-purple-50',
      },
      {
        title: 'View Menu ',
        description: 'Add menu  and update info',
        path: '/menu',
        icon: <Folder className='h-4 w-4 text-gray-500' />,
        hoverClass: 'hover:border-purple-200 hover:bg-purple-50',
      },
      {
        title: 'Settings',
        description: 'Update venue info and account preferences',
        path: '/settings',
        icon: <Settings className='h-4 w-4 text-gray-500' />,
        hoverClass: 'hover:border-green-200 hover:bg-green-50',
      },
    ],
  }

  const quickActions = quickActionsData[role] || []

  const systemOverviewData: Record<string, any[]> = {
    super_admin: [
      {
        title: "Today's Revenue",
        value: `$${DashboardData?.todaysRevenue ?? 0}`,
        color: 'text-blue-600',
      },
      {
        title: 'Revenue of This Week',
        value: `$${DashboardData?.weekRevenue ?? 0}`,
        color: 'text-purple-600',
      },
      {
        title: "Today's Bookings",
        value: `${DashboardData?.todaysBookings ?? 0}`,
        color: 'text-green-600',
      },
    ],
    venue_owner: [
      {
        title: "Today's Earnings",
        value: `$${DashboardData?.todaysEarnings ?? 0}`,
        color: 'text-blue-600',
      },
      {
        title: 'Earnings of This Week',
        value: `$${DashboardData?.weeklyEarnings ?? 0}`,
        color: 'text-purple-600',
      },
      {
        title: "Today's Bookings",
        value: `${DashboardData?.todaysBookings ?? 0}`,
        color: 'text-green-600',
      },
    ],
  }

  const systemOverview = systemOverviewData[role] || []

  return (
    <Main>
      <div className='space-y-6'>
        {/* Stripe Alert for venue */}
        {role !== 'super_admin' &&
          !user?.user?.venue?.venueStripeConnectAccountActive && (
            <div className='rounded-lg border border-amber-400 bg-amber-50 text-amber-700 shadow-sm'>
              <div className='flex items-center gap-3 border-b border-amber-200 px-4 py-3'>
                <AlertTriangle className='h-5 w-5 text-amber-500' />
                <span className='text-base font-semibold text-amber-800'>
                  Action Required
                </span>
              </div>
              <div className='px-6 py-4'>
                <p className='text-sm leading-relaxed'>
                  To start receiving payments, please connect your{' '}
                  <span className='font-medium text-amber-800'>
                    Stripe account
                  </span>{' '}
                  and activate it.
                </p>
                <div className='mt-4'>
                  <Button
                    className='flex items-center gap-2 bg-amber-600 text-white hover:bg-amber-700'
                    onClick={handleStripeAccount}
                    disabled={isLoading || !StripeAccount?.data?.url}
                  >
                    Connect Stripe
                    <ArrowRight className='h-4 w-4' />
                  </Button>
                </div>
              </div>
            </div>
          )}

        {/* Stats Cards */}
        <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4'>
          {statsCardsData.map((card, index) => (
            <StatsCard key={index} {...card} />
          ))}
        </div>

        {/* Quick Actions + Recent Activity */}
        <div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              {quickActions.map((action, index) => (
                <QuickActionCard
                  key={index}
                  {...action}
                  onClick={() => handleNavigate(action.path)}
                />
              ))}
            </CardContent>
          </Card>

          <RecentBookings
            bookings={bookings}
            DashboardDataLoading={DashboardDataLoading}
          />
        </div>

        {/* System Overview */}
        <Card>
          <CardHeader>
            <CardTitle>System Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='grid grid-cols-1 gap-6 md:grid-cols-3'>
              {systemOverview.map((item, index) => (
                <SystemOverviewCard key={index} {...item} />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </Main>
  )
}
