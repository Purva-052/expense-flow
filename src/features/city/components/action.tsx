/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-console */
import { DeleteModal } from '@/components/model/delete-model'
import { TCityFormSchema } from '../schema'
import {
  useCreateCityData,
  useDeleteCityData,
  useUpdateCityData,
} from '../services'
import { useCityStore } from '../stores/useCityStore'
import { CityActionForm } from './action-form'
import { useState } from 'react'

export function ActionFormModal() {
  const [selectedCountryID, setSelectedCountryID] = useState(null)
  const { open, setOpen, currentRow, setCurrentRow } = useCityStore()
  const { mutateAsync: createMutate, isPending: isCreateLoading } =
    useCreateCityData()
  const { mutateAsync: updateMutate, isPending: isUpdateLoading } =
    useUpdateCityData(currentRow?.id || '')
  const { mutateAsync: deleteMutate, isPending: isDeleteLoading } =
    useDeleteCityData(currentRow?.id || '')

  const handleCreate = (values: TCityFormSchema) => {
    const payload: any = {
      name: values.name,
      stateId: values.state,
      countryId: values.country,
    }
    createMutate(payload)
  }

  const handleEdit = (values: TCityFormSchema) => {
    const payload: any = {
      name: values.name,
      stateId: values.state,
      countryId: values.country,
    }
    updateMutate(payload)
  }

  const handleDelete = () => {
    deleteMutate()
  }

  const handleCloseDialog = () => {
    setOpen(null)
    setTimeout(() => {
      setCurrentRow(null)
    }, 300)
  }

  return (
    <>
      <CityActionForm
        key='add-city'
        open={open === 'add'}
        loading={isCreateLoading}
        onOpenChange={(value) => setOpen(value ? 'add' : null)}
        onSubmit={handleCreate}
        selectedCountryID={selectedCountryID}
        setSelectedCountryID={setSelectedCountryID}
      />

      {currentRow && (
        <>
          <CityActionForm
            key={`city-edit-${currentRow.id}`}
            open={open === 'edit'}
            onSubmit={handleEdit}
            loading={isUpdateLoading}
            onOpenChange={handleCloseDialog}
            currentRow={currentRow}
            selectedCountryID={selectedCountryID}
            setSelectedCountryID={setSelectedCountryID}
          />
          <DeleteModal
            onConfirm={handleDelete}
            key={`city-delete-${currentRow.id}`}
            isOpen={open === 'delete'}
            onClose={handleCloseDialog}
            itemName={currentRow.name}
            loading={isDeleteLoading}

          />
        </>
      )}
    </>
  )
}
