/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect } from 'react'
import { SubmitHandler, useForm, useWatch } from 'react-hook-form'
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
import { CityFormSchema, TCityFormSchema } from '../schema'

interface Props {
  currentRow?: any
  open: boolean
  onOpenChange: (open: boolean) => void
  loading?: boolean
  onSubmit: (values: TCityFormSchema) => void
  selectedCountryID: any
  setSelectedCountryID: any
}

export function CityActionForm({
  currentRow,
  open,
  onOpenChange,
  onSubmit: onSubmitValues,
  loading,
  selectedCountryID,
  setSelectedCountryID,
}: Readonly<Props>) {
  const isEdit = !!currentRow

  const form = useForm<TCityFormSchema>({
    resolver: zodResolver(CityFormSchema),
    defaultValues: isEdit
      ? {
          name: currentRow?.name ?? '',
          state: currentRow?.state ? String(currentRow.state.id) : null,
          country: currentRow?.country ? String(currentRow.country.id) : null,
          isEdit,
        }
      : {
          name: '',
          state: null,
          country: null,
          isEdit,
        },
  })

  const watchedCountry = useWatch({
    control: form.control,
    name: 'country',
  })

  const handleCountryChange = (val: any) => {
    setSelectedCountryID(val)
    form.setValue('country', val)
    form.setValue('state', null)
  }

  const { data: countryOptions = [], isLoading: isLoadingCountry }: any =
    useGetDropdownOptions(API.venue.country, { pagination: false })
  const { data: stateOptions = [], isLoading: isLoadingState }: any =
    useGetDropdownOptions(
      API.venue.state,
      { pagination: false, countryId: selectedCountryID },
      !!selectedCountryID // ✅ enabled only when a country is selected
    )

  const onSubmit: SubmitHandler<TCityFormSchema> = (values) => {
    onSubmitValues(values)
  }

  useEffect(() => {
    if (!watchedCountry) {
      // if country is removed/unselected
      form.setValue('state', null)
    }
  }, [watchedCountry])

  useEffect(() => {
    if (currentRow) {
      const { country } = currentRow
      setSelectedCountryID(country?.id?.toString() || null)
      form.reset({
        ...form.getValues(),
        country: country?.id?.toString() || null,
      })
    }
  }, [currentRow])

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
          <DialogTitle>{isEdit ? 'Edit City' : 'Add City'}</DialogTitle>
        </DialogHeader>
        <div className='-mr-4 h-fit w-full overflow-y-auto py-1'>
          <Form {...form}>
            <form
              id='city-form'
              onSubmit={form.handleSubmit(onSubmit)}
              className='space-y-4 p-0.5'
            >
              <TextInputField
                control={form.control}
                name='name'
                label='City Name'
                placeholder='Enter city name'
              />
              <CustomDropDownSearchable
                form={form}
                name='country'
                label='Country'
                options={countryOptions?.data?.map((c: any) => ({
                  value: c.id.toString(),
                  label: c.name,
                }))}
                onChangeValue={handleCountryChange}
                placeholder='Search country'
                isLoading={isLoadingCountry}
              />
              <CustomDropDownSearchable
                form={form}
                name='state'
                label='State'
                disabled={!watchedCountry} // use watchedCountry instead of selectedCountryID
                options={stateOptions?.data?.map((s: any) => ({
                  value: s.id.toString(),
                  label: s.name,
                }))}
                placeholder='Search state'
                isLoading={isLoadingState}
              />
            </form>
          </Form>
        </div>
        <DialogFooter>
          <CustomButton type='submit' loading={loading} form='city-form'>
            Save Changes
          </CustomButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
