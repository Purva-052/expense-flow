import { DeleteModal } from "@/components/model/delete-model";
import { ProductInquiryActionForm } from "./action-form";
import { CommentModal } from "./comment-modal";
import { ViewProductInquiryModal } from "./view-modal";
import { useProductInquiryStore } from "../stores/useProductInquiry";
import { TProductInquirySchema } from "../schema";
import {
  useCreateProductInquiry,
  useDeleteProductInquiry,
  useUpdateProductInquiry,
} from "../services";

export function ActionFormModal() {
  const { open, setOpen, currentRow, setCurrentRow } = useProductInquiryStore();
  const { mutateAsync: createMutate, isPending: isCreateLoading } =
    useCreateProductInquiry();
  const { mutateAsync: updateMutate, isPending: isUpdateLoading } =
    useUpdateProductInquiry(currentRow?.id || "");
  const { mutateAsync: deleteMutate, isPending: isDeleteLoading } =
    useDeleteProductInquiry(currentRow?.id || "");

  const handleSubmission = (values: TProductInquirySchema, type: string) => {
    if (type === "add") {
      createMutate(values);
    } else {
      updateMutate(values);
    }
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
      <ProductInquiryActionForm
        key="add-product-inquiry"
        open={open === "add"}
        loading={isCreateLoading}
        onOpenChange={(value) => setOpen(value ? "add" : null)}
        onSubmit={(values) => handleSubmission(values, "add")}
      />

      {currentRow && (
        <>
          <ProductInquiryActionForm
            key={`product-inquiry-edit-${currentRow.id}`}
            open={open === "edit"}
            onSubmit={(values) => handleSubmission(values, "edit")}
            loading={isUpdateLoading}
            onOpenChange={handleCloseDialog}
            currentRow={currentRow}
          />
          <DeleteModal
            onConfirm={handleDelete}
            key={`product-inquiry-delete-${currentRow.id}`}
            isOpen={open === "delete"}
            onClose={handleCloseDialog}
            itemName={currentRow.companyName}
            loading={isDeleteLoading}
          />
          <ViewProductInquiryModal />
          <CommentModal />
        </>
      )}
    </>
  );
}
