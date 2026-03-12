// src/features/coupons/components/ActionFormModal.tsx
import { DeleteModal } from "@/components/model/delete-model";
import { useOutboundSourcesStore } from "../stores/useOutboundSourcesStore";
import {
  useCreateOutboundSource,
  useDeleteOutboundSource,
  useUpdateOutboundSource,
} from "../services";
import { TOutboundSourceSchema } from "../schema";
import { OutboundSourceActionForm } from "./action-form";

export function ActionFormModal() {
  const { open, setOpen, currentRow, setCurrentRow } =
    useOutboundSourcesStore();
  const { mutateAsync: createMutate, isPending: isCreateLoading } =
    useCreateOutboundSource();
  const { mutateAsync: updateMutate, isPending: isUpdateLoading } =
    useUpdateOutboundSource(currentRow?.id || "");
  const { mutateAsync: deleteMutate, isPending: isDeleteLoading } =
    useDeleteOutboundSource(currentRow?.id || "");

  const handleCreate = (values: TOutboundSourceSchema) => {
    const payload = {
      name: values.name,
      //   domainId: values.domainId,
    };
    createMutate(payload);
  };

  const handleEdit = (values: TOutboundSourceSchema) => {
    const payload = {
      name: values.name,
      //   domainId: values.domainId,
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
      <OutboundSourceActionForm
        key="add-industry-type"
        open={open === "add"}
        loading={isCreateLoading}
        onOpenChange={(value) => setOpen(value ? "add" : null)}
        onSubmit={handleCreate}
      />

      {currentRow && (
        <>
          <OutboundSourceActionForm
            key={`industry-type-edit-${currentRow.id}`}
            open={open === "edit"}
            onSubmit={handleEdit}
            loading={isUpdateLoading}
            onOpenChange={handleCloseDialog}
            currentRow={currentRow}
          />
          <DeleteModal
            onConfirm={handleDelete}
            key={`industry-type-delete-${currentRow.id}`}
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
