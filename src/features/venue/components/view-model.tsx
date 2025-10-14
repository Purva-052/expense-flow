import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useVenueStore } from '../stores/useVenueStore'

export function ViewVenueModal() {
  const { open, setOpen, currentRow } = useVenueStore()

  if (open !== 'view' || !currentRow) return null

  return (
    <Dialog open={open === 'view'} onOpenChange={() => setOpen(null)}>
      <DialogContent className='max-w-lg'>
        <DialogHeader>
          <DialogTitle>Venue Details</DialogTitle>
        </DialogHeader>

        <div className='space-y-4'>
          <div>
            <h3 className='text-sm font-medium'>Name</h3>
            <p className='text-sm text-gray-600'>{currentRow.name}</p>
          </div>

          {currentRow.description && (
            <div>
              <h3 className='text-sm font-medium'>Description</h3>
              <p className='text-sm text-gray-600'>{currentRow.description}</p>
            </div>
          )}

          <div>
            <h3 className='text-sm font-medium'>Country</h3>
            <p className='text-sm text-gray-600'>{currentRow.country?.name}</p>
          </div>

          <div>
            <h3 className='text-sm font-medium'>State</h3>
            <p className='text-sm text-gray-600'>{currentRow.state?.name}</p>
          </div>

          <div>
            <h3 className='text-sm font-medium'>City</h3>
            <p className='text-sm text-gray-600'>{currentRow.city?.name}</p>
          </div>

          <div>
            <h3 className='text-sm font-medium'>Locality</h3>
            <p className='text-sm text-gray-600'>{currentRow.locality?.name}</p>
          </div>

          <div>
            <h3 className='text-sm font-medium'>Venue Type</h3>
            <p className='text-sm text-gray-600'>
              {currentRow.venueType?.name}
            </p>
          </div>

          {currentRow.image && (
            <div>
              <h3 className='text-sm font-medium'>Image</h3>
              <img
                src={currentRow.image}
                alt='Venue'
                className='h-40 w-full rounded-md border object-cover'
              />
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
