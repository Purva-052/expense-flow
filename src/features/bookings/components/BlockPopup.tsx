/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { format } from 'date-fns'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useBlockBooking } from '../services'

const BlockPopup = ({
  setBlockDialogOpen,
  blockDialogOpen,
  selectedDateToBlock,
  setSelectedDateToBlock,
  isLoading,
  blockedDates,
  setBlockedDates,
}: any) => {
  const successBlockedDate = () => {
    if (selectedDateToBlock) {
      setBlockedDates([...blockedDates, selectedDateToBlock])
    }

    reset()
    setSelectedDateToBlock(null)
    setBlockDialogOpen(false)
  }

  const { mutateAsync: blockBooking } = useBlockBooking(successBlockedDate)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<any>({
    defaultValues: {
      reason: '',
      description: '',
    },
  })

  const onSubmit = (data: any) => {
    if (!selectedDateToBlock) return

    const payload = {
      blockType: 'holiday',
      specificDate: format(selectedDateToBlock, 'yyyy-MM-dd'),
      reason: data.reason,
      description: data.description,
      startTime: '00:00',
      endTime: '23:59',
    }

    blockBooking(payload)
  }

  return (
    <Dialog open={blockDialogOpen} onOpenChange={setBlockDialogOpen}>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle>Block Bookings</DialogTitle>
          <DialogDescription>
            Block all bookings for{' '}
            <span className='font-medium'>
              {selectedDateToBlock
                ? format(selectedDateToBlock, 'MMM dd, yyyy')
                : ''}
            </span>
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className='mt-4 space-y-4'>
          <div className='space-y-1'>
            <Label htmlFor='reason'>Reason</Label>
            <Input
              id='reason'
              placeholder='e.g., Maintenance, Private Event'
              {...register('reason', { required: 'Reason is required' })}
            />
            {errors.reason && (
              <p className='text-sm text-red-500'>
                {String(errors.reason.message)}
              </p>
            )}
          </div>

          <div className='space-y-1'>
            <Label htmlFor='description'>Description</Label>
            <Textarea
              id='description'
              placeholder='Additional details (optional)'
              {...register('description')}
            />
          </div>

          <DialogFooter className='mt-4 gap-2'>
            <Button
              variant='outline'
              type='button'
              onClick={() => {
                setBlockDialogOpen(false)
                setSelectedDateToBlock(null)
                reset()
              }}
            >
              Cancel
            </Button>
            <Button type='submit' disabled={isLoading}>
              {isLoading ? 'Blocking...' : 'Confirm Block'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default BlockPopup
