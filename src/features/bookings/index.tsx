/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react'
import { useSearch } from '@tanstack/react-router'
import { Calendar, Users } from 'lucide-react'
import { useAuthStore } from '@/stores/use-auth-store'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import PageLayout from '@/components/layout/layout-provider'
import { useGetCustomerListData } from '../customers/services'
import { useGetVenues } from '../venue/services'
import { ListView } from './components/ListView'
import { CalendarView } from './components/calenderView'
import { useGetBookingList } from './services'

export interface Booking {
  id: string
  customerName: string
  customerEmail: string
  customerPhone: string
  date: string
  time: string
  duration: number
  guests: number
  tableId: string
  tableName: string
  venueSection: string
  status: 'confirmed' | 'pending' | 'cancelled' | 'completed'
  specialRequests?: string
  totalAmount: number
  depositPaid: number
  createdAt: string
  updatedAt: string
}

const BookingsPage = () => {
  const [stratDate, setStartDate] = useState<Date | undefined>(undefined)
  const [endDate, setEndDate] = useState<Date | undefined>(undefined)
  const [activeTab, setActiveTab] = useState<any>('calendar')

  const { user } = useAuthStore()
  const role = user?.user?.role?.name

  const search: any = useSearch({ from: '/_authenticated/bookings/' })

  useEffect(() => {
    if (search?.tab === 'list') {
      setActiveTab('list')
    }
  }, [search])

  const formatDateForApi = (date?: Date) => {
    if (!date) return undefined
    return date.toISOString().split('T')[0] // YYYY-MM-DD
  }

  const handleDateChange = (val: any) => {
    setStartDate(val?.from)
    setEndDate(val?.to)
  }

  const [listParams, setListParams] = useState({
    pagination: activeTab === 'list' ? true : false,
    limit: 10,
    page: 1,
    search: '',
    startDate: undefined,
    endDate: undefined,
    status: undefined,
    customerId: search?.customerId ?? undefined, // ✅ set from query param
    venueId: undefined,
  })

  const apiParams = {
    page: listParams.page,
    limit: listParams.limit,
    search: listParams.search,
    startDate: formatDateForApi(stratDate),
    endDate: formatDateForApi(endDate),
    status: listParams.status,
    pagination: activeTab === 'list' ? true : false,
    customerId: listParams.customerId,
    venueId: listParams.venueId,
  }

  const { data: customerList, isPending: customerListLoading }: any =
    useGetCustomerListData()

  const { data: bookingList, isPending: bookingListLoading }: any =
    useGetBookingList(apiParams)

  const { data: venueListData, isPending: venueListDataLoading }: any =
    useGetVenues({
      pagination: false,
    })

  const bookingData = bookingList?.data || []
  const totalCount = (bookingList as any)?.metadata?.totalCount

  const handleSearch = (search: string | undefined) => {
    setListParams({ ...listParams, search: search ?? '', page: 1 })
  }

  const handleCustomerSelect = (value: any) => {
    setListParams({
      ...listParams,
      customerId: value, // 'all' resets filter
      page: 1,
    })
  }

  const handleVenueSelect = (value: any) => {
    setListParams({
      ...listParams,
      venueId: value, // 'all' resets filter
      page: 1,
    })
  }

  const handleStatusSelect = (value: any) => {
    setListParams({
      ...listParams,
      status: value, // 'all' resets filter
      page: 1,
    })
  }

  const handlePaginationChange = (newPagination: {
    pageIndex: number
    pageSize: number
  }) => {
    setListParams({
      ...listParams,
      limit: newPagination.pageSize,
      page: newPagination.pageIndex + 1,
    })
  }

  const filters: any = [
    {
      type: 'search',
      key: 'search',
      placeholder: 'Search by customer name, email, or table...',
      value: listParams.search,
      onChange: handleSearch,
    },
    {
      type: 'select',
      key: 'customer',
      placeholder: 'Filter by customer',
      options: customerList?.data?.map((value: any) => {
        return { label: value?.name, value: value?.id }
      }),
      value: listParams.customerId, // 👈 pre-selects if set
      onChange: handleCustomerSelect,
      isLoading: customerListLoading,
    },
    ...(role === 'super_admin'
      ? [
          {
            type: 'select',
            key: 'venue',
            placeholder: 'Filter by Venue',
            options: venueListData?.data?.map((value: any) => ({
              label: value?.name,
              value: value?.id,
            })),
            value: listParams.venueId,
            onChange: handleVenueSelect,
            isLoading: venueListDataLoading,
          },
        ]
      : []),

    {
      type: 'select',
      key: 'status',
      placeholder: 'Filter by Status', // This will now show correctly
      options: [
        { label: 'Pending', value: 'pending' },
        { label: 'Confirmed', value: 'confirmed' },
        { label: 'Cancelled', value: 'cancelled' },
        { label: 'Completed', value: 'completed' },
      ],
      value: listParams.status, // Keep undefined initially
      onChange: handleStatusSelect,
    },
    {
      type: 'dateRange',
      key: 'createdAt',
      placeholder: 'Filter by date range',
      onChange: handleDateChange,
    },
  ]

  const getStatusColor = (status: Booking['status']) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'completed':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  return (
    <PageLayout>
      <div className='space-y-6'>
        {/* Header */}
        <div className='flex items-center justify-between'>
          <div>
            <h1 className='text-3xl font-bold tracking-tight'>
              Bookings Management
            </h1>
            <p className='text-muted-foreground'>
              Manage and track all venue bookings with calendar and list views
            </p>
          </div>
        </div>

        {role === 'super_admin' ? (
          <ListView
            loading={bookingListLoading}
            bookings={bookingData}
            getStatusColor={getStatusColor}
            totalCount={totalCount}
            filters={filters}
            handlePaginationChange={handlePaginationChange}
            listParams={listParams}
          />
        ) : (
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className='space-y-4'
          >
            <TabsList>
              <TabsTrigger value='calendar' className='flex items-center gap-2'>
                <Calendar className='h-4 w-4' />
                Calendar View
              </TabsTrigger>
              <TabsTrigger value='list' className='flex items-center gap-2'>
                <Users className='h-4 w-4' />
                List View
              </TabsTrigger>
            </TabsList>

            <TabsContent value='calendar'>
              <CalendarView
                bookings={bookingData}
                getStatusColor={getStatusColor}
                setStartDate={setStartDate}
                setEndDate={setEndDate}
              />
            </TabsContent>

            <TabsContent value='list'>
              <ListView
                loading={bookingListLoading}
                bookings={bookingData}
                getStatusColor={getStatusColor}
                totalCount={totalCount}
                filters={filters}
                handlePaginationChange={handlePaginationChange}
                listParams={listParams}
              />
            </TabsContent>
          </Tabs>
        )}
      </div>
    </PageLayout>
  )
}

export default BookingsPage
