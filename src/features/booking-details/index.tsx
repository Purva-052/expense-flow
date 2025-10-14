/* eslint-disable @typescript-eslint/no-explicit-any */
import { format } from 'date-fns'
import { Link, useSearch } from '@tanstack/react-router'
import {
  Calendar,
  Clock,
  Users,
  MapPin,
  Phone,
  Mail,
  FileText,
  ArrowLeft,
  Building,
  User,
  Utensils,
  CreditCard,
  AlertCircle,
  CheckCircle,
  XCircle,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  CircleCheckBig,
  ShieldAlert,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import PageLayout from '@/components/layout/layout-provider'
import { useGetBookingDetails } from './services'
import { BookingDetails } from './types'

const BookingDetailsPage = () => {
  const search: any = useSearch({ from: '/_authenticated/booking-details/' })
  const bookingId = search.bookingId

  const {
    data: bookingDetailsData,
    isLoading: bookingDetailsDataLoading,
  }: any = useGetBookingDetails(bookingId)

  const booking = (bookingDetailsData?.data as BookingDetails) || []

  const getStatusColor = (status: BookingDetails['status']) => {
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

  const getStatusIcon = (status: BookingDetails['status']) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle className='h-4 w-4' />
      case 'pending':
        return <AlertCircle className='h-4 w-4' />
      case 'cancelled':
        return <XCircle className='h-4 w-4' />
      case 'completed':
        return <CheckCircle className='h-4 w-4' />
      default:
        return <AlertCircle className='h-4 w-4' />
    }
  }

  if (bookingDetailsDataLoading) {
    return (
      <PageLayout>
        <div className='flex min-h-screen items-center justify-center'>
          <div className='flex flex-col items-center gap-3'>
            <div className='border-muted-foreground h-10 w-10 animate-spin rounded-full border-4 border-t-transparent'></div>
            <p className='text-muted-foreground'> Loading booking details...</p>
          </div>
        </div>
      </PageLayout>
    )
  }

  return (
    <PageLayout>
      <div className='space-y-6'>
        {/* Header */}
        <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
          <div className='space-y-8'>
            <div className='flex items-center gap-4'>
              <Link to='/bookings'>
                <Button variant='outline' size='sm'>
                  <ArrowLeft className='mr-2 h-4 w-4' />
                  Back to Bookings
                </Button>
              </Link>
            </div>
            <h1 className='text-3xl font-bold tracking-tight'>
              Booking Details
            </h1>
            <p className='text-muted-foreground'>
              Booking ID: {booking?.bookingId}
            </p>
          </div>
          <div className='flex items-center gap-2'>
            {getStatusIcon(booking?.status)}
            <Badge className={getStatusColor(booking?.status)}>
              {booking?.status?.toUpperCase()}
            </Badge>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className='grid grid-cols-1 gap-6 lg:grid-cols-3'>
          {/* Left Column - Main Details */}
          <div className='space-y-6 lg:col-span-2'>
            {/* Customer Information */}
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <User className='h-5 w-5' />
                  Customer Information
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
                  <div className='space-y-2'>
                    <p className='text-muted-foreground text-sm'>Name</p>
                    <p className='font-medium'>{booking?.userName}</p>
                  </div>
                  <div className='space-y-2'>
                    <p className='text-muted-foreground text-sm'>Email</p>
                    <div className='flex items-center gap-2'>
                      <Mail className='text-muted-foreground h-4 w-4' />
                      <p className='text-sm'>{booking?.userEmail}</p>
                    </div>
                  </div>
                  <div className='space-y-2'>
                    <p className='text-muted-foreground text-sm'>Phone</p>
                    <div className='flex items-center gap-2'>
                      <Phone className='text-muted-foreground h-4 w-4' />
                      <p className='text-sm'>{booking?.userPhone}</p>
                    </div>
                  </div>
                  <div className='space-y-2'>
                    <p className='text-muted-foreground text-sm'>
                      Number of Guests
                    </p>
                    <div className='flex items-center gap-2'>
                      <Users className='text-muted-foreground h-4 w-4' />
                      <p className='font-medium'>{booking?.numberOfGuests}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Booking Details */}
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <Calendar className='h-5 w-5' />
                  Booking Details
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
                  <div className='space-y-2'>
                    <p className='text-muted-foreground text-sm'>Date</p>
                    <div className='flex items-center gap-2'>
                      <Calendar className='text-muted-foreground h-4 w-4' />
                      <p className='font-medium'>
                        {booking?.bookingDateTime
                          ? format(
                              new Date(booking.bookingDateTime),
                              'EEEE, MMMM dd, yyyy'
                            )
                          : 'No Date'}
                      </p>
                    </div>
                  </div>
                  <div className='space-y-2'>
                    <p className='text-muted-foreground text-sm'>Time</p>
                    <div className='flex items-center gap-2'>
                      <Clock className='text-muted-foreground h-4 w-4' />
                      <p className='font-medium'>
                        {booking?.bookingDateTime &&
                          booking?.endDateTime &&
                          `${format(
                            new Date(booking.bookingDateTime),
                            'hh:mm a'
                          )} - ${format(
                            new Date(booking.endDateTime),
                            'hh:mm a'
                          )}`}
                      </p>
                    </div>
                  </div>
                  <div className='space-y-2'>
                    <p className='text-muted-foreground text-sm'>
                      Table Number
                    </p>
                    <p className='font-medium'>
                      Table {booking?.actualTableNumber}
                    </p>
                  </div>
                  <div className='space-y-2'>
                    <p className='text-muted-foreground text-sm'>
                      Section Capacity
                    </p>
                    <p className='font-medium'>
                      {booking?.sectionCapacity} people
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Venue Information */}
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <Building className='h-5 w-5' />
                  Venue Information
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div className='space-y-2'>
                  <p className='text-muted-foreground text-sm'>Venue Name</p>
                  <p className='text-lg font-medium'>{booking?.venueName}</p>
                </div>
                <div className='space-y-2'>
                  <p className='text-muted-foreground text-sm'>Address</p>
                  <div className='flex items-start gap-2'>
                    <MapPin className='text-muted-foreground mt-1 h-4 w-4' />
                    <p className='text-sm'>{booking?.venueAddress}</p>
                  </div>
                </div>
                <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
                  <div className='space-y-2'>
                    <p className='text-muted-foreground text-sm'>
                      Total Tables
                    </p>
                    <p className='font-medium'>{booking?.numberOfTables}</p>
                  </div>
                  <div className='space-y-2'>
                    <p className='text-muted-foreground text-sm'>
                      Section Capacity
                    </p>
                    <p className='font-medium'>
                      {booking?.sectionCapacity} people
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Guest List */}
            {booking?.guests && booking?.guests.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className='flex items-center gap-2'>
                    <Users className='h-5 w-5' />
                    Guest List ({booking?.guests.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className='space-y-4'>
                    {booking.guests.map((guest: any, index: any) => (
                      <div key={guest.id} className='rounded-lg border p-4'>
                        <div className='space-y-2'>
                          <p className='font-medium'>{guest?.fullName}</p>
                          <div className='text-muted-foreground flex flex-col gap-2 text-sm sm:flex-row'>
                            <div className='flex items-center gap-1'>
                              <Mail className='h-3 w-3' />
                              <span>{guest?.email}</span>
                            </div>
                            <div className='flex items-center gap-1'>
                              <Phone className='h-3 w-3' />
                              <span>{guest?.phoneNumber}</span>
                            </div>
                          </div>
                        </div>
                        {index < booking.guests.length - 1 && (
                          <Separator className='mt-4' />
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column - Summary & Actions */}
          <div className='space-y-6'>
            {/* Payment Summary */}
            <Card className='rounded-2xl border border-gray-200 shadow-md transition-all duration-300 hover:shadow-lg'>
              <CardHeader className='pb-2'>
                <CardTitle className='flex items-center gap-2 text-lg font-semibold'>
                  <CreditCard className='text-primary h-5 w-5' />
                  Payment Summary
                </CardTitle>
                <p className='text-muted-foreground text-sm'>
                  Review booking payment details and totals
                </p>
              </CardHeader>

              <CardContent className='space-y-5'>
                {/* Payment Details */}
                <div className='space-y-3'>
                  {booking?.paymentGateway && (
                    <div className='flex justify-between text-sm'>
                      <span className='text-muted-foreground'>Gateway</span>
                      <span className='font-medium'>
                        {booking.paymentGateway}
                      </span>
                    </div>
                  )}

                  {booking?.paymentMethod && (
                    <div className='flex justify-between text-sm'>
                      <span className='text-muted-foreground'>Method</span>
                      <span className='font-medium capitalize'>
                        {booking.paymentMethod}
                      </span>
                    </div>
                  )}

                  {booking?.paymentStatus && (
                    <div className='flex justify-between text-sm'>
                      <span className='text-muted-foreground'>Status</span>
                      <span
                        className={cn(
                          'flex items-center gap-1 font-semibold',
                          booking.paymentStatus === 'succeeded'
                            ? 'text-green-600'
                            : booking.paymentStatus === 'pending'
                              ? 'text-yellow-600'
                              : 'text-red-600'
                        )}
                      >
                        {booking.paymentStatus === 'succeeded' ? (
                          <ArrowUpRight className='h-4 w-4' />
                        ) : (
                          <ArrowDownRight className='h-4 w-4' />
                        )}
                        {booking.paymentStatus}
                      </span>
                    </div>
                  )}
                </div>

                <Separator />

                {/* Amount Breakdown */}
                <div className='space-y-3'>
                  {booking?.paymentSubTotal && (
                    <div className='flex justify-between'>
                      <span className='text-muted-foreground text-sm'>
                        Amount
                      </span>
                      <span className='font-semibold'>
                        ${booking.paymentSubTotal}
                      </span>
                    </div>
                  )}

                  {booking?.paymentApplicationTaxPercentage && (
                    <div className='flex justify-between text-sm'>
                      <span className='text-muted-foreground'>
                        Tax ({booking.paymentApplicationTaxPercentage}%)
                      </span>
                      <span className='font-medium'>
                        ${booking.paymentApplicationTaxValue}
                      </span>
                    </div>
                  )}
                  {booking?.applicationFeeAmount && (
                    <div className='flex justify-between text-sm'>
                      <span className='text-muted-foreground text-sm'>
                        Application Fees
                      </span>
                      <span className='font-medium'>
                        ${booking.applicationFeeAmount}
                      </span>
                    </div>
                  )}
                </div>

                <Separator />

                {/* Total */}
                <div className='flex items-center justify-between'>
                  <span className='text-muted-foreground text-sm'>
                    Total Amount
                  </span>
                  <span className='flex items-center gap-1 text-xl font-bold'>
                    <DollarSign className='h-5 w-5' />
                    {booking.paymentTotalAmount}
                  </span>
                </div>

                {/* Status Badge */}
                {booking.paymentStatus === 'succeeded' ? (
                  <div className='mt-4 flex items-center justify-center gap-2 rounded-lg bg-green-50 py-2 text-center text-sm font-medium text-green-700'>
                    <CircleCheckBig className='h-5 w-5 text-green-500' />
                    <span> Payment Completed Successfully</span>
                  </div>
                ) : (
                  <div className='mt-4 flex items-center justify-center gap-2 rounded-lg bg-yellow-50 py-2 text-center text-sm font-medium text-yellow-700'>
                    <ShieldAlert className='h-5 w-5 text-yellow-500' />
                    <span> Payment Pending Confirmation</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Special Requests & Notes */}
            {(booking?.specialRequests ||
              booking?.customerNotes ||
              booking?.venueNotes) && (
              <Card>
                <CardHeader>
                  <CardTitle className='flex items-center gap-2'>
                    <FileText className='h-5 w-5' />
                    Notes & Requests
                  </CardTitle>
                </CardHeader>
                <CardContent className='space-y-4'>
                  {booking?.specialRequests && (
                    <div className='space-y-2'>
                      <p className='text-muted-foreground text-sm font-medium'>
                        Special Requests
                      </p>
                      <p className='bg-muted rounded-md p-3 text-sm'>
                        {booking?.specialRequests}
                      </p>
                    </div>
                  )}
                  {booking.customerNotes && (
                    <div className='space-y-2'>
                      <p className='text-muted-foreground text-sm font-medium'>
                        Customer Notes
                      </p>
                      <p className='bg-muted rounded-md p-3 text-sm'>
                        {booking?.customerNotes}
                      </p>
                    </div>
                  )}
                  {booking?.venueNotes && (
                    <div className='space-y-2'>
                      <p className='text-muted-foreground text-sm font-medium'>
                        Venue Notes
                      </p>
                      <p className='bg-muted rounded-md p-3 text-sm'>
                        {booking?.venueNotes}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Pre-Orders */}
            {booking?.preOrders && booking?.preOrders?.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className='flex items-center gap-2'>
                    <Utensils className='h-5 w-5' />
                    Pre-Orders ({booking?.preOrders?.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className='space-y-4'>
                    {booking?.preOrders?.map((order, index) => (
                      <div key={order?.id} className='rounded-lg border p-4'>
                        <div className='flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between'>
                          <div className='space-y-1'>
                            <p className='font-medium'>{order?.menuItemName}</p>

                            {/* 🆕 Description */}
                            {order?.description && (
                              <p className='text-muted-foreground text-sm'>
                                {order?.description}
                              </p>
                            )}

                            <p className='text-muted-foreground text-sm'>
                              Quantity: {order?.quantity} × ${order?.unitPrice}
                            </p>
                          </div>
                          <div className='flex items-center gap-2'>
                            <Badge variant='outline'>{order?.status}</Badge>
                            <p className='font-semibold'>
                              ${order?.totalPrice}
                            </p>
                          </div>
                        </div>
                        {index < booking?.preOrders?.length - 1 && (
                          <Separator className='mt-4' />
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </PageLayout>
  )
}

export default BookingDetailsPage
