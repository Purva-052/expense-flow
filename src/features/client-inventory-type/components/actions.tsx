// src/features/coupons/components/ActionFormModal.tsx
import { DeleteModal } from "@/components/model/delete-model";
import {
  useCreateClientInventoryType,
  useDeleteClientInventoryType,
  useUpdateClientInventoryType,
} from "../services";
import { TClientInventoryTypeSchema } from "../schema";
import { DomainForm } from "./action-form";
import { useClientInventoryTypeStore } from "../stores/useClientInventoryTypeStore";

export function ActionFormModal() {
  const { open, setOpen, currentRow, setCurrentRow } =
    useClientInventoryTypeStore();
  const { mutateAsync: createMutate, isPending: isCreateLoading } =
    useCreateClientInventoryType();
  const { mutateAsync: updateMutate, isPending: isUpdateLoading } =
    useUpdateClientInventoryType(currentRow?.id || "");
  const { mutateAsync: deleteMutate, isPending: isDeleteLoading } =
    useDeleteClientInventoryType(currentRow?.id || "");

  const handleCreate = (values: TClientInventoryTypeSchema) => {
    const payload = {
      name: values.name,
    };
    createMutate(payload);
  };

  const handleEdit = (values: TClientInventoryTypeSchema) => {
    const payload = {
      name: values.name,
    };
    updateMutate(payload);
  };

  const handleDelete = () => {
    deleteMutate();
  };

  const handleCloseDialog = () => {
    setOpen(null);
    setTimeout(() => {
      setCurrentRow(null);
    }, 300);
  };

  return (
    <>
      <DomainForm
        key="add-domain"
        open={open === "add"}
        loading={isCreateLoading}
        onOpenChange={(value) => setOpen(value ? "add" : null)}
        onSubmit={handleCreate}
      />

      {currentRow && (
        <>
          <DomainForm
            key={`domain-edit-${currentRow.id}`}
            open={open === "edit"}
            onSubmit={handleEdit}
            loading={isUpdateLoading}
            onOpenChange={handleCloseDialog}
            currentRow={currentRow}
          />
          <DeleteModal
            onConfirm={handleDelete}
            key={`domain-delete-${currentRow.id}`}
            isOpen={open === "delete"}
            onClose={handleCloseDialog}
            itemName={currentRow.name}
            loading={isDeleteLoading}
          />
        </>
      )}
    </>
  );
}
