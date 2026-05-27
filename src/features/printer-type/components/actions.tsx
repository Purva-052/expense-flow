// src/features/coupons/components/ActionFormModal.tsx
import { DeleteModal } from "@/components/model/delete-model";
import {
  useCreatePrinter,
  useDeletePrinter,
  useUpdatePrinter,
} from "../services";
import { TPrinterTypeSchema } from "../schema";
import { PrinterTypeForm } from "./action-form";
import { usePrinterStore } from "../stores/usePrinterStore";

export function ActionFormModal() {
  const { open, setOpen, currentRow, setCurrentRow } = usePrinterStore();
  const { mutateAsync: createMutate, isPending: isCreateLoading } =
    useCreatePrinter();
  const { mutateAsync: updateMutate, isPending: isUpdateLoading } =
    useUpdatePrinter(currentRow?.id || "");
  const { mutateAsync: deleteMutate, isPending: isDeleteLoading } =
    useDeletePrinter(currentRow?.id || "");

  const handleCreate = (values: TPrinterTypeSchema) => {
    const payload = {
      name: values.name,
    };
    createMutate(payload);
  };

  const handleEdit = (values: TPrinterTypeSchema) => {
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
      <PrinterTypeForm
        key="add-printer-type"
        open={open === "add"}
        loading={isCreateLoading}
        onOpenChange={(value) => setOpen(value ? "add" : null)}
        onSubmit={handleCreate}
      />

      {currentRow && (
        <>
          <PrinterTypeForm
            key={`printer-type-edit-${currentRow.id}`}
            open={open === "edit"}
            onSubmit={handleEdit}
            loading={isUpdateLoading}
            onOpenChange={handleCloseDialog}
            currentRow={currentRow}
          />
          <DeleteModal
            onConfirm={handleDelete}
            key={`printer-type-delete-${currentRow.id}`}
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
