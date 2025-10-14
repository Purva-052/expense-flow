/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from 'react'
import { DeleteModal } from '@/components/model/delete-model'
import { TLocalityFormSchema } from '../schema'
import {
  useCreateLocalityData,
  useDeleteLocalityData,
  useUpdateLocalityData,
} from '../services'
import { useLocalityStore } from '../stores/useLocalityStore'
import { LocalityActionForm } from './action-form'

export function ActionFormModal() {
  const [selectedCountryID, setSelectedCountryID] = useState(null)
  const [selectedStateID, setSelectedStateID] = useState(null)
  const { open, setOpen, currentRow, setCurrentRow } = useLocalityStore()
  const { mutateAsync: createMutate, isPending: isCreateLoading } =
    useCreateLocalityData()
  const { mutateAsync: updateMutate, isPending: isUpdateLoading } =
    useUpdateLocalityData(currentRow?.id || '')
  const { mutateAsync: deleteMutate, isPending: isDeleteLoading } =
    useDeleteLocalityData(currentRow?.id || '')

  const handleCreate = (values: TLocalityFormSchema) => {
    const payload: any = {
      name: values.name,
      cityId: values.city,
      stateId: values.state,
      countryId: values.country,
    }
    createMutate(payload)
  }

  const handleEdit = (values: TLocalityFormSchema) => {
    const payload: any = {
      name: values.name,
      cityId: values.city,
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
      <LocalityActionForm
        key='add-locality'
        open={open === 'add'}
        loading={isCreateLoading}
        onOpenChange={(value) => setOpen(value ? 'add' : null)}
        onSubmit={handleCreate}
        selectedCountryID={selectedCountryID}
        setSelectedCountryID={setSelectedCountryID}
        selectedStateID={selectedStateID}
        setSelectedStateID={setSelectedStateID}
      />

      {currentRow && (
        <>
          <LocalityActionForm
            key={`locality-edit-${currentRow.id}`}
            open={open === 'edit'}
            onSubmit={handleEdit}
            loading={isUpdateLoading}
            onOpenChange={handleCloseDialog}
            currentRow={currentRow}
            selectedCountryID={selectedCountryID}
            setSelectedCountryID={setSelectedCountryID}
            selectedStateID={selectedStateID}
            setSelectedStateID={setSelectedStateID}
          />
          <DeleteModal
            onConfirm={handleDelete}
            key={`locality-delete-${currentRow.id}`}
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
