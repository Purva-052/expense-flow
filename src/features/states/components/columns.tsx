/* eslint-disable @typescript-eslint/no-explicit-any */
import { ColumnDef } from '@tanstack/react-table'
import { MoreHorizontal } from 'lucide-react'
// Assuming this is a shared component
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useStateStore } from '../stores/useStateStore'

export const columns: ColumnDef<any>[] = [
  {
    accessorKey: 'name',
    header: 'Name',
  },
  {
    accessorKey: 'code',
    header: 'Code',
  },
  {
    accessorKey: 'country.name',
    header: 'Country Name',
  },

  {
    id: 'actions',
    header: 'Actions',
    cell: function Cell({ row }) {
      const operator = row.original
      const { setOpen, setCurrentRow } = useStateStore()

      const handleEdit = () => {
        setOpen('edit')
        setCurrentRow(operator)
      }

      const handleDelete = () => {
        setOpen('delete')
        setCurrentRow(operator)
      }

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
            <DropdownMenuItem onClick={handleView}>View State</DropdownMenuItem>
            <DropdownMenuItem onClick={handleEdit}>Edit State</DropdownMenuItem>
            <DropdownMenuItem
              className='text-red-600 focus:bg-red-50 focus:text-red-600'
              onClick={handleDelete}
            >
              Delete State
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
    enableSorting: false,
  },
]
