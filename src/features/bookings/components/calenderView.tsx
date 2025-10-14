/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from 'react'
import {
  format,
  isSameDay,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  getDay,
} from 'date-fns'
import { Link } from '@tanstack/react-router'
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  Users,
  Phone,
  Mail,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import GlobalFilterSection from '@/components/table/global-table-filter'
import { Booking } from '../index'
import BlockPopup from './BlockPopup'

interface CalendarViewProps {
  bookings: any[]

  getStatusColor: (status: Booking['status']) => string
  setStartDate: (date: Date | undefined) => void
  setEndDate: (date: Date | undefined) => void
}

export const CalendarView = ({
  bookings,

  getStatusColor,
  setStartDate,
  setEndDate,
}: CalendarViewProps) => {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedBooking, setSelectedBooking] = useState<any>(null)

  // eslint-disable-next-line no-console
  console.log('🚀 ~ CalendarView ~ selectedBooking:', selectedBooking)

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [blockedDates, setBlockedDates] = useState<Date[]>([])
  const [blockDialogOpen, setBlockDialogOpen] = useState(false)
  const [selectedDateToBlock, setSelectedDateToBlock] = useState<Date | null>(
    null
  )

  const getBookingsForDate = (date: Date) => {
    return bookings.filter((booking) =>
      isSameDay(new Date(booking?.bookingDateTime), date)
    )
  }

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev)
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1)
      } else {
        newDate.setMonth(prev.getMonth() + 1)
      }
      return newDate
    })
  }

  const handleBookingClick = (booking: Booking) => {
    setSelectedBooking(booking)
    setIsDialogOpen(true)
  }

  // Generate calendar days
  const generateCalendarDays = () => {
    const start = startOfMonth(currentDate)
    const end = endOfMonth(currentDate)
    const startDay = getDay(start)

    const prevMonth = new Date(start)
    prevMonth.setMonth(start.getMonth() - 1)
    const prevMonthEnd = endOfMonth(prevMonth)

    const days = []

    for (let i = startDay - 1; i >= 0; i--) {
      const day = new Date(prevMonthEnd)
      day.setDate(prevMonthEnd.getDate() - i)
      days.push({ date: day, isCurrentMonth: false })
    }

    const currentMonthDays = eachDayOfInterval({ start, end })
    currentMonthDays.forEach((day) => {
      days.push({ date: day, isCurrentMonth: true })
    })

    const remainingDays = 42 - days.length
    for (let i = 1; i <= remainingDays; i++) {
      const day = new Date(end)
      day.setDate(end.getDate() + i)
      days.push({ date: day, isCurrentMonth: false })
    }

    return days
  }

  const calendarDays = generateCalendarDays()
  const dayNames = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']

  const handleDateChange = (val: any) => {
    setStartDate(val?.from)
    setEndDate(val?.to)
  }

  const filters: any = [
    {
      type: 'dateRange',
      key: 'createdAt',
      placeholder: 'Filter by date range',
      onChange: handleDateChange,
    },
  ]

  return (
    <div className='space-y-6'>
      {/* Calendar Header */}
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-4'>
          <Button
            variant='outline'
            size='sm'
            onClick={() => navigateMonth('prev')}
          >
            <ChevronLeft className='h-4 w-4' />
          </Button>
          <h2 className='text-2xl font-semibold'>
            {format(currentDate, 'MMMM yyyy')}
          </h2>
          <Button
            variant='outline'
            size='sm'
            onClick={() => navigateMonth('next')}
          >
            <ChevronRight className='h-4 w-4' />
          </Button>
          <GlobalFilterSection filters={filters ?? []} />
        </div>
      </div>

      {/* Calendar Grid */}
      <div className='overflow-hidden rounded-lg border border-gray-200 bg-white'>
        {/* Day Headers */}
        <div className='grid grid-cols-7 border-b border-gray-200'>
          {dayNames.map((day) => (
            <div
              key={day}
              className='border-r border-gray-200 p-3 text-center text-sm font-medium text-gray-700 last:border-r-0'
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className='grid grid-cols-7'>
          {calendarDays.map(({ date, isCurrentMonth }, index) => {
            const dayBookings = getBookingsForDate(date)
            const isToday = isSameDay(date, new Date())
            const isSelected = isSameDay(date, currentDate)
            const isBlocked = blockedDates.some((d) => isSameDay(d, date))

            return (
              <div
                key={index}
                className={`min-h-[120px] border-r border-b border-gray-200 p-2 last:border-r-0 ${!isCurrentMonth ? 'bg-gray-50' : 'bg-white'} ${isToday ? 'bg-blue-50' : ''} ${isSelected ? 'bg-blue-100' : ''} ${isBlocked ? 'cursor-not-allowed bg-gray-300 opacity-60' : 'cursor-pointer hover:bg-gray-50'} `}
                onClick={() => {
                  if (isBlocked) return // Disable clicking blocked days
                  const dayBookings = getBookingsForDate(date)
                  if (dayBookings.length === 0) {
                    setSelectedDateToBlock(date)
                    setBlockDialogOpen(true)
                  } else {
                    setCurrentDate(date)
                  }
                }}
              >
                {/* Date Number */}
                <div
                  className={`mb-2 text-sm ${
                    !isCurrentMonth ? 'text-gray-400' : 'text-gray-900'
                  } ${isToday ? 'font-bold text-blue-600' : ''}`}
                >
                  {format(date, 'd')}
                </div>

                {/* Bookings */}
                {dayBookings.length > 0 && (
                  <div className='space-y-1'>
                    {dayBookings.slice(0, 3).map((booking) => (
                      <div
                        key={booking.id}
                        className={`cursor-pointer rounded px-2 py-1 text-xs transition-colors ${getStatusColor(
                          booking.status
                        )}`}
                        onClick={(e) => {
                          e.stopPropagation()
                          handleBookingClick(booking)
                        }}
                        title={`${booking.userName} - ${format(
                          new Date(booking.bookingDateTime),
                          'hh:mm a'
                        )} - ${booking.numberOfGuests} guests`}
                      >
                        <div className='truncate font-medium'>
                          {booking.userName}
                        </div>
                        <div className='text-muted-foreground'>
                          {format(new Date(booking.bookingDateTime), 'hh:mm a')}
                        </div>
                      </div>
                    ))}
                    {dayBookings.length > 3 && (
                      <Popover>
                        <PopoverTrigger asChild>
                          <div className='cursor-pointer rounded px-2 py-1 text-center text-xs text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700'>
                            +{dayBookings.length - 3} more
                          </div>
                        </PopoverTrigger>
                        <PopoverContent
                          className='w-80'
                          side='top'
                          align='start'
                        >
                          <div className='space-y-2'>
                            <h4 className='text-sm font-medium'>
                              All Bookings for {format(date, 'MMM dd, yyyy')}
                            </h4>
                            <div className='max-h-60 space-y-2 overflow-y-auto'>
                              {dayBookings.map((booking) => (
                                <div
                                  key={booking.id}
                                  className={`cursor-pointer rounded px-3 py-2 text-xs transition-colors ${getStatusColor(
                                    booking.status
                                  )}`}
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleBookingClick(booking)
                                  }}
                                >
                                  <div className='flex items-center justify-between'>
                                    <div className='min-w-0 flex-1'>
                                      <div className='truncate font-medium'>
                                        {booking.userName}
                                      </div>
                                      <div className='text-muted-foreground'>
                                        {format(
                                          new Date(booking.bookingDateTime),
                                          'hh:mm a'
                                        )}{' '}
                                        -{' '}
                                        {format(
                                          new Date(booking.endDateTime),
                                          'hh:mm a'
                                        )}{' '}
                                        • {booking.numberOfGuests} guests
                                      </div>
                                    </div>
                                    <Badge
                                      variant='outline'
                                      className={`text-xs ${getStatusColor(
                                        booking.status
                                      )}`}
                                    >
                                      {booking.status}
                                    </Badge>
                                  </div>
                                  <div className='mt-1 text-xs text-gray-600'>
                                    {booking.tableName} • {booking.venueSection}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </PopoverContent>
                      </Popover>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Booking Details Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className='sm:max-w-md'>
          <DialogHeader>
            <DialogTitle className='flex items-center gap-2'>
              <Clock className='h-5 w-5' />
              Booking Details
            </DialogTitle>
            <DialogDescription>
              Quick overview of the selected booking
            </DialogDescription>
          </DialogHeader>

          {selectedBooking && (
            <div className='space-y-4'>
              {/* Customer Info */}
              <div className='space-y-2'>
                <h3 className='text-lg font-medium'>
                  {selectedBooking.userName}
                </h3>
                <div className='space-y-1 text-sm text-gray-600'>
                  <div className='flex items-center gap-2'>
                    <Mail className='h-4 w-4' />
                    {selectedBooking.userEmail}
                  </div>
                  <div className='flex items-center gap-2'>
                    <Phone className='h-4 w-4' />
                    {selectedBooking.userPhone}
                  </div>
                </div>
              </div>

              {/* Booking Details */}
              <div className='space-y-3'>
                <div className='grid grid-cols-2 gap-4 text-sm'>
                  <div>
                    <span className='font-medium'>Date:</span>
                    <p>
                      {format(
                        new Date(selectedBooking.bookingDateTime),
                        'MMM dd, yyyy'
                      )}
                    </p>
                  </div>
                  <div>
                    <span className='font-medium'>Time:</span>
                    <p>
                      {format(
                        new Date(selectedBooking.bookingDateTime),
                        'hh:mm a'
                      )}{' '}
                      -{' '}
                      {format(new Date(selectedBooking.endDateTime), 'hh:mm a')}
                    </p>
                  </div>
                  <div>
                    <span className='font-medium'>Duration:</span>
                    <p>{selectedBooking.duration} Min</p>
                  </div>
                  <div>
                    <span className='font-medium'>Guests:</span>
                    <p className='flex items-center gap-1'>
                      <Users className='h-4 w-4' />
                      {selectedBooking.numberOfGuests}
                    </p>
                  </div>
                </div>

                <div className='space-y-3'>
                  <div className='grid grid-cols-2 gap-4 text-sm'>
                    {selectedBooking.venueTypeName && (
                      <div>
                        <span className='font-medium'>Venue Section:</span>
                        <p className='text-sm'>
                          {selectedBooking.venueTypeName}
                        </p>
                      </div>
                    )}
                    {selectedBooking.venueSectionTypeName && (
                      <div>
                        <span className='font-medium'>Section Type:</span>
                        <p className='text-sm'>
                          {selectedBooking.venueSectionTypeName}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Special Requests */}
                {selectedBooking.specialRequests && (
                  <div>
                    <span className='font-medium'>Special Requests:</span>
                    <p className='mt-1 text-sm text-gray-600'>
                      {selectedBooking.specialRequests}
                    </p>
                  </div>
                )}

                {/* Payment Info */}
                <div className='grid grid-cols-2 gap-4 text-sm'>
                  {selectedBooking.paymentMethod && (
                    <div>
                      <span className='font-medium'>Payment Method</span>
                      <p className='font-semibold'>
                        {selectedBooking.paymentMethod}
                      </p>
                    </div>
                  )}
                  {selectedBooking.paymentGateway && (
                    <div>
                      <span className='font-medium'>Payment Gateway</span>
                      <p className='font-semibold'>
                        {selectedBooking.paymentGateway}
                      </p>
                    </div>
                  )}
                  {selectedBooking.paymentStatus && (
                    <div>
                      <span className='font-medium'>Payment Status</span>
                      <p className='font-semibold'>
                        {selectedBooking.paymentStatus}
                      </p>
                    </div>
                  )}
                  {selectedBooking.paymentApplicationTaxPercentage && (
                    <div>
                      <span className='font-medium'>
                        Tax ({selectedBooking.paymentApplicationTaxPercentage}%)
                      </span>
                      <p className='font-semibold'>
                        ${selectedBooking.paymentApplicationTaxValue}
                      </p>
                    </div>
                  )}
                  {selectedBooking.applicationFeeAmount && (
                    <div>
                      <span className='font-medium'>Application Fees</span>
                      <p className='font-semibold'>
                        ${selectedBooking.applicationFeeAmount}
                      </p>
                    </div>
                  )}
                  {selectedBooking.paymentTotalAmount && (
                    <div>
                      <span className='font-medium'>Total Amount:</span>
                      <p className='font-semibold text-green-600'>
                        ${selectedBooking.paymentTotalAmount}
                      </p>
                    </div>
                  )}
                </div>

                {/* Status */}
                <div className='flex items-center gap-2'>
                  <span className='font-medium'>Status:</span>
                  <Badge className={getStatusColor(selectedBooking.status)}>
                    {selectedBooking.status}
                  </Badge>
                </div>
              </div>
            </div>
          )}
          <DialogFooter className='gap-2'>
            <Button variant='outline' onClick={() => setIsDialogOpen(false)}>
              Close
            </Button>
            <Link
              to='/booking-details'
              search={{ bookingId: selectedBooking?.id }}
            >
              <Button>View Full Details</Button>
            </Link>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <BlockPopup
        setBlockDialogOpen={setBlockDialogOpen}
        blockDialogOpen={blockDialogOpen}
        selectedDateToBlock={selectedDateToBlock}
        setBlockedDates={setBlockedDates}
        setSelectedDateToBlock={setSelectedDateToBlock}
        blockedDates={blockedDates}
      />
    </div>
  )
}
