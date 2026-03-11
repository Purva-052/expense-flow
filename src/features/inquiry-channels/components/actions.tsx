// src/features/coupons/components/ActionFormModal.tsx
import { DeleteModal } from "@/components/model/delete-model";
import { useInquiryCategoryStore } from "../stores/useInquiryCategoryStore";
import { TInquiryCategorySchema } from "../schema";
import {
  useCreateInquiryCategory,
  useDeleteInquiryCategory,
  useUpdateInquiryCategory,
} from "../services";
import { InquiryCategoryActionForm } from "./action-form";

export function ActionFormModal() {
  const { open, setOpen, currentRow, setCurrentRow } =
    useInquiryCategoryStore();
  const { mutateAsync: createMutate, isPending: isCreateLoading } =
    useCreateInquiryCategory();
  const { mutateAsync: updateMutate, isPending: isUpdateLoading } =
    useUpdateInquiryCategory(currentRow?.id || "");
  const { mutateAsync: deleteMutate, isPending: isDeleteLoading } =
    useDeleteInquiryCategory(currentRow?.id || "");

  const handleCreate = (values: TInquiryCategorySchema) => {
    const payload = {
      name: values.name,
    };
    createMutate(payload);
  };

  const handleEdit = (values: TInquiryCategorySchema) => {
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
      <InquiryCategoryActionForm
        key="add-industry-type"
        open={open === "add"}
        loading={isCreateLoading}
        onOpenChange={(value) => setOpen(value ? "add" : null)}
        onSubmit={handleCreate}
      />

      {currentRow && (
        <>
          <InquiryCategoryActionForm
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
