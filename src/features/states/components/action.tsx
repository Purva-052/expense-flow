/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-console */
// src/features/states/components/actions.tsx
import { DeleteModal } from '@/components/model/delete-model'
import { TStateFormSchema } from '../schema'
import {
  useCreateStateData,
  useDeleteStateData,
  useUpdateStateData,
} from '../services'
import { useStateStore } from '../stores/useStateStore'
import { StateActionForm } from './action-form'

export function ActionFormModal() {
  const { open, setOpen, currentRow, setCurrentRow } = useStateStore()
  const { mutateAsync: createMutate, isPending: isCreateLoading } =
    useCreateStateData()
  const { mutateAsync: updateMutate, isPending: isUpdateLoading } =
    useUpdateStateData(currentRow?.id || '')
  const { mutate: deleteMutate, isPending: isDeleteLoading } =
    useDeleteStateData(currentRow?.id || '')

  const handleCreate = (values: TStateFormSchema) => {
    console.log('🚀 ~ handleCreate ~ values:', values)

    const payload: any = {
      name: values.name,
      code: values.code,
      countryId: values.country,
    }

    createMutate(payload)
  }

  const handleEdit = (values: TStateFormSchema) => {
    const payload: any = {
      name: values.name,
      code: values.code,
      countryId: values.country,
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
      <StateActionForm
        key='add-state'
        open={open === 'add'}
        loading={isCreateLoading}
        onOpenChange={(value) => setOpen(value ? 'add' : null)}
        onSubmit={handleCreate}
      />

      {currentRow && (
        <>
          <StateActionForm
            key={`state-edit-${currentRow.id}`}
            open={open === 'edit'}
            onSubmit={handleEdit}
            loading={isUpdateLoading}
            onOpenChange={handleCloseDialog}
            currentRow={currentRow}
          />
          <DeleteModal
            onConfirm={handleDelete}
            key={`state-delete-${currentRow.id}`}
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
