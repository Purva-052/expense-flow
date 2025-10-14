/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect } from 'react'
import { z } from 'zod'
import { useForm, Controller, FormProvider } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import API from '@/config/api/api'
import { useAuthStore } from '@/stores/use-auth-store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import CustomDropDownSearchable from '@/components/shared/custome-searchable-dropdown'
import TimePicker from '@/components/shared/custome-timepicker'
import { useGetDropdownOptions } from '@/features/venue/services/useDropdown'
import { useUpdateSettingData } from '../services'
import { DaysToggle } from './DaysToggle'

const settingsSchema = z.object({
  slotDurationMinutes: z.number().min(15).optional(),
  maxAdvanceBookingDays: z.number().min(1).optional(),
  customOpeningTime: z.string().optional(),
  customClosingTime: z.string().optional(),
  days: z
    .array(
      z.object({
        day: z.string(),
        active: z.boolean(),
      })
    )
    .optional(),
  stripePublishableKey: z.string().optional(),
  customerDefaultCityId: z.any().optional(),
  defaultVenueTimeslotDuration: z.number().optional(),
  applicationTax: z.number().optional(),
  defaultVenueCommission: z.number().optional(),
})

type SettingsFormValues = z.infer<typeof settingsSchema>

export function SettingsForm({ data }: { data: any }) {
  const { user } = useAuthStore()
  const role = user?.user?.role?.name

  const { data: cityOptions = [], isLoading: isLoadingCity }: any =
    useGetDropdownOptions(
      API.venue.city,
      { pagination: false },
      role === 'super_admin'
    )

  const onSuccessUpdateSettings = (data: any) => {
    reset({
      slotDurationMinutes: data?.slotDurationMinutes,
      maxAdvanceBookingDays: data?.maxAdvanceBookingDays,
      customOpeningTime: data?.customOpeningTime,
      customClosingTime: data?.customClosingTime,
      days: data?.weekAvailability?.map((d: any) => ({
        day: d?.dayOfWeek,
        active: d?.isOpen,
      })),
    })
  }
  const { mutateAsync: updateVenueSettings, isPending } = useUpdateSettingData(
    onSuccessUpdateSettings
  )

  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      slotDurationMinutes: 0,
      maxAdvanceBookingDays: 0,
      customOpeningTime: '',
      customClosingTime: '',
      days: [],
      stripePublishableKey: '',
      customerDefaultCityId: undefined,
      defaultVenueTimeslotDuration: undefined,
      applicationTax: undefined,
    },
  })

  const { register, handleSubmit, control, reset, watch, setValue } = form

  // Reset the form whenever new data arrives
  useEffect(() => {
    if (!data) return
    console.log('Resetting form with data:', data)
    reset({
      slotDurationMinutes: data?.slotDurationMinutes,
      maxAdvanceBookingDays: data?.maxAdvanceBookingDays,
      customOpeningTime: data?.customOpeningTime,
      customClosingTime: data?.customClosingTime,
      days: data?.weekAvailability?.map((d: any) => ({
        day: d?.dayOfWeek,
        active: d?.isOpen,
      })),
      stripePublishableKey: data?.stripePublishableKey ?? '',
      customerDefaultCityId: data?.customerDefaultCityId
        ? String(data?.customerDefaultCityId)
        : null,
      defaultVenueTimeslotDuration: data?.defaultVenueTimeslotDuration ?? 0,
      applicationTax: data?.applicationTax ?? 0,
      defaultVenueCommission: data?.defaultVenueCommission ?? 0,
    })
  }, [data, reset])

  const onSubmit = (values: SettingsFormValues) => {
    const payloadVenue = {
      slotDurationMinutes: values?.slotDurationMinutes,
      maxAdvanceBookingDays: values?.maxAdvanceBookingDays,
      customOpeningTime: values?.customOpeningTime,
      customClosingTime: values?.customClosingTime,
      weekAvailability: values?.days?.map((d) => ({
        dayOfWeek: d?.day,
        isOpen: d?.active,
      })),
    }

    const payloadAdmin = {
      stripePublishableKey: values?.stripePublishableKey,
      customerDefaultCityId: values?.customerDefaultCityId,
      defaultVenueTimeslotDuration: values?.defaultVenueTimeslotDuration,
      applicationTax: values?.applicationTax,
      defaultVenueCommission: values?.defaultVenueCommission,
    }

    const FinalPayload = role === 'super_admin' ? payloadAdmin : payloadVenue

    updateVenueSettings(FinalPayload)
  }

  return (
    <FormProvider {...form}>
      <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
        {role === 'venue_owner' ? (
          <>
            <div className='grid gap-4 md:grid-cols-2'>
              <div className='space-y-2'>
                <Label>Slot Duration (minutes)</Label>
                <Input
                  type='number'
                  {...register('slotDurationMinutes', { valueAsNumber: true })}
                />
              </div>
              <div className='space-y-2'>
                <Label>Max Advance Booking Days</Label>
                <Input
                  type='number'
                  {...register('maxAdvanceBookingDays', {
                    valueAsNumber: true,
                  })}
                />
              </div>
              <div className='space-y-2'>
                <Label>Opening Time</Label>
                <TimePicker
                  value={watch('customOpeningTime')}
                  onChange={(val) => setValue('customOpeningTime', val)}
                  placeholder='Opening Time'
                />
              </div>

              <div className='space-y-2'>
                <Label>Closing Time</Label>
                <TimePicker
                  value={watch('customClosingTime')}
                  onChange={(val) => setValue('customClosingTime', val)}
                  placeholder='Closing Time'
                />
              </div>
            </div>

            <Controller
              control={control}
              name='days'
              render={({ field }: any) => (
                <DaysToggle
                  days={field.value} // always the latest days from form state
                  onToggle={(index, updatedDay) => {
                    const newDays = [...field.value]
                    newDays[index] = updatedDay
                    field.onChange(newDays) // update form state
                  }}
                />
              )}
            />
          </>
        ) : (
          <div className='grid gap-4 md:grid-cols-2'>
            <div className='space-y-2'>
              <Label>Stripe Publishable Key</Label>
              <Input type='text' {...register('stripePublishableKey')} />
            </div>
            <div className='space-y-2'>
              <CustomDropDownSearchable
                form={form}
                name='customerDefaultCityId'
                label='Default City'
                options={cityOptions?.data?.map((c: any) => ({
                  value: c.id.toString(),
                  label: c.name,
                }))}
                placeholder='Search city'
                isLoading={isLoadingCity}
              />
            </div>
            <div className='space-y-2'>
              <Label>Venue Timeslot Duration</Label>
              <Input
                type='number'
                {...register('defaultVenueTimeslotDuration', {
                  valueAsNumber: true,
                })}
              />
            </div>
            <div className='space-y-2'>
              <Label>Application Tax (%)</Label>
              <Input
                type='number'
                {...register('applicationTax', { valueAsNumber: true })}
              />
            </div>
            <div className='space-y-2'>
              <Label>Venue Commission</Label>
              <Input
                type='number'
                {...register('defaultVenueCommission', { valueAsNumber: true })}
              />
            </div>
          </div>
        )}

        <div className='text-right'>
          <Button type='submit' disabled={isPending}>
            {isPending ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </FormProvider>
  )
}
