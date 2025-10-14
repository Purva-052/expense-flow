/* eslint-disable @typescript-eslint/no-explicit-any */
import { Link } from '@tanstack/react-router'
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
import { useVenueStore } from '../stores/useVenueStore'

export const columns: ColumnDef<any>[] = [
  {
    accessorKey: 'name',
    header: 'Name',
  },
  {
    accessorKey: 'country.name',
    header: 'Country',
  },
  {
    accessorKey: 'state.name',
    header: 'State',
  },
  {
    accessorKey: 'city.name',
    header: 'City',
  },
  {
    accessorKey: 'locality.name',
    header: 'Locality',
  },
  {
    accessorKey: 'venueType.name',
    header: 'Venue Type',
  },
  {
    id: 'actions',
    header: 'Actions',
    cell: function Cell({ row }) {
      const operator = row.original
      const { setOpen, setCurrentRow } = useVenueStore()

      const handleEdit = () => {
        setOpen('edit')
        setCurrentRow(operator)
      }

      const handleDelete = () => {
        setOpen('delete')
        setCurrentRow(operator)
      }

      const handleView = () => {
        // setOpen('view')
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
            <Link to='/venue-view' search={{ venueId: operator.id }}>
              <DropdownMenuItem onClick={handleView}>
                View Venue
              </DropdownMenuItem>
            </Link>
            <DropdownMenuItem onClick={handleEdit}>Edit Venue</DropdownMenuItem>
            <DropdownMenuItem
              className='text-red-600 focus:bg-red-50 focus:text-red-600'
              onClick={handleDelete}
            >
              Delete Venue
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
    enableSorting: false,
  },
]
