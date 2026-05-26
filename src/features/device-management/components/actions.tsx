// src/features/coupons/components/ActionFormModal.tsx
import { DeleteModal } from "@/components/model/delete-model";
import { useCreateDevice, useDeleteDevice, useUpdateDevice } from "../services";
import { TDeviceSchema } from "../schema";
import { DeviceForm } from "./action-form";
import { useDeviceStore } from "../stores/useDeviceStore";

export function ActionFormModal() {
  const { open, setOpen, currentRow, setCurrentRow } = useDeviceStore();
  const { mutateAsync: createMutate, isPending: isCreateLoading } =
    useCreateDevice();
  const { mutateAsync: updateMutate, isPending: isUpdateLoading } =
    useUpdateDevice(currentRow?.id || "");
  const { mutateAsync: deleteMutate, isPending: isDeleteLoading } =
    useDeleteDevice(currentRow?.id || "");

  const handleCreate = (values: TDeviceSchema) => {
    const payload = {
      brandId: values.brandId,
      modelName: values.modelName,
      osType: values.osType,
      serialNumber: values.serialNumber,
    };
    createMutate(payload);
  };

  const handleEdit = (values: TDeviceSchema) => {
    const payload = {
      brandId: values.brandId,
      modelName: values.modelName,
      osType: values.osType,
      serialNumber: values.serialNumber,
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
      <DeviceForm
        key="add-device"
        open={open === "add"}
        loading={isCreateLoading}
        onOpenChange={(value) => setOpen(value ? "add" : null)}
        onSubmit={handleCreate}
      />

      {currentRow && (
        <>
          <DeviceForm
            key={`device-edit-${currentRow.id}`}
            open={open === "edit"}
            onSubmit={handleEdit}
            loading={isUpdateLoading}
            onOpenChange={handleCloseDialog}
            currentRow={currentRow}
          />
          <DeleteModal
            onConfirm={handleDelete}
            key={`device-delete-${currentRow.id}`}
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
