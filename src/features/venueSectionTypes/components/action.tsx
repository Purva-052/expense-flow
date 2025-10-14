/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-console */
import { DeleteModal } from '@/components/model/delete-model'
import { TVenueSectionTypeFormSchema } from '../schema'
import {
  useCreateVenueSectionTypesData,
  useDeleteVenueSectionTypesData,
  useUpdateVenueSectionTypesData,
} from '../services'
import { useVenueSectionTypeStore } from '../stores/useVenueSectionTypeStore'
import { VenueSectionTypeActionForm } from './action-form'

export function ActionFormModal() {
  const { open, setOpen, currentRow, setCurrentRow } =
    useVenueSectionTypeStore()
  const { mutateAsync: createMutate, isPending: isCreateLoading } =
    useCreateVenueSectionTypesData()
  const { mutateAsync: updateMutate, isPending: isUpdateLoading } =
    useUpdateVenueSectionTypesData(currentRow?.id || '')
  const { mutate: deleteMutate, isPending: isDeleteLoading } =
    useDeleteVenueSectionTypesData(currentRow?.id || '')

  const handleCreate = (values: TVenueSectionTypeFormSchema) => {
    const payload: any = { name: values.name }
    createMutate(payload)
  }

  const handleEdit = (values: TVenueSectionTypeFormSchema) => {
    const payload: any = { name: values.name }
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
      <VenueSectionTypeActionForm
        key='add-venue-section-type'
        open={open === 'add'}
        loading={isCreateLoading}
        onOpenChange={(value) => setOpen(value ? 'add' : null)}
        onSubmit={handleCreate}
      />

      {currentRow && (
        <>
          <VenueSectionTypeActionForm
            key={`venue-section-type-edit-${currentRow.id}`}
            open={open === 'edit'}
            onSubmit={handleEdit}
            loading={isUpdateLoading}
            onOpenChange={handleCloseDialog}
            currentRow={currentRow}
          />
          <DeleteModal
            onConfirm={handleDelete}
            key={`venue-section-type-delete-${currentRow.id}`}
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
