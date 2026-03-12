// src/features/coupons/components/ActionFormModal.tsx
import { DeleteModal } from "@/components/model/delete-model";
import { TInboundSourceSchema } from "../schema";
import { useInboundSourcesStore } from "../stores/useInboundSourcesStore";
import {
  useCreateInboundSource,
  useDeleteInboundSource,
  useUpdateInboundSource,
} from "../services";
import { InboundSourceActionForm } from "./action-form";

export function ActionFormModal() {
  const { open, setOpen, currentRow, setCurrentRow } = useInboundSourcesStore();
  const { mutateAsync: createMutate, isPending: isCreateLoading } =
    useCreateInboundSource();
  const { mutateAsync: updateMutate, isPending: isUpdateLoading } =
    useUpdateInboundSource(currentRow?.id || "");
  const { mutateAsync: deleteMutate, isPending: isDeleteLoading } =
    useDeleteInboundSource(currentRow?.id || "");

  const handleCreate = (values: TInboundSourceSchema) => {
    const payload = {
      name: values.name,
      // domainId: values.domainId,
    };
    createMutate(payload);
  };

  const handleEdit = (values: TInboundSourceSchema) => {
    const payload = {
      name: values.name,
      // domainId: values.domainId,
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
      <InboundSourceActionForm
        key="add-industry-type"
        open={open === "add"}
        loading={isCreateLoading}
        onOpenChange={(value) => setOpen(value ? "add" : null)}
        onSubmit={handleCreate}
      />

      {currentRow && (
        <>
          <InboundSourceActionForm
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
