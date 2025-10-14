import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useAdminMenuCategoriesStore } from '../stores/useAdminMenuCategoriesStore'

export function ViewMenuCategoryModal() {
  const { open, setOpen, currentRow } = useAdminMenuCategoriesStore()

  if (open !== 'view' || !currentRow) return null

  return (
    <Dialog open={open === 'view'} onOpenChange={() => setOpen(null)}>
      <DialogContent className='max-w-lg'>
        <DialogHeader>
          <DialogTitle>Menu Category Details</DialogTitle>
        </DialogHeader>

        <div className='space-y-4'>
          <div>
            <h3 className='text-sm font-medium'>Name</h3>
            <p className='text-sm text-gray-600'>{currentRow.name}</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
