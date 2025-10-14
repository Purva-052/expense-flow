/* eslint-disable @typescript-eslint/no-explicit-any */
import { SubmitHandler, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import API from '@/config/api/api'
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
import CustomDropDownSearchable from '@/components/shared/custome-searchable-dropdown'
import { useGetDropdownOptions } from '@/features/venue/services/useDropdown'
import { StateFormSchema, TStateFormSchema } from '../schema'

interface Props {
  currentRow?: any
  open: boolean
  onOpenChange: (open: boolean) => void
  loading?: boolean
  onSubmit: (values: TStateFormSchema) => void
}

export function StateActionForm({
  currentRow,
  open,
  onOpenChange,
  onSubmit: onSubmitValues,
  loading,
}: Readonly<Props>) {
  const isEdit = !!currentRow

  const form = useForm<TStateFormSchema>({
    resolver: zodResolver(StateFormSchema),
    defaultValues: isEdit
      ? {
          name: currentRow?.name ?? '',
          code: currentRow?.code ?? '',
          country: currentRow?.country ? String(currentRow.country.id) : null,
          isEdit,
        }
      : {
          name: '',
          code: '',
          country: null,
          isEdit,
        },
  })

  const { data: countryOptions = [], isLoading: isLoadingCountry }: any =
    useGetDropdownOptions(API.venue.country, { pagination: false })

  const onSubmit: SubmitHandler<TStateFormSchema> = (values) => {
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
          <DialogTitle>{isEdit ? 'Edit State' : 'Add State'}</DialogTitle>
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
                label='Name'
                placeholder='Enter name'
              />
              <TextInputField
                control={form.control}
                name='code'
                label='Code'
                placeholder='Enter code (e.g., GJ)'
              />
              <CustomDropDownSearchable
                form={form}
                name='country'
                label='Country'
                options={countryOptions?.data?.map((c: any) => ({
                  value: c.id.toString(), // still using string, we can switch to number later
                  label: c.name,
                }))}
                placeholder='Search country'
                isLoading={isLoadingCountry}
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
