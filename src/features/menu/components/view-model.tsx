import { DollarSign, Clock, Zap, ChefHat, Leaf, Ban } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useMenuStore } from '../stores/useMenuStore'

export function ViewMenuItemModal() {
  const { open, setOpen, currentRow } = useMenuStore()

  if (open !== 'view' || !currentRow) return null

  return (
    <Dialog open={open === 'view'} onOpenChange={() => setOpen(null)}>
      <DialogContent className='max-w-lg'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            <ChefHat className='h-5 w-5' />
            Menu Item Details
          </DialogTitle>
        </DialogHeader>

        <div className='space-y-6'>
          {/* Name */}
          <div>
            <h3 className='text-sm font-medium'>Item Name</h3>
            <p className='text-sm text-gray-600'>{currentRow.name}</p>
          </div>

          {/* Description */}
          <div>
            <h3 className='text-sm font-medium'>Description</h3>
            <p className='text-sm text-gray-600'>{currentRow.description}</p>
          </div>

          {/* Category */}
          <div>
            <h3 className='text-sm font-medium'>Menu Category</h3>
            <p className='text-sm text-gray-600'>
              {currentRow?.category?.name ?? '-'}
            </p>
          </div>

          {/* Price */}
          <div className='flex items-center gap-2'>
            <DollarSign className='h-4 w-4 text-gray-500' />
            <h3 className='text-sm font-medium'>Price</h3>
            <p className='text-sm text-gray-600'>
              ${Number(currentRow.price).toFixed(2)}
            </p>
          </div>

          {/* Preparation Time */}
          <div className='flex items-center gap-2'>
            <Clock className='h-4 w-4 text-gray-500' />
            <h3 className='text-sm font-medium'>Preparation Time</h3>
            <p className='text-sm text-gray-600'>
              {currentRow.preparationTime} minutes
            </p>
          </div>

          {/* Calories */}
          {currentRow.calories !== undefined && (
            <div className='flex items-center gap-2'>
              <Zap className='h-4 w-4 text-gray-500' />
              <h3 className='text-sm font-medium'>Calories</h3>
              <p className='text-sm text-gray-600'>{currentRow.calories}</p>
            </div>
          )}

          {/* Availability */}
          <div>
            <h3 className='mb-2 text-sm font-medium'>Availability</h3>
            {currentRow.isAvailable ? (
              <Badge variant='outline' className='bg-green-50 text-green-600'>
                Available
              </Badge>
            ) : (
              <Badge variant='outline' className='bg-red-50 text-red-600'>
                Not Available
              </Badge>
            )}
          </div>

          {/* Vegetarian */}
          <div>
            <h3 className='mb-2 text-sm font-medium'>Vegetarian</h3>
            {currentRow.isVegetarian ? (
              <Badge
                variant='outline'
                className='flex items-center gap-1 border-green-600 text-green-600'
              >
                <Leaf className='h-3 w-3' /> Veg
              </Badge>
            ) : (
              <Badge
                variant='outline'
                className='flex items-center gap-1 border-red-600 text-red-600'
              >
                <Ban className='h-3 w-3' /> Non-Veg
              </Badge>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
