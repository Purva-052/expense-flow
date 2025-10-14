/* eslint-disable @typescript-eslint/no-explicit-any */
import { ColumnDef } from '@tanstack/react-table'
import { MoreHorizontal } from 'lucide-react'
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
import { usePaymentsStore } from '../stores/usePaymentsStore'

export const columns: ColumnDef<any>[] = [
  {
    accessorKey: 'userName',
    header: ' Name',
  },
  {
    accessorKey: 'userEmail',
    header: 'Email',
  },
  {
    accessorKey: 'paymentGateway',
    header: 'Payment Gateway',
  },
  {
    accessorKey: 'paymentMethod',
    header: 'Payment Method',
  },
  {
    accessorKey: 'subTotal',
    header: 'Amount',
    cell: ({ row }) => {
      const value = row.original.subTotal
      return <span>${Number(value).toFixed(2)}</span>
    },
  },
  {
    accessorKey: 'applicationTaxPercentage',
    header: 'Tax Percentage',
    cell: ({ row }) => {
      const value = row.original.applicationTaxPercentage
      return <span className='text-center'>{value}%</span>
    },
  },
  {
    accessorKey: 'applicationTaxValue',
    header: 'Tax Amount',
    cell: ({ row }) => {
      const value = row.original.applicationTaxValue
      return <span>${Number(value).toFixed(2)}</span>
    },
  },
  {
    accessorKey: 'totalAmount',
    header: 'Total Amount',
    cell: ({ row }) => {
      const value = row.original.totalAmount
      return <span>${Number(value).toFixed(2)}</span>
    },
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const value = row.original.status

      return (
        <Badge
          variant={value === 'pending' ? 'destructive' : 'success'}
          className='text-sm font-medium'
        >
          {value === 'pending' ? 'Pending' : 'Success'}
        </Badge>
      )
    },
  },
  {
    id: 'actions',
    header: 'Actions',
    cell: function Cell({ row }) {
      const operator = row.original
      const { setOpen, setCurrentRow } = usePaymentsStore()

      const handleView = () => {
        setOpen('view')
        setCurrentRow(operator)
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
              View Payment Details
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
    enableSorting: false,
  },
]
