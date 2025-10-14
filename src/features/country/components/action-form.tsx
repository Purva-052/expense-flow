/* eslint-disable @typescript-eslint/no-explicit-any */
// src/features/countries/components/action-form.tsx
import { SubmitHandler, useForm } from 'react-hook-form'
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
import { countryFormSchema, TCountryFormSchema } from '../schema'

interface Props {
  currentRow?: any
  open: boolean
  onOpenChange: (open: boolean) => void
  loading?: boolean
  onSubmit: (values: TCountryFormSchema) => void
}

export function CountryActionForm({
  currentRow,
  open,
  onOpenChange,
  onSubmit: onSubmitValues,
  loading,
}: Readonly<Props>) {
  const isEdit = !!currentRow

  const form = useForm<TCountryFormSchema>({
    resolver: zodResolver(countryFormSchema),
    defaultValues: isEdit
      ? {
          name: currentRow?.name ?? '',
          code: currentRow?.code ?? '',
          dialCode: currentRow?.dialCode ?? '',
          flag: currentRow?.flag ?? '',
          isEdit,
        }
      : {
          name: '',
          code: '',
          dialCode: '',
          flag: '',
          isEdit,
        },
  })

  const onSubmit: SubmitHandler<TCountryFormSchema> = (values) => {
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
          <DialogTitle>{isEdit ? 'Edit Country' : 'Add Country'}</DialogTitle>
        </DialogHeader>
        <div className='-mr-4 h-fit w-full overflow-y-auto py-1'>
          <Form {...form}>
            <form
              id='country-form'
              onSubmit={form.handleSubmit(onSubmit)}
              className='space-y-4 p-0.5'
            >
              <TextInputField
                control={form.control}
                name='name'
                label='Country Name'
                placeholder='Enter country name'
              />
              <TextInputField
                control={form.control}
                name='code'
                label='Country Code'
                placeholder='Enter country code (e.g., IN, US)'
              />
              <TextInputField
                control={form.control}
                name='dialCode'
                label='Dial Code'
                placeholder='Enter dial code (e.g., +91)'
              />
              <TextInputField
                control={form.control}
                name='flag'
                label='Flag URL'
                placeholder='Enter flag image URL'
              />
            </form>
          </Form>
        </div>
        <DialogFooter>
          <CustomButton type='submit' loading={loading} form='country-form'>
            Save Changes
          </CustomButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
