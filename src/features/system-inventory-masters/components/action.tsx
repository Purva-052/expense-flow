import { DeleteModal } from "@/components/model/delete-model";
import {
  useCreateSystemInventoryType,
  useDeleteSystemInventoryTypes,
  useUpdateSystemInventoryType,
} from "../services";
import { useSystemInventoryMasterStore } from "../stores/useSystemInventoryMasterStore";
import {
  SystemInventoryActionForm,
  TSystemInventorySchema,
} from "./action-form";
import { SystemInventoryMasterConfig } from "../constants";

interface Props {
  config: SystemInventoryMasterConfig;
}

export function ActionFormModal({ config }: Readonly<Props>) {
  const { open, setOpen, currentRow, setCurrentRow } =
    useSystemInventoryMasterStore();
  const { mutateAsync: createMutate, isPending: isCreateLoading } =
    useCreateSystemInventoryType(config.api);
  const { mutateAsync: updateMutate, isPending: isUpdateLoading } =
    useUpdateSystemInventoryType(config.api, currentRow?.id || "");
  const { mutateAsync: deleteMutate, isPending: isDeleteLoading } =
    useDeleteSystemInventoryTypes(config.api, currentRow?.id || "");

  const handleCreate = (values: TSystemInventorySchema) => {
    const payload = {
      name: values.name,
    };
    createMutate(payload);
  };

  const handleEdit = (values: TSystemInventorySchema) => {
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
      <SystemInventoryActionForm
        key={`add-${config.itemLabel}`}
        open={open === "add"}
        config={config}
        loading={isCreateLoading}
        onOpenChange={(value) => setOpen(value ? "add" : null)}
        onSubmit={handleCreate}
      />

      {currentRow && (
        <>
          <SystemInventoryActionForm
            key={`inventory-edit-${currentRow.id}`}
            open={open === "edit"}
            config={config}
            onSubmit={handleEdit}
            loading={isUpdateLoading}
            onOpenChange={handleCloseDialog}
            currentRow={currentRow}
          />
          <DeleteModal
            onConfirm={handleDelete}
            key={`inventory-delete-${currentRow.id}`}
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
