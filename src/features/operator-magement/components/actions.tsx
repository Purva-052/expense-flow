// src/features/operators/components/actions.tsx

import { ActionForm } from './action-form'
import { DeleteModal } from '@/components/model/delete-model'
import { useCreateOperator, useDeleteOperator, useUpdateOperator } from '../services'
import { useOperatorStore } from '../store'
import { OperatorForm } from '../types' // Using TFormSchema for values
import { TFormSchema } from '../schema'

export function ActionFormModal() {
    const { open, setOpen, currentRow, setCurrentRow } = useOperatorStore()
    const { mutateAsync: createMutate, isPending: isCreateLoading } = useCreateOperator()
    const { mutateAsync: updateMutate, isPending: isUpdateLoading } = useUpdateOperator(currentRow?.user_id || '')
    const { mutateAsync: deleteMutate, isPending: isDeleteLoading } = useDeleteOperator(currentRow?.user_id || '')

    const handleCreate = (values: TFormSchema) => {
        // Construct payload from form values
        const payload: OperatorForm = {
            name: values.name,
            email: values.email,
            mobile: values.mobile,
            password: values.password, // Password is required for creation
            user_name: values.user_name,
        }
        createMutate(payload)
    }

    const handleEdit = (values: TFormSchema) => {
        const payload: Partial<OperatorForm> = {
            name: values.name,
            email: values.email,
            mobile: values.mobile,
            user_name: values.user_name,
        }
        // Only include the password in the payload if the user entered a new one
        if (values.password) {
            payload.password = values.password
        }
        updateMutate(payload)
    }

    const handleDelete = () => {
        deleteMutate()
    }
    
    // This function handles closing the edit/delete dialogs and clearing the selected row
    const handleCloseDialog = () => {
        setOpen(null);
        // Delay clearing the row to prevent UI flicker while the dialog closes
        setTimeout(() => {
            setCurrentRow(null);
        }, 300); // 300ms is a common animation duration
    }

    return (
        <>
            <ActionForm
                key='add-operator'
                open={open === 'add'}
                loading={isCreateLoading}
                onOpenChange={(value) => setOpen(value ? 'add' : null)}
                onSubmit={handleCreate}
            />

            {currentRow && (
                <>
                    <ActionForm
                        key={`operator-edit-${currentRow.user_id}`}
                        open={open === 'edit'}
                        onSubmit={handleEdit}
                        loading={isUpdateLoading}
                        onOpenChange={handleCloseDialog}
                        currentRow={currentRow}
                    />
                    <DeleteModal
                        onConfirm={handleDelete}
                        key={`operator-delete-${currentRow.user_id}`}
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