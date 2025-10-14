/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-console */
import { DeleteModal } from '@/components/model/delete-model'
import {
  useCreateVenueTypesData,
  useDeleteVenueTypesData,
  useUpdateVenueTypesData,
} from '../services'
import { useVenueTypeStore } from '../stores/useVenueTypeStore'
import { VenueTypeActionForm } from './action-form'
import { TVenueTypeFormSchema } from '../schema'

export function ActionFormModal() {
  const { open, setOpen, currentRow, setCurrentRow } = useVenueTypeStore()
  const { mutateAsync: createMutate, isPending: isCreateLoading } =
    useCreateVenueTypesData()
  const { mutateAsync: updateMutate, isPending: isUpdateLoading } =
    useUpdateVenueTypesData(currentRow?.id || '')
  const { mutate: deleteMutate, isPending: isDeleteLoading } =
    useDeleteVenueTypesData(currentRow?.id || '')

  const handleCreate = (values: TVenueTypeFormSchema) => {
    const payload: any = {
      name: values.name,
    }
    createMutate(payload)
  }

  const handleEdit = (values: TVenueTypeFormSchema) => {
    const payload: any = {
      name: values.name,
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
      <VenueTypeActionForm
        key="add-venue-type"
        open={open === 'add'}
        loading={isCreateLoading}
        onOpenChange={(value) => setOpen(value ? 'add' : null)}
        onSubmit={handleCreate}
      />

      {currentRow && (
        <>
          <VenueTypeActionForm
            key={`venue-type-edit-${currentRow.id}`}
            open={open === 'edit'}
            onSubmit={handleEdit}
            loading={isUpdateLoading}
            onOpenChange={handleCloseDialog}
            currentRow={currentRow}
          />
          <DeleteModal
            onConfirm={handleDelete}
            key={`venue-type-delete-${currentRow.id}`}
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
