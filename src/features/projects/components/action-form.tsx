/* eslint-disable @typescript-eslint/no-explicit-any */
import { SubmitHandler, useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Form } from '@/components/ui/form'
import CustomButton from '@/components/shared/custom-button'
import { TextInputField } from '@/components/shared/custom-input-field'
import { couponFormSchema, TCouponFormSchema } from '../schema'
import { Checkbox } from '@/components/ui/checkbox'

interface Props {
  currentRow?: any
  open: boolean
  onOpenChange: (open: boolean) => void
  loading?: boolean
  onSubmit: (values: TCouponFormSchema) => void
}

export function CouponActionForm({
  currentRow,
  open,
  onOpenChange,
  onSubmit: onSubmitValues,
  loading,
}: Readonly<Props>) {
  const isEdit = !!currentRow

  const form = useForm<TCouponFormSchema>({
    resolver: zodResolver(couponFormSchema) as any,
    defaultValues: isEdit
      ? {
          code: currentRow?.code ?? '',
          description: currentRow?.description ?? '',
          discountPercentage: currentRow?.discountPercentage ?? 0,
          maxDiscountAmount: currentRow?.maxDiscountAmount ?? 0,
          minOrderAmount: currentRow?.minOrderAmount ?? 0,
          isActive: currentRow?.isActive ?? true,
        }
      : {
          code: '',
          description: '',
          discountPercentage: 0,
          maxDiscountAmount: 0,
          minOrderAmount: 0,
          isActive: true,
        },
  })

  const onSubmit: SubmitHandler<TCouponFormSchema> = (values) => {
    onSubmitValues(values)
  }

  return (
    <Dialog
      open={open}
      modal
      onOpenChange={(state) => {
        form.reset()
        onOpenChange(state)
      }}
    >
      <DialogContent className='sm:max-w-lg'>
        <DialogHeader className='text-left'>
          <DialogTitle>{isEdit ? 'Edit Coupon' : 'Add Coupon'}</DialogTitle>
        </DialogHeader>
        <div className='-mr-4 h-fit w-full overflow-y-auto py-1'>
          <Form {...form}>
            <form
              id='coupon-form'
              onSubmit={form.handleSubmit(onSubmit)}
              className='space-y-4 p-0.5'
            >
              <TextInputField
                control={form.control}
                name='code'
                label='Coupon Code'
                placeholder='Enter coupon code'
              />
              <TextInputField
                control={form.control}
                name='description'
                label='Description'
                placeholder='Enter coupon description'
              />
              <TextInputField
                control={form.control}
                name='discountPercentage'
                label='Discount (%)'
                type='number'
                placeholder='Enter discount'
                valueAsNumber
              />
              <TextInputField
                control={form.control}
                name='maxDiscountAmount'
                label='Max Discount Amount'
                type='number'
                placeholder='Enter max discount'
                valueAsNumber
              />
              <TextInputField
                control={form.control}
                name='minOrderAmount'
                label='Minimum Order Amount'
                type='number'
                placeholder='Enter minimum order'
                valueAsNumber
              />

              {/* ✅ IsActive Checkbox */}
              <Controller
                control={form.control}
                name='isActive'
                render={({ field }) => (
                  <div className='flex items-center space-x-2'>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                    <label className='text-sm font-medium'>Active</label>
                  </div>
                )}
              />
            </form>
          </Form>
        </div>
        <DialogFooter>
          <CustomButton type='submit' loading={loading} form='coupon-form'>
            Save Changes
          </CustomButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
