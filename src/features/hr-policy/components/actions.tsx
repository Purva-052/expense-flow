/* eslint-disable @typescript-eslint/no-explicit-any */
import { DeleteModal } from "@/components/model/delete-model";
import { useHRPolicyStore } from "../stores/useHRPolicyStore";
import {
  useCreateHRPolicy,
  useDeleteHRPolicy,
  useUpdateHRPolicy,
  useUploadHRPolicyFile,
} from "../services";
import { THRPolicySchema } from "../schema";
import { HRPolicyActionForm } from "./action-form";

export function ActionFormModal() {
  const { open, setOpen, currentRow, setCurrentRow } = useHRPolicyStore();

  const { mutateAsync: createMutate, isPending: isCreateLoading } =
    useCreateHRPolicy();
  const { mutateAsync: updateMutate, isPending: isUpdateLoading } =
    useUpdateHRPolicy();
  const { mutateAsync: deleteMutate, isPending: isDeleteLoading } =
    useDeleteHRPolicy(currentRow?.id || "");
  const { mutateAsync: uploadMutate, isPending: isUploadLoading } =
    useUploadHRPolicyFile();

  const handleCreate = async (values: THRPolicySchema) => {
    let finalFileKey = values.fileS3Key || "";

    const fileToUpload = values.file;
    if (fileToUpload instanceof File) {
      const formData = new FormData();
      formData.append("file", fileToUpload);
      formData.append("folder", "hr-policy-documents");

      try {
        const response: any = await uploadMutate(formData);
        if (response?.key) {
          finalFileKey = response.key;
        }
      } catch (error) {
        console.error("Upload failed", error);
        return;
      }
    }

    const payload = {
      title: values.title,
      fileS3Key: finalFileKey,
    };
    createMutate(payload);
  };

  const handleEdit = async (values: THRPolicySchema) => {
    let finalFileKey = values.fileS3Key || "";

    const fileToUpload = values.file;
    if (fileToUpload instanceof File) {
      const formData = new FormData();
      formData.append("file", fileToUpload);
      formData.append("folder", "hr-policy-documents");

      try {
        const response: any = await uploadMutate(formData);
        if (response?.key) {
          finalFileKey = response.key;
        }
      } catch (error) {
        console.error("Upload failed", error);
        return;
      }
    }

    const payload = {
      title: values.title,
      fileS3Key: finalFileKey,
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
      <HRPolicyActionForm
        key="add-hr-policy"
        open={open === "add"}
        loading={isCreateLoading || isUploadLoading}
        onOpenChange={(value) => setOpen(value ? "add" : null)}
        onSubmit={handleCreate}
      />

      {currentRow && (
        <>
          <HRPolicyActionForm
            key={`hr-policy-edit-${currentRow.id}`}
            open={open === "edit"}
            onSubmit={handleEdit}
            loading={isUpdateLoading || isUploadLoading}
            onOpenChange={handleCloseDialog}
            currentRow={currentRow}
          />
          <DeleteModal
            onConfirm={handleDelete}
            key={`hr-policy-delete-${currentRow.id}`}
            isOpen={open === "delete"}
            onClose={handleCloseDialog}
            itemName={currentRow.title}
            loading={isDeleteLoading}
          />
        </>
      )}
    </>
  );
}
