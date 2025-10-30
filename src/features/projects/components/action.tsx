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

export function ActionFormModal({
  managerList,
  managerListLoading,
  teamLeaderList,
  teamLeaderListLoading,
  clientsList,
  clientListLoading,
}: any) {
  const { open, setOpen, currentRow, setCurrentRow } = useProjectsStore();
  const { mutateAsync: createMutate, isPending: isCreateLoading } =
    useCreateProjectsData();
  const { mutateAsync: updateMutate, isPending: isUpdateLoading } =
    useUpdateProjectsData(currentRow?.id || "");
  const { mutateAsync: deleteMutate, isPending: isDeleteLoading } =
    useDeleteProjectsData(currentRow?.id || "");

  const ClientListData = clientsList?.data;

  const ManagerListData = managerList?.data;

  const teamLeaderListData = teamLeaderList?.data;
  const handleCreate = (values: TProjectFormSchema) => {
    const payload = {
      name: values.name,
      description: values.description,
      clientId: values.clientId,
      startDate: values.startDate,
      expectedCompletionDate: values.expectedCompletionDate,
      managerId: values.managerId ? values.managerId : undefined,
      teamLeadId: values.teamLeadId ? values.teamLeadId : undefined,
      percentageComplete: values.percentageComplete,
      priority: values.priority,
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
      managerId: values.managerId ? values.managerId : undefined,
      teamLeadId: values.teamLeadId ? values.teamLeadId : undefined,
      percentageComplete: values.percentageComplete,
      priority: values.priority,
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
        clientsList={ClientListData}
        clientListLoading={clientListLoading}
        ManagerListData={ManagerListData}
        managerListLoading={managerListLoading}
        teamLeaderListData={teamLeaderListData}
        teamLeaderListLoading={teamLeaderListLoading}
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
            clientsList={ClientListData}
            clientListLoading={clientListLoading}
            ManagerListData={ManagerListData}
            managerListLoading={managerListLoading}
            teamLeaderListData={teamLeaderListData}
            teamLeaderListLoading={teamLeaderListLoading}
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
