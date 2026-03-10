// src/features/coupons/components/ActionFormModal.tsx
import { DeleteModal } from "@/components/model/delete-model";
import { useIndustryStore } from "../stores/useIndustryStore";
import {
  useCreateIndustry,
  useDeleteIndustry,
  useUpdateIndustry,
} from "../services";
import { TIndustrySchema } from "../schema";
import { IndustryActionForm } from "./action-form";

export function ActionFormModal() {
  const { open, setOpen, currentRow, setCurrentRow } = useIndustryStore();
  const { mutateAsync: createMutate, isPending: isCreateLoading } =
    useCreateIndustry();
  const { mutateAsync: updateMutate, isPending: isUpdateLoading } =
    useUpdateIndustry(currentRow?.id || "");
  const { mutateAsync: deleteMutate, isPending: isDeleteLoading } =
    useDeleteIndustry(currentRow?.id || "");

  const handleCreate = (values: TIndustrySchema) => {
    const payload = {
      name: values.name,
    };
    createMutate(payload);
  };

  const handleEdit = (values: TIndustrySchema) => {
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
      <IndustryActionForm
        key="add-industry-type"
        open={open === "add"}
        loading={isCreateLoading}
        onOpenChange={(value) => setOpen(value ? "add" : null)}
        onSubmit={handleCreate}
      />

      {currentRow && (
        <>
          <IndustryActionForm
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
