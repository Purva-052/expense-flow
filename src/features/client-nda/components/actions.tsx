import { DeleteModal } from "@/components/model/delete-model";
import { ClientNDAActionForm } from "./action-form";
import { useClientNDAStore } from "../stores/useClientNDA";
import { useDeleteNDA } from "../services";

export function ActionFormModal() {
  const { open, setOpen, currentRow, setCurrentRow } = useClientNDAStore();

  const { mutateAsync: deleteMutate, isPending: isDeleteLoading } = useDeleteNDA(
    currentRow?.id || ""
  );

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
      <ClientNDAActionForm
        open={open === "add"}
        onOpenChange={(value) => setOpen(value ? "add" : null)}
      />

      {currentRow && (
        <>
          <ClientNDAActionForm
            open={open === "preview"}
            onOpenChange={handleCloseDialog}
            currentRow={currentRow}
            isViewOnly={true}
          />
          <ClientNDAActionForm
            open={open === "edit"}
            onOpenChange={handleCloseDialog}
            currentRow={currentRow}
            isViewOnly={false}
          />
          <DeleteModal
            onConfirm={handleDelete}
            isOpen={open === "delete"}
            onClose={handleCloseDialog}
            itemName={`NDA for ${currentRow.clientName || currentRow.client?.name || "Client"}`}
            loading={isDeleteLoading}
          />
        </>
      )}
    </>
  );
}
