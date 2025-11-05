// src/features/coupons/components/ActionFormModal.tsx
import { DeleteModal } from "@/components/model/delete-model";
import { ProjectModuleActionForm } from "./action-form";
import { useProjectModuleStore } from "../stores/useProjectModuleStore";
import { TProjectFormSchema } from "@/features/projects/schema";
import { useCreateProjectModule, useDeleteProjectModule, useUpdateProjectModule } from "../services";

export function ActionFormModal() {
  const { open, setOpen, currentRow, setCurrentRow } = useProjectModuleStore();
  const { mutateAsync: createMutate, isPending: isCreateLoading } =
    useCreateProjectModule();
  const { mutateAsync: updateMutate, isPending: isUpdateLoading } =
    useUpdateProjectModule(currentRow?.id || "");
  const { mutateAsync: deleteMutate, isPending: isDeleteLoading } =
    useDeleteProjectModule(currentRow?.id || "");

  const handleCreate = (values: TProjectFormSchema) => {
    const payload = {
      name: values.name,
    };
    createMutate(payload);
  };

  const handleEdit = (values: TProjectFormSchema) => {
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
      <ProjectModuleActionForm
        key="add-project-module"
        open={open === "add"}
        loading={isCreateLoading}
        onOpenChange={(value) => setOpen(value ? "add" : null)}
        onSubmit={handleCreate}
      />

      {currentRow && (
        <>
          <ProjectModuleActionForm
            key={`project-module-edit-${currentRow.id}`}
            open={open === "edit"}
            onSubmit={handleEdit}
            loading={isUpdateLoading}
            onOpenChange={handleCloseDialog}
            currentRow={currentRow}
          />
          <DeleteModal
            onConfirm={handleDelete}
            key={`project-module-delete-${currentRow.id}`}
            isOpen={open === "delete"}
            onClose={handleCloseDialog}
            itemName={currentRow.code}
            loading={isDeleteLoading}
          />
        </>
      )}
    </>
  );
}
