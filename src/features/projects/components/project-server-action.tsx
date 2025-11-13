/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-console */
// src/features/coupons/components/ActionFormModal.tsx
import { DeleteModal } from "@/components/model/delete-model";
import {
  useCreateProjectServer,
  useDeleteProjectServer,
  useUpdateProjectServer,
} from "../services";

import { useProjectServerStore } from "../stores/useProjectServerStore";
import { ProjectServerActionForm } from "./project-server-form";

export function ProjectServerActionFormModal({
  ProjectId,
}: {
  ProjectId: any;
}) {
  const { open, setOpen, currentRow, setCurrentRow } = useProjectServerStore();
  const { mutateAsync: createMutate, isPending: isCreateLoading } =
    useCreateProjectServer();
  const { mutateAsync: updateMutate, isPending: isUpdateLoading } =
    useUpdateProjectServer(currentRow?.id || "");
  const { mutateAsync: deleteMutate, isPending: isDeleteLoading } =
    useDeleteProjectServer(currentRow?.id || "");

  const handleSubmission = (values: any, type: string) => {
    const payload = {
      url: values?.url,
      port: values?.port,
      type: values?.type,
      status: values?.status,
      serverId: values?.serverId,
      projectId: ProjectId,
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
      <ProjectServerActionForm
        key="add-server"
        open={open === "add"}
        loading={isCreateLoading}
        onOpenChange={(value) => setOpen(value ? "add" : null)}
        onSubmit={(values) => handleSubmission(values, "add")}
      />

      {currentRow && (
        <>
          <ProjectServerActionForm
            key={`server-edit-${currentRow.id}`}
            open={open === "edit"}
            onSubmit={(values) => handleSubmission(values, "edit")}
            loading={isUpdateLoading}
            onOpenChange={handleCloseDialog}
            currentRow={currentRow}
          />
          <DeleteModal
            onConfirm={handleDelete}
            key={`project-server-delete-${currentRow.id}`}
            isOpen={open === "delete"}
            onClose={handleCloseDialog}
            itemName={currentRow.url}
            loading={isDeleteLoading}
          />
        </>
      )}
    </>
  );
}
