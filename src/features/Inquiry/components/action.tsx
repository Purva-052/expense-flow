/* eslint-disable no-console */
// src/features/coupons/components/ActionFormModal.tsx
import { DeleteModal } from "@/components/model/delete-model";
import { InquiryActionForm } from "./action-form";
import { useInquiryStore } from "../stores/useInquiryStore";
import { TInquirySchema } from "../schema";

export function ActionFormModal() {
  const { open, setOpen, currentRow, setCurrentRow } = useInquiryStore();
  // const { mutateAsync: createMutate, isPending: isCreateLoading } =
  //   useCreateInquiry();
  // const { mutateAsync: updateMutate, isPending: isUpdateLoading } =
  //   useUpdateInquiry(currentRow?.id || "");
  // const { mutateAsync: deleteMutate, isPending: isDeleteLoading } =
  //   useDeleteInquiry(currentRow?.id || "");

  const handleCreate = (values: TInquirySchema) => {

    console.log("🚀 ~ handleCreate ~ values:", values)

    // const payload = {
    //   name: values.name,
    // };
    // createMutate(payload);
  };

  const handleEdit = (values: TInquirySchema) => {

    console.log("🚀 ~ handleEdit ~ values:", values)

    // const payload = {
    //   name: values.name,
    // };
    // updateMutate(payload);
  };

  const handleDelete = () => {
    // deleteMutate();
  };

  const handleCloseDialog = () => {
    setOpen(null);
    setTimeout(() => {
      setCurrentRow(null);
    }, 300);
  };

  return (
    <>
      <InquiryActionForm
        key="add-inquiry"
        open={open === "add"}
        // loading={isCreateLoading}
        onOpenChange={(value) => setOpen(value ? "add" : null)}
        onSubmit={handleCreate}
      />

      {currentRow && (
        <>
          <InquiryActionForm
            key={`inquiry-edit-${currentRow.id}`}
            open={open === "edit"}
            onSubmit={handleEdit}
            // loading={isUpdateLoading}
            onOpenChange={handleCloseDialog}
            currentRow={currentRow}
          />
          <DeleteModal
            onConfirm={handleDelete}
            key={`inquiry-delete-${currentRow.id}`}
            isOpen={open === "delete"}
            onClose={handleCloseDialog}
            itemName={currentRow.code}
            // loading={isDeleteLoading}
          />
        </>
      )}
    </>
  );
}
