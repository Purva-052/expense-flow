import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useCountryStore } from '../stores/useCountryStore'

export function ViewCountryModal() {
  const { open, setOpen, currentRow } = useCountryStore()

  if (open !== 'view' || !currentRow) return null

  return (
    <Dialog open={open === 'view'} onOpenChange={() => setOpen(null)}>
      <DialogContent className='max-w-lg'>
        <DialogHeader>
          <DialogTitle>Country Details</DialogTitle>
        </DialogHeader>

        <div className='space-y-4'>
          <div>
            <h3 className='text-sm font-medium'>Name</h3>
            <p className='text-sm text-gray-600'>{currentRow.name}</p>
          </div>

          <div>
            <h3 className='text-sm font-medium'>Code</h3>
            <p className='text-sm text-gray-600'>{currentRow.code}</p>
          </div>

          <div>
            <h3 className='text-sm font-medium'>Dial Code</h3>
            <p className='text-sm text-gray-600'>{currentRow.dialCode}</p>
          </div>

          {currentRow.flag && (
            <div>
              <h3 className='mb-2 text-sm font-medium'>Flag</h3>
              <img
                src={currentRow.flag}
                alt='Flag'
                className='h-20 w-32 rounded-md border object-contain'
              />
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
