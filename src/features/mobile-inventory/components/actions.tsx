import { DeleteModal } from "@/components/model/delete-model";
import { useCreateMobileInventory, useDeleteMobileInventory, useUpdateMobileInventory } from "../services";
import { TMobileInventorySchema } from "../schema";
import { MobileInventoryForm } from "./action-form";
import { useMobileInventoryStore } from "../stores/useMobileInventoryStore";

export function ActionFormModal() {
  const { open, setOpen, currentRow, setCurrentRow } = useMobileInventoryStore();
  const { mutateAsync: createMutate, isPending: isCreateLoading } =
    useCreateMobileInventory();

  const handleCreate = (values: TMobileInventorySchema) => {
    const payload: any = {
      brandId: values.brandId,
      model: values.model,
      color: values.color,
      serialNumber: values.serialNumber,
      os: values.os,
    };
    if (values.allocateTo !== undefined) {
      payload.allocateTo = values.allocateTo ? Number(values.allocateTo) : null;
    } else {
      payload.allocateTo = null;
    }
    createMutate(payload);
  };

  const handleCloseDialog = () => {
    setOpen(null);
    setTimeout(() => {
      setCurrentRow(null);
    }, 300);
  };

  return (
    <>
      <MobileInventoryForm
        key="add-mobile-inventory"
        open={open === "add"}
        loading={isCreateLoading}
        onOpenChange={(value) => setOpen(value ? "add" : null)}
        onSubmit={handleCreate}
      />

      {currentRow && open === "edit" && (
        <EditFormWrapper
          currentRow={currentRow}
          open={open === "edit"}
          onClose={handleCloseDialog}
        />
      )}

      {currentRow && open === "delete" && (
        <DeleteModalWrapper
          currentRow={currentRow}
          open={open === "delete"}
          onClose={handleCloseDialog}
        />
      )}
    </>
  );
}

interface EditWrapperProps {
  currentRow: any;
  open: boolean;
  onClose: () => void;
}

function EditFormWrapper({ currentRow, open, onClose }: EditWrapperProps) {
  const { mutateAsync: updateMutate, isPending: isUpdateLoading } =
    useUpdateMobileInventory(currentRow?.id || "");

  const handleEdit = (values: TMobileInventorySchema) => {
    const payload: any = {
      brandId: values.brandId,
      model: values.model,
      color: values.color,
      serialNumber: values.serialNumber,
      os: values.os,
    };
    if (values.allocateTo !== undefined) {
      payload.allocateTo = values.allocateTo ? Number(values.allocateTo) : null;
    } else {
      payload.allocateTo = null;
    }
    updateMutate(payload);
  };

  return (
    <MobileInventoryForm
      key={`mobile-inventory-edit-${currentRow.id}`}
      open={open}
      onSubmit={handleEdit}
      loading={isUpdateLoading}
      onOpenChange={onClose}
      currentRow={currentRow}
    />
  );
}

interface DeleteWrapperProps {
  currentRow: any;
  open: boolean;
  onClose: () => void;
}

function DeleteModalWrapper({ currentRow, open, onClose }: DeleteWrapperProps) {
  const { mutateAsync: deleteMutate, isPending: isDeleteLoading } =
    useDeleteMobileInventory(currentRow?.id || "");

  const handleDelete = () => {
    deleteMutate();
  };

  return (
    <DeleteModal
      onConfirm={handleDelete}
      key={`mobile-inventory-delete-${currentRow.id}`}
      isOpen={open}
      onClose={onClose}
      itemName={currentRow.model || currentRow.name}
      loading={isDeleteLoading}
    />
  );
}
