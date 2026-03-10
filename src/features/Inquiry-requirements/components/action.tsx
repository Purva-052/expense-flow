// src/features/coupons/components/ActionFormModal.tsx
import { DeleteModal } from "@/components/model/delete-model";
import { useInquiryRequirementStore } from "../stores/useInquiryRequirementStore";
import { TProjectFormSchema } from "@/features/projects/schema";
import {
  useCreateInquiryRequirement,
  useDeleteInquiryRequirement,
  useUpdateInquiryRequirement,
} from "../services";
import { InquiryRequirementForm } from "./action-form";

export function ActionFormModal() {
  const { open, setOpen, currentRow, setCurrentRow } =
    useInquiryRequirementStore();
  const { mutateAsync: createMutate, isPending: isCreateLoading } =
    useCreateInquiryRequirement();
  const { mutateAsync: updateMutate, isPending: isUpdateLoading } =
    useUpdateInquiryRequirement(currentRow?.id || "");
  const { mutateAsync: deleteMutate, isPending: isDeleteLoading } =
    useDeleteInquiryRequirement(currentRow?.id || "");

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
      <InquiryRequirementForm
        key="add-inquiry-requirement"
        open={open === "add"}
        loading={isCreateLoading}
        onOpenChange={(value: any) => setOpen(value ? "add" : null)}
        onSubmit={handleCreate}
      />

      {currentRow && (
        <>
          <InquiryRequirementForm
            key={`inquiry-requirement-edit-${currentRow.id}`}
            open={open === "edit"}
            onSubmit={handleEdit}
            loading={isUpdateLoading}
            onOpenChange={handleCloseDialog}
            currentRow={currentRow}
          />
          <DeleteModal
            onConfirm={handleDelete}
            key={`inquiry-requirement-delete-${currentRow.id}`}
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
