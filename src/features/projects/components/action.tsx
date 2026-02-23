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

const formatDateForPayload = (date?: Date | null) => {
  if (!date) return null;

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

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
      isProduct: values.isProduct,
      description: values.description,
      clientId: values.clientId,
      startDate: formatDateForPayload(values.startDate),
      expectedCompletionDate: formatDateForPayload(
        values.expectedCompletionDate
      ),
      handlerId: values.handlerId ? values.handlerId : undefined,
      percentageComplete: values.percentageComplete,
      priority: values.priority,
      status: values.status,
      projectTypeId: values.projectTypeId,
      technologyId: values.technologyId,
      isVisibleToAllDevTeam: values.isVisibleToAllDevTeam,
      isVisibleToAllBdeTeam: values.isVisibleToAllBdeTeam,
    };
    createMutate(payload);
  };

  const handleEdit = (values: TProjectFormSchema) => {
    const payload = {
      name: values.name,
      isProduct: values.isProduct,
      description: values.description,
      clientId: values.clientId,
      startDate: formatDateForPayload(values.startDate),
      expectedCompletionDate: formatDateForPayload(
        values.expectedCompletionDate
      ),
      handlerId: values.handlerId ? values.handlerId : undefined,
      percentageComplete: values.percentageComplete,
      priority: values.priority,
      projectTypeId: values.projectTypeId,
      technologyId: values.technologyId,
      isVisibleToAllDevTeam: values.isVisibleToAllDevTeam,
      isVisibleToAllBdeTeam: values.isVisibleToAllBdeTeam,
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
          />
          <DeleteModal
            onConfirm={handleDelete}
            key={`project-delete-${currentRow.id}`}
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
