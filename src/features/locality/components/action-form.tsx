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
import { LocalityFormSchema, TLocalityFormSchema } from '../schema'

interface Props {
  currentRow?: any
  open: boolean
  onOpenChange: (open: boolean) => void
  loading?: boolean
  onSubmit: (values: TLocalityFormSchema) => void
  selectedCountryID: any
  setSelectedCountryID: any
  selectedStateID: any
  setSelectedStateID: any
}

export function LocalityActionForm({
  currentRow,
  open,
  onOpenChange,
  onSubmit: onSubmitValues,
  loading,
  setSelectedCountryID,
  selectedCountryID,
  selectedStateID,
  setSelectedStateID,
}: Readonly<Props>) {
  const isEdit = !!currentRow

  const form = useForm<TLocalityFormSchema>({
    resolver: zodResolver(LocalityFormSchema),
    defaultValues: isEdit
      ? {
          name: currentRow?.name ?? '',
          city: currentRow?.city ? String(currentRow.city.id) : null,
          state: currentRow?.state ? String(currentRow.state.id) : null,
          country: currentRow?.country ? String(currentRow.country.id) : null,
          isEdit,
        }
      : {
          name: '',
          city: null,
          state: null,
          country: null,
          isEdit,
        },
  })

  const { data: countryOptions = [], isLoading: isLoadingCountry }: any =
    useGetDropdownOptions(API.venue.country, { pagination: false })

  const { data: stateOptions = [], isLoading: isLoadingState }: any =
    useGetDropdownOptions(
      API.venue.state,
      { pagination: false, countryId: selectedCountryID },
      !!selectedCountryID // ✅ enabled only when a country is selected
    )

  const watchedCountry = useWatch({
    control: form.control,
    name: 'country',
  })
  const watchedState = useWatch({
    control: form.control,
    name: 'state',
  })
  const handleCountryChange = (val: any) => {
    setSelectedCountryID(val)
    form.setValue('country', val)
    form.setValue('state', null)
  }

  const handleStateChange = (val: any) => {
    setSelectedStateID(val)
    form.setValue('state', val)
    form.setValue('city', null)
  }

  const { data: cityOptions = [], isLoading: isLoadingCity }: any =
    useGetDropdownOptions(
      API.venue.city,
      {
        pagination: false,
        countryId: selectedCountryID,
        stateId: selectedStateID,
      },
      !!selectedCountryID && !!selectedStateID
    )

  const onSubmit: SubmitHandler<TLocalityFormSchema> = (values) => {
    onSubmitValues(values)
  }

  useEffect(() => {
    if (!watchedCountry) {
      // if country is removed/unselected
      form.setValue('state', null)
    }
    if (!watchedState) {
      // if country is removed/unselected
      form.setValue('city', null)
    }
  }, [watchedCountry, watchedState, form])
  useEffect(() => {
    if (currentRow) {
      const { country, state } = currentRow
      setSelectedCountryID(country?.id?.toString() || null)
      setSelectedStateID(state?.id?.toString() || null)
      form.reset({
        ...form.getValues(),
        country: country?.id?.toString() || null,
        state: state?.id?.toString() || null,
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
          <DialogTitle>{isEdit ? 'Edit Locality' : 'Add Locality'}</DialogTitle>
        </DialogHeader>
        <div className='-mr-4 h-fit w-full overflow-y-auto py-1'>
          <Form {...form}>
            <form
              id='locality-form'
              onSubmit={form.handleSubmit(onSubmit)}
              className='space-y-4 p-0.5'
            >
              <TextInputField
                control={form.control}
                name='name'
                label='Locality Name'
                placeholder='Enter locality name'
              />
              <CustomDropDownSearchable
                form={form}
                name='country'
                label='Country'
                options={countryOptions?.data?.map((c: any) => ({
                  value: c.id.toString(),
                  label: c.name,
                }))}
                placeholder='Search country'
                onChangeValue={handleCountryChange}
                isLoading={isLoadingCountry}
              />
              <CustomDropDownSearchable
                form={form}
                name='state'
                label='State'
                options={stateOptions?.data?.map((s: any) => ({
                  value: s.id.toString(),
                  label: s.name,
                }))}
                placeholder='Search state'
                onChangeValue={handleStateChange}
                isLoading={isLoadingState}
                disabled={!watchedCountry}
              />
              <CustomDropDownSearchable
                form={form}
                name='city'
                label='City'
                options={cityOptions?.data?.map((c: any) => ({
                  value: c.id.toString(),
                  label: c.name,
                }))}
                placeholder='Search city'
                isLoading={isLoadingCity}
                disabled={!watchedState}
              />
            </form>
          </Form>
        </div>
        <DialogFooter>
          <CustomButton type='submit' loading={loading} form='locality-form'>
            Save Changes
          </CustomButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
