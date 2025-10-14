/* eslint-disable @typescript-eslint/no-explicit-any */
// import { format } from 'date-fns'
import { format } from 'date-fns'
import { useNavigate } from '@tanstack/react-router'
import { ColumnDef } from '@tanstack/react-table'
import { MoreHorizontal, Eye } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Booking } from '../index'

interface ColumnsProps {
  getStatusColor: (status: Booking['status']) => string
  role: string
}

export const createColumns = ({
  getStatusColor,
  role,
}: ColumnsProps): ColumnDef<Booking>[] => [
  ...(role === 'super_admin'
    ? [
        {
          accessorKey: 'venueName',
          header: 'Venue Name',
        },
      ]
    : []),

  {
    accessorKey: 'customerName',
    header: 'Customer',
    cell: ({ row }) => {
      const booking: any = row.original
      return (
        <div className='space-y-1'>
          <p className='font-medium'>{booking.userName}</p>
          <p className='text-muted-foreground text-sm'>{booking.userEmail}</p>
          <p className='text-muted-foreground text-sm'>{booking.userPhone}</p>
        </div>
      )
    },
  },
  {
    accessorKey: 'date',
    header: 'Date & Time',
    cell: ({ row }) => {
      const booking: any = row.original
      return (
        <div className='space-y-1'>
          <p className='text-sm'>
            {format(new Date(booking.bookingDateTime), 'MMM dd, yyyy')}
          </p>
          <p className='text-muted-foreground text-sm'>
            {format(new Date(booking?.endDateTime), 'MMM dd, yyyy')} (
            {Number(booking?.duration ?? 0).toFixed(2)} min)
          </p>
        </div>
      )
    },
  },
  {
    accessorKey: 'tableName',
    header: 'venue type & section type',
    cell: ({ row }) => {
      const booking: any = row.original
      return (
        <div className='space-y-1'>
          <p className='text-sm font-medium'>{booking.venueTypeName}</p>
          <p className='text-muted-foreground text-sm'>
            {booking.venueSectionTypeName}
          </p>
        </div>
      )
    },
  },
  {
    accessorKey: 'guests',
    header: 'Guests',
    cell: ({ row }) => {
      const booking: any = row.original
      return (
        <div className='text-center'>
          <span className='font-medium'>{booking.numberOfGuests}</span>
        </div>
      )
    },
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const booking = row.original
      return (
        <Badge className={getStatusColor(booking.status)}>
          {booking.status}
        </Badge>
      )
    },
  },
  {
    accessorKey: 'paymentTotalAmount',
    header: 'Amount',
    cell: ({ row }) => {
      const booking: any = row.original
      return (
        <div className='flex flex-col items-start justify-center'>
          <p className='font-medium'>
            {booking.paymentTotalAmount
              ? `$ ${booking.paymentTotalAmount}`
              : '-'}
          </p>
        </div>
      )
    },
  },

  {
    id: 'actions',
    header: 'Actions',
    cell: ({ row }) => {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const navigate = useNavigate()
      const booking = row.original

      const handleView = () => {
        navigate({
          to: '/booking-details',
          search: { bookingId: booking.id }, // sets ?bookingId=25
        })
      }

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant='ghost' className='h-8 w-8 p-0'>
              <span className='sr-only'>Open menu</span>
              <MoreHorizontal className='h-4 w-4' />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align='end'>
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleView}>
              <Eye className='mr-2 h-4 w-4' />
              View Details
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
    enableSorting: false,
  },
]
