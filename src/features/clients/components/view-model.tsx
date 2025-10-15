import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useClientsStore } from '../stores/useClientsStore'

export function ViewClientsModal() {
  const { open, setOpen, currentRow } = useClientsStore()
  if (open !== 'view' || !currentRow) return null

  return (
    <Dialog open={open === 'view'} onOpenChange={() => setOpen(null)}>
      <DialogContent className='max-w-lg'>
        <DialogHeader>
          <DialogTitle>Company Details</DialogTitle>
        </DialogHeader>
        <div className='space-y-4'>
          <div>
            <h3 className='text-sm font-medium'>Name</h3>
            <p className='text-sm text-gray-600'>{currentRow.name}</p>
          </div>
          <div>
            <h3 className='text-sm font-medium'>Company</h3>
            <p className='text-sm text-gray-600'>{currentRow.company}</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
