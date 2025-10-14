// src/features/coupons/components/ActionFormModal.tsx
import { DeleteModal } from '@/components/model/delete-model'
import { TCouponFormSchema } from '../schema'
import { useCouponsStore } from '../stores/useCouponsStore'
import {
  useCreateCouponsData,
  useDeleteCouponsData,
  useUpdateCouponsData,
} from '../services'
import { CouponActionForm } from './action-form'

export function ActionFormModal() {
  const { open, setOpen, currentRow, setCurrentRow } = useCouponsStore()
  const { mutateAsync: createMutate, isPending: isCreateLoading } =
    useCreateCouponsData()
  const { mutateAsync: updateMutate, isPending: isUpdateLoading } =
    useUpdateCouponsData(currentRow?.id || '')
  const { mutateAsync: deleteMutate, isPending: isDeleteLoading } =
    useDeleteCouponsData(currentRow?.id || '')

  const handleCreate = (values: TCouponFormSchema) => {
    createMutate(values)
  }

  const handleEdit = (values: TCouponFormSchema) => {
    updateMutate(values)
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
      <CouponActionForm
        key="add-coupon"
        open={open === 'add'}
        loading={isCreateLoading}
        onOpenChange={(value) => setOpen(value ? 'add' : null)}
        onSubmit={handleCreate}
      />

      {currentRow && (
        <>
          <CouponActionForm
            key={`coupon-edit-${currentRow.id}`}
            open={open === 'edit'}
            onSubmit={handleEdit}
            loading={isUpdateLoading}
            onOpenChange={handleCloseDialog}
            currentRow={currentRow}
          />
          <DeleteModal
            onConfirm={handleDelete}
            key={`coupon-delete-${currentRow.id}`}
            isOpen={open === 'delete'}
            onClose={handleCloseDialog}
            itemName={currentRow.code}
            loading={isDeleteLoading}
          />
        </>
      )}
    </>
  )
}
