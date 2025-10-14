import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useLocalityStore } from '../stores/useLocalityStore'

export function ViewLocalityModal() {
  const { open, setOpen, currentRow } = useLocalityStore()

  if (open !== 'view' || !currentRow) return null

  return (
    <Dialog open={open === 'view'} onOpenChange={() => setOpen(null)}>
      <DialogContent className='max-w-lg'>
        <DialogHeader>
          <DialogTitle>Locality Details</DialogTitle>
        </DialogHeader>

        <div className='space-y-4'>
          <div>
            <h3 className='text-sm font-medium'>Name</h3>
            <p className='text-sm text-gray-600'>{currentRow.name}</p>
          </div>

          <div>
            <h3 className='text-sm font-medium'>City</h3>
            <p className='text-sm text-gray-600'>{currentRow?.city?.name}</p>
          </div>

          <div>
            <h3 className='text-sm font-medium'>State</h3>
            <p className='text-sm text-gray-600'>{currentRow?.state?.name}</p>
          </div>

          <div>
            <h3 className='text-sm font-medium'>Country</h3>
            <p className='text-sm text-gray-600'>{currentRow?.country?.name}</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
