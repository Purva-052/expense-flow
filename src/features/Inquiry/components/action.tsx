/* eslint-disable no-console */
// src/features/coupons/components/ActionFormModal.tsx
import { DeleteModal } from "@/components/model/delete-model";
import { InquiryActionForm } from "./action-form";
import { useInquiryStore } from "../stores/useInquiryStore";
import { TInquirySchema } from "../schema";
import {
  useCreateInquiry,
  useDeleteInquiry,
  useUpdateInquiry,
} from "../services";

export function ActionFormModal() {
  const { open, setOpen, currentRow, setCurrentRow } = useInquiryStore();
  const { mutateAsync: createMutate, isPending: isCreateLoading } =
    useCreateInquiry();
  const { mutateAsync: updateMutate, isPending: isUpdateLoading } =
    useUpdateInquiry(currentRow?.id || "");
  const { mutateAsync: deleteMutate, isPending: isDeleteLoading } =
    useDeleteInquiry(currentRow?.id || "");

  const handleSubmission = (values: TInquirySchema, type: string) => {
    if (type === "add") {
      const basePayload = {
        clientName: values?.clientName,
        countryName: values?.countryName,
        requirements: values?.requirements,
        status: values?.status,
        notes: values?.notes,
        clientContactNo: values?.clientContactNo,
        clientCompanyName: values?.clientCompanyName,
        sourceOfInquiry: values?.sourceOfInquiry,
        clientEmailId: values?.clientEmailId,
      };
      const payload = Object.fromEntries(
        Object.entries(basePayload).filter(
          ([_, v]) => v !== undefined && v !== null && v !== ""
        )
      );
      createMutate(payload);
    } else {
      const basePayload = {
        clientName: values.clientName,
        countryName: values.countryName,
        requirements: values.requirements,
        clientContactNo: values?.clientContactNo,
        clientCompanyName: values?.clientCompanyName,
        sourceOfInquiry: values?.sourceOfInquiry,
        clientEmailId: values?.clientEmailId,
      };
      const payload = Object.fromEntries(
        Object.entries(basePayload).filter(
          ([_, v]) => v !== undefined && v !== null && v !== ""
        )
      );
      updateMutate(payload);
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
      <InquiryActionForm
        key="add-inquiry"
        open={open === "add"}
        loading={isCreateLoading}
        onOpenChange={(value) => setOpen(value ? "add" : null)}
        onSubmit={(values) => handleSubmission(values, "add")}
      />

      {currentRow && (
        <>
          <InquiryActionForm
            key={`inquiry-edit-${currentRow.id}`}
            open={open === "edit"}
            onSubmit={(values) => handleSubmission(values, "edit")}
            loading={isUpdateLoading}
            onOpenChange={handleCloseDialog}
            currentRow={currentRow}
          />
          <DeleteModal
            onConfirm={handleDelete}
            key={`inquiry-delete-${currentRow.id}`}
            isOpen={open === "delete"}
            onClose={handleCloseDialog}
            itemName={currentRow.clientName}
            loading={isDeleteLoading}
          />
        </>
      )}
    </>
  );
}
