/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-console */
// src/features/operators/components/actions.tsx
import { DeleteModal } from '@/components/model/delete-model'
import { TCountryFormSchema } from '../schema'
import {
  useCreateCountryData,
  useDeleteCountryData,
  useUpdateCountryData,
} from '../services'
import { useCountryStore } from '../stores/useCountryStore'
import { CountryActionForm } from './action-form'

export function ActionFormModal() {
  const { open, setOpen, currentRow, setCurrentRow } = useCountryStore()
  const { mutateAsync: createMutate, isPending: isCreateLoading } =
    useCreateCountryData()
  const { mutateAsync: updateMutate, isPending: isUpdateLoading } =
    useUpdateCountryData(currentRow?.id || '')
  const { mutateAsync: deleteMutate, isPending: isDeleteLoading } =
    useDeleteCountryData(currentRow?.id || '')

  const handleCreate = (values: TCountryFormSchema) => {
    const payload: any = {
      name: values.name,
      code: values.code,
      dialCode: values.dialCode,
      flag: values.flag,
    }
    createMutate(payload)
  }

  const handleEdit = (values: TCountryFormSchema) => {
    const payload: any = {
      name: values.name,
      code: values.code,
      dialCode: values.dialCode,
      flag: values.flag,
    }
    console.log('🚀 ~ handleEdit ~ payload:', payload)
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
      <CountryActionForm
        key='add-country'
        open={open === 'add'}
        loading={isCreateLoading}
        onOpenChange={(value) => setOpen(value ? 'add' : null)}
        onSubmit={handleCreate}
      />

      {currentRow && (
        <>
          <CountryActionForm
            key={`country-edit-${currentRow.id}`}
            open={open === 'edit'}
            onSubmit={handleEdit}
            loading={isUpdateLoading}
            onOpenChange={handleCloseDialog}
            currentRow={currentRow}
          />
          <DeleteModal
            onConfirm={handleDelete}
            key={`country-delete-${currentRow.id}`}
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
