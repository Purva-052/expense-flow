// src/features/coupons/components/ActionFormModal.tsx
import { DeleteModal } from "@/components/model/delete-model";

import { useTechnologyStore } from "../stores/useTechnologyStore";
import { TechnologyActionForm } from "./action-form";
import { TTechnologyFormSchema } from "../schema";
import {
  useCreateTechnologyData,
  useDeleteTechnologyData,
  useUpdateTechnologyData,
} from "../services";

export function ActionFormModal() {
  const { open, setOpen, currentRow, setCurrentRow } = useTechnologyStore();
  const { mutateAsync: createMutate, isPending: isCreateLoading } =
    useCreateTechnologyData();
  const { mutateAsync: updateMutate, isPending: isUpdateLoading } =
    useUpdateTechnologyData(currentRow?.id || "");
  const { mutateAsync: deleteMutate, isPending: isDeleteLoading } =
    useDeleteTechnologyData(currentRow?.id || "");

  const handleCreate = (values: TTechnologyFormSchema) => {
    const payload = {
      name: values.name,
      color: values.color,
    };
    createMutate(payload);
  };

  const handleEdit = (values: TTechnologyFormSchema) => {
    const payload = {
      name: values.name,
      color: values.color,
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
      <TechnologyActionForm
        key="add-technology"
        open={open === "add"}
        loading={isCreateLoading}
        onOpenChange={(value) => setOpen(value ? "add" : null)}
        onSubmit={handleCreate}
      />

      {currentRow && (
        <>
          <TechnologyActionForm
            key={`technology-edit-${currentRow.id}`}
            open={open === "edit"}
            onSubmit={handleEdit}
            loading={isUpdateLoading}
            onOpenChange={handleCloseDialog}
            currentRow={currentRow}
          />
          <DeleteModal
            onConfirm={handleDelete}
            key={`technology-delete-${currentRow.id}`}
            isOpen={open === "delete"}
            onClose={handleCloseDialog}
            itemName={currentRow.code}
            loading={isDeleteLoading}
          />
        </>
      )}
    </>
  );
}
