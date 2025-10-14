import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useStateStore } from '../stores/useStateStore'

export function ViewStateModal() {
  const { open, setOpen, currentRow } = useStateStore()

  if (open !== 'view' || !currentRow) return null

  return (
    <Dialog open={open === 'view'} onOpenChange={() => setOpen(null)}>
      <DialogContent className='max-w-lg'>
        <DialogHeader>
          <DialogTitle>State Details</DialogTitle>
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
            <h3 className='text-sm font-medium'>Country Name</h3>
            <p className='text-sm text-gray-600'>{currentRow?.country?.name}</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
