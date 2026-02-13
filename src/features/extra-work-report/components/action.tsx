import { DeleteModal } from "@/components/model/delete-model";
import { ExtraWorkActionForm } from "./action-form";
import { TExtraWorkFormSchema } from "../schema";
import {
  useCreateExtraWorkData,
  useDeleteExtraWorkData,
  useUpdateExtraWorkData,
} from "../services";
import { useExtraWorkStore } from "../stores";
import { useGetProjectSDropdownList } from "@/features/Project-type/services";
import { useGetUserDropdownList } from "@/features/users/services";

export function ActionFormModal() {
  const { open, setOpen, currentRow, setCurrentRow } = useExtraWorkStore();

  const { data: projectsList, isPending: projectsListLoading }: any =
    useGetProjectSDropdownList();
  const { data: employeesList, isPending: employeesListLoading }: any =
    useGetUserDropdownList({
      status: "active",
    });

  const { mutateAsync: createMutate, isPending: isCreateLoading } =
    useCreateExtraWorkData();
  const { mutateAsync: updateMutate, isPending: isUpdateLoading } =
    useUpdateExtraWorkData(currentRow?.id || "");
  const { mutateAsync: deleteMutate, isPending: isDeleteLoading } =
    useDeleteExtraWorkData(currentRow?.id || "");

  const deleteInfoText = currentRow?.employee?.fullName
    ? `the extra work report for ${currentRow.employee.fullName} on ${new Date(
        currentRow.reportingDate
      ).toLocaleDateString()}.`
    : "this extra work report.";

  const handleCreate = (values: TExtraWorkFormSchema) => {
    createMutate(values);
  };

  const handleEdit = (values: TExtraWorkFormSchema) => {
    updateMutate(values);
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
      <ExtraWorkActionForm
        key="add-extra-work"
        open={open === "add"}
        loading={isCreateLoading}
        onOpenChange={(value) => setOpen(value ? "add" : null)}
        onSubmit={handleCreate}
        projectsList={projectsList}
        projectsListLoading={projectsListLoading}
        employeesList={employeesList}
        employeesListLoading={employeesListLoading}
      />

      {currentRow && (
        <>
          <ExtraWorkActionForm
            key={`extra-work-edit-${currentRow.id}`}
            open={open === "edit"}
            onSubmit={handleEdit}
            loading={isUpdateLoading}
            onOpenChange={handleCloseDialog}
            currentRow={currentRow}
            projectsList={projectsList}
            projectsListLoading={projectsListLoading}
            employeesList={employeesList}
            employeesListLoading={employeesListLoading}
          />
          <DeleteModal
            onConfirm={handleDelete}
            key={`extra-work-delete-${currentRow.id}`}
            isOpen={open === "delete"}
            onClose={handleCloseDialog}
            itemName={deleteInfoText}
            loading={isDeleteLoading}
          />
        </>
      )}
    </>
  );
}
