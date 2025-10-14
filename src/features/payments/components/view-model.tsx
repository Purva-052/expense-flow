import {  CreditCard } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import { usePaymentsStore } from '../stores/usePaymentsStore'

export function ViewPaymentModal() {
  const { open, setOpen, currentRow } = usePaymentsStore()

  if (open !== 'view' || !currentRow) return null

  const statusColor =
    currentRow.status === 'successed'
      ? 'bg-green-100 text-green-800 border border-green-200'
      : 'bg-yellow-100 text-yellow-800 border border-yellow-200'

  return (
    <Dialog open={open === 'view'} onOpenChange={() => setOpen(null)}>
      <DialogContent className='max-w-md'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            <CreditCard className='h-5 w-5' />
            Payment Details
          </DialogTitle>
        </DialogHeader>

        <div className='space-y-4'>
          {/* Customer Info */}
          <div>
            <h3 className='text-sm font-medium'>Customer Name</h3>
            <p className='text-sm text-gray-600'>{currentRow.userName}</p>
          </div>
          <div>
            <h3 className='text-sm font-medium'>Email</h3>
            <p className='text-sm text-gray-600'>{currentRow.userEmail}</p>
          </div>

          {/* Payment Info */}
          <div>
            <h3 className='text-sm font-medium'>Payment Gateway</h3>
            <p className='text-sm text-gray-600'>
              {currentRow.paymentGateway || '-'}
            </p>
          </div>
          <div>
            <h3 className='text-sm font-medium'>Payment Method</h3>
            <p className='text-sm text-gray-600'>
              {currentRow.paymentMethod || '-'}
            </p>
          </div>
          <div>
            <h3 className='text-sm font-medium'>Payment Status</h3>
            <Badge className={`${statusColor} px-3 py-1 font-medium`}>
              {currentRow.status.charAt(0).toUpperCase() +
                currentRow.status.slice(1)}
            </Badge>
          </div>

          {/* Amounts */}
          <Separator />
          <div className='flex justify-between'>
            <span className='text-sm text-gray-500'>Amount</span>
            <span className='font-medium'>
              ${Number(currentRow.subTotal).toFixed(2)}
            </span>
          </div>
          <div className='flex justify-between'>
            <span className='text-sm text-gray-500'>
              Tax ({currentRow.applicationTaxPercentage}%)
            </span>
            <span className='font-medium'>
              ${Number(currentRow.applicationTaxValue).toFixed(2)}
            </span>
          </div>
          <Separator />
          <div className='flex justify-between'>
            <span className='text-sm font-medium'>Total Amount</span>
            <span className='text-lg font-bold'>
              ${Number(currentRow.totalAmount).toFixed(2)}
            </span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
