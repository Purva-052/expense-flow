// src/features/coupons/components/ActionFormModal.tsx
import { DeleteModal } from "@/components/model/delete-model";
import { ProjectTypeActionForm } from "./action-form";
import { useProjectTypeStore } from "../stores/useProjectTypeStore";
import { TProjectFormSchema } from "@/features/projects/schema";
import {
  useCreateProjectType,
  useDeleteProjectTypes,
  useUpdateProjectType,
} from "../services";

export function ActionFormModal() {
  const { open, setOpen, currentRow, setCurrentRow } = useProjectTypeStore();
  const { mutateAsync: createMutate, isPending: isCreateLoading } =
    useCreateProjectType();
  const { mutateAsync: updateMutate, isPending: isUpdateLoading } =
    useUpdateProjectType(currentRow?.id || "");
  const { mutateAsync: deleteMutate, isPending: isDeleteLoading } =
    useDeleteProjectTypes(currentRow?.id || "");

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
      <ProjectTypeActionForm
        key="add-project-type"
        open={open === "add"}
        loading={isCreateLoading}
        onOpenChange={(value) => setOpen(value ? "add" : null)}
        onSubmit={handleCreate}
      />

      {currentRow && (
        <>
          <ProjectTypeActionForm
            key={`project-type-edit-${currentRow.id}`}
            open={open === "edit"}
            onSubmit={handleEdit}
            loading={isUpdateLoading}
            onOpenChange={handleCloseDialog}
            currentRow={currentRow}
          />
          <DeleteModal
            onConfirm={handleDelete}
            key={`project-type-delete-${currentRow.id}`}
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
