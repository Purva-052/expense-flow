/* eslint-disable no-console */
// src/features/coupons/components/ActionFormModal.tsx
import { DeleteModal } from "@/components/model/delete-model";
import { ServerActionForm } from "./action-form";
import { useServerStore } from "../stores/useServerStore";
import { TServerSchema } from "../schema";
import { useCreateServer, useDeleteServer, useUpdateServer } from "../services";

export function ActionFormModal() {
  const { open, setOpen, currentRow, setCurrentRow } = useServerStore();
  const { mutateAsync: createMutate, isPending: isCreateLoading } =
    useCreateServer();
  const { mutateAsync: updateMutate, isPending: isUpdateLoading } =
    useUpdateServer(currentRow?.id || "");
  const { mutateAsync: deleteMutate, isPending: isDeleteLoading } =
    useDeleteServer(currentRow?.id || "");

  const handleSubmission = (values: TServerSchema, type: string) => {
    const payload = {
      ip: values.ip,
      ownerName: values.ownerName,
      ssl: values.ssl,
    };
    if (type === "add") {
      createMutate(payload);
    } else {
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
      <ServerActionForm
        key="add-server"
        open={open === "add"}
        loading={isCreateLoading}
        onOpenChange={(value) => setOpen(value ? "add" : null)}
        onSubmit={(values) => handleSubmission(values, "add")}
      />

      {currentRow && (
        <>
          <ServerActionForm
            key={`server-edit-${currentRow.id}`}
            open={open === "edit"}
            onSubmit={(values) => handleSubmission(values, "edit")}
            loading={isUpdateLoading}
            onOpenChange={handleCloseDialog}
            currentRow={currentRow}
          />
          <DeleteModal
            onConfirm={handleDelete}
            key={`server-delete-${currentRow.id}`}
            isOpen={open === "delete"}
            onClose={handleCloseDialog}
            itemName={currentRow.ip}
            loading={isDeleteLoading}
          />
        </>
      )}
    </>
  );
}
