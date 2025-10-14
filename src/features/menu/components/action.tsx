/* eslint-disable @typescript-eslint/no-explicit-any */
import { useAuthStore } from '@/stores/use-auth-store'
import { DeleteModal } from '@/components/model/delete-model'
import { useGetMenuCategories } from '@/features/admin-menu-categories/services'
import { MenuItemFormModal } from '@/features/venue/components/menu-items-model'
import {
  useCreateMenuData,
  useDeleteMenuData,
  useUpdateMenuData,
} from '../services'
import { useMenuStore } from '../stores/useMenuStore'

export function ActionFormModal() {
  const { open, setOpen, currentRow, setCurrentRow } = useMenuStore()
  const { mutateAsync: createMutate, isPending: isCreateLoading } =
    useCreateMenuData()
  const { mutateAsync: updateMutate, isPending: isUpdateLoading } =
    useUpdateMenuData(currentRow?.id || '')
  const { mutateAsync: deleteMutate, isPending: isDeleteLoading } =
    useDeleteMenuData(currentRow?.id || '')
  const { user } = useAuthStore()
  const venueId = user?.user?.venue?.id

  const { data: categoryList }: any = useGetMenuCategories()

  const handleCreate = (values: any) => {
    const payload: any = {
      venueId: venueId,
      categoryId: values.categoryId,
      name: values.name,
      description: values.description,
      price: values.price,
      isAvailable: values.isAvailable,
      preparationTime: values.preparationTime,
      calories: values.calories,
      isVegetarian: values.isVegetarian,
    }
    createMutate(payload)
  }

  const handleEdit = (values: any) => {
    const payload: any = {
      venueId: venueId,
      categoryId: values.categoryId,
      name: values.name,
      description: values.description,
      price: values.price,
      isAvailable: values.isAvailable,
      preparationTime: values.preparationTime,
      calories: values.calories,
      isVegetarian: values.isVegetarian,
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
      <MenuItemFormModal
        open={open === 'add'}
        onClose={() => setOpen(null)}
        onSubmit={handleCreate}
        // venueId={venueId}
        isSubmitting={isCreateLoading}
        categoryList={categoryList || []}
      />

      {currentRow && (
        <>
          <MenuItemFormModal
            open={open === 'edit'}
            onClose={() => setOpen(null)}
            onSubmit={handleEdit}
            // venueId={venueId}
            initialData={currentRow}
            isSubmitting={isUpdateLoading}
            categoryList={categoryList || []}
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
