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
import { useAdminMenuCategoriesStore } from '../stores/useAdminMenuCategoriesStore'

export const columns: ColumnDef<any>[] = [
  {
    accessorKey: 'name',
    header: 'Name',
  },
  {
    id: 'actions',
    header: 'Actions',
    cell: function Cell({ row }) {
      const operator = row.original
      const { setOpen, setCurrentRow } = useAdminMenuCategoriesStore()

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
            <DropdownMenuItem onClick={handleView}>
              View Menu Category
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleEdit}>
              Edit Menu Category
            </DropdownMenuItem>
            <DropdownMenuItem
              className='text-red-600 focus:bg-red-50 focus:text-red-600'
              onClick={handleDelete}
            >
              Delete Menu Category
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
    enableSorting: false,
  },
]
