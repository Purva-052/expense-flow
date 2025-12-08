import { useDeleteInterview } from "@/features/Interviews/services";
import { useCreateUserData } from "../services";
import { useNewJoineeStore } from "../stores/useNewJoineeStore";
import { NewJoineeActionForm } from "./action-form";
import { DeleteModal } from "@/components/model/delete-model";
import { useState } from "react";

export function ActionFormModal({
  technologyList,
  technologyListLoading,
}: any) {
  const { open, setOpen, currentRow, setCurrentRow } = useNewJoineeStore();
  const [_, setIsDeleteDialogOpen] = useState(false);

  const onSuccessDeleteInterview = () => {
    setIsDeleteDialogOpen(false);
  };

  const { mutateAsync: createMutate, isPending: isCreateLoading } =
    useCreateUserData();

  const { mutateAsync: deleteMutate, isPending: isDeleteLoading } =
    useDeleteInterview(onSuccessDeleteInterview);

  // -----------------------------
  // CREATE HANDLER
  // -----------------------------
  const handleCreate = async (values: any) => {
    const payload = {
      candidateName: values.candidateName,
      technology: values.technology,
      email: values.email,
      phoneNumber: values.phoneNumber,
      notes: values.notes,
      experienceInYears: values.experienceInYears,
      interviewerComments: values.interviewerComments,
      joiningDate: values.joiningDate,
    };

    await createMutate(payload);
    handleCloseDialog();
  };

  // -----------------------------
  // CLOSE MODAL HANDLER
  // -----------------------------
  const handleCloseDialog = () => {
    setOpen(null);

    // Only clear currentRow after transition
    setTimeout(() => {
      setCurrentRow(null);
    }, 300);
  };

  // -----------------------------
  // DELETE HANDLER
  // -----------------------------
  const handleDelete = async () => {
    if (!currentRow?.id) return;

    await deleteMutate(currentRow.id);

    // Close modal + clear row
    handleCloseDialog();
  };

  return (
    <>
      {/* ------ ADD NEW JOINEE MODAL ------ */}
      <NewJoineeActionForm
        key="add-new-joinee"
        open={open === "add"}
        loading={isCreateLoading}
        onOpenChange={(value) => setOpen(value ? "add" : null)}
        onSubmit={handleCreate}
        technologyListData={technologyList?.data}
        technologyListLoading={technologyListLoading}
      />

      {/* ------ DELETE MODAL ------ */}
      {currentRow?.id && (
        <DeleteModal
          key={`delete-joinee-${currentRow.id}`}
          isOpen={open === "delete"}
          onClose={handleCloseDialog}
          onConfirm={handleDelete}
          itemName={currentRow.candidateName || "this candidate"}
          loading={isDeleteLoading}
        />
      )}
    </>
  );
}
