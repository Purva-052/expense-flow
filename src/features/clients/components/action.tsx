import { DeleteModal } from "@/components/model/delete-model";
import { ClientActionForm } from "./action-form";
import { useClientsStore } from "../stores/useClientsStore";
import { TClientFormSchema } from "../schema";
import {
  useCreateClientsData,
  useDeleteClientsData,
  useUpdateClientsData,
} from "../services";

export function ActionFormModal() {
  const { open, setOpen, currentRow, setCurrentRow } = useClientsStore();

  const { mutateAsync: createMutate, isPending: isCreateLoading } =
    useCreateClientsData();
  const { mutateAsync: updateMutate, isPending: isUpdateLoading } =
    useUpdateClientsData(currentRow?.id || "");
  const { mutateAsync: deleteMutate, isPending: isDeleteLoading } =
    useDeleteClientsData(currentRow?.id || "");

  const handleCreate = (values: TClientFormSchema) => {
    const payload = {
      name: values.name,
      company: values.company,
      countryId: values.countryId,
      timezone: values.timezone,
    };
    createMutate(payload);
  };

  const handleEdit = (values: TClientFormSchema) => {
    const payload = {
      name: values.name,
      company: values.company,
      countryId: values.countryId,
      timezone: values.timezone,
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
      <ClientActionForm
        key="add-Client"
        open={open === "add"}
        loading={isCreateLoading}
        onOpenChange={(value) => setOpen(value ? "add" : null)}
        onSubmit={handleCreate}
      />

      {currentRow && (
        <>
          <ClientActionForm
            key={`client-edit-${currentRow.id}`}
            open={open === "edit"}
            onSubmit={handleEdit}
            loading={isUpdateLoading}
            onOpenChange={handleCloseDialog}
            currentRow={currentRow}
          />
          <DeleteModal
            onConfirm={handleDelete}
            key={`client-delete-${currentRow.id}`}
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
