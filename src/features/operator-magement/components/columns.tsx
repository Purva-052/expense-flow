// src/features/operators/components/columns.tsx

'use client'

import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { DataTableColumnHeader } from '@/features/users/components/data-table-column-header'; // Assuming this is a shared component
import { getFormattedDate } from '@/utils/commonFunctions'
import { ColumnDef } from '@tanstack/react-table'
import { MoreHorizontal } from 'lucide-react'
import { useOperatorStore } from '../store'
import { Operator } from '../types'

export const columns: ColumnDef<Operator>[] = [
  // Column 1: Row Selection Checkbox
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && 'indeterminate')
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label='Select all'
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label='Select row'
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'employee_id',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Employee ID' />
    ),
    enableSorting: false,
    enableHiding: false,
    cell: ({ row }) => {
      const employeeId = row.getValue('employee_id')
      return (
        <div className='flex items-center'>
          <span className='mr-2'>{String(employeeId)}</span>
        </div>
      )
    }
  },

  // Column 2: Name (with Sorting)
  {
    accessorKey: 'name',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Name' />
    ),
  },

  {
    accessorKey: 'email',
    header: 'Email',
  },
  {
    accessorKey: 'mobile',
    header: 'Mobile',
  },
  {
    accessorKey: 'user_name',
    header: 'Username',
  },
  {
    accessorKey: 'created_at',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Created At' />
    ),
    cell: ({ row }) => {
      const date = new Date(row.getValue('created_at'))
      const formatted = getFormattedDate(date)
      return <div className='font-medium'>{formatted}</div>
    },
  },
  {
    id: 'actions',
    header: 'Actions',
    cell: function Cell({ row }) {
      const operator = row.original
      const { setOpen, setCurrentRow } = useOperatorStore()

      const handleEdit = () => {
        setOpen('edit')
        setCurrentRow(operator)
      }

      // const handleDelete = () => {
      //   setOpen('delete')
      //   setCurrentRow(operator)
      // }

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
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(operator.user_id)}
            >
              Copy Operator ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleEdit}>
              Edit Operator
            </DropdownMenuItem>
            {/* <DropdownMenuItem
              className='text-red-600 focus:bg-red-50 focus:text-red-600'
              onClick={handleDelete}
            >
              Delete Operator
            </DropdownMenuItem> */}
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
    enableSorting: false,
  },
]