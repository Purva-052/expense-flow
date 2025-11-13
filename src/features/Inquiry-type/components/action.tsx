// src/features/coupons/components/ActionFormModal.tsx
import { DeleteModal } from "@/components/model/delete-model";
import { InquiryTypeActionForm } from "./action-form";
import { useInquiryTypeStore } from "../stores/useInquiryTypeStore";
import { TProjectFormSchema } from "@/features/projects/schema";
import {
  useCreateInquiryType,
  useDeleteInquiryType,
  useUpdateInquiryType,
} from "../services";

export function ActionFormModal() {
  const { open, setOpen, currentRow, setCurrentRow } = useInquiryTypeStore();
  const { mutateAsync: createMutate, isPending: isCreateLoading } =
    useCreateInquiryType();
  const { mutateAsync: updateMutate, isPending: isUpdateLoading } =
    useUpdateInquiryType(currentRow?.id || "");
  const { mutateAsync: deleteMutate, isPending: isDeleteLoading } =
    useDeleteInquiryType(currentRow?.id || "");

  const handleCreate = (values: TProjectFormSchema) => {
    const payload = {
      name: values.name,
    };
    createMutate(payload);
  };

  const handleEdit = (values: TProjectFormSchema) => {
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
      <InquiryTypeActionForm
        key="add-inquiry-type"
        open={open === "add"}
        loading={isCreateLoading}
        onOpenChange={(value) => setOpen(value ? "add" : null)}
        onSubmit={handleCreate}
      />

      {currentRow && (
        <>
          <InquiryTypeActionForm
            key={`inquiry-type-edit-${currentRow.id}`}
            open={open === "edit"}
            onSubmit={handleEdit}
            loading={isUpdateLoading}
            onOpenChange={handleCloseDialog}
            currentRow={currentRow}
          />
          <DeleteModal
            onConfirm={handleDelete}
            key={`inquiry-type-delete-${currentRow.id}`}
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
