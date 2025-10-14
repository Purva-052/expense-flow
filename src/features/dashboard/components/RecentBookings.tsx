/* eslint-disable @typescript-eslint/no-explicit-any */
import { formatDistanceToNow } from 'date-fns'
import { useNavigate } from '@tanstack/react-router'
import { Calendar, CreditCard, MapPin, User } from 'lucide-react'
import { useAuthStore } from '@/stores/use-auth-store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const RecentBookings = ({ bookings, DashboardDataLoading }: any) => {
  const { user } = useAuthStore()
  const venue = user?.user?.venue?.name
  const venueLocation = user?.user?.venue?.location
  const navigate = useNavigate()

  const accentColors = [
    'bg-blue-100 text-blue-700',
    'bg-green-100 text-green-700',
    'bg-purple-100 text-purple-700',
    'bg-orange-100 text-orange-700',
    'bg-pink-100 text-pink-700',
  ]

  return (
    <Card className='transition-shadow hover:shadow-md'>
      <CardHeader className='flex items-center justify-between'>
        <CardTitle className='text-lg font-semibold text-gray-800'>
          Recent Bookings
        </CardTitle>
        {!DashboardDataLoading && bookings.length > 0 && (
          <span className='rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700'>
            {bookings.length} new
          </span>
        )}
      </CardHeader>

      <CardContent>
        {DashboardDataLoading ? (
          <div className='py-10 text-center text-sm text-gray-500'>
            Loading...
          </div>
        ) : bookings.length > 0 ? (
          <div className='max-h-[320px] space-y-4 overflow-y-auto pr-2'>
            {bookings.map((booking: any, index: number) => {
              const timeAgo = formatDistanceToNow(new Date(booking.createdAt), {
                addSuffix: true,
              })
              const accent = accentColors[index % accentColors.length]
              return (
                <div
                  key={booking.id}
                  className='group relative cursor-pointer overflow-hidden rounded-xl border bg-white p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md'
                  onClick={() =>
                    navigate({
                      to: '/booking-details',
                      search: { bookingId: booking?.bookingId },
                    })
                  }
                >
                  <div className='absolute top-2 right-2 text-xs font-medium text-gray-400'>
                    {timeAgo}
                  </div>

                  <div className='flex items-start space-x-3'>
                    <div
                      className={`mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${accent}`}
                    >
                      <User className='h-4 w-4' />
                    </div>
                    <div className='flex-1'>
                      <h4 className='font-medium text-gray-900 group-hover:text-blue-700'>
                        {booking.user?.name}
                      </h4>
                      <p className='text-xs text-gray-500'>{booking.user?.email}</p>

                      <div className='mt-2 space-y-1 text-sm'>
                        <div className='flex items-center text-gray-700'>
                          <MapPin className='mr-1.5 h-4 w-4 text-gray-400' />
                          {booking.venue?.name ?? venue}
                        </div>
                        <div className='ml-5 text-xs text-gray-500'>
                          {booking.venue?.location ?? venueLocation}
                        </div>

                        {booking.totalAmount && (
                          <div className='mt-1 flex items-center font-semibold text-green-700'>
                            <CreditCard className='mr-1.5 h-4 w-4 text-green-500' />
                            ₹{Number(booking.totalAmount).toLocaleString('en-IN')}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className='py-10 text-center text-sm text-gray-500'>
            <Calendar className='mx-auto mb-3 h-6 w-6 text-gray-400' />
            No recent bookings found
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default RecentBookings
