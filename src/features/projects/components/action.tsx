/* eslint-disable @typescript-eslint/no-explicit-any */
import { DeleteModal } from "@/components/model/delete-model";
import { useProjectsStore } from "../stores/useProjectsStore";
import { TProjectFormSchema } from "../schema";
import {
  useCreateProjectsData,
  useDeleteProjectsData,
  useUpdateProjectsData,
} from "../services";
import { ProjectActionForm } from "./action-form";
import { useAuthStore } from "@/stores/use-auth-store";

export function ActionFormModal({
  clientsList,
  clientListLoading,
  projectTypes,
  projectTypesLoading,
  projecthandler,
  projecthandlerLoading,
  technologyList,
  technologyListLoading,
}: any) {
  const { open, setOpen, currentRow, setCurrentRow } = useProjectsStore();
  const user = useAuthStore((state) => state.user);
  const userRole = user?.user?.role;
  const { mutateAsync: createMutate, isPending: isCreateLoading } =
    useCreateProjectsData();
  const { mutateAsync: updateMutate, isPending: isUpdateLoading } =
    useUpdateProjectsData(currentRow?.id || "");
  const { mutateAsync: deleteMutate, isPending: isDeleteLoading } =
    useDeleteProjectsData(currentRow?.id || "");

  const ClientListData = clientsList?.data;

  const handleCreate = (values: TProjectFormSchema) => {
    const payload = {
      name: values.name,
      description: values.description,
      clientId: values.clientId,
      startDate: values.startDate,
      expectedCompletionDate: values.expectedCompletionDate,
      handlerId: values.handlerId ? values.handlerId : undefined,
      percentageComplete: values.percentageComplete,
      priority: values.priority,
      status: values.status,
      projectTypeId: values.projectTypeId,
      technologyId: values.technologyId,
      projectDocuments: values.projectDocuments,
    };
    createMutate(payload);
  };

  const handleEdit = (values: TProjectFormSchema) => {
    const payload = {
      name: values.name,
      description: values.description,
      clientId: values.clientId,
      startDate: values.startDate,
      expectedCompletionDate: values.expectedCompletionDate,
      handlerId: values.handlerId ? values.handlerId : undefined,
      percentageComplete: values.percentageComplete,
      priority: values.priority,
      projectTypeId: values.projectTypeId,
      technologyId: values.technologyId,
      projectDocuments: values.projectDocuments,
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
      <ProjectActionForm
        key="add-coupon"
        open={open === "add"}
        loading={isCreateLoading}
        onOpenChange={(value) => setOpen(value ? "add" : null)}
        onSubmit={handleCreate}
        projectTypes={projectTypes}
        projectTypesLoading={projectTypesLoading}
        clientsList={ClientListData}
        clientListLoading={clientListLoading}
        projecthandler={projecthandler}
        projecthandlerLoading={projecthandlerLoading}
        technologyList={technologyList}
        technologyListLoading={technologyListLoading}
        userRole={userRole}
      />

      {currentRow && (
        <>
          <ProjectActionForm
            key={`coupon-edit-${currentRow.id}`}
            open={open === "edit"}
            onSubmit={handleEdit}
            loading={isUpdateLoading}
            onOpenChange={handleCloseDialog}
            currentRow={currentRow}
            projectTypes={projectTypes}
            projectTypesLoading={projectTypesLoading}
            clientsList={ClientListData}
            clientListLoading={clientListLoading}
            projecthandler={projecthandler}
            projecthandlerLoading={projecthandlerLoading}
            technologyList={technologyList}
            technologyListLoading={technologyListLoading}
            userRole={userRole}
          />
          <DeleteModal
            onConfirm={handleDelete}
            key={`coupon-delete-${currentRow.id}`}
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
