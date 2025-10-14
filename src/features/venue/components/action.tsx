/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-explicit-any */
// src/features/operators/components/actions.tsx
import { useState } from 'react'
import { DeleteModal } from '@/components/model/delete-model'
import {
  useCreateVenueData,
  useDeleteVenue,
  useUpdateVenueData,
} from '../services'
import { useVenueStore } from '../stores/useVenueStore'
import { VenueForm } from './venue-form'

export function ActionFormModal() {
  const { open, setOpen, currentRow, setCurrentRow } = useVenueStore()
  const [venueId, setVenueId] = useState<number | null>(null)
  const [currentStep, setCurrentStep] = useState<any>(1)

  const onsuccessAddVenue = (data: any) => {
    console.log('🚀 ~ onsuccessAddVenue ~ data:', data)
    setVenueId(data?.id)
    setCurrentStep((s: number) => s + 1)
  }
  const { mutate: createMutate, isPending: isCreateLoading } =
    useCreateVenueData(onsuccessAddVenue)
  const { mutate: updateMutate, isPending: isUpdateLoading } =
    useUpdateVenueData(currentRow?.id || '')
  const { mutate: deleteMutate, isPending: isDeleteLoading } = useDeleteVenue(
    currentRow?.id || ''
  )

  const handleCreate = (values: any) => {
    console.log('🚀 ~ handleCreate ~ values:', values)

    // Construct payload from form values
    const payload = {
      name: values.name,
      description: values.description,
      venueTypeId: values.venueType,
      cityId: values.city,
      stateId: values.state,
      localityId: values.locality,
      countryId: values.country,
      address: values.address,
      phoneNumberCountryId: values.phoneNumberCountryId,
      phoneNumberCountryCode: values.phoneNumberCountryCode,
      phone: values.phone,
      rating: values.rating,
      totalReviews: values.totalReviews,
      priceRange: values.priceRange,
      openingTime: values.openingTime,
      closingTime: values.closingTime,
    }

    createMutate(payload)
  }

  const handleEdit = (values: any) => {
    console.log('🚀 ~ handleEdit ~ values:', values)

    const payload = {
      name: values.name,
      description: values.description,
      venueTypeId: values.venueType,
      cityId: values.city,
      stateId: values.state,
      localityId: values.locality,
      countryId: values.country,
      address: values.address,
      phoneNumberCountryId: values.phoneNumberCountryId,
      phoneNumberCountryCode: values.phoneNumberCountryCode,
      phone: values.phone,
      rating: values.rating,
      totalReviews: values.totalReviews,
      priceRange: values.priceRange,
      openingTime: values.openingTime,
      closingTime: values.closingTime,
    }

    updateMutate(payload)
  }

  const handleDelete = () => {
    deleteMutate()
  }

  const handleModalOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      // If the dialog is closing, reset the state.
      setOpen(null)
      setCurrentStep(1) // Reset step to 1 for the next time it opens
      setTimeout(() => {
        setCurrentRow(null)
      }, 300) // Delay clearing the row to prevent UI flicker
    } else if (open !== 'add' && open !== 'edit') {
      // This handles opening the dialog from a closed state
      setOpen(currentRow ? 'edit' : 'add')
    }
  }
  // --- FIX END ---

  return (
    <>
      <VenueForm
        key='add-venue'
        open={open === 'add'}
        loading={isCreateLoading}
        // Use the new, more robust handler here
        onOpenChange={handleModalOpenChange}
        onSubmit={handleCreate}
        venueId={venueId}
        setVenueId={setVenueId}
        setCurrentStep={setCurrentStep}
        currentStep={currentStep}
        setOpen={setOpen}
      />

      {currentRow && (
        <>
          <VenueForm
            key={`venue-edit-${currentRow.id}`}
            open={open === 'edit'}
            onSubmit={handleEdit}
            loading={isUpdateLoading}
            onOpenChange={handleModalOpenChange}
            setVenueId={setVenueId}
            currentRow={currentRow}
            venueId={venueId}
            setCurrentStep={setCurrentStep}
            currentStep={currentStep}
            setOpen={setOpen}
          />
          <DeleteModal
            onConfirm={handleDelete}
            key={`venue-delete-${currentRow.id}`}
            isOpen={open === 'delete'}
            // The old handler is fine for the delete modal, but for consistency, you could use the new one.
            onClose={() => handleModalOpenChange(false)}
            itemName={currentRow.name}
            loading={isDeleteLoading}
          />
        </>
      )}
    </>
  )
}
