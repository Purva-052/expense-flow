import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useCustomerStore } from '../stores/useCustomerStore'

export function CustomerDetails() {
  const { open, setOpen, currentRow } = useCustomerStore()

  if (open !== 'view customer' || !currentRow) return null

  return (
    <Dialog open={open === 'view customer'} onOpenChange={() => setOpen(null)}>
      <DialogContent className='max-w-lg'>
        <DialogHeader>
          <DialogTitle>Customer Details</DialogTitle>
        </DialogHeader>

        <div className='space-y-4'>
          <div>
            <h3 className='text-sm font-medium'>Name</h3>
            <p className='text-sm text-gray-600'>{currentRow.name}</p>
          </div>

          <div>
            <h3 className='text-sm font-medium'>Country Code</h3>
            <p className='text-sm text-gray-600'>
              {currentRow.phoneNumberCountryCode}
            </p>
          </div>

          <div>
            <h3 className='text-sm font-medium'>Phone Number </h3>
            <p className='text-sm text-gray-600'>{currentRow.phone}</p>
          </div>
          <div>
            <h3 className='mb-2 text-sm font-medium'>Email</h3>
            <p className='text-sm text-gray-600'>{currentRow.email}</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
