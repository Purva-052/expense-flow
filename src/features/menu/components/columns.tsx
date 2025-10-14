/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { ColumnDef } from '@tanstack/react-table'
import { MoreHorizontal } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Switch } from '@/components/ui/switch'
import { useAvailableMenuData } from '../services'
import { useMenuStore } from '../stores/useMenuStore'

// ✅ Separate component for Switch cell
function AvailabilitySwitch({ row }: { row: any }) {
  const {
    mutateAsync: changeAvailability,
    isPending: isChangeAvailableLoading,
  } = useAvailableMenuData(row.original.id)

  const handleToggle = async (checked: boolean) => {
    try {
      await changeAvailability({ id: row.original.id })
      console.log(`Item ${row.original.name} availability updated:`, checked)
    } catch (error) {
      console.error('Error updating availability:', error)
    }
  }

  return (
    <Switch
      checked={!!row.original.isAvailable}
      onCheckedChange={handleToggle}
      disabled={isChangeAvailableLoading}
    />
  )
}

export const columns: ColumnDef<any>[] = [
  {
    accessorKey: 'name',
    header: 'Item Name',
  },
  {
    accessorKey: 'category.name',
    header: 'Menu Category',
  },
  {
    accessorKey: 'price',
    header: 'Price',
    cell: ({ row }) => {
      const value = row.original.price
      return <span>${Number(value).toFixed(2)}</span>
    },
  },
  {
    accessorKey: 'isVegetarian',
    header: 'Vegetarian',
    cell: ({ row }) => <span>{row.original.isVegetarian ? 'Yes' : 'No'}</span>,
  },
  {
    accessorKey: 'available',
    header: 'Available',
    cell: ({ row }) => <AvailabilitySwitch row={row} />, // ✅ use separate component
  },
  {
    id: 'actions',
    header: 'Actions',
    cell: function Cell({ row }) {
      const operator = row.original
      const { setOpen, setCurrentRow } = useMenuStore()

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
            <DropdownMenuItem onClick={handleView}>View Menu</DropdownMenuItem>
            <DropdownMenuItem onClick={handleEdit}>Edit Menu</DropdownMenuItem>
            <DropdownMenuItem
              className='text-red-600 focus:bg-red-50 focus:text-red-600'
              onClick={handleDelete}
            >
              Delete Menu
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
    enableSorting: false,
  },
]
