/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-console */
import { DeleteModal } from '@/components/model/delete-model'
import { TMenuCategoryFormSchema } from '../schema'
import {
  useCreateMenuCategories,
  useDeleteMenuCategories,
  useUpdateMenuCategories,
} from '../services'
import { useAdminMenuCategoriesStore } from '../stores/useAdminMenuCategoriesStore'
import { MenuCategoryActionForm } from './action-form'

export function ActionFormModal() {
  const { open, setOpen, currentRow, setCurrentRow } =
    useAdminMenuCategoriesStore()
  const { mutateAsync: createMutate, isPending: isCreateLoading } =
    useCreateMenuCategories()
  const { mutateAsync: updateMutate, isPending: isUpdateLoading } =
    useUpdateMenuCategories(currentRow?.id || '')
  const { mutateAsync: deleteMutate, isPending: isDeleteLoading } =
    useDeleteMenuCategories(currentRow?.id || '')

  const handleCreate = (values: TMenuCategoryFormSchema) => {
    const payload: any = {
      name: values.name,
    }
    createMutate(payload)
  }

  const handleEdit = (values: TMenuCategoryFormSchema) => {
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
      <MenuCategoryActionForm
        key='add-menu-category'
        open={open === 'add'}
        loading={isCreateLoading}
        onOpenChange={(value: any) => setOpen(value ? 'add' : null)}
        onSubmit={handleCreate}
      />

      {currentRow && (
        <>
          <MenuCategoryActionForm
            key={`menu-category-edit-${currentRow.id}`}
            open={open === 'edit'}
            onSubmit={handleEdit}
            loading={isUpdateLoading}
            onOpenChange={handleCloseDialog}
            currentRow={currentRow}
          />
          <DeleteModal
            onConfirm={handleDelete}
            key={`menu-category-delete-${currentRow.id}`}
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
